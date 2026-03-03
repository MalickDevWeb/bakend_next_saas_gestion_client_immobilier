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

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.surTitre}>KYA BACKEND DOCUMENTATION</p>
        <h1>Documentation complete comme un site web</h1>
        <p>
          Cette page regroupe toute la documentation: architecture, dossiers, sous-dossiers,
          middlewares, captures, et reference exhaustive fichier par fichier.
        </p>
        <div className={styles.actions}>
          <Link className={styles.boutonPrimaire} href="/docs/index">
            Commencer la lecture
          </Link>
          <Link className={styles.boutonSecondaire} href="/documentation">
            Voir Swagger API
          </Link>
        </div>
      </header>

      <section className={styles.section}>
        <h2>Bibliotheque des documents</h2>
        <div className={styles.grille}>
          {documents.map((document) => (
            <article key={document.slug} className={styles.carte}>
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
        <h2>Capture rapide de la structure</h2>
        <p>
          Apercu automatique du document des captures. Ouvre la page complete pour voir
          toutes les captures et schemas.
        </p>
        <pre className={styles.capture}>{apercuCapture}</pre>
        <Link href="/docs/captures" className={styles.boutonPrimaire}>Voir toutes les captures</Link>
      </section>
    </main>
  )
}
