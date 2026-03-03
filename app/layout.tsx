import { Sora, Nunito_Sans } from 'next/font/google'

const policeTitre = Sora({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--police-titre',
})

const policeTexte = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--police-texte',
})

export const metadata = {
  title: 'Backend KYA API',
  description: 'API Next.js orientee backend',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${policeTitre.variable} ${policeTexte.variable}`}>{children}</body>
    </html>
  )
}
