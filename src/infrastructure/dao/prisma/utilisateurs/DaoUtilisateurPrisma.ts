import { PrismaClient, Prisma, TypeRoleUtilisateur, TypeStatutUtilisateur } from '@prisma/client'
import { BuilderEntiteUtilisateur } from '@/src/domaine/builders'
import { EntiteUtilisateur } from '@/src/domaine/entites/utilisateurs/EntiteUtilisateur'
import { EnumerationRoleUtilisateur } from '@/src/domaine/enumerations/EnumerationRoleUtilisateur'
import { InterfaceDaoUtilisateur } from '@/src/domaine/interfaces/dao/utilisateurs/InterfaceDaoUtilisateur'
import { ErreurHttp } from '@/src/coeur/erreurs/ErreurHttp'
import { CODE_HTTP } from '@/src/messages'

export class DaoUtilisateurPrisma implements InterfaceDaoUtilisateur {
  constructor(private readonly prisma: PrismaClient) {}

  public async lister(): Promise<EntiteUtilisateur[]> {
    const elements = await this.prisma.utilisateur.findMany({
      orderBy: { creeLe: 'desc' },
    })
    return elements.map((element) => this.mapperVersEntite(element))
  }

  public async rechercherParId(id: string): Promise<EntiteUtilisateur | null> {
    const element = await this.prisma.utilisateur.findUnique({
      where: { id: String(id || '').trim() },
    })
    if (!element) return null
    return this.mapperVersEntite(element)
  }

  public async sauvegarder(entite: EntiteUtilisateur): Promise<EntiteUtilisateur> {
    const telephone = this.resoudreTelephone(entite)
    try {
      const element = await this.prisma.utilisateur.upsert({
        where: { id: entite.id },
        create: {
          id: entite.id,
          telephone,
          email: entite.email.valeur,
          motDePasseHache: entite.motDePasseHash,
          role: this.mapperRoleVersPrisma(entite.role),
          statut: this.mapperStatutVersPrisma(entite.statut),
        },
        update: {
          telephone,
          email: entite.email.valeur,
          motDePasseHache: entite.motDePasseHash,
          role: this.mapperRoleVersPrisma(entite.role),
          statut: this.mapperStatutVersPrisma(entite.statut),
        },
      })

      return this.mapperVersEntite(element)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const cible = Array.isArray(error.meta?.target) ? error.meta?.target : []
        const champs = (cible as string[]).map((c) => c.toLowerCase())
        if (champs.includes('email')) {
          throw new ErreurHttp(CODE_HTTP.CONFLIT, 'Email déjà utilisé.')
        }
        if (champs.includes('telephone')) {
          throw new ErreurHttp(CODE_HTTP.CONFLIT, 'Téléphone déjà utilisé.')
        }
        throw new ErreurHttp(CODE_HTTP.CONFLIT, 'Identifiant déjà utilisé.')
      }
      throw error
    }
  }

  public async supprimerParId(id: string): Promise<void> {
    await this.prisma.utilisateur.delete({
      where: { id: String(id || '').trim() },
    })
  }

  private mapperVersEntite(element: {
    id: string
    telephone: string
    email: string
    role: TypeRoleUtilisateur
    statut: TypeStatutUtilisateur
    motDePasseHache: string
    creeLe: Date
  }): EntiteUtilisateur {
    const builder = new BuilderEntiteUtilisateur()
      .avecId(element.id)
      .avecIdentifiantConnexion(element.telephone)
      .avecNomComplet(element.telephone)
      .avecEmail(element.email)
      .avecRole(this.mapperRoleDepuisPrisma(element.role))
      .avecStatut(this.mapperStatutDepuisPrisma(element.statut))
      .avecMotDePasseHash(element.motDePasseHache)
      .avecDateCreation(element.creeLe)

    if (this.estTelephoneSenegal(element.telephone)) {
      builder.avecTelephone(element.telephone)
    }

    return builder.construire()
  }

  private mapperRoleVersPrisma(role: EnumerationRoleUtilisateur): TypeRoleUtilisateur {
    if (role === EnumerationRoleUtilisateur.SUPER_ADMIN) return 'SUPER_ADMIN'
    if (role === EnumerationRoleUtilisateur.ADMIN) return 'ADMIN'
    return 'UTILISATEUR'
  }

  private mapperRoleDepuisPrisma(role: TypeRoleUtilisateur): EnumerationRoleUtilisateur {
    if (role === 'SUPER_ADMIN') return EnumerationRoleUtilisateur.SUPER_ADMIN
    if (role === 'ADMIN') return EnumerationRoleUtilisateur.ADMIN
    return EnumerationRoleUtilisateur.UTILISATEUR
  }

  private mapperStatutVersPrisma(statut: string): TypeStatutUtilisateur {
    const valeur = String(statut || 'ACTIF').toUpperCase()
    if (valeur === 'SUSPENDU') return 'SUSPENDU'
    if (valeur === 'ARCHIVE') return 'ARCHIVE'
    if (valeur === 'EN_ATTENTE') return 'EN_ATTENTE'
    return 'ACTIF'
  }

  private mapperStatutDepuisPrisma(statut: TypeStatutUtilisateur): 'ACTIF' | 'SUSPENDU' | 'ARCHIVE' {
    if (statut === 'SUSPENDU') return 'SUSPENDU'
    if (statut === 'ARCHIVE') return 'ARCHIVE'
    return 'ACTIF'
  }

  private resoudreTelephone(entite: EntiteUtilisateur): string {
    const direct = String(entite.telephone || '').trim()
    if (direct) return direct
    const identifiant = String(entite.identifiantConnexion || '').trim()
    if (identifiant) return identifiant
    return `77${Date.now().toString().slice(-7)}`
  }

  private estTelephoneSenegal(valeur: string): boolean {
    return /^(70|75|76|77|78)\d{7}$/.test(String(valeur || '').trim())
  }
}
