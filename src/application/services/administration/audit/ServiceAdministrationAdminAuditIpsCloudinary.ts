import { DtoEtatImpersonation } from '@/src/application/dtos/authentification/DtoAuthentification'
import { TypeResultatMutationAdministrationAdmin } from '@/src/domaine/types/administration'
import { ServiceAdministrationAdminUtilitaires } from '@/src/application/services/administration/commun/ServiceAdministrationAdminUtilitaires'
import type { TypeDependancesServiceAdministrationAdminAuditIpsCloudinary } from '@/src/application/types/administration/audit/TypeDependancesServiceAdministrationAdminAuditIpsCloudinary'
import { CODE_HTTP, ERRORS, t } from '@/src/messages'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { v2 as cloudinary } from 'cloudinary'

export class ServiceAdministrationAdminAuditIpsCloudinary {
  constructor(private readonly dependances: TypeDependancesServiceAdministrationAdminAuditIpsCloudinary) {}

  public async listerJournauxAudit(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    champTri?: string | null,
    ordreTri?: string | null
  ): Promise<Record<string, unknown>[]> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'audit_logs')
    const elements = (await this.dependances.daoJournalAudit.lister()).map((element) =>
      this.dependances.mappeur.mapperJournalAuditEnDto(element)
    )
    return ServiceAdministrationAdminUtilitaires.trierElements(elements, champTri, ordreTri)
  }

  public async obtenirJournalAudit(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    journalId: string
  ): Promise<Record<string, unknown>> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'audit_logs')
    const journal = await this.dependances.daoJournalAudit.rechercherParId(journalId)
    this.exigerEntite(journal, t(ERRORS.ADMIN_JOURNAL_AUDIT_INTROUVABLE))
    return this.dependances.mappeur.mapperJournalAuditEnDto(journal)
  }

  public async creerJournalAudit(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'audit_logs')
    const journal = this.dependances.constructeur.construireEntiteJournalAuditDepuisCorps(corps)
    await this.dependances.daoJournalAudit.sauvegarder(journal)

    const dto = this.dependances.mappeur.mapperJournalAuditEnDto(journal)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'audit_logs',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      resourceId: journal.id,
      path: `/audit_logs/${journal.id}`,
      executerRollback: async () => {
        await this.dependances.daoJournalAudit.supprimerParId(journal.id)
      },
    })

    return { donnees: dto, annulation }
  }

  public async supprimerJournalAudit(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    journalId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'audit_logs')
    const journal = await this.dependances.daoJournalAudit.rechercherParId(journalId)
    this.exigerEntite(journal, t(ERRORS.ADMIN_JOURNAL_AUDIT_INTROUVABLE))

    const avantEntite = journal
    await this.dependances.daoJournalAudit.supprimerParId(journalId)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'audit_logs',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      resourceId: journalId,
      path: `/audit_logs/${journalId}`,
      executerRollback: async () => {
        await this.dependances.daoJournalAudit.sauvegarder(avantEntite)
      },
    })

    return { donnees: { ok: true }, annulation }
  }

  public async appliquerRetentionJournauxAudit(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    retentionDays: number
  ): Promise<{ ok: true; deletedCount: number }> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'audit_logs')
    const retentionProtegee = Math.max(1, Math.floor(Number(retentionDays || 1)))
    const cutoff = Date.now() - retentionProtegee * 24 * 60 * 60 * 1000
    const journaux = await this.dependances.daoJournalAudit.lister()
    let deletedCount = 0

    for (const journal of journaux) {
      if (journal.creeLe.getTime() >= cutoff) continue
      await this.dependances.daoJournalAudit.supprimerParId(journal.id)
      deletedCount += 1
    }

    return { ok: true, deletedCount }
  }

  public async listerIpsBloquees(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    champTri?: string | null,
    ordreTri?: string | null
  ): Promise<Record<string, unknown>[]> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'blocked_ips')
    const elements = (await this.dependances.daoIpBloquee.lister()).map((element) =>
      this.dependances.mappeur.mapperIpBloqueeEnDto(element)
    )
    return ServiceAdministrationAdminUtilitaires.trierElements(elements, champTri, ordreTri)
  }

  public async obtenirIpBloquee(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    ipId: string
  ): Promise<Record<string, unknown>> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'blocked_ips')
    const entite = await this.dependances.daoIpBloquee.rechercherParId(ipId)
    this.exigerEntite(entite, t(ERRORS.ADMIN_IP_BLOQUEE_INTROUVABLE))
    return this.dependances.mappeur.mapperIpBloqueeEnDto(entite)
  }

  public async bloquerIp(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    corps: Record<string, unknown>
  ): Promise<TypeResultatMutationAdministrationAdmin<Record<string, unknown>>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'blocked_ips')
    const entite = this.dependances.constructeur.construireEntiteIpBloqueeDepuisCorps(corps)
    await this.dependances.daoIpBloquee.sauvegarder(entite)

    const dto = this.dependances.mappeur.mapperIpBloqueeEnDto(entite)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'blocked_ips',
      operation: 'CREATE',
      actorId: contexte.utilisateurId,
      resourceId: entite.id,
      path: `/blocked_ips/${entite.id}`,
      executerRollback: async () => {
        await this.dependances.daoIpBloquee.supprimerParId(entite.id)
      },
    })

    return { donnees: dto, annulation }
  }

  public async debloquerIp(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    ipId: string
  ): Promise<TypeResultatMutationAdministrationAdmin<{ ok: true }>> {
    const contexte = await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'blocked_ips')
    const entite = await this.dependances.daoIpBloquee.rechercherParId(ipId)
    this.exigerEntite(entite, t(ERRORS.ADMIN_IP_BLOQUEE_INTROUVABLE))

    const avantEntite = entite
    await this.dependances.daoIpBloquee.supprimerParId(ipId)
    const annulation = this.dependances.annulation.enregistrerActionAnnulation({
      ressource: 'blocked_ips',
      operation: 'DELETE',
      actorId: contexte.utilisateurId,
      resourceId: ipId,
      path: `/blocked_ips/${ipId}`,
      executerRollback: async () => {
        await this.dependances.daoIpBloquee.sauvegarder(avantEntite)
      },
    })

    return { donnees: { ok: true }, annulation }
  }

  public async ouvrirUrlCloudinary(
    jetonAcces: string,
    impersonation: DtoEtatImpersonation,
    url: string
  ): Promise<{ url: string }> {
    await this.dependances.securite.obtenirContexteAcces(jetonAcces, impersonation, 'cloudinary')
    const cible = String(url || '').trim()
    if (!cible) return { url: '' }

    if (!cible.includes('res.cloudinary.com')) return { url: cible }

    try {
      const parsed = new URL(cible)
      const segments = parsed.pathname.split('/').filter(Boolean)
      if (segments.length < 5) return { url: cible }

      const cloudName = segments[0]
      const resourceType = (segments[1] || 'raw') as 'image' | 'video' | 'raw' | 'auto'
      const deliveryType = segments[2] || 'authenticated'
      const publicIdWithExt = segments.slice(4).join('/')
      const formatMatch = publicIdWithExt.match(/\.([a-z0-9]+)$/i)
      const format = formatMatch ? formatMatch[1] : undefined
      const publicId = publicIdWithExt.replace(/\.[a-z0-9]+$/i, '')
      const downloadFormat = format ?? 'pdf'

      cloudinary.config({
        cloud_name: cloudName,
        api_key: String(process.env.CLOUDINARY_API_KEY || ''),
        api_secret: String(process.env.CLOUDINARY_API_SECRET || ''),
        secure: true,
      })

      const signedUrl = cloudinary.utils.private_download_url(publicId, downloadFormat, {
        resource_type: resourceType,
        type: deliveryType === 'authenticated' ? 'authenticated' : 'authenticated',
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1h
      })

      return { url: signedUrl }
    } catch (error) {
      return { url: cible }
    }
  }

  private exigerEntite<T>(entite: T | null | undefined, message: string): asserts entite is T {
    if (!entite) {
      throw new ErreurHttp(CODE_HTTP.NON_TROUVE, message)
    }
  }
}
