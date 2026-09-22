// Pages fetch on the server, so requests go straight to the backend.
const API_URL = process.env.API_URL ?? 'http://localhost:8080'

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

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, init)
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
