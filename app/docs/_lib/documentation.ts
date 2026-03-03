import { readFile } from 'node:fs/promises'
import path from 'node:path'

export type TypeDocumentSite = {
  slug: string
  titre: string
  fichier: string
  resume: string
}

export const DOCUMENTS_SITE: TypeDocumentSite[] = [
  {
    slug: 'charte-documentation',
    titre: 'Charte documentation obligatoire',
    fichier: 'CHARTE_DOCUMENTATION_OBLIGATOIRE.md',
    resume: 'Regles officielles: toute modification doit etre documentee.',
  },
  {
    slug: 'index',
    titre: 'Index de la documentation',
    fichier: 'INDEX_DOCUMENTATION_COMPLETE.md',
    resume: 'Point d entree et ordre recommande de lecture.',
  },
  {
    slug: 'guide-maitre',
    titre: 'Guide maitre architecture',
    fichier: 'GUIDE_MAITRE_ARCHITECTURE_REUTILISABLE.md',
    resume: 'Vision complete, reproduction pas a pas et regles du projet.',
  },
  {
    slug: 'guide-dossiers',
    titre: 'Guide dossier par dossier',
    fichier: 'GUIDE_DOSSIER_PAR_DOSSIER.md',
    resume: 'Ou mettre chaque chose, pourquoi, et quand modifier.',
  },
  {
    slug: 'securite-authentification-90',
    titre: 'Securite authentification 90',
    fichier: 'SECURITE_AUTHENTIFICATION_90.md',
    resume: '2FA TOTP, refresh rotation, CSRF, RBAC, audit, headers et CORS strict.',
  },
  {
    slug: 'authentification-100-couches',
    titre: 'Authentification 100 couches',
    fichier: 'AUTHENTIFICATION_100_COUCHES.md',
    resume: 'Repository + DAO + domaine auth complet avec driver prisma ou memoire.',
  },
  {
    slug: 'seeders',
    titre: 'Guide complet des seeders',
    fichier: 'SEEDERS_GUIDE_COMPLET.md',
    resume: 'Architecture seeders, commandes et extension du systeme.',
  },
  {
    slug: 'modele-configuration',
    titre: 'Modele configuration systeme',
    fichier: 'MODELE_CONFIGURATION_SYSTEME.md',
    resume: 'Structure recommandee de la table de configuration en base.',
  },
  {
    slug: 'deploiement-render',
    titre: 'Deploiement Render Docker',
    fichier: 'DEPLOIEMENT_RENDER_DOCKER.md',
    resume: 'Guide complet pour deployer le backend sur Render.',
  },
  {
    slug: 'captures',
    titre: 'Captures arborescences et flux',
    fichier: 'CAPTURES_DOSSIERS_ET_SOUS_DOSSIERS.md',
    resume: 'Captures textuelles completes + schemas de flux.',
  },
  {
    slug: 'reference-fichiers',
    titre: 'Reference fichier par fichier',
    fichier: 'REFERENCE_FICHIER_PAR_FICHIER.md',
    resume: 'Table exhaustive de tous les fichiers du projet.',
  },
  {
    slug: 'concepts',
    titre: 'Concepts POO SOLID',
    fichier: 'CONCEPTS_BACKEND_POO_SOLID.md',
    resume: 'Explication des concepts architecturaux utilises.',
  },
  {
    slug: 'documentation-historique',
    titre: 'Documentation historique',
    fichier: 'DOCUMENTATION_FICHIER_PAR_FICHIER.md',
    resume: 'Version historique du guide fichier par fichier.',
  },
]

export function obtenirDocumentsSite(): TypeDocumentSite[] {
  return DOCUMENTS_SITE
}

export function obtenirDocumentParSlug(slug: string): TypeDocumentSite | undefined {
  return DOCUMENTS_SITE.find((document) => document.slug === slug)
}

export async function chargerContenuDocument(fichier: string): Promise<string> {
  const chemin = path.join(process.cwd(), 'docs', fichier)
  return readFile(chemin, 'utf8')
}
