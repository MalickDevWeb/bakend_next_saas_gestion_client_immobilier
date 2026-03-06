import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import type { PrismaClient } from '@prisma/client'
import type { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP } from '@/src/messages'
import { verifierMaintenanceGlobaleMutation } from '@/src/infrastructure/http/verifierMaintenanceGlobale'
import { verifierBlocageAbonnementMutation } from '@/src/infrastructure/http/verifierBlocageAbonnementGlobal'
import { appliquerRetentionsDepuisPolitique } from '@/src/infrastructure/http/politiquePlateforme'

const LONGUEUR_MAX_CLE = 190
const DUREE_DEFAUT_IDEMPOTENCE_MS = 24 * 60 * 60 * 1000
const STATUT_EN_COURS = 'IN_PROGRESS'
const STATUT_TERMINE = 'COMPLETED'
const ENTETES_REJOUABLES = [
  'x-undo-id',
  'x-undo-expires-at',
  'x-undo-resource',
  'x-undo-resource-id',
] as const

type TypeEntetesIdempotence = Partial<Record<(typeof ENTETES_REJOUABLES)[number], string>>

export type TypeOptionsMutationIdempotente<TCorps extends Record<string, unknown>> = {
  chemin: string
  methode?: string
  scope: string
  corps: TCorps
  cleIdempotence?: string | null
  ttlMs?: number
  executerMutation: () => Promise<NextResponse>
}

type TypeServiceAuthentificationIdempotence = {
  obtenirContexteDepuisJetonAcces: (
    jetonAcces: string
  ) => Promise<{ utilisateur: { id: string | null | undefined } }>
}

type TypeOptionsMutationIdempotenteRequete<TCorps extends Record<string, unknown>> = {
  prisma: PrismaClient
  requete: NextRequest
  jetonAcces: string
  impersonation?: DtoEtatImpersonation
  corps: TCorps
  serviceAuthentification: TypeServiceAuthentificationIdempotence
  executerMutation: () => Promise<NextResponse>
  methode?: string
  chemin?: string
  cleIdempotence?: string | null
  ttlMs?: number
}

type TypeCleUniqueIdempotence = {
  cle: string
  scope: string
  methode: string
  chemin: string
}

type TypeEnregistrementIdempotence = {
  hashRequete: string
  statut: string
  codeHttp: number | null
  corpsReponse: unknown
  entetesReponse: unknown
}

type TypeDelegateIdempotenceMutation = {
  deleteMany(args: { where: { expireLe?: { lt: Date }; cle?: string; scope?: string; methode?: string; chemin?: string } }): Promise<{ count: number }>
  findUnique(args: {
    where: {
      cle_scope_methode_chemin: TypeCleUniqueIdempotence
    }
  }): Promise<TypeEnregistrementIdempotence | null>
  create(args: {
    data: TypeCleUniqueIdempotence & {
      hashRequete: string
      statut: string
      expireLe: Date
    }
  }): Promise<unknown>
  update(args: {
    where: {
      cle_scope_methode_chemin: TypeCleUniqueIdempotence
    }
    data: {
      statut: string
      codeHttp: number
      corpsReponse: unknown
      entetesReponse: unknown
    }
  }): Promise<unknown>
}

function normaliserCleIdempotence(cle: string | null | undefined): string {
  return String(cle || '').trim().slice(0, LONGUEUR_MAX_CLE)
}

function calculerHashRequete(entree: unknown): string {
  const texte = JSON.stringify(entree ?? null)
  return createHash('sha256').update(texte).digest('hex')
}

function extraireEntetesRejouables(reponse: NextResponse): TypeEntetesIdempotence {
  const entetes: TypeEntetesIdempotence = {}
  for (const nomEntete of ENTETES_REJOUABLES) {
    const valeur = reponse.headers.get(nomEntete)
    if (valeur) {
      entetes[nomEntete] = valeur
    }
  }
  return entetes
}

function appliquerEntetesRejouees(reponse: NextResponse, entetes: unknown): void {
  if (!entetes || typeof entetes !== 'object') return
  const source = entetes as Record<string, unknown>
  for (const nomEntete of ENTETES_REJOUABLES) {
    const valeur = source[nomEntete]
    if (typeof valeur === 'string' && valeur.trim()) {
      reponse.headers.set(nomEntete, valeur)
    }
  }
}

function construireReponseDepuisCache(codeHttp: number, corpsReponse: unknown, entetes: unknown): NextResponse {
  const reponse = NextResponse.json(corpsReponse ?? null, { status: codeHttp })
  appliquerEntetesRejouees(reponse, entetes)
  reponse.headers.set('x-idempotency-replayed', 'true')
  return reponse
}

function detecterCollisionCle(hashExistant: string, hashActuel: string): void {
  if (hashExistant === hashActuel) return
  throw new ErreurHttp(
    CODE_HTTP.CONFLIT,
    "Conflit d'idempotence: la même clé a déjà été utilisée avec une autre requête.",
    { code: 'IDEMPOTENCY_KEY_CONFLICT' }
  )
}

