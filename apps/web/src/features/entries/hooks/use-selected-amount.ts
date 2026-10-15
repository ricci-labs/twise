import { type RefObject, useEffect } from 'react'

export function useSelectedAmount(amountInput: RefObject<HTMLInputElement | null>, isOn: boolean) {
  useEffect(() => {
    if (isOn) {
      amountInput.current?.select()
    }
  }, [amountInput, isOn])
}
