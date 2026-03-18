import { v4 as uuid } from 'uuid'
import { InterfaceDaoContractTemplate } from '@/src/domaine/interfaces/dao/contrats/InterfaceDaoContractTemplate'
import { InterfaceDaoInventoryTemplate } from '@/src/domaine/interfaces/dao/contrats/InterfaceDaoInventoryTemplate'
import { InterfaceDaoContract } from '@/src/domaine/interfaces/dao/contrats/InterfaceDaoContract'
import { InterfaceDaoClient } from '@/src/domaine/interfaces/dao/locations/InterfaceDaoClient'
import { InterfaceDaoLocation } from '@/src/domaine/interfaces/dao/locations/InterfaceDaoLocation'
import { ServiceAuthentification } from '@/src/application/services/authentification/ServiceAuthentification'
import { ServiceRenduContrat } from '@/src/application/services/administration/contrats/ServiceRenduContrat'
import { BuilderEntiteContractTemplate } from '@/src/domaine/builders/BuilderEntiteContractTemplate'
import { BuilderEntiteInventoryTemplate } from '@/src/domaine/builders/BuilderEntiteInventoryTemplate'
import { BuilderEntiteContract } from '@/src/domaine/builders/BuilderEntiteContract'

type TypeContexteAdmin = { adminId: string }

type TypePayloadGeneration = {
  templateId?: string | null
  locationId?: string | null
  donnees?: Record<string, unknown>
}

export class ServiceAdministrationAdminContrats {
  constructor(
    private readonly securite: ServiceAuthentification,
    private readonly daoTemplate: InterfaceDaoContractTemplate,
    private readonly daoInventoryTemplate: InterfaceDaoInventoryTemplate,
    private readonly daoContract: InterfaceDaoContract,
    private readonly daoClient: InterfaceDaoClient,
    private readonly daoLocation: InterfaceDaoLocation,
    private readonly rendu: ServiceRenduContrat
  ) {}

  // ---- Templates ----
  public async listerTemplates(jetonAcces: string, impersonation: unknown): Promise<unknown[]> {
    const ctx = await this.validerAdmin(jetonAcces, impersonation)
    return this.daoTemplate.listerParAdmin(ctx.adminId)
  }
  public async listerInventoryTemplates(jetonAcces: string, impersonation: unknown) {
    const ctx = await this.validerAdmin(jetonAcces, impersonation)
    return this.daoInventoryTemplate.listerParAdmin(ctx.adminId)
  }

  public async creerTemplate(jetonAcces: string, impersonation: unknown, entree: any) {
    const ctx = await this.validerAdmin(jetonAcces, impersonation)
    const id = uuid()
    const entite = new BuilderEntiteContractTemplate()
      .avecId(id)
      .avecAdminId(ctx.adminId)
      .avecNom(String(entree?.nom || 'Contrat'))
      .avecCorps(String(entree?.corps || ''))
      .avecPlaceholders((entree?.placeholders as Record<string, unknown>) || null)
      .avecVersion(1)
      .build()
    const saved = await this.daoTemplate.sauvegarder(entite)
    return saved
  }

  public async mettreAJourTemplate(jetonAcces: string, impersonation: unknown, entree: any) {
    const ctx = await this.validerAdmin(jetonAcces, impersonation)
    const id = String(entree?.id || '').trim()
    const existant = await this.daoTemplate.rechercherParId(id)
    if (!existant || existant.adminId !== ctx.adminId) {
      throw new Error('Template introuvable ou non autorisé')
    }
    const version =
      existant.corps !== String(entree?.corps || existant.corps) ? existant.version + 1 : existant.version
    const entite = new BuilderEntiteContractTemplate()
      .avecId(id)
      .avecAdminId(ctx.adminId)
      .avecNom(String(entree?.nom || existant.nom))
      .avecCorps(String(entree?.corps ?? existant.corps))
      .avecPlaceholders((entree?.placeholders as Record<string, unknown>) ?? existant.placeholders)
      .avecVersion(version)
      .avecCreeLe(existant.creeLe)
      .avecMisAJourLe(new Date())
      .build()
    const saved = await this.daoTemplate.sauvegarder(entite)
    return saved
  }

  public async supprimerTemplate(jetonAcces: string, impersonation: unknown, entree: any) {
    const ctx = await this.validerAdmin(jetonAcces, impersonation)
    const id = String(entree?.id || '').trim()
    const existant = await this.daoTemplate.rechercherParId(id)
    if (!existant || existant.adminId !== ctx.adminId) {
      throw new Error('Template introuvable ou non autorisé')
    }
    await this.daoTemplate.supprimerParId(id)
    return { ok: true }
  }

  // ---- Templates état des lieux ----
  public async creerInventoryTemplate(jetonAcces: string, impersonation: unknown, entree: any) {
    const ctx = await this.validerAdmin(jetonAcces, impersonation)
    const id = uuid()
    const entite = new BuilderEntiteInventoryTemplate()
      .avecId(id)
      .avecAdminId(ctx.adminId)
      .avecNom(String(entree?.nom || 'État des lieux'))
      .avecCorps(String(entree?.corps || ''))
      .avecPlaceholders((entree?.placeholders as Record<string, unknown>) || null)
      .avecIsTable(Boolean(entree?.isTable))
      .avecVersion(1)
      .build()
    return this.daoInventoryTemplate.sauvegarder(entite)
  }

