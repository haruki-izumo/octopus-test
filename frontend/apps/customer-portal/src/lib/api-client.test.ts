import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import { ApiError, createActionKey, getJson, postJson } from './api-client'

describe('api client', () => {
    let fetchMock: Mock<typeof fetch>

    beforeEach(() => {
        fetchMock = vi.fn<typeof fetch>()
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    function sentHeaders(call: number): Headers {
        return new Headers(fetchMock.mock.calls[call]?.[1]?.headers)
    }

    describe('createActionKey', () => {
        it('creates a different key each time', () => {
            expect(createActionKey()).not.toBe(createActionKey())
        })
    })

    describe('getJson', () => {
        it('returns the response body', async () => {
            fetchMock.mockResolvedValue(Response.json({ status: 'ok' }))

            await expect(getJson('/health')).resolves.toEqual({ status: 'ok' })
            expect(fetchMock).toHaveBeenCalledWith('/api/health', undefined)
        })

        it('passes on fetch options, such as caching', async () => {
            fetchMock.mockResolvedValue(Response.json({}))

            await getJson('/contracts/1', { cache: 'no-store' })

            expect(fetchMock).toHaveBeenCalledWith('/api/contracts/1', { cache: 'no-store' })
        })

        it('throws the error from the backend', async () => {
            fetchMock.mockResolvedValue(
                Response.json(
                    { error: { code: 'NOT_FOUND', message: 'Contract 1 not found' } },
                    { status: 404 },
                ),
            )

            await expect(getJson('/contracts/1')).rejects.toEqual(
                new ApiError(404, 'NOT_FOUND', 'Contract 1 not found'),
            )
        })

        it('throws an error when the response has no body', async () => {
            fetchMock.mockResolvedValue(
                new Response(null, { status: 502, statusText: 'Bad Gateway' }),
            )

            await expect(getJson('/contracts/1')).rejects.toEqual(
                new ApiError(502, 'UNKNOWN', 'Bad Gateway'),
            )
        })
    })

    describe('postJson', () => {
        it('sends the body with the action key and actor', async () => {
            fetchMock.mockResolvedValue(Response.json({ uuid: 'change-1' }, { status: 201 }))

            const response = await postJson(
                '/billing-day-changes',
                { billing_day: 15 },
                { actionKey: 'key-1' },
            )

            expect(response).toEqual({ uuid: 'change-1' })
            expect(fetchMock).toHaveBeenCalledOnce()
            expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/billing-day-changes')
            expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
                method: 'POST',
                body: '{"billing_day":15}',
            })
            expect(sentHeaders(0).get('Idempotency-Key')).toBe('key-1')
            expect(sentHeaders(0).get('X-Actor')).toBe('customer-portal')
        })

        it('retries a failed request with the same key', async () => {
            fetchMock
                .mockRejectedValueOnce(new DOMException('The operation timed out', 'TimeoutError'))
                .mockResolvedValueOnce(new Response(null, { status: 503 }))
                .mockResolvedValueOnce(Response.json({ uuid: 'change-1' }, { status: 201 }))

            await expect(
                postJson('/billing-day-changes', {}, { actionKey: 'key-1' }),
            ).resolves.toEqual({ uuid: 'change-1' })

            expect(fetchMock).toHaveBeenCalledTimes(3)
            for (const call of [0, 1, 2]) {
                expect(sentHeaders(call).get('Idempotency-Key')).toBe('key-1')
            }
        })

        it('gives up after three attempts', async () => {
            fetchMock.mockImplementation(async () => new Response(null, { status: 503 }))

            await expect(
                postJson('/billing-day-changes', {}, { actionKey: 'key-1' }),
            ).rejects.toMatchObject({ status: 503 })
            expect(fetchMock).toHaveBeenCalledTimes(3)
        })

        it('does not retry when the backend rejects the request', async () => {
            fetchMock.mockResolvedValue(
                Response.json(
                    { error: { code: 'CONFLICT', message: 'Contract 1 was changed' } },
                    { status: 409 },
                ),
            )

            await expect(
                postJson('/billing-day-changes', {}, { actionKey: 'key-1' }),
            ).rejects.toEqual(new ApiError(409, 'CONFLICT', 'Contract 1 was changed'))
            expect(fetchMock).toHaveBeenCalledOnce()
        })
    })
})
