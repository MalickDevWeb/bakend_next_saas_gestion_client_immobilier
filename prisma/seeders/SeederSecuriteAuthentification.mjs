import { Algorithm, hash } from '@node-rs/argon2'
import { SeederAbstrait } from './SeederAbstrait.mjs'
import { DONNEES_SECURITE_AUTH } from './donneesSecuriteAuth.mjs'

export class SeederSecuriteAuthentification extends SeederAbstrait {
  async executer() {
    let lignesTraitees = 0
    let lignesCreees = 0
    let lignesMisesAJour = 0
    let lignesIgnorees = 0

    const resultatSuperAdmin = await this.upsertUtilisateurEtPermissions({
      role: 'SUPER_ADMIN',
      donneesUtilisateur: DONNEES_SECURITE_AUTH.superAdmin,
      permissions: DONNEES_SECURITE_AUTH.permissionsSuperAdmin,
    })
    lignesTraitees += resultatSuperAdmin.lignesTraitees
    lignesCreees += resultatSuperAdmin.lignesCreees
    lignesMisesAJour += resultatSuperAdmin.lignesMisesAJour
    lignesIgnorees += resultatSuperAdmin.lignesIgnorees

    const resultatAdmin = await this.upsertUtilisateurEtPermissions({
      role: 'ADMIN',
      donneesUtilisateur: DONNEES_SECURITE_AUTH.admin,
      permissions: DONNEES_SECURITE_AUTH.permissionsAdmin,
    })
    lignesTraitees += resultatAdmin.lignesTraitees
    lignesCreees += resultatAdmin.lignesCreees
    lignesMisesAJour += resultatAdmin.lignesMisesAJour
    lignesIgnorees += resultatAdmin.lignesIgnorees

    const resultatSupervision = await this.upsertDonneesSupervisionAdmin(
      resultatAdmin.utilisateur
    )
    lignesTraitees += resultatSupervision.lignesTraitees
    lignesCreees += resultatSupervision.lignesCreees
    lignesMisesAJour += resultatSupervision.lignesMisesAJour
    lignesIgnorees += resultatSupervision.lignesIgnorees

    return {
      nomSeeder: 'SeederSecuriteAuthentification',
      lignesTraitees,
      lignesCreees,
      lignesMisesAJour,
      lignesIgnorees,
    }
  }

  async upsertUtilisateurEtPermissions({
    role,
    donneesUtilisateur,
    permissions,
  }) {
    let lignesTraitees = 0
    let lignesCreees = 0
    let lignesMisesAJour = 0
    let lignesIgnorees = 0

    const motDePasseHache = await hash(donneesUtilisateur.motDePasse, {
      algorithm: Algorithm.Argon2id,
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1,
      outputLen: 32,
    })

    const utilisateurExistant = await this.prisma.utilisateur.findFirst({
      where: {
        OR: [{ telephone: donneesUtilisateur.telephone }, { email: donneesUtilisateur.email }],
      },
    })

    let utilisateurId = utilisateurExistant?.id || null
    let utilisateur = utilisateurExistant || null
    const forceUpdate = String(process.env.SEED_FORCE_UPDATE || '').trim().toLowerCase() === 'true'

    if (!utilisateurExistant) {
      const utilisateurCree = await this.prisma.utilisateur.create({
        data: {
          telephone: donneesUtilisateur.telephone,
          email: donneesUtilisateur.email,
          motDePasseHache,
          role,
          statut: donneesUtilisateur.statut,
          superAdminTotpActive: role === 'SUPER_ADMIN' ? donneesUtilisateur.totpActif : false,
        },
      })

      utilisateurId = utilisateurCree.id
      utilisateur = utilisateurCree
      lignesTraitees += 1
      lignesCreees += 1
    } else if (utilisateurExistant.role !== role) {
      const utilisateurMisAJour = await this.prisma.utilisateur.update({
        where: { id: utilisateurExistant.id },
        data: {
          telephone: donneesUtilisateur.telephone,
          email: donneesUtilisateur.email,
          role,
          statut: donneesUtilisateur.statut,
          motDePasseHache,
        },
      })

      utilisateurId = utilisateurExistant.id
      utilisateur = utilisateurMisAJour
      lignesTraitees += 1
      lignesMisesAJour += 1
    } else if (forceUpdate) {
      const utilisateurMisAJour = await this.prisma.utilisateur.update({
        where: { id: utilisateurExistant.id },
        data: {
          telephone: donneesUtilisateur.telephone,
          email: donneesUtilisateur.email,
          statut: donneesUtilisateur.statut,
          motDePasseHache,
        },
      })
      utilisateurId = utilisateurExistant.id
      utilisateur = utilisateurMisAJour
      lignesTraitees += 1
      lignesMisesAJour += 1
    } else {
      utilisateur = utilisateurExistant
      lignesIgnorees += 1
    }

    if (!utilisateurId) {
      return {
        lignesTraitees,
        lignesCreees,
        lignesMisesAJour,
        lignesIgnorees: lignesIgnorees + permissions.length,
        utilisateur: null,
      }
    }

    for (const code of permissions) {
      const permissionExistante = await this.prisma.permissionUtilisateur.findUnique({
        where: {
          utilisateurId_code: {
            utilisateurId,
            code,
          },
        },
      })

      if (!permissionExistante) {
        await this.prisma.permissionUtilisateur.create({
          data: {
            utilisateurId,
            code,
            autorise: true,
          },
        })
        lignesTraitees += 1
        lignesCreees += 1
      } else if (!permissionExistante.autorise) {
        await this.prisma.permissionUtilisateur.update({
          where: { id: permissionExistante.id },
          data: { autorise: true },
        })
        lignesTraitees += 1
        lignesMisesAJour += 1
      } else {
        lignesIgnorees += 1
      }
    }

    const permissionsActuelles = await this.prisma.permissionUtilisateur.findMany({
      where: { utilisateurId },
    })
    const ensembleCibles = new Set(permissions)
    for (const permissionActuelle of permissionsActuelles) {
      if (ensembleCibles.has(permissionActuelle.code)) continue
      if (!permissionActuelle.autorise) {
        lignesIgnorees += 1
        continue
      }
      await this.prisma.permissionUtilisateur.update({
        where: { id: permissionActuelle.id },
        data: { autorise: false },
      })
      lignesTraitees += 1
      lignesMisesAJour += 1
    }

    return {
      lignesTraitees,
      lignesCreees,
      lignesMisesAJour,
      lignesIgnorees,
      utilisateur,
    }
  }