  public async mettreAJourInventoryTemplate(jetonAcces: string, impersonation: unknown, entree: any) {
    const ctx = await this.validerAdmin(jetonAcces, impersonation)
    const id = String(entree?.id || '').trim()
    const existant = await this.daoInventoryTemplate.rechercherParId(id)
    if (!existant || existant.adminId !== ctx.adminId) throw new Error('Modèle introuvable')
    const version =
      existant.corps !== String(entree?.corps || existant.corps) ? existant.version + 1 : existant.version
    const entite = new BuilderEntiteInventoryTemplate()
      .avecId(id)
      .avecAdminId(ctx.adminId)
      .avecNom(String(entree?.nom || existant.nom))
      .avecCorps(String(entree?.corps ?? existant.corps))
      .avecPlaceholders((entree?.placeholders as Record<string, unknown>) ?? existant.placeholders)
      .avecIsTable(Boolean(entree?.isTable ?? existant.isTable))
      .avecVersion(version)
      .avecCreeLe(existant.creeLe)
      .avecMisAJourLe(new Date())
      .build()
    return this.daoInventoryTemplate.sauvegarder(entite)
  }

  public async supprimerInventoryTemplate(jetonAcces: string, impersonation: unknown, entree: any) {
    const ctx = await this.validerAdmin(jetonAcces, impersonation)
    const id = String(entree?.id || '').trim()
    const existant = await this.daoInventoryTemplate.rechercherParId(id)
    if (!existant || existant.adminId !== ctx.adminId) throw new Error('Modèle introuvable')
    await this.daoInventoryTemplate.supprimerParId(id)
    return { ok: true }
  }

  // ---- Contrats ----
  public async listerContrats(jetonAcces: string, impersonation: unknown, clientId?: string) {
    const ctx = await this.validerAdmin(jetonAcces, impersonation)
    if (clientId) return this.daoContract.listerParClient(ctx.adminId, clientId)
    return this.daoContract.listerParAdmin(ctx.adminId)
  }

  public async obtenirContrat(jetonAcces: string, impersonation: unknown, id: string) {
    const ctx = await this.validerAdmin(jetonAcces, impersonation)
    const contrat = await this.daoContract.rechercherParId(String(id || '').trim())
    if (!contrat || contrat.adminId !== ctx.adminId) throw new Error('Contrat introuvable ou non autorisé')
    return contrat
  }

  public async genererContrat(
    jetonAcces: string,
    impersonation: unknown,
    clientId: string,
    payload: TypePayloadGeneration
  ) {
    const ctx = await this.validerAdmin(jetonAcces, impersonation)
    const client = await this.daoClient.rechercherParId(String(clientId || '').trim())
    if (!client || client.adminId !== ctx.adminId) throw new Error('Client introuvable ou non autorisé')

    const location =
      payload.locationId && (await this.daoLocation.rechercherParId(String(payload.locationId)))
    if (payload.locationId && (!location || location.clientId !== client.id)) {
      throw new Error('Location introuvable pour ce client')
    }

    let template = null
    if (payload.templateId) {
      template = await this.daoTemplate.rechercherParId(String(payload.templateId))
      if (!template || template.adminId !== ctx.adminId) throw new Error('Template non autorisé')
    }

    const corps = template?.corps || ''
    const rendu = await this.rendu.rendre(corps, payload.donnees || {})

    const entite = new BuilderEntiteContract()
      .avecId(uuid())
      .avecAdminId(ctx.adminId)
      .avecClientId(client.id)
      .avecLocationId(location ? location.id : null)
      .avecTemplateId(template ? template.id : null)
      .avecStatut('pending_signature')
      .avecPdfUrl(rendu.pdfUrl)
      .avecPayload(payload.donnees || {})
      .avecHashContenu(rendu.hashContenu)
      .avecCreeLe(new Date())
      .avecMisAJourLe(new Date())
      .build()

    const saved = await this.daoContract.sauvegarder(entite)
    return saved
  }

  public async signerContrat(
    jetonAcces: string,
    impersonation: unknown,
    id: string,
    signatures: Record<string, unknown> | null
  ) {
    const ctx = await this.validerAdmin(jetonAcces, impersonation)
    const contrat = await this.daoContract.rechercherParId(String(id || '').trim())
    if (!contrat || contrat.adminId !== ctx.adminId) throw new Error('Contrat introuvable ou non autorisé')
    const entite = new BuilderEntiteContract()
      .avecId(contrat.id)
      .avecAdminId(contrat.adminId)
      .avecClientId(contrat.clientId)
      .avecLocationId(contrat.locationId)
      .avecTemplateId(contrat.templateId)
      .avecStatut('signed')
      .avecPdfUrl(contrat.pdfUrl)
      .avecPayload({ ...(contrat.payload || {}), signatures })
      .avecHashContenu(contrat.hashContenu)
      .avecSigneLe(new Date())
      .avecCreeLe(contrat.creeLe)
      .avecMisAJourLe(new Date())
      .build()
    const saved = await this.daoContract.sauvegarder(entite)
    return saved
  }

  // ---- Helpers ----
  private async validerAdmin(jetonAcces: string, impersonation: unknown): Promise<TypeContexteAdmin> {
    const contexte = await this.securite.obtenirContexteDepuisJetonAcces(jetonAcces)
    if (!contexte.utilisateur || contexte.utilisateur.role !== 'ADMIN') {
      throw new Error('Accès refusé')
    }
    return { adminId: contexte.utilisateur.id }
  }
}
