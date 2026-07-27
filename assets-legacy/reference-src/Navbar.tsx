import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, Lock, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/providers/trpc";

const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/association", label: "L'association" },
  { to: "/newsletter", label: "Newsletter" },
  { to: "/documents", label: "Documents" },
  { to: "/rejoindre", label: "Rejoindre" },
];

/**
 * Slot d'authentification de la barre de navigation :
 * - chargement : placeholder neutre (même encombrement, sans contenu)
 * - non connecté : bouton « Espace membres » → /espace-membres
 * - connecté : « Tableau de bord » → /admin + « Déconnexion »
 */
function AuthSlot() {
  const utils = trpc.useUtils();
  const me = trpc.auth.me.useQuery(undefined, {
    staleTime: 30_000,
    retry: false,
  });
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
      void utils.invalidate();
    },
  });

  if (me.isLoading) {
    return (
      <span
        className="btn-quiet pointer-events-none hidden select-none opacity-0 lg:inline-flex"
        aria-hidden="true"
      >
        <Lock className="h-3.5 w-3.5" />
        Espace membres
      </span>
    );
  }

  if (!me.data) {
    return (
      <Link to="/espace-membres" className="btn-quiet hidden lg:inline-flex">
        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
        Espace membres
      </Link>
    );
  }

  return (
    <span className="hidden items-center gap-2 lg:inline-flex">
      <Link to="/admin" className="btn-quiet">
        <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
        Tableau de bord
      </Link>
      <button
        type="button"
        className="btn-quiet"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
        Déconnexion
      </button>
    </span>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Fermer le panneau mobile à chaque changement de route (ajustement pendant le rendu)
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setOpen(false);
  }

  // Fermeture par Échap + blocage du scroll quand le panneau est ouvert
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-line bg-paper/90 backdrop-blur-[8px]">
      <div className="container-qd flex h-full items-center justify-between">
        {/* Logo + nom */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-ink"
          aria-label="Quantum Dynamics — Accueil"
        >
          <img
            src="/logo-mark.png"
            alt=""
            className="h-8 w-auto"
            width={26}
            height={32}
          />
          <span className="font-display text-[15px] font-semibold tracking-[-0.02em]">
            Quantum Dynamics
          </span>
        </Link>

        {/* Onglets desktop */}
        <nav
          className="hidden items-center gap-7 min-[900px]:flex"
          aria-label="Navigation principale"
        >
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "group relative py-1 text-sm font-medium transition-colors",
                  isActive ? "text-ink" : "text-ink-3 hover:text-ink"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  <span
                    className={cn(
                      "absolute inset-x-0 -bottom-0.5 h-0.5 origin-left bg-energy transition-transform duration-200",
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    )}
                    aria-hidden="true"
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Espace membres / admin selon l'état de session */}
          <AuthSlot />

          {/* Hamburger mobile */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded border border-line text-ink min-[900px]:hidden"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Panneau mobile plein écran — portail sur <body> : le backdrop-blur du
          header créerait un containing block qui écraserait le `fixed inset-0`
          (panneau superposé au contenu). Rendu hors du header, z-[100], opaque. */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed inset-0 z-[100] flex flex-col bg-paper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navigation"
            >
              <div className="container-qd flex h-16 items-center justify-between border-b border-line">
                <span className="flex items-center gap-2.5 text-ink">
                  <img
                    src="/logo-mark.png"
                    alt=""
                    className="h-8 w-auto"
                    width={26}
                    height={32}
                  />
                  <span className="font-display text-[15px] font-semibold">
                    Quantum Dynamics
                  </span>
                </span>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded border border-line text-ink"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <nav
                className="container-qd flex flex-1 flex-col justify-center gap-6"
                aria-label="Navigation mobile"
              >
                {[
                  ...NAV_LINKS,
                  { to: "/espace-membres", label: "Espace membres" },
                ].map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                  >
                    <NavLink
                      to={link.to}
                      end={link.to === "/"}
                      className={({ isActive }) =>
                        cn(
                          "font-display text-[28px] font-medium tracking-[-0.02em] transition-colors",
                          isActive
                            ? "text-energy"
                            : "text-ink hover:text-energy"
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}
