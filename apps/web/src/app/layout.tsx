import '../styles/globals.css'

export const metadata = {
  title: 'SIG Empresa',
  description: 'Sistema de Gestão Empresarial',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
