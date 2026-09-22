import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

import { ApiError, getJson } from './api-client'

describe('getJson', () => {
    let fetchMock: Mock<typeof fetch>

    beforeEach(() => {
        fetchMock = vi.fn<typeof fetch>()
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('returns the response body', async () => {
        fetchMock.mockResolvedValue(Response.json({ status: 'ok' }))

        await expect(getJson('/health')).resolves.toEqual({ status: 'ok' })
        expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/health', undefined)
    })

    it('passes on fetch options, such as caching', async () => {
        fetchMock.mockResolvedValue(Response.json({}))

        await getJson('/contracts/1', { cache: 'no-store' })

        expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/contracts/1', {
            cache: 'no-store',
        })
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
        fetchMock.mockResolvedValue(new Response(null, { status: 502, statusText: 'Bad Gateway' }))

        await expect(getJson('/contracts/1')).rejects.toEqual(
            new ApiError(502, 'UNKNOWN', 'Bad Gateway'),
        )
    })
})