  async upsertDonneesSupervisionAdmin(utilisateurAdmin) {
    if (!utilisateurAdmin) {
      return {
        lignesTraitees: 0,
        lignesCreees: 0,
        lignesMisesAJour: 0,
        lignesIgnorees: 0,
      }
    }

    let lignesTraitees = 0
    let lignesCreees = 0
    let lignesMisesAJour = 0
    let lignesIgnorees = 0

    const adminExistant = await this.prisma.admin.findUnique({
      where: { utilisateurId: utilisateurAdmin.id },
    })

    const donneesAdmin = {
      utilisateurId: utilisateurAdmin.id,
      nomUtilisateur:
        DONNEES_SECURITE_AUTH.profilAdmin.nomUtilisateur || utilisateurAdmin.telephone,
      nom: DONNEES_SECURITE_AUTH.profilAdmin.nom,
      email: utilisateurAdmin.email,
      statut: DONNEES_SECURITE_AUTH.profilAdmin.statut,
      modeAbonnement: DONNEES_SECURITE_AUTH.profilAdmin.modeAbonnement,
      montantMensuelAbonnement: DONNEES_SECURITE_AUTH.profilAdmin.montantMensuelAbonnement,
      montantAnnuelAbonnement: DONNEES_SECURITE_AUTH.profilAdmin.montantAnnuelAbonnement,
      autoriserMontantPersonnalise:
        DONNEES_SECURITE_AUTH.profilAdmin.autoriserMontantPersonnalise,
      permissionTableauDeBord: true,
      permissionClients: true,
      permissionLocations: true,
      permissionPaiements: true,
      permissionDocuments: true,
      permissionParametres: true,
      permissionTravaux: true,
      permissionImports: true,
      permissionNotifications: true,
      permissionExportPdf: true,
    }

    const admin = adminExistant
      ? await this.prisma.admin.update({
          where: { id: adminExistant.id },
          data: donneesAdmin,
        })
      : await this.prisma.admin.create({
          data: donneesAdmin,
        })

    lignesTraitees += 1
    if (adminExistant) lignesMisesAJour += 1
    else lignesCreees += 1

    const entrepriseExistante = await this.prisma.entreprise.findUnique({
      where: { id: DONNEES_SECURITE_AUTH.entrepriseAdmin.id },
    })
    if (entrepriseExistante) {
      await this.prisma.entreprise.update({
        where: { id: entrepriseExistante.id },
        data: {
          nom: DONNEES_SECURITE_AUTH.entrepriseAdmin.nom,
          adminId: admin.id,
        },
      })
      lignesTraitees += 1
      lignesMisesAJour += 1
    } else {
      await this.prisma.entreprise.create({
        data: {
          id: DONNEES_SECURITE_AUTH.entrepriseAdmin.id,
          nom: DONNEES_SECURITE_AUTH.entrepriseAdmin.nom,
          adminId: admin.id,
        },
      })
      lignesTraitees += 1
      lignesCreees += 1
    }

    const demandeExistante = await this.prisma.demandeAdmin.findUnique({
      where: { id: DONNEES_SECURITE_AUTH.demandeAdmin.id },
    })
    const donneesDemande = {
      nom: DONNEES_SECURITE_AUTH.demandeAdmin.nom,
      email: DONNEES_SECURITE_AUTH.demandeAdmin.email,
      telephone: DONNEES_SECURITE_AUTH.demandeAdmin.telephone,
      nomEntreprise: DONNEES_SECURITE_AUTH.demandeAdmin.nomEntreprise,
      statut: DONNEES_SECURITE_AUTH.demandeAdmin.statut,
      nomUtilisateur: DONNEES_SECURITE_AUTH.demandeAdmin.nomUtilisateur,
      motDePasse: DONNEES_SECURITE_AUTH.demandeAdmin.motDePasse,
      paye: DONNEES_SECURITE_AUTH.demandeAdmin.paye,
      payeLe: DONNEES_SECURITE_AUTH.demandeAdmin.paye ? new Date() : null,
    }

    if (demandeExistante) {
      await this.prisma.demandeAdmin.update({
        where: { id: demandeExistante.id },
        data: donneesDemande,
      })
      lignesTraitees += 1
      lignesMisesAJour += 1
    } else {
      await this.prisma.demandeAdmin.create({
        data: {
          id: DONNEES_SECURITE_AUTH.demandeAdmin.id,
          ...donneesDemande,
        },
      })
      lignesTraitees += 1
      lignesCreees += 1
    }

    if (!lignesTraitees) {
      lignesIgnorees += 1
    }

    return {
      lignesTraitees,
      lignesCreees,
      lignesMisesAJour,
      lignesIgnorees,
    }
  }
}
