import type { Identity } from "@dfinity/agent";
import { AuthClient as Middleman, DataRequestWithOrigin, DataResponse } from "../utils/authClient";
import { DelegationIdentity } from "@dfinity/identity";

const ONE_MINUTE_MILLIS = 60 * 1000;

// Use your local .env file to direct this to the local IC replica
const IDENTITY_URL = process.env.INTERNET_IDENTITY_URL || "https://identity.ic0.app";

const authClient = Middleman.create();

export function getIdentity(): Promise<Identity> {
    return authClient.then((c) => {
        console.log("PrivIC Principal", c.getIdentity().getPrincipal().toText());
        return c.getIdentity();
    });
}

export function isAuthenticated(): Promise<boolean> {
    return authClient.then((c) => c.isAuthenticated());
}

export function returnToClient(dataResponse: DataResponse): Promise<void> {
    return authClient.then((c) => {
        c.returnToClientApp(dataResponse);
    });
}

export function login(): Promise<[Identity, DataRequestWithOrigin | undefined]> {
    return authClient.then((c) => {
        return new Promise((resolve, reject) => {
            c.login({
                identityProvider: IDENTITY_URL,
                onSuccess: (dataRequest: DataRequestWithOrigin | undefined) => {
                    console.log("Data request from open chat", dataRequest);
                    console.log("PrivIC Principal", c.getIdentity().getPrincipal().toText());
                    resolve([c.getIdentity(), dataRequest]);
                },
                onError: (err) => reject(err),
            });
        });
    });
}

export function logout(): Promise<void> {
    return authClient.then((c) => c.logout());
}

export function startSession(identity: Identity): Promise<void> {
    return new Promise((resolve) => {
        const durationUntilSessionExpireMS = getTimeUntilSessionExpiryMs(identity);
        const durationUntilLogoutMs = durationUntilSessionExpireMS - ONE_MINUTE_MILLIS;
        if (durationUntilLogoutMs <= 5 * ONE_MINUTE_MILLIS) {
            resolve();
        } else {
            setTimeout(resolve, durationUntilLogoutMs);
        }
        // setTimeout(resolve, 5000);
    });
}

export function getTimeUntilSessionExpiryMs(identity: Identity): number {
    if (!(identity instanceof DelegationIdentity)) {
        return 0;
    }

    const expiryDateTimestampMs = Number(
        identity
            .getDelegation()
            .delegations.map((d) => d.delegation.expiration)
            .reduce((current, next) => (next < current ? next : current)) / BigInt(1_000_000)
    );

    return expiryDateTimestampMs - Date.now();
}