export async function executerMutationIdempotente<TCorps extends Record<string, unknown>>(
  prisma: PrismaClient,
  options: TypeOptionsMutationIdempotente<TCorps>
): Promise<NextResponse> {
  const delegate = (prisma as unknown as {
    idempotenceMutation: TypeDelegateIdempotenceMutation
  }).idempotenceMutation

  const cle = normaliserCleIdempotence(options.cleIdempotence)
  if (!cle) {
    return options.executerMutation()
  }

  const methode = String(options.methode || 'POST').toUpperCase()
  const chemin = String(options.chemin || '').trim()
  const scope = String(options.scope || '').trim() || 'anonymous'
  const ttlMs = Math.max(60_000, Number(options.ttlMs || DUREE_DEFAUT_IDEMPOTENCE_MS))
  const hashRequete = calculerHashRequete(options.corps)
  const maintenant = new Date()

  await delegate.deleteMany({
    where: {
      expireLe: { lt: maintenant },
    },
  })

  const cleUnique: TypeCleUniqueIdempotence = {
    cle,
    scope,
    methode,
    chemin,
  }

  const existante = await delegate.findUnique({
    where: {
      cle_scope_methode_chemin: cleUnique,
    },
  })

  if (existante) {
    detecterCollisionCle(existante.hashRequete, hashRequete)

    if (existante.statut === STATUT_TERMINE && typeof existante.codeHttp === 'number') {
      return construireReponseDepuisCache(
        existante.codeHttp,
        existante.corpsReponse,
        existante.entetesReponse
      )
    }

    throw new ErreurHttp(
      CODE_HTTP.CONFLIT,
      "Une requête avec cette clé d'idempotence est déjà en cours.",
      { code: 'IDEMPOTENCY_REQUEST_IN_PROGRESS' }
    )
  }

  try {
    await delegate.create({
      data: {
        cle,
        scope,
        methode,
        chemin,
        hashRequete,
        statut: STATUT_EN_COURS,
        expireLe: new Date(Date.now() + ttlMs),
      },
    })
  } catch {
    const collision = await delegate.findUnique({
      where: {
        cle_scope_methode_chemin: cleUnique,
      },
    })

    if (collision) {
      detecterCollisionCle(collision.hashRequete, hashRequete)
      if (collision.statut === STATUT_TERMINE && typeof collision.codeHttp === 'number') {
        return construireReponseDepuisCache(
          collision.codeHttp,
          collision.corpsReponse,
          collision.entetesReponse
        )
      }
    }

    throw new ErreurHttp(
      CODE_HTTP.CONFLIT,
      "Une requête avec cette clé d'idempotence est déjà en cours.",
      { code: 'IDEMPOTENCY_REQUEST_IN_PROGRESS' }
    )
  }

  try {
    const reponse = await options.executerMutation()
    const clone = reponse.clone()
    const texte = await clone.text().catch(() => '')
    let corpsReponse: unknown = null
    if (texte) {
      try {
        corpsReponse = JSON.parse(texte)
      } catch {
        corpsReponse = { raw: texte }
      }
    }

    await delegate.update({
      where: {
        cle_scope_methode_chemin: cleUnique,
      },
      data: {
        statut: STATUT_TERMINE,
        codeHttp: reponse.status,
        corpsReponse,
        entetesReponse: extraireEntetesRejouables(reponse),
      },
    })

    return reponse
  } catch (erreur) {
    await delegate.deleteMany({
      where: {
        cle,
        scope,
        methode,
        chemin,
      },
    })
    throw erreur
  }
}

export async function executerMutationIdempotenteSiDemandee<
  TCorps extends Record<string, unknown>
>(options: TypeOptionsMutationIdempotenteRequete<TCorps>): Promise<NextResponse> {
  const methode = String(options.methode || options.requete.method || 'POST').toUpperCase()
  const chemin = String(options.chemin || new URL(options.requete.url).pathname || '').trim()
  await appliquerRetentionsDepuisPolitique(options.prisma)
  await verifierMaintenanceGlobaleMutation(options.prisma, methode, chemin)
  await verifierBlocageAbonnementMutation({
    prisma: options.prisma,
    serviceAuthentification: options.serviceAuthentification,
    jetonAcces: options.jetonAcces,
    impersonation: options.impersonation,
    methode,
    chemin,
  })

  const cleIdempotence =
    options.cleIdempotence ?? lireCleIdempotenceDepuisRequete(options.requete)
  if (!cleIdempotence) {
    return options.executerMutation()
  }

  const contexteSession = await options.serviceAuthentification.obtenirContexteDepuisJetonAcces(
    options.jetonAcces
  )
  const scopeIdempotence = [
    `u:${String(contexteSession.utilisateur.id || '').trim()}`,
    `imp:${String(options.impersonation?.adminId || '').trim() || 'none'}`,
  ].join('|')

  return executerMutationIdempotente(options.prisma, {
    chemin,
    methode,
    cleIdempotence,
    scope: scopeIdempotence,
    corps: options.corps,
    ttlMs: options.ttlMs,
    executerMutation: options.executerMutation,
  })
}

export function lireCleIdempotenceDepuisRequete(requete: NextRequest): string {
  return normaliserCleIdempotence(requete.headers.get('x-idempotency-key'))
}
