/**
 * Point d'entree centralise pour tous les messages de l'application
 * Importer uniquement ce fichier dans le reste du projet
 */

export * from './validation'
export * from './app'

export { t, getAction, getLabel, getStatus, getError } from './app'

import { MESSAGES } from './app'

export const ACTIONS = MESSAGES.ACTIONS
export const LABELS = MESSAGES.LABELS
export const STATUS = MESSAGES.STATUS
export const PAGES = MESSAGES.PAGES
export const SUCCESS = MESSAGES.SUCCESS
export const ERRORS = MESSAGES.ERRORS
export const CONFIRMATIONS = MESSAGES.CONFIRMATIONS
export const NAV = MESSAGES.NAV
export const ENTITIES = MESSAGES.ENTITIES
export const MENU = MESSAGES.MENU
export const VALIDATION = MESSAGES.VALIDATION
export { CODE_HTTP } from './app/code.http'
