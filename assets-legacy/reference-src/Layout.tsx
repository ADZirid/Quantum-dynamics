import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import Lenis from 'lenis'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

/**
 * Layout partagé — pattern B (nested routes) : le slot de contenu est <Outlet/>,
 * App.tsx déclare les pages en <Route> imbriquées sous <Route element={<Layout/>}>.
 */
export default function Layout() {
  const { pathname } = useLocation()

  // Remonter en haut de page à chaque navigation
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Lenis : scroll lissé global (désactivé si prefers-reduced-motion)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.1 })
    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  return (
    <div className="flex min-h-[100dvh] flex-col bg-paper text-ink">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
