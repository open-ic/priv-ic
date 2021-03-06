use crate::email_sender::EmailSender;
use crate::index_store::IndexStore;
use crate::sms_sender::SmsSender;
use crate::verification_code_reader::VerificationCodeReader;
use futures::future;
use types::{Error, VerificationCodeTarget};

pub async fn run(
    code_reader: &dyn VerificationCodeReader,
    index_store: &dyn IndexStore,
    sms_sender: &dyn SmsSender,
    email_sender: &dyn EmailSender,
) -> Result<(), Error> {
    let from_index = index_store
        .get_index_processed_up_to()
        .await?
        .map_or(0, |i| i + 1);

    let success_result = code_reader.get(from_index).await?;

    if let Some(latest_index) = success_result.verification_codes.last().map(|e| e.index) {
        let futures: Vec<_> = success_result
            .verification_codes
            .into_iter()
            .map(|c| match c.value.target {
                VerificationCodeTarget::Phone(phone_number) => {
                    sms_sender.send(phone_number, c.value.code)
                }
                VerificationCodeTarget::Email(email_address) => {
                    email_sender.send(email_address, c.value.code)
                }
            })
            .collect();

        future::join_all(futures).await;

        index_store.set_index_processed_up_to(latest_index).await?;
    }

    Ok(())
}
