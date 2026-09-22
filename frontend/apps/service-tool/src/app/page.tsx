import { Box } from '@octoev/mosaic/Box'
import { Button } from '@octoev/mosaic/Button'
import { Stack, StackItem } from '@octoev/mosaic/Stack'
import { TextField } from '@octoev/mosaic/TextField'
import { redirect } from 'next/navigation'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<{ uuid?: string | string[] }>
}) {
    const { uuid } = await searchParams
    const search = typeof uuid === 'string' ? uuid.trim() : ''
    if (UUID.test(search)) {
        redirect(`/contracts/${search.toLowerCase()}`)
    }

    return (
        <Box as="div" maxWidth={640}>
            <Stack gap={4}>
                <h1>Find a contract</h1>
                <form action="/">
                    <Stack gap={4}>
                        <TextField
                            label="Contract UUID"
                            name="uuid"
                            defaultValue={search}
                            isInvalid={search !== ''}
                            errorMessage="Enter a UUID, such as 6f1c2c1e-5d0b-4a39-9a55-0d5b1c7f8a01"
                        />
                        <StackItem crossAlignSelf="start">
                            <Button type="submit">Find contract</Button>
                        </StackItem>
                    </Stack>
                </form>
            </Stack>
        </Box>
    )
}
