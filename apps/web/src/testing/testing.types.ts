export type FakeAnswer = (request: Request) => Response | Promise<Response>

export type EntryLine = [accountId: string, amountCents: number]
