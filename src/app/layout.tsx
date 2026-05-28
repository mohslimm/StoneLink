import type { Metadata } from 'next'
import './globals.css'
import { TopNavigation } from '@/components/ui/custom/TopNavigation'
import { ToastContainer } from '@/components/ui/custom/Toast'
import { PageTransitionLayout } from '@/components/ui/custom/PageTransitionLayout'

export const metadata: Metadata = {
  title: 'StoneLink — Autonomous Sales Intelligence',
  description: 'Plateforme de croissance High-Ticket pour agences premium',
  icons: {
    icon: '/logo-app.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <div className="min-h-screen bg-[var(--bg-void)]">
          <TopNavigation />
          <main className="pt-14">
            <PageTransitionLayout>
              {children}
            </PageTransitionLayout>
          </main>
          <ToastContainer />
        </div>
      </body>
    </html>
  )
}
