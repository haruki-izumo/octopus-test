// In the browser, requests go through the `/api` rewrite in next.config.ts.
const SERVER_API_URL = process.env.API_URL ?? 'http://localhost:8080'
const ACTOR = 'customer-portal'
const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 100
const TIMEOUT_MS = 10_000

export class ApiError extends Error {
    constructor(
        readonly status: number,
        readonly code: string,
        message: string,
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

/** A key for one action by the customer, such as submitting a form. Retries reuse it. */
export function createActionKey(): string {
    return crypto.randomUUID()
}

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
    return parse<T>(await fetch(url(path), init))
}

/** Sends a change to the backend, retrying timeouts and server errors with the same key. */
export async function postJson<T>(
    path: string,
    body: unknown,
    { actionKey }: { actionKey: string },
): Promise<T> {
    const init: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': actionKey,
            'X-Actor': ACTOR,
        },
        body: JSON.stringify(body),
    }
    for (let attempt = 1; ; attempt++) {
        const isLastAttempt = attempt === MAX_ATTEMPTS
        let response: Response
        try {
            response = await fetch(url(path), { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) })
        } catch (error) {
            if (isLastAttempt) throw error
            await wait(RETRY_DELAY_MS * attempt)
            continue
        }
        if (response.status >= 500 && !isLastAttempt) {
            await wait(RETRY_DELAY_MS * attempt)
            continue
        }
        return parse<T>(response)
    }
}

function url(path: string): string {
    return typeof window === 'undefined' ? `${SERVER_API_URL}${path}` : `/api${path}`
}

async function parse<T>(response: Response): Promise<T> {
    if (response.ok) {
        return (await response.json()) as T
    }
    const body = (await response.json().catch(() => ({}))) as {
        error?: { code: string; message: string }
    }
    throw new ApiError(
        response.status,
        body.error?.code ?? 'UNKNOWN',
        body.error?.message ?? response.statusText,
    )
}

function wait(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
