import { NextRequest } from 'next/server'
import { conteneurDependances } from '@/src/coeur/conteneur/ConteneurDependances'
import { executerAvecGestionErreurs } from '@/src/infrastructure/http/executerAvecGestionErreurs'
import { lirePolitiquePlateforme } from '@/src/infrastructure/http/politiquePlateforme'
import {
  calculerDisponibiliteProvidersPaiement,
  lireConfigurationProvidersPaiement,
} from '@/src/infrastructure/http/adminPaymentProviders'

export const GET = executerAvecGestionErreurs(
  conteneurDependances.reponseHttp,
  async (requete: NextRequest) => {
    const jetonAcces = conteneurDependances.adaptateurRequeteSecurite.extraireJetonAcces(requete)
    const impersonation = conteneurDependances.adaptateurRequeteSecurite.lireImpersonation(requete)
    const [donnees, politique, configurationProviders] = await Promise.all([
      conteneurDependances.controleurAdministrationAdmin.obtenirStatutPaiementAdmin(
        jetonAcces,
        impersonation,
        new URL(requete.url)
      ),
      lirePolitiquePlateforme(conteneurDependances.prisma),
      lireConfigurationProvidersPaiement(
        conteneurDependances.prisma,
        conteneurDependances.serviceChiffrement
      ),
    ])
    const disponibilite = calculerDisponibiliteProvidersPaiement(configurationProviders)

    const sortie = {
      ...(donnees as Record<string, unknown>),
      graceDays: politique.paymentRules.graceDays,
      blockOnOverdue: politique.paymentRules.blockOnOverdue,
      latePenaltyPercent: politique.paymentRules.latePenaltyPercent,
      recipientName: politique.paymentRules.recipientName,
      waveRecipientPhone: politique.paymentRules.waveRecipientPhone,
      waveEnabled: politique.paymentRules.waveEnabled,
      waveMode: politique.paymentRules.waveMode,
      waveApiConfigured: disponibilite.waveApiConfigured,
      orangeRecipientPhone: politique.paymentRules.orangeRecipientPhone,
      orangeMoneyEnabled: politique.paymentRules.orangeMoneyEnabled,
      orangeMoneyMode: politique.paymentRules.orangeMoneyMode,
      orangeMoneyApiConfigured: disponibilite.orangeMoneyApiConfigured,
      orangeOtpEnabled: politique.paymentRules.orangeOtpEnabled,
      manualValidationEnabled: politique.paymentRules.manualValidationEnabled,
    }
    return conteneurDependances.reponseHttp.succes(sortie)
  }
)
