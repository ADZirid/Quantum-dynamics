import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  FileText,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Newspaper,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import OverviewTab from "@/components/admin/OverviewTab";
import type { AdminTabKey } from "@/components/admin/OverviewTab";
import NewsletterTab from "@/components/admin/NewsletterTab";
import DocumentsTab from "@/components/admin/DocumentsTab";
import CandidaturesTab from "@/components/admin/CandidaturesTab";
import BureauTab from "@/components/admin/BureauTab";
import SecuriteTab from "@/components/admin/SecuriteTab";

const TABS: {
  value: AdminTabKey;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { value: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { value: "newsletter", label: "Newsletter", icon: Newspaper },
  { value: "documents", label: "Documents", icon: FileText },
  { value: "candidatures", label: "Candidatures", icon: Inbox },
  { value: "bureau", label: "Bureau & membres", icon: Users },
  { value: "securite", label: "Sécurité", icon: ShieldCheck },
];

/** Skeleton pendant la vérification de session. */
function AdminSkeleton() {
  return (
    <div
      className="container-qd flex flex-col gap-8 py-12 lg:flex-row"
      aria-busy="true"
      aria-label="Vérification de la session"
    >
      <div className="space-y-3 lg:w-60">
        <Skeleton className="h-10 w-40" />
        {[0, 1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
      <div className="flex-1 space-y-4">
        <Skeleton className="h-9 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map(i => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}

/**
 * /admin — tableau de bord protégé (session requise).
 * Garde d'accès : auth.me → null = redirection vers /espace-membres.
 */
export default function Admin() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const me = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 5_000,
  });
  const [tab, setTab] = useState<AdminTabKey>("overview");

  const logout = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      utils.auth.me.setData(undefined, null);
      await utils.invalidate();
      navigate("/");
    },
  });

  if (me.isLoading) {
    return <AdminSkeleton />;
  }
  if (!me.data) {
    return <Navigate to="/espace-membres" replace />;
  }

  return (
    <div className="bg-paper">
      <Tabs
        value={tab}
        onValueChange={v => setTab(v as AdminTabKey)}
        orientation="vertical"
        className="container-qd flex flex-col gap-6 py-8 lg:flex-row lg:gap-8 lg:py-12"
      >
        {/* Barre latérale */}
        <div className="lg:w-60 lg:shrink-0">
          <div className="lg:sticky lg:top-20">
            <div className="rounded border border-line bg-white p-4">
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo-mark.png"
                  alt=""
                  className="h-8 w-auto"
                  width={26}
                  height={32}
                />
                <div>
                  <p className="font-display text-[15px] font-semibold tracking-[-0.02em] text-ink">
                    Administration
                  </p>
                  <span className="mt-0.5 inline-block rounded border border-energy/40 bg-energy/10 px-1.5 py-px font-mono text-[10px] uppercase tracking-[0.08em] text-energy">
                    Bureau
                  </span>
                </div>
              </div>

              {/* Navigation par onglets (ARIA tabs, clavier géré par Radix) */}
              <TabsList
                aria-label="Sections du tableau de bord"
                className="mt-4 flex h-auto w-full flex-row items-stretch gap-1 overflow-x-auto rounded-none bg-transparent p-0 lg:flex-col"
              >
                {TABS.map(t => (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    className="flex shrink-0 items-center justify-start gap-2.5 whitespace-nowrap rounded border-l-2 border-transparent px-3 py-2.5 text-sm font-medium text-ink-2 shadow-none transition-colors hover:bg-paper-2/70 hover:text-ink data-[state=active]:border-energy data-[state=active]:bg-paper-2 data-[state=active]:text-ink data-[state=active]:shadow-none"
                  >
                    <t.icon className="h-4 w-4" aria-hidden="true" />
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Utilisateur connecté + déconnexion */}
              <div className="mt-4 border-t border-line pt-4">
                <p className="font-mono text-xs text-ink-3">
                  Connecté :{" "}
                  <span className="text-ink">{me.data.username}</span>
                </p>
                <button
                  type="button"
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                  className="btn-quiet mt-2 w-full justify-start hover:border-danger/50 hover:text-danger disabled:opacity-60"
                >
                  {logout.isPending ? (
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="min-w-0 flex-1">
          {TABS.map(t => (
            <TabsContent key={t.value} value={t.value} className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {t.value === "overview" && <OverviewTab onNavigate={setTab} />}
                {t.value === "newsletter" && <NewsletterTab />}
                {t.value === "documents" && <DocumentsTab />}
                {t.value === "candidatures" && <CandidaturesTab />}
                {t.value === "bureau" && <BureauTab />}
                {t.value === "securite" && <SecuriteTab />}
              </motion.div>
            </TabsContent>
          ))}

          {/* Barre basse admin (remplace le footer public dans l'espace d'administration) */}
          <p className="mt-12 border-t border-line pt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
            Quantum Dynamics — Administration · v1.0
          </p>
        </div>
      </Tabs>
    </div>
  );
}
