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
      <body>{children}</body>
    </html>
  )
}
