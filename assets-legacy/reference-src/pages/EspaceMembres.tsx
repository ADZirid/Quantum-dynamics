import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { motion, useAnimationControls } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { trpc } from "@/providers/trpc";

const GENERIC_ERROR = "Identifiant ou mot de passe incorrect.";
const LOCKED_ERROR = "Trop de tentatives, réessayez dans quelques minutes.";

/**
 * /espace-membres — connexion réservée au bureau / administrateurs.
 * Anti-énumération : un seul message d'erreur générique, jamais de détail
 * sur le champ fautif. Verrouillage géré côté serveur (429).
 */
export default function EspaceMembres() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const controls = useAnimationControls();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session déjà active → directement vers le tableau de bord
  const me = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 5_000,
  });

  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      setError(null);
      await utils.auth.me.invalidate();
      navigate("/admin");
    },
    onError: err => {
      const code = err.data?.code;
      setError(code === "TOO_MANY_REQUESTS" ? LOCKED_ERROR : GENERIC_ERROR);
      // Secousse horizontale de la carte (x ±8px, 3 itérations)
      void controls.start({
        x: [0, -8, 8, -8, 8, -8, 0],
        transition: { duration: 0.3 },
      });
    },
  });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (login.isPending) return;
    setError(null);
    login.mutate({ username: username.trim(), password });
  };

  if (me.data) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="relative flex min-h-[calc(100dvh-64px)] items-center justify-center overflow-hidden bg-ink px-6 py-16">
      {/* Grille technique claire, opacité 5 % */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: "url('/texture-grid.svg')",
          backgroundSize: "512px 512px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[400px]"
      >
        <motion.div
          animate={controls}
          className="rounded border border-line bg-paper p-10 shadow-[0_8px_32px_rgba(0,0,0,0.25)]"
        >
          {/* En-tête */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/logo-mark.png"
              alt=""
              className="h-10 w-auto"
              width={32}
              height={40}
            />
            <h1 className="mt-4 font-display text-[22px] font-medium tracking-[-0.02em] text-ink">
              Espace membres
            </h1>
            <p className="mt-2 text-sm text-ink-2">
              Réservé aux membres du bureau et administrateurs du site.
            </p>
          </div>

          {/* Erreur (générique, anti-énumération) */}
          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2 rounded border border-danger/40 bg-danger/10 px-3.5 py-3 text-[13px] font-medium text-danger"
            >
              <Lock
                className="mt-0.5 h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
              {error}
            </div>
          )}

          <form
            onSubmit={onSubmit}
            className="mt-6 space-y-4"
            noValidate={false}
          >
            <div className="space-y-1.5">
              <label
                htmlFor="login-username"
                className="label-mono block text-ink-2"
              >
                Identifiant
              </label>
              <input
                id="login-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full rounded border border-line bg-white px-3.5 py-3 text-sm text-ink transition-colors focus:border-energy focus:outline-none"
                disabled={login.isPending}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="label-mono block text-ink-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded border border-line bg-white px-3.5 py-3 pr-11 text-sm text-ink transition-colors focus:border-energy focus:outline-none"
                  disabled={login.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-ink-3 transition-colors hover:text-ink"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={login.isPending || !username.trim() || !password}
              className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              {login.isPending ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Connexion en cours…
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              to="/"
              className="text-[13px] text-ink-3 transition-colors hover:text-ink"
            >
              ← Retour au site
            </Link>
          </div>
        </motion.div>

        <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.08em] text-[#6B7570]">
          Accès journalisé — 5 tentatives max / 15 min
        </p>
      </motion.div>
    </div>
  );
}
