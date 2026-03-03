import Link from 'next/link'
import {
  obtenirDocumentsSite,
  chargerContenuDocument,
} from '@/app/docs/_lib/documentation'
import styles from '@/app/docs/page.module.css'

export const metadata = {
  title: 'Documentation complete backend KYA',
  description: 'Portail de documentation complet, dossier par dossier et fichier par fichier.',
}

export default async function PageDocs() {
  const documents = obtenirDocumentsSite()
  const contenuCapture = await chargerContenuDocument('CAPTURES_DOSSIERS_ET_SOUS_DOSSIERS.md')
  const apercuCapture = contenuCapture.split('\n').slice(0, 80).join('\n')
  const nombreGuides = documents.filter(
    (document) => document.slug.includes('guide') || document.slug === 'index'
  ).length
  const nombreReferences = documents.filter(
    (document) => document.slug.includes('reference') || document.slug.includes('concept')
  ).length

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p className={styles.surTitre}>KYA BACKEND DOCUMENTATION</p>
          <h1>Documentation complete, claire et presentable</h1>
          <p>
            Portail officiel du backend KYA: architecture, conventions, dossiers,
            middlewares, seeders, captures, et reference fichier par fichier.
          </p>

          <div className={styles.stats}>
            <article className={styles.stat}>
              <p className={styles.statValeur}>{documents.length}</p>
              <p className={styles.statLabel}>documents disponibles</p>
            </article>
            <article className={styles.stat}>
              <p className={styles.statValeur}>{nombreGuides}</p>
              <p className={styles.statLabel}>guides de mise en route</p>
            </article>
            <article className={styles.stat}>
              <p className={styles.statValeur}>{nombreReferences}</p>
              <p className={styles.statLabel}>references techniques</p>
            </article>
          </div>

          <div className={styles.actions}>
            <Link className={styles.boutonPrimaire} href="/docs/index">
              Commencer la lecture
            </Link>
            <Link className={styles.boutonSecondaire} href="/documentation">
              Voir Swagger API
            </Link>
          </div>
        </div>

        <aside className={styles.heroAside}>
          <h2>Parcours recommande</h2>
          <ol className={styles.parcours}>
            <li className={styles.etape}>
              <p className={styles.etapeTitre}>1. Commencer par l index</p>
              <Link className={styles.etapeLien} href="/docs/index">
                Ouvrir Index de la documentation
              </Link>
            </li>
            <li className={styles.etape}>
              <p className={styles.etapeTitre}>2. Lire le guide maitre</p>
              <Link className={styles.etapeLien} href="/docs/guide-maitre">
                Ouvrir Guide maitre architecture
              </Link>
            </li>
            <li className={styles.etape}>
              <p className={styles.etapeTitre}>3. Verifier les routes API</p>
              <Link className={styles.etapeLien} href="/documentation">
                Ouvrir Swagger API
              </Link>
            </li>
          </ol>
        </aside>
      </header>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2>Bibliotheque des documents</h2>
          <p>Chaque carte ouvre un guide precis. Classement: du plus strategique au plus detaille.</p>
        </header>
        <div className={styles.grille}>
          {documents.map((document, index) => (
            <article key={document.slug} className={styles.carte}>
              <p className={styles.indiceCarte}>DOC {String(index + 1).padStart(2, '0')}</p>
              <h3>{document.titre}</h3>
              <p>{document.resume}</p>
              <p className={styles.chemin}>docs/{document.fichier}</p>
              <Link href={`/docs/${document.slug}`} className={styles.lienCarte}>
                Ouvrir ce document
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2>Capture rapide de la structure</h2>
          <p>Apercu automatique de l arborescence. Ouvre la version complete pour tous les details.</p>
        </header>
        <pre className={styles.capture}>{apercuCapture}</pre>
        <div className={styles.captureActions}>
          <Link href="/docs/captures" className={styles.boutonPrimaire}>Voir toutes les captures</Link>
          <Link href="/api/sante" className={styles.boutonSecondaire}>Tester /api/sante</Link>
        </div>
      </section>
    </main>
  )
}
