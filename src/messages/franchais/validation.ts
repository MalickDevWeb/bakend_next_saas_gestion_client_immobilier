import { VALIDATION_MESSAGES_FR_COMMON } from './validation.common'
import { VALIDATION_MESSAGES_FR_AUTH } from './validation.auth'
import { VALIDATION_MESSAGES_FR_CLIENT } from './validation.client'
import { VALIDATION_MESSAGES_FR_PROPERTY } from './validation.property'
import { VALIDATION_MESSAGES_FR_PAYMENT } from './validation.payment'

export const VALIDATION_MESSAGES_FR: Record<string, string> = {
  ...VALIDATION_MESSAGES_FR_COMMON,
  ...VALIDATION_MESSAGES_FR_AUTH,
  ...VALIDATION_MESSAGES_FR_CLIENT,
  ...VALIDATION_MESSAGES_FR_PROPERTY,
  ...VALIDATION_MESSAGES_FR_PAYMENT,
}

export type ValidationMessagesFr = typeof VALIDATION_MESSAGES_FR
