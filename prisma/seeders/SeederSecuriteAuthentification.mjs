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
      lignesTraitees += 1
      lignesCreees += 1
    } else if (utilisateurExistant.role !== role) {
      await this.prisma.utilisateur.update({
        where: { id: utilisateurExistant.id },
        data: {
          role,
          statut: donneesUtilisateur.statut,
          motDePasseHache,
        },
      })

      utilisateurId = utilisateurExistant.id
      lignesTraitees += 1
      lignesMisesAJour += 1
    } else {
      lignesIgnorees += 1
    }

    if (!utilisateurId) {
      return {
        lignesTraitees,
        lignesCreees,
        lignesMisesAJour,
        lignesIgnorees: lignesIgnorees + permissions.length,
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
    }
  }
}
