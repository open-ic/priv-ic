export const appLookup: Record<string, string> = {
    "https://az5sd-cqaaa-aaaae-aaarq-cai.ic0.app/": "Distrikt",
    "https://7e6iv-biaaa-aaaaf-aaada-cai.ic0.app/": "OpenChat",
    "https://h5aet-waaaa-aaaab-qaamq-cai.raw.ic0.app/": "Dscvr",
};

export const nullProfile: Profile = {
    identity: {
        email: { addresses: [] },
        phone: { numbers: [] },
    },
    apps: [],
};

export function addEmailAddress(profile: Profile, address: Verifiable<string>): Profile {
    return {
        ...profile,
        identity: {
            ...profile.identity,
            email: {
                addresses: [address, ...profile.identity.email.addresses],
            },
        },
    };
}

export function removeEmailAddress(profile: Profile, id: bigint): Profile {
    return {
        ...profile,
        identity: {
            ...profile.identity,
            email: {
                addresses: profile.identity.email.addresses.filter((n) => n.id !== id),
            },
        },
    };
}

export function addPhoneNumber(profile: Profile, phoneNumber: Verifiable<PhoneNumber>): Profile {
    return {
        ...profile,
        identity: {
            ...profile.identity,
            phone: {
                numbers: [phoneNumber, ...profile.identity.phone.numbers],
            },
        },
    };
}

export function removePhoneNumber(profile: Profile, id: bigint): Profile {
    return {
        ...profile,
        identity: {
            ...profile.identity,
            phone: {
                numbers: profile.identity.phone.numbers.filter((n) => n.id !== id),
            },
        },
    };
}

export type Profile = {
    identity: Identity;
    apps: ClientApp[];
};

export type ClientApp = {
    domainName: string;
};

export type Identity = {
    email: EmailFacet;
    phone: PhoneFacet;
};

export type EmailFacet = {
    addresses: Verifiable<string>[];
};

export type PhoneFacet = {
    numbers: Verifiable<PhoneNumber>[];
};

export type PhoneNumber = {
    countryCode: number;
    number: string;
};

export type Verifiable<T> = {
    id: bigint;
    status: VerificationCodeStatus;
    added: bigint;
    value: T;
};

export type VerificationCodeStatus = "pending" | "sent" | "verified" | "expired";

export type RegisterEmailResponse =
    | RegisterEmailSuccess
    | RegisterEmailAlreadyRegistered
    | RegisterEmailInvalid;

export type RegisterEmailSuccess = {
    kind: "register_email_success";
    id: bigint;
};

export type RegisterEmailAlreadyRegistered = {
    kind: "register_email_already_registered";
};

export type RegisterEmailInvalid = {
    kind: "register_email_invalid";
};

export type RegisterPhoneResponse =
    | RegisterPhoneSuccess
    | RegisterPhoneAlreadyRegistered
    | RegisterPhoneInvalid;

export type RegisterPhoneSuccess = {
    kind: "register_phone_success";
    id: bigint;
};

export type RegisterPhoneAlreadyRegistered = {
    kind: "register_phone_already_registered";
};

export type RegisterPhoneInvalid = {
    kind: "register_phone_invalid";
};

export type SendCodeResponse =
    | "success"
    | "already_sent"
    | "identity_not_found"
    | "attribute_not_found"
    | "already_verified"
    | "unsupported";

export type ConfirmCodeResponse =
    | "success"
    | "code_incorrect"
    | "code_expired"
    | "already_confirmed"
    | "not_sent"
    | "not_found";

export type VisibleProfileAttributesResponse = "not_found" | bigint[];
