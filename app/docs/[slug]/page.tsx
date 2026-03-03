import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  obtenirDocumentsSite,
  obtenirDocumentParSlug,
  chargerContenuDocument,
} from '@/app/docs/_lib/documentation'
import styles from '@/app/docs/document.module.css'

type TypeProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return obtenirDocumentsSite().map((document) => ({ slug: document.slug }))
}

export async function generateMetadata({ params }: TypeProps) {
  const { slug } = await params
  const document = obtenirDocumentParSlug(slug)

  if (!document) {
    return {
      title: 'Document introuvable',
    }
  }

  return {
    title: `${document.titre} - KYA Docs`,
    description: document.resume,
  }
}

export default async function PageDocument({ params }: TypeProps) {
  const { slug } = await params
  const document = obtenirDocumentParSlug(slug)

  if (!document) {
    notFound()
  }

  const contenu = await chargerContenuDocument(document.fichier)
  const nombreLignes = contenu.split('\n').length
  const tailleKo = Math.max(1, Math.round(Buffer.byteLength(contenu, 'utf8') / 1024))

  return (
    <main className={styles.page}>
      <header className={styles.entete}>
        <p className={styles.surTitre}>DOCUMENTATION DETAILLEE</p>
        <h1>{document.titre}</h1>
        <p>{document.resume}</p>
        <div className={styles.meta}>
          <p className={styles.chemin}>Source: docs/{document.fichier}</p>
          <p className={styles.puce}>{nombreLignes} lignes</p>
          <p className={styles.puce}>{tailleKo} Ko</p>
        </div>
        <div className={styles.actions}>
          <Link href="/docs" className={styles.boutonSecondaire}>Retour portail docs</Link>
          <Link href="/documentation" className={styles.boutonPrimaire}>Swagger API</Link>
        </div>
      </header>

      <article className={styles.contenu}>
        <pre>{contenu}</pre>
      </article>
    </main>
  )
}
