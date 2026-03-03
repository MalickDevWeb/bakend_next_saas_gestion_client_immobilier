import { Algorithm, hash } from '@node-rs/argon2'
import { SeederAbstrait } from './SeederAbstrait.mjs'
import { DONNEES_SECURITE_AUTH } from './donneesSecuriteAuth.mjs'

export class SeederSecuriteAuthentification extends SeederAbstrait {
  async executer() {
    const donneesSuperAdmin = DONNEES_SECURITE_AUTH.superAdmin
    const permissions = DONNEES_SECURITE_AUTH.permissionsSuperAdmin

    let lignesTraitees = 0
    let lignesCreees = 0
    let lignesMisesAJour = 0
    let lignesIgnorees = 0

    const motDePasseHache = await hash(donneesSuperAdmin.motDePasse, {
      algorithm: Algorithm.Argon2id,
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1,
      outputLen: 32,
    })

    const utilisateurExistant = await this.prisma.utilisateur.findFirst({
      where: {
        OR: [
          { nomUtilisateur: donneesSuperAdmin.nomUtilisateur },
          { email: donneesSuperAdmin.email },
        ],
      },
    })

    let utilisateurId = utilisateurExistant?.id || null

    if (!utilisateurExistant) {
      const utilisateur = await this.prisma.utilisateur.create({
        data: {
          nomUtilisateur: donneesSuperAdmin.nomUtilisateur,
          email: donneesSuperAdmin.email,
          motDePasseHache,
          role: 'SUPER_ADMIN',
          statut: donneesSuperAdmin.statut,
          superAdminTotpActive: donneesSuperAdmin.totpActif,
        },
      })

      utilisateurId = utilisateur.id
      lignesTraitees += 1
      lignesCreees += 1
    } else if (utilisateurExistant.role !== 'SUPER_ADMIN') {
      await this.prisma.utilisateur.update({
        where: { id: utilisateurExistant.id },
        data: {
          role: 'SUPER_ADMIN',
          statut: donneesSuperAdmin.statut,
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
        nomSeeder: 'SeederSecuriteAuthentification',
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

    return {
      nomSeeder: 'SeederSecuriteAuthentification',
      lignesTraitees,
      lignesCreees,
      lignesMisesAJour,
      lignesIgnorees,
    }
  }
}
