export type FakeAnswer = (request: Request) => Response | Promise<Response>

export type FakePostingExtra = {
  invoiceId?: string
  installmentNo?: number
  contactId?: string
}

export type EntryLine = [accountId: string, amountCents: number, extra?: FakePostingExtra]

export type FakeWorkspaceHoliday = {
  id: string
  onDate: string
  name: string
}
