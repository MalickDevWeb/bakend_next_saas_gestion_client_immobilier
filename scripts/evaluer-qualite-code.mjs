import { readdir, readFile } from 'node:fs/promises'
import { execSync } from 'node:child_process'
import path from 'node:path'

const SEUIL_PAR_DEFAUT = 80
const EXTENSIONS = new Set(['.ts', '.tsx'])
const DOSSIERS_CIBLES = ['src', 'app/api']
const DOSSIERS_IGNORES = new Set(['node_modules', '.next', '.git', 'dist', 'build'])
const PORTEE_PAR_DEFAUT = 'delta'

async function listerFichiers(dossierRacine) {
  const resultat = []

  async function parcourir(dossierCourant) {
    const elements = await readdir(dossierCourant, { withFileTypes: true })
    for (const element of elements) {
      if (DOSSIERS_IGNORES.has(element.name)) continue

      const cheminComplet = path.join(dossierCourant, element.name)
      if (element.isDirectory()) {
        await parcourir(cheminComplet)
        continue
      }

      if (!element.isFile()) continue
      const extension = path.extname(element.name)
      if (!EXTENSIONS.has(extension)) continue
      if (element.name.endsWith('.d.ts')) continue
      resultat.push(cheminComplet)
    }
  }

  await parcourir(dossierRacine)
  return resultat
}

function executerCommande(command) {
  try {
    const sortie = execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    return sortie
      .split('\n')
      .map((ligne) => ligne.trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

function estDansDossiersCibles(cheminRelatif) {
  const normalise = cheminRelatif.replaceAll('\\', '/')
  return DOSSIERS_CIBLES.some((dossier) => normalise === dossier || normalise.startsWith(`${dossier}/`))
}

function filtrerFichiersTypeScript(chemins) {
  return chemins.filter((cheminRelatif) => {
    if (!estDansDossiersCibles(cheminRelatif)) return false
    const extension = path.extname(cheminRelatif)
    if (!EXTENSIONS.has(extension)) return false
    if (cheminRelatif.endsWith('.d.ts')) return false
    return true
  })
}

function listerFichiersDelta(racine) {
  const unstaged = executerCommande('git diff --name-only --diff-filter=ACMRTUXB')
  const staged = executerCommande('git diff --cached --name-only --diff-filter=ACMRTUXB')
  const untracked = executerCommande('git ls-files --others --exclude-standard')

  const uniques = new Set([...unstaged, ...staged, ...untracked])
  const fichiers = filtrerFichiersTypeScript([...uniques])
  return fichiers.map((fichierRelatif) => path.join(racine, fichierRelatif))
}

function compterOccurences(texte, motif) {
  const occurrences = texte.match(motif)
  return occurrences ? occurrences.length : 0
}

function calculerPenaliteAvecPlafond(valeur, multiplicateur, plafond) {
  return Math.min(valeur * multiplicateur, plafond)
}

async function evaluerQualite() {
  const racine = process.cwd()
  const seuil = Number.parseInt(process.env.QUALITE_MIN_SCORE || `${SEUIL_PAR_DEFAUT}`, 10)
  const portee = String(process.env.QUALITE_PORTEE || PORTEE_PAR_DEFAUT).toLowerCase()

  let fichiers = []
  if (portee === 'projet') {
    for (const dossier of DOSSIERS_CIBLES) {
      const chemin = path.join(racine, dossier)
      const sousFichiers = await listerFichiers(chemin).catch(() => [])
      fichiers = fichiers.concat(sousFichiers)
    }
  } else {
    fichiers = listerFichiersDelta(racine)
    if (fichiers.length === 0) {
      console.log('=== Evaluation qualite code ===')
      console.log('Portee: delta (fichiers modifies)')
      console.log('Aucun fichier TypeScript modifie dans src/ ou app/api/.')
      console.log(`Score calcule: 100% (seuil requis: ${seuil}%)`)
      console.log('SUCCES: rien a corriger dans le delta courant.')
      process.exit(0)
    }
  }

  let nombreAny = 0
  let nombreTodo = 0
  let nombreConsole = 0
  let nombreThrowLitteral = 0
  const fichiersClassesLongues = []

  for (const fichier of fichiers) {
    const contenu = await readFile(fichier, 'utf8')
    const lignes = contenu.split('\n').length

    nombreAny += compterOccurences(contenu, /\bany\b/g)
    nombreTodo += compterOccurences(contenu, /\b(TODO|FIXME)\b/g)
    nombreConsole += compterOccurences(contenu, /\bconsole\.(log|debug|info|warn|error)\s*\(/g)
    nombreThrowLitteral += compterOccurences(
      contenu,
      /throw\s+new\s+[A-Za-z0-9_]+\(\s*(['"`]).*?\1/g
    )

    const contientClasse = /\bclass\s+[A-Z][A-Za-z0-9_]*/.test(contenu)
    if (contientClasse && lignes > 220) {
      fichiersClassesLongues.push({ fichier, lignes })
    }
  }

  const penalites = {
    any: calculerPenaliteAvecPlafond(nombreAny, 2, 25),
    todo: calculerPenaliteAvecPlafond(nombreTodo, 2, 15),
    console: calculerPenaliteAvecPlafond(nombreConsole, 1, 10),
    throwsLitteraux: calculerPenaliteAvecPlafond(nombreThrowLitteral, 3, 20),
    classesLongues: calculerPenaliteAvecPlafond(fichiersClassesLongues.length, 5, 30),
  }

  const totalPenalites = Object.values(penalites).reduce((somme, valeur) => somme + valeur, 0)
  const score = Math.max(0, 100 - totalPenalites)

  console.log('=== Evaluation qualite code ===')
  console.log(`Portee: ${portee === 'projet' ? 'projet complet' : 'delta (fichiers modifies)'}`)
  console.log(`Fichiers analyses: ${fichiers.length}`)
  console.log(`Seuil requis: ${seuil}%`)
  console.log(`Score calcule: ${score}%`)
  console.log('')
  console.log('Detail penalites:')
  console.log(`- any: ${nombreAny} => -${penalites.any}`)
  console.log(`- TODO/FIXME: ${nombreTodo} => -${penalites.todo}`)
  console.log(`- console.*: ${nombreConsole} => -${penalites.console}`)
  console.log(`- throw litteral: ${nombreThrowLitteral} => -${penalites.throwsLitteraux}`)
  console.log(`- classes longues (>220 lignes): ${fichiersClassesLongues.length} => -${penalites.classesLongues}`)

  if (fichiersClassesLongues.length > 0) {
    console.log('')
    console.log('Classes longues detectees:')
    for (const element of fichiersClassesLongues.slice(0, 10)) {
      console.log(`- ${path.relative(racine, element.fichier)} (${element.lignes} lignes)`)
    }
  }

  if (score < seuil) {
    console.error('')
    console.error(`ECHEC: score ${score}% < seuil ${seuil}%.`)
    console.error('Action requise: refactoriser/corriger puis relancer la commande.')
    process.exit(1)
  }

  console.log('')
  console.log(`SUCCES: score ${score}% >= seuil ${seuil}%.`)
}

evaluerQualite().catch((erreur) => {
  console.error('Erreur lors de l evaluation qualite:', erreur)
  process.exit(1)
})
