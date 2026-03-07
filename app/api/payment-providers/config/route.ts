import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import {
  construireUrlWebhookPaiementProvider,
  lireConfigurationProvidersPaiement,
  masquerConfigurationProvidersPaiement,
  sauvegarderConfigurationProvidersPaiement,
} from '@/src/infrastructure/http/adminPaymentProviders'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP } from '@/src/messages'

async function exigerSuperAdminPaiement(requete: NextRequest): Promise<void> {
  const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
  const contexteSession =
    await conteneurDependances.serviceAuthentification.obtenirContexteDepuisJetonAcces(jetonAcces)
  const role = String(contexteSession.utilisateur.role || '').trim().toUpperCase()
  if (role !== 'SUPER_ADMIN') {
    throw new ErreurHttp(CODE_HTTP.INTERDIT, 'Acces reserve au Super Admin.')
  }
  await conteneurDependances.serviceAuthentification.exigerSecondeAuthSuperAdmin(jetonAcces)
}

export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    await exigerSuperAdminPaiement(requete)
    const config = await lireConfigurationProvidersPaiement(
      conteneurDependances.prisma,
      conteneurDependances.serviceChiffrement
    )
    const origin = new URL(requete.url).origin
    return conteneurDependances.reponseHttp.succes({
      ...masquerConfigurationProvidersPaiement(config),
      webhooks: {
        wave: construireUrlWebhookPaiementProvider(origin, 'wave'),
        orangeMoney: construireUrlWebhookPaiementProvider(origin, 'orange_money'),
      },
    })
  }
)

export const PUT = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    conteneurDependances.adaptateurRequeteSecurite.exigerCsrf(requete)
    await exigerSuperAdminPaiement(requete)
    const corps = (await requete.json().catch(() => ({}))) as Record<string, unknown>
    const config = await sauvegarderConfigurationProvidersPaiement(
      conteneurDependances.prisma,
      conteneurDependances.serviceChiffrement,
      corps
    )
    const origin = new URL(requete.url).origin
    return conteneurDependances.reponseHttp.succes({
      ...config,
      webhooks: {
        wave: construireUrlWebhookPaiementProvider(origin, 'wave'),
        orangeMoney: construireUrlWebhookPaiementProvider(origin, 'orange_money'),
      },
    })
  }
)
