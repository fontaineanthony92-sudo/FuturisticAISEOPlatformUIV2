import { useEffect, useState } from "react";
import {
  LayoutDashboard, FileText, Bot, Sparkles, Database, Globe, Image,
  BarChart3, Calendar, Settings, ChevronRight, Search, Bell,
  ArrowRight, Zap, TrendingUp, Plus, Send, Upload, Link,
  CheckCircle, Clock, Star, Target, BookOpen, Cpu, Activity, X,
  Menu, LogOut, ChevronDown, Eye, Download, RefreshCw,
  Newspaper, Layers, Hash, AlignLeft, PenTool, Radio, Lightbulb,
  Wand2, RotateCcw, Minimize2, Maximize2, Scissors, BookMarked,
  FlaskConical, ChevronUp, MousePointerClick, Pencil, SlidersHorizontal,
  AlertCircle, CheckCircle2, ArrowUpRight, Flame
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { VisualEnrichment } from "./components/VisualEnrichment";
import { ArticleSection, contentToSections, sectionsToContent } from "./utils/articleContent";

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = "landing" | "auth" | "dashboard" | "articles" | "assistant" |
  "research" | "generate" | "editor" | "visual" | "knowledge" | "wordpress" | "media" | "analytics";

// ─── Constants ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "articles", label: "Articles", icon: FileText },
  { id: "assistant", label: "SEO Coach", icon: Bot },
  { id: "research", label: "Recherche SEO", icon: FlaskConical },
  { id: "generate", label: "Générer", icon: Sparkles },
  { id: "editor", label: "Éditeur", icon: Pencil },
  { id: "knowledge", label: "Knowledge Base", icon: Database },
  { id: "wordpress", label: "WordPress", icon: Globe },
  { id: "media", label: "Media", icon: Image },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
] as const;

const STATUS_FR: Record<string, string> = {
  published: "Publié",
  draft: "Brouillon",
  review: "En révision",
  ready: "Prêt à publier",
  scheduled: "Planifié",
  planned: "Planifié",
  pending: "En attente",
  processing: "En cours",
  indexed: "Indexé",
};

// ─── Composants partagés ───────────────────────────────────────────────────────
function GlassCard({ children, className = "", glow = false }: {
  children: React.ReactNode; className?: string; glow?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl border border-purple-500/30 bg-gradient-to-br from-[#0e1535]/95 to-[#080e28]/90 backdrop-blur-xl shadow-2xl ${glow ? "shadow-purple-500/15" : ""} ${className}`}>
      {glow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/8 to-cyan-500/4 pointer-events-none" />
      )}
      {children}
    </div>
  );
}

function NeonBadge({ children, color = "purple" }: { children: React.ReactNode; color?: "purple" | "cyan" | "pink" | "green" | "emerald" | "yellow" }) {
  const colors = {
    purple: "bg-purple-500/15 text-purple-200 border-purple-500/40",
    cyan: "bg-cyan-500/15 text-cyan-200 border-cyan-500/40",
    pink: "bg-pink-500/15 text-pink-200 border-pink-500/40",
    green: "bg-emerald-500/15 text-emerald-200 border-emerald-500/40",
    emerald: "bg-emerald-500/15 text-emerald-200 border-emerald-500/40",
    yellow: "bg-yellow-500/15 text-yellow-200 border-yellow-500/40",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border font-mono ${colors[color]}`}>
      {children}
    </span>
  );
}

function GlowButton({ children, onClick, variant = "primary", className = "" }: {
  children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost"; className?: string;
}) {
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40",
    secondary: "bg-transparent border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
  };
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

const WORKFLOW_STEPS = ["Recherche SEO", "Génération", "Édition", "Enrichissement", "Révision", "Publication"];

function WorkflowBreadcrumb({ activeIndex, onBack }: { activeIndex: number; onBack?: () => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {onBack && (
        <button onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0e1535] border border-purple-500/25 text-slate-300 hover:text-white hover:border-purple-400/50 text-xs font-medium transition-all hover:bg-[#14193f]">
          <ChevronRight size={11} className="rotate-180" /> Retour
        </button>
      )}
      <div className="flex items-center gap-1 text-xs font-mono flex-wrap">
        {WORKFLOW_STEPS.map((step, i) => (
          <span key={step} className="flex items-center gap-1">
            <span className={`px-2.5 py-1 rounded-lg transition-all ${
              i === activeIndex
                ? "text-white bg-purple-600/50 border border-purple-400/60 font-semibold shadow-lg shadow-purple-500/20"
                : i < activeIndex
                ? "text-emerald-400 border border-emerald-500/20 bg-emerald-500/5"
                : "text-slate-500 border border-transparent"
            }`}>
              {i < activeIndex && <span className="mr-1">✓</span>}{step}
            </span>
            {i < 5 && <ChevronRight size={10} className={i < activeIndex ? "text-emerald-500/50" : "text-slate-700"} />}
          </span>
        ))}
      </div>
    </div>
  );
}

function SEOScoreCircle({ score }: { score: number | null }) {
  const color = score === null ? "#64748b" : score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f87171";
  const r = 32;
  const circ = 2 * Math.PI * r;
  const dash = score === null ? 0 : (score / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ padding: "6px" }}>
      <svg width={88} height={88} viewBox="0 0 88 88" overflow="visible" style={{ transform: "rotate(-90deg)" }}>
        <circle cx={44} cy={44} r={r} fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="6" />
        <circle cx={44} cy={44} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={circ - dash} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 7px ${color})` }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-lg font-bold font-mono" style={{ color, textShadow: `0 0 12px ${color}60` }}>{score ?? "—"}</div>
        <div className="text-[9px] text-slate-400 font-mono">SEO</div>
      </div>
    </div>
  );
}

// ─── Landing Page ──────────────────────────────────────────────────────────────
function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const features = [
    { icon: Sparkles, title: "Génération de contenu IA", desc: "Produisez des articles optimisés SEO en quelques minutes grâce à nos modèles de langage avancés.", color: "purple" },
    { icon: Target, title: "SEO Coach Assistant", desc: "Bénéficiez de recommandations en temps réel et de stratégies de keywords de votre conseiller IA.", color: "cyan" },
    { icon: Globe, title: "Automatisation WordPress", desc: "Planifiez et publiez directement sur WordPress en un seul clic.", color: "pink" },
    { icon: Database, title: "Knowledge Base", desc: "Ingérez vos documents, PDF et sites web comme sources de contenu de confiance.", color: "green" },
    { icon: BarChart3, title: "Dashboard Analytics", desc: "Suivez vos rankings SEO, la croissance du traffic et la performance de votre contenu en temps réel.", color: "purple" },
    { icon: Image, title: "Gestion des Media", desc: "Suggestions d'images par IA avec synchronisation directe vers la bibliothèque Media WordPress.", color: "cyan" },
  ] as const;

  const stats = [
    { value: "10x", label: "Plus rapide pour produire du contenu" },
    { value: "94%", label: "Score SEO moyen obtenu" },
    { value: "3 800+", label: "Startups et PME clientes" },
    { value: "24M+", label: "Articles générés" },
  ];

  return (
    <div className="min-h-screen bg-[#050816] overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Effets de fond */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500/10 rounded-full blur-[80px]" />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(124,58,237,0.04) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-purple-500/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Cpu size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            NEXUS<span className="text-purple-400">SEO</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Fonctionnalités", "Tarifs", "Cas d'usage", "Documentation"].map(item => (
            <button key={item} className="text-slate-400 hover:text-white text-sm transition-colors">{item}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <GlowButton variant="ghost" onClick={onGetStarted}>Connexion</GlowButton>
          <GlowButton onClick={onGetStarted}>
            Démarrer <ArrowRight size={14} />
          </GlowButton>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <NeonBadge color="purple">
            <Zap size={10} /> Plateforme IA SEO pensée pour simplifier la production de contenu professionnel
          </NeonBadge>
          <h1 className="mt-6 text-5xl md:text-7xl font-black text-white leading-[1.08] tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <span className="bg-gradient-to-r from-white via-purple-100 to-slate-300 bg-clip-text text-transparent">
              SEO Content
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
              Réinventé par l'IA
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            La plateforme IA SEO la plus avancée du marché. Générez, optimisez et publiez du contenu de qualité professionnelle comme un expert.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <button onClick={onGetStarted}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold text-base shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
              <Sparkles size={18} /> Essayer gratuitement <ArrowRight size={16} />
            </button>
            <button className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400/50 font-medium text-base transition-all duration-200">
              <Eye size={16} /> Voir la démo
            </button>
          </div>

          {/* Aperçu hero */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-[#050816] rounded-3xl pointer-events-none z-10" />
            <GlassCard className="p-4 max-w-3xl mx-auto" glow>
              <div className="rounded-xl overflow-hidden bg-[#070d22] border border-purple-500/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <div className="ml-2 px-3 py-0.5 rounded bg-[#0b1028] text-slate-500 text-xs font-mono flex-1">nexusseo.ai/dashboard</div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "SEO Score", value: "94", change: "+12", color: "#34d399" },
                    { label: "Publiés", value: "847", change: "+23", color: "#8b5cf6" },
                    { label: "Traffic moy.", value: "12.4K", change: "+34%", color: "#06b6d4" },
                    { label: "Keywords #1", value: "218", change: "+7", color: "#ec4899" },
                  ].map(kpi => (
                    <div key={kpi.label} className="rounded-lg bg-[#0b1028] p-3 border border-purple-500/10">
                      <div className="text-xs text-slate-500 font-mono mb-1">{kpi.label}</div>
                      <div className="text-xl font-bold font-mono" style={{ color: kpi.color }}>{kpi.value}</div>
                      <div className="text-xs text-emerald-400 font-mono mt-0.5">{kpi.change}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-lg bg-[#0b1028] p-3 border border-purple-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={13} className="text-purple-400" />
                    <span className="text-xs text-purple-300 font-mono">AI SEO Coach — Analyse de votre contenu en cours...</span>
                    <div className="ml-auto flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0.15s" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    💡 Votre article "Transformation Digitale 2025" est classé #3 sur son keyword principal.
                    L'ajout de 3 keywords LSI pourrait le faire passer en #1. Suggestion : <span className="text-cyan-400">"enterprise AI", "digital workflow"</span>
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-black font-mono bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="text-center mb-14">
          <NeonBadge color="cyan"><Radio size={10} /> Plateforme complète</NeonBadge>
          <h2 className="mt-4 text-4xl font-bold text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            Tous les outils dont votre équipe a besoin
          </h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">Une plateforme intelligente pour l'ensemble du cycle de vie du contenu SEO.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <GlassCard key={f.title} className="p-6 hover:border-purple-500/40 transition-all duration-300 cursor-pointer group hover:-translate-y-1" glow>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4
                ${f.color === "purple" ? "bg-purple-500/15 text-purple-400" :
                  f.color === "cyan" ? "bg-cyan-500/15 text-cyan-400" :
                  f.color === "pink" ? "bg-pink-500/15 text-pink-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                <f.icon size={20} />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                En savoir plus <ChevronRight size={12} />
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20">
        <GlassCard className="p-12 text-center overflow-hidden" glow>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-purple-500/20 blur-3xl pointer-events-none" />
          <NeonBadge color="purple"><Lightbulb size={10} /> Démarrez aujourd'hui</NeonBadge>
          <h2 className="mt-4 text-3xl md:text-5xl font-bold text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            Prêt à transformer<br />votre stratégie SEO ?
          </h2>
          <p className="mt-4 text-slate-400 max-w-lg mx-auto">Rejoignez 2 400+ équipes de communication qui utilisent NexusSEO pour produire un meilleur contenu, plus rapidement.</p>
          <button onClick={onGetStarted} className="mt-8 inline-flex items-center gap-2.5 px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 text-white font-semibold text-base shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300 hover:scale-105">
            <Sparkles size={18} /> Démarrer gratuitement <ArrowRight size={16} />
          </button>
        </GlassCard>
      </section>

      <footer className="relative z-10 border-t border-purple-500/10 px-6 md:px-12 py-8 text-center text-slate-600 text-sm">
        © 2025 NexusSEO · Plateforme IA SEO pensée pour simplifier la production de contenu professionnel
      </footer>
    </div>
  );
}

// ─── Page de connexion ─────────────────────────────────────────────────────────
function AuthPage({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("sarah.connor@lelocal.fr");
  const [password, setPassword] = useState("••••••••••");

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4 relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(124,58,237,0.04) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Cpu size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              NEXUS<span className="text-purple-400">SEO</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            {mode === "login" ? "Bon retour parmi nous" : "Créez votre compte"}
          </h1>
          <p className="mt-1.5 text-slate-400 text-sm">
            {mode === "login" ? "Connectez-vous à votre espace de travail" : "Démarrez votre essai gratuit de 14 jours"}
          </p>
        </div>

        <GlassCard className="p-7" glow>
          <div className="flex rounded-xl bg-[#070d22] p-1 mb-6 border border-purple-500/10">
            {(["login", "register"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === m ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "text-slate-500 hover:text-slate-300"}`}>
                {m === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs text-slate-400 font-mono mb-1.5">Nom complet</label>
                <input type="text" placeholder="Sarah Connor" defaultValue="Sarah Connor"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0b1028] border border-purple-500/20 text-white text-sm focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30 placeholder-slate-600 transition-all" />
              </div>
            )}
            <div>
              <label className="block text-xs text-slate-400 font-mono mb-1.5">Email professionnel</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0b1028] border border-purple-500/20 text-white text-sm focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30 placeholder-slate-600 transition-all" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-mono mb-1.5">Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0b1028] border border-purple-500/20 text-white text-sm focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all" />
            </div>
            {mode === "register" && (
              <div>
                <label className="block text-xs text-slate-400 font-mono mb-1.5">Organisation</label>
                <input type="text" placeholder="Le Local" defaultValue="Le Local"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0b1028] border border-purple-500/20 text-white text-sm focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30 placeholder-slate-600 transition-all" />
              </div>
            )}
            <button onClick={onLogin} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-[1.02] mt-2">
              {mode === "login" ? "Accéder à NexusSEO" : "Créer mon compte"}
            </button>
          </div>

          <div className="mt-5 pt-5 border-t border-purple-500/10 text-center text-xs text-slate-500">
            {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-purple-400 hover:text-purple-300 transition-colors">
              {mode === "login" ? "S'inscrire" : "Se connecter"}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ active, onChange, collapsed, onToggle, onLogout }: {
  active: Screen; onChange: (s: Screen) => void; collapsed: boolean; onToggle: () => void; onLogout: () => void;
}) {
  return (
    <aside className={`h-full flex flex-col border-r border-purple-500/20 bg-gradient-to-b from-[#080e28] to-[#060b1e] transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}>
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-purple-500/10">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
          <Cpu size={13} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-sm tracking-tight whitespace-nowrap overflow-hidden" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            NEXUS<span className="text-purple-400">SEO</span>
          </span>
        )}
        <button onClick={onToggle} className="ml-auto text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0">
          <Menu size={15} />
        </button>
      </div>

      <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onChange(item.id as Screen)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 relative ${isActive
                ? "text-white bg-gradient-to-r from-purple-500/20 to-purple-500/5 border-r-2 border-purple-400 shadow-[inset_0_0_12px_rgba(124,58,237,0.08)]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}>
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-purple-400 rounded-r shadow-[0_0_8px_#7c3aed]" />}
              <item.icon size={15} className={isActive ? "text-purple-400" : ""} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-purple-500/10 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg text-sm transition-all">
          <Settings size={15} />
          {!collapsed && "Paramètres"}
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg text-sm transition-all">
          <LogOut size={15} />
          {!collapsed && "Déconnexion"}
        </button>
      </div>
    </aside>
  );
}

// ─── Barre supérieure ──────────────────────────────────────────────────────────
function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-purple-500/20 bg-[#060c20]/90 backdrop-blur-md">
      <div>
        <h1 className="text-base font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0b1028] border border-purple-500/10 text-slate-500 text-xs">
          <Search size={12} />
          <span className="hidden sm:inline">Rechercher...</span>
          <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-mono">⌘K</kbd>
        </div>
        <button className="relative w-8 h-8 rounded-lg bg-[#0b1028] border border-purple-500/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
          <Bell size={14} />
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_4px_#7c3aed]" />
        </button>
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0b1028] border border-purple-500/10 cursor-pointer hover:border-purple-500/30 transition-colors">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center text-white text-[10px] font-bold">SC</div>
          <span className="text-xs text-slate-400 hidden sm:inline">Sarah C.</span>
          <ChevronDown size={11} className="text-slate-600" />
        </div>
      </div>
    </header>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
function DashboardScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const kpis = [
    { label: "Articles publiés", value: "847", delta: "+23 ce mois", icon: FileText, color: "#8b5cf6" },
    { label: "Score SEO moyen", value: "94", delta: "+12 pts", icon: Target, color: "#34d399" },
    { label: "Traffic mensuel", value: "124K", delta: "+34%", icon: TrendingUp, color: "#06b6d4" },
    { label: "Keywords #1", value: "218", delta: "+7 cette semaine", icon: Hash, color: "#ec4899" },
  ];

  const trafficData = [
    { month: "Jan", traffic: 45, seo: 62 }, { month: "Fév", traffic: 52, seo: 68 },
    { month: "Mar", traffic: 61, seo: 71 }, { month: "Avr", traffic: 74, seo: 78 },
    { month: "Mai", traffic: 89, seo: 83 }, { month: "Juin", traffic: 107, seo: 87 },
    { month: "Juil", traffic: 124, seo: 94 },
  ];

  const recentArticles = [
    { title: "SEO pour startups : stratégie complète de génération de leads", seo: 96, status: "published", views: "12.4K" },
    { title: "Growth Marketing : 7 leviers d'acquisition pour PME", seo: 88, status: "published", views: "8.7K" },
    { title: "Content Marketing B2B : générer des leads qualifiés", seo: 82, status: "draft", views: "—" },
    { title: "Financement startup : guide complet des options en France", seo: 91, status: "review", views: "—" },
  ];

  const calendarItems = [
    { title: "Product-Market Fit pour SaaS", date: "28 Mai", status: "scheduled" },
    { title: "Stratégie de pricing startup", date: "1 Juin", status: "draft" },
    { title: "Growth hacking B2B", date: "5 Juin", status: "scheduled" },
    { title: "Fundraising seed en 2025", date: "10 Juin", status: "planned" },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <GlassCard key={kpi.label} className="p-4 overflow-hidden" glow>
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${kpi.color}60, transparent)` }} />
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-15 blur-xl pointer-events-none" style={{ backgroundColor: kpi.color }} />
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${kpi.color}20`, boxShadow: `0 0 16px ${kpi.color}30` }}>
                <kpi.icon size={16} style={{ color: kpi.color }} />
              </div>
              <NeonBadge color="green"><TrendingUp size={8} /> {kpi.delta}</NeonBadge>
            </div>
            <div className="text-2xl font-bold font-mono text-white" style={{ textShadow: `0 0 20px ${kpi.color}40` }}>{kpi.value}</div>
            <div className="text-xs text-slate-400 mt-1">{kpi.label}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Graphique Traffic */}
        <GlassCard className="lg:col-span-2 p-5" glow>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Traffic & Performance SEO</h3>
              <p className="text-xs text-slate-500 mt-0.5">Vue mensuelle</p>
            </div>
            <div className="flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />Traffic (K)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />SEO Score</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
              <XAxis dataKey="month" tick={{ fill: "#6b7db3", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7db3", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#0b1028", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px", color: "#e8eaf6", fontSize: "12px" }} />
              <Area type="monotone" dataKey="traffic" stroke="#8b5cf6" strokeWidth={2} fill="url(#tGrad)" />
              <Area type="monotone" dataKey="seo" stroke="#06b6d4" strokeWidth={2} fill="url(#sGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Suggestions IA */}
        <GlassCard className="p-5" glow>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <Bot size={13} className="text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Suggestions IA</h3>
          </div>
          <div className="space-y-3">
            {[
              { icon: Target, color: "#34d399", msg: "Ajoutez 3 keywords LSI pour booster le ranking de l'article \"Transformation Digitale\"" },
              { icon: Lightbulb, color: "#fbbf24", msg: "Publiez jeudi à 10h pour +28% d'engagement" },
              { icon: TrendingUp, color: "#8b5cf6", msg: "\"Gouvernance IA\" affiche +340% de volume de recherche — générez maintenant" },
              { icon: PenTool, color: "#06b6d4", msg: "Mettez à jour la meta description de 5 anciens articles" },
            ].map((s, i) => (
              <div key={i} className="flex gap-2.5 p-2.5 rounded-xl bg-[#070d22] border border-purple-500/10 hover:border-purple-500/25 transition-all cursor-pointer">
                <s.icon size={13} style={{ color: s.color }} className="mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed">{s.msg}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Articles récents */}
        <GlassCard className="lg:col-span-2 p-5" glow>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Articles récents</h3>
            <GlowButton variant="ghost" onClick={() => onNavigate("articles")} className="text-xs">
              Voir tout <ChevronRight size={11} />
            </GlowButton>
          </div>
          <div className="space-y-2.5">
            {recentArticles.map(a => (
              <div key={a.title} className="flex items-center gap-3 p-3 rounded-xl bg-[#0b1232]/60 border border-purple-500/15 hover:border-purple-500/30 transition-all cursor-pointer group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate group-hover:text-white transition-colors">{a.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <NeonBadge color={a.status === "published" ? "green" : a.status === "review" ? "cyan" : "purple"}>
                      {STATUS_FR[a.status]}
                    </NeonBadge>
                    {a.views !== "—" && <span className="text-xs text-slate-600 font-mono">{a.views} vues</span>}
                  </div>
                </div>
                <SEOScoreCircle score={a.seo} />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Calendrier éditorial */}
        <GlassCard className="p-5" glow>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={14} className="text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Calendrier éditorial</h3>
          </div>
          <div className="space-y-2">
            {calendarItems.map(item => (
              <div key={item.title} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#070d22] border border-purple-500/10">
                <div className="text-center flex-shrink-0 w-12">
                  <div className="text-[10px] text-slate-500 font-mono">{item.date.split(" ")[1]}</div>
                  <div className="text-sm font-bold text-white font-mono">{item.date.split(" ")[0]}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 truncate">{item.title}</p>
                  <NeonBadge color={item.status === "scheduled" || item.status === "planned" ? "green" : item.status === "draft" ? "purple" : "cyan"}>
                    {STATUS_FR[item.status]}
                  </NeonBadge>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate("research")} className="mt-4 w-full py-2 rounded-xl border border-dashed border-purple-500/25 text-xs text-purple-400 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex items-center justify-center gap-1.5">
            <Plus size={12} /> Planifier un article
          </button>
        </GlassCard>
      </div>
    </div>
  );
}

// ─── Liste des articles ─────────────────────────────────────────────────────────
type ArticleStatus = "published" | "draft" | "review" | "scheduled";

interface Article {
  id: string;
  title: string | null;
  seo_score: number | null;
  status: ArticleStatus;
  main_keyword: string | null;
  secondary_keywords: string[] | null;
  created_at: string;
  updated_at: string;
  featured_image_url: string | null;
  thumbnail_url: string | null;
}

function formatArticleDate(value: string | null | undefined): string {
  if (!value) return "Date indisponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date indisponible";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function ArticlesScreen({ onNavigate, onSelectArticle }: { onNavigate: (s: Screen) => void; onSelectArticle: (id: string, screen: Screen) => void }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ArticleStatus>("all");

  useEffect(() => {
    const controller = new AbortController();

    async function loadArticles() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:3001/api/articles", { signal: controller.signal });
        if (!response.ok) throw new Error("Impossible de charger les articles depuis le serveur.");

        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("La réponse du serveur est invalide.");

        setArticles(data as Article[]);
      } catch (requestError) {
        if (requestError instanceof Error && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "Une erreur est survenue pendant le chargement.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadArticles();
    return () => controller.abort();
  }, []);
  const filterLabels: Record<"all" | ArticleStatus, string> = {
    all: "Tous les articles",
    published: "Publiés",
    draft: "Brouillons",
    review: "En révision",
    scheduled: "Planifiés",
  };

  const filtered = filter === "all" ? articles : articles.filter(a => a.status === filter);
  const filters: Array<"all" | ArticleStatus> = ["all", "published", "review", "draft", "scheduled"];

  return (
    <div className="p-6 space-y-5 overflow-y-auto h-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "bg-[#0b1028] border border-purple-500/15 text-slate-500 hover:text-slate-300"}`}>
              {filterLabels[f]} {filter === f && !loading && !error && `(${filtered.length})`}
            </button>
          ))}
        </div>
        <button onClick={() => onNavigate("research")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform">
          <FlaskConical size={14} /> Nouveau contenu
        </button>
      </div>

      <div className="space-y-2.5">
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-400">Chargement des articles...</p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-rose-300">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            {articles.length === 0 ? "Aucun article pour le moment." : "Aucun article pour ce filtre."}
          </p>
        ) : filtered.map(a => (
          <GlassCard key={a.id} className="p-4 hover:border-purple-500/35 transition-all group" glow>
            <div className="flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-[#070d22] border border-purple-500/10">
                {(a.thumbnail_url || a.featured_image_url) ? (
                  <img src={a.thumbnail_url || a.featured_image_url || undefined} alt={a.title || ""} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText size={20} className="text-slate-600" />
                  </div>
                )}
              </div>

              {/* SEO Score */}
              <SEOScoreCircle score={a.seo_score} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate">{a.title || "Article sans titre"}</h3>
                  <NeonBadge color={
                    a.status === "published" ? "green" :
                    a.status === "review" ? "cyan" :
                    a.status === "scheduled" ? "pink" :
                    "purple"
                  }>{STATUS_FR[a.status]}</NeonBadge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 font-mono flex-wrap">
                  <span className="flex items-center gap-1"><Clock size={10} /> Modifié {formatArticleDate(a.updated_at || a.created_at)}</span>
                  <span className="flex items-center gap-1"><Hash size={10} /> {a.main_keyword || "Mot-clé non renseigné"}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {a.status === "draft" && (
                  <button
                    onClick={() => onSelectArticle(a.id, "editor")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-500 transition-all"
                  >
                    <PenTool size={11} /> Continuer la rédaction
                  </button>
                )}
                {a.status === "review" && (
                  <>
                    <button
                      onClick={() => onSelectArticle(a.id, "editor")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b1028] border border-purple-500/15 text-slate-400 hover:text-white text-xs transition-all"
                    >
                      <PenTool size={11} /> Modifier
                    </button>
                    <button
                      onClick={() => onSelectArticle(a.id, "wordpress")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-xs font-medium hover:scale-105 transition-transform shadow-lg shadow-cyan-500/20"
                    >
                      <CheckCircle size={11} /> Valider et publier
                    </button>
                  </>
                )}
                {a.status === "scheduled" && (
                  <>
                    <button
                      onClick={() => onSelectArticle(a.id, "editor")}
                      className="p-2 rounded-lg bg-[#0b1028] border border-purple-500/15 text-slate-400 hover:text-white transition-colors"
                    >
                      <PenTool size={13} />
                    </button>
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600/20 border border-pink-500/30 text-pink-300 text-xs hover:bg-pink-600/30 transition-colors"
                    >
                      <Calendar size={11} /> Planifié
                    </button>
                  </>
                )}
                {a.status === "published" && (
                  <>
                    <button
                      onClick={() => onSelectArticle(a.id, "editor")}
                      className="p-2 rounded-lg bg-[#0b1028] border border-purple-500/15 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <PenTool size={13} />
                    </button>
                    <button className="p-2 rounded-lg bg-[#0b1028] border border-purple-500/15 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                      <Eye size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// ─── SEO Coach ─────────────────────────────────────────────────────────────────
function AssistantScreen() {
  const [mode, setMode] = useState<"production" | "coach">("coach");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour Sarah ! Je suis votre AI SEO Coach. Comment puis-je vous aider aujourd'hui ? Je peux analyser votre stratégie de contenu, suggérer des keywords, ou vous accompagner dans l'optimisation de vos articles pour de meilleurs rankings." },
    { role: "user", content: "Je souhaite créer un article pour attirer des startups qui cherchent à développer leur visibilité SEO." },
    { role: "assistant", content: `Excellent angle ! Le SEO pour startups affiche +285% de volume de recherche ce trimestre. Voici ma recommandation stratégique :\n\n**Keyword principal :** "SEO startup" (4 200 recherches/mois, concurrence moyenne)\n**Keywords LSI :** "génération leads organiques", "stratégie SEO PME", "acquisition client SEO"\n\n**Structure de contenu recommandée :**\n1. H1 : SEO pour startups : stratégie complète de génération de leads (2025)\n2. H2 : Pourquoi le SEO est essentiel pour les startups\n3. H2 : Les 4 piliers d'une stratégie SEO pour PME\n4. H2 : Comment identifier les bons mots-clés pour votre business\n5. H2 : Feuille de route en 90 jours\n\nLongueur cible : 2 200 mots pour ce sujet afin de viser le top 3. Prêt à générer l'article complet ?` },
  ]);

  const seoTips = [
    { label: "Densité de keywords", value: "2,3%", status: "good", icon: Hash },
    { label: "Lisibilité", value: "Niveau 9", status: "good", icon: BookOpen },
    { label: "Liens internes", value: "3/5", status: "warning", icon: Link },
    { label: "Longueur meta", value: "148 car.", status: "good", icon: AlignLeft },
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev,
      { role: "user", content: input },
      { role: "assistant", content: "Analyse de votre demande en cours... En fonction des tendances de recherche actuelles, je recommande de cibler des keywords longue traîne à intention commerciale. Votre audience cible répond bien aux contenus basés sur des données avec des actions concrètes. Souhaitez-vous que je génère un article SEO complet sur ce sujet ?" }
    ]);
    setInput("");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden p-4 gap-4">
      <div className="flex items-center gap-3">
        <div className="flex rounded-xl bg-[#070d22] p-1 border border-purple-500/10">
          {(["production", "coach"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${mode === m ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "text-slate-500 hover:text-slate-300"}`}>
              {m === "production" ? <><Sparkles size={11} /> Production</> : <><Bot size={11} /> SEO Coach</>}
            </button>
          ))}
        </div>
        <NeonBadge color="green"><Activity size={9} /> En ligne</NeonBadge>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Chat */}
        <GlassCard className="lg:col-span-2 flex flex-col overflow-hidden" glow>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${msg.role === "assistant" ? "bg-gradient-to-br from-purple-600 to-violet-700" : "bg-gradient-to-br from-cyan-500 to-blue-600"}`}>
                  {msg.role === "assistant" ? <Bot size={13} className="text-white" /> : "SC"}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "assistant"
                  ? "bg-[#0b1028] border border-purple-500/20 text-slate-300"
                  : "bg-gradient-to-r from-purple-600 to-violet-600 text-white"}`}>
                  <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-purple-500/10">
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder={mode === "coach" ? "Posez une question à votre SEO Coach..." : "Décrivez l'article à générer..."}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#0b1028] border border-purple-500/20 text-sm text-white placeholder-slate-600 focus:border-purple-500/50 focus:outline-none transition-all" />
              <button onClick={handleSend} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white flex items-center gap-1.5 text-sm hover:scale-105 transition-transform shadow-lg shadow-purple-500/20">
                <Send size={14} />
              </button>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {["Analyser mon contenu", "Opportunités de keywords", "Analyse concurrentielle", "Audit SEO"].map(q => (
                <button key={q} onClick={() => setInput(q)}
                  className="px-2.5 py-1 rounded-lg bg-[#070d22] border border-purple-500/15 text-slate-500 hover:text-purple-300 hover:border-purple-500/30 text-xs transition-all">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Panneau SEO */}
        <div className="flex flex-col gap-4">
          <GlassCard className="p-4" glow>
            <h3 className="text-xs font-semibold text-slate-400 font-mono mb-3 uppercase tracking-wider">Indicateurs SEO</h3>
            <div className="space-y-3">
              {seoTips.map(tip => (
                <div key={tip.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <tip.icon size={12} className="text-slate-500" />
                    <span className="text-xs text-slate-400">{tip.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-slate-300">{tip.value}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${tip.status === "good" ? "bg-emerald-400 shadow-[0_0_4px_#34d399]" : "bg-yellow-400 shadow-[0_0_4px_#fbbf24]"}`} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-4" glow>
            <h3 className="text-xs font-semibold text-slate-400 font-mono mb-3 uppercase tracking-wider">Suggestions de keywords</h3>
            <div className="space-y-2">
              {[
                { kw: "cadre de gouvernance IA", vol: "8,1K", diff: "Moyen" },
                { kw: "politique IA responsable", vol: "4,3K", diff: "Faible" },
                { kw: "accountability algorithmique", vol: "2,9K", diff: "Faible" },
                { kw: "conformité IA enterprise", vol: "1,8K", diff: "Faible" },
              ].map(k => (
                <div key={k.kw} className="flex items-center justify-between p-2 rounded-lg bg-[#070d22] border border-purple-500/10 hover:border-purple-500/25 cursor-pointer transition-all">
                  <span className="text-xs text-slate-300 truncate">{k.kw}</span>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-[10px] text-cyan-400 font-mono">{k.vol}</span>
                    <NeonBadge color={k.diff === "Faible" ? "green" : "cyan"}>{k.diff}</NeonBadge>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-4" glow>
            <h3 className="text-xs font-semibold text-slate-400 font-mono mb-3 uppercase tracking-wider">Score du prompt</h3>
            <div className="flex items-center justify-center py-2">
              <SEOScoreCircle score={78} />
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">Ajoutez plus de précisions à votre prompt pour améliorer la qualité du contenu</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ─── Génération d'article ───────────────────────────────────────────────────────
function GenerateScreen({ onNavigate, onGeneratedArticle }: { onNavigate?: (s: Screen) => void; onGeneratedArticle?: (id: string) => void }) {
  const [subject, setSubject] = useState("Stratégie SEO complète pour startups et PME");
  const [mainKeyword, setMainKeyword] = useState("SEO startup");
  const [audience, setAudience] = useState("Fondateurs de startup");
  const [length, setLength] = useState("Long");
  const [tone, setTone] = useState("professionnel");
  const [includeFaq, setIncludeFaq] = useState(true);
  const [generateMetaDescription, setGenerateMetaDescription] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedArticle, setGeneratedArticle] = useState<{
    id: string;
    title: string;
    metaDescription: string;
    content: string;
    faq: Array<{ question: string; answer: string }>;
  } | null>(null);
  const [promptModify, setPromptModify] = useState("");
  const [applyingPrompt, setApplyingPrompt] = useState(false);

  const tones = [
    { key: "professionnel", label: "Professionnel" },
    { key: "pédagogique", label: "Pédagogique" },
    { key: "expert", label: "Expert" },
    { key: "conversationnel", label: "Conversationnel" },
  ];

  const handleGenerate = async () => {
    if (!subject.trim() || !mainKeyword.trim()) {
      setGenerationError("Renseignez le sujet et le keyword principal.");
      return;
    }

    setGenerating(true);
    setGenerationError(null);
    setGenerated(false);
    setGeneratedArticle(null);

    try {
      const response = await fetch("http://localhost:3001/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          mainKeyword,
          secondaryKeywords: [],
          audience,
          tone,
          length,
          includeFaq,
          generateMetaDescription,
        }),
      });

      const result = await response.json() as {
        error?: string;
        id?: string;
        article?: {
          title: string;
          metaDescription: string;
          content: string;
          faq: Array<{ question: string; answer: string }>;
        };
      };

      if (!response.ok) throw new Error(result.error || "La génération de l’article a échoué.");
      if (!result.id || !result.article) throw new Error("Le serveur a retourné une réponse incomplète.");

      onGeneratedArticle?.(result.id);
      setGeneratedArticle({ id: result.id, ...result.article });
      setGenerated(true);
    } catch (requestError) {
      setGenerationError(requestError instanceof Error
        ? requestError.message
        : "Le backend est inaccessible. Vérifiez qu’il est démarré puis réessayez.");
    } finally {
      setGenerating(false);
    }
  };
  const handleOpenEditor = () => {
    if (!generatedArticle || !onNavigate) return;
    onGeneratedArticle?.(generatedArticle.id);
    onNavigate("editor");
  };
  const handleApplyPrompt = () => {
    if (!promptModify.trim()) return;
    setApplyingPrompt(true);
    setTimeout(() => { setApplyingPrompt(false); setPromptModify(""); }, 1500);
  };

  return (
    <div className="p-5 h-full overflow-y-auto space-y-4">
      <WorkflowBreadcrumb activeIndex={1} onBack={() => onNavigate?.("research")} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Panneau de configuration */}
        <GlassCard className="p-5 space-y-4" glow>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Sparkles size={14} className="text-purple-400" /> Paramètres de génération</h3>

          <div>
            <label className="block text-xs text-slate-400 font-mono mb-1.5">Sujet de l'article</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#070d22] border border-purple-500/20 text-white text-sm focus:border-purple-500/50 focus:outline-none transition-all" />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-mono mb-1.5">Keyword principal</label>
            <input type="text" value={mainKeyword} onChange={e => setMainKeyword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#070d22] border border-purple-500/20 text-white text-sm focus:border-purple-500/50 focus:outline-none transition-all" />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-mono mb-1.5">Audience cible</label>
            <input type="text" value={audience} onChange={e => setAudience(e.target.value)} placeholder="Ex. Dirigeants de PME, étudiants, responsables RH, grand public..." className="w-full px-3 py-2 rounded-xl bg-[#070d22] border border-purple-500/20 text-white text-sm focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-mono mb-2">Ton éditorial</label>
            <div className="grid grid-cols-2 gap-2">
              {tones.map(t => (
                <button key={t.key} onClick={() => setTone(t.key)}
                  className={`py-2 rounded-lg text-xs font-medium transition-all ${tone === t.key ? "bg-purple-600 text-white" : "bg-[#070d22] border border-purple-500/15 text-slate-500 hover:text-slate-300"}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-mono mb-1.5">Longueur de l'article</label>
            <select value={length} onChange={e => setLength(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-[#070d22] border border-purple-500/20 text-white text-sm focus:outline-none">
              <option value="Long">Long format (2 400+ mots)</option>
              <option value="Standard">Standard (1 200–1 800 mots)</option>
              <option value="Court">Court (600–1 000 mots)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="faq" checked={includeFaq} onChange={e => setIncludeFaq(e.target.checked)} className="accent-purple-500" />
            <label htmlFor="faq" className="text-xs text-slate-400">Inclure une section FAQ</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="meta" checked={generateMetaDescription} onChange={e => setGenerateMetaDescription(e.target.checked)} className="accent-purple-500" />
            <label htmlFor="meta" className="text-xs text-slate-400">Générer automatiquement la meta description</label>
          </div>

          <button onClick={handleGenerate} disabled={generating || !subject.trim() || !mainKeyword.trim()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] disabled:opacity-60">
            {generating ? <><RefreshCw size={14} className="animate-spin" /> Génération en cours...</> : <><Sparkles size={14} /> Générer l'article</>}
          </button>
        </GlassCard>

        {/* Aperçu */}
        <GlassCard className="lg:col-span-2 p-5 flex flex-col" glow>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><FileText size={14} className="text-cyan-400" /> Aperçu de l'article</h3>
            {generated && (
              <div className="flex items-center gap-2">
                <SEOScoreCircle score={null} />
                <button className="p-1.5 rounded-lg bg-[#070d22] border border-purple-500/15 text-slate-400 hover:text-white transition-colors"><Download size={12} /></button>
                <button onClick={handleOpenEditor}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform">
                  <Pencil size={11} /> Ouvrir dans l'éditeur
                </button>
              </div>
            )}
          </div>

          {generationError && <p className="mb-3 text-xs text-rose-300" role="alert">{generationError}</p>}

          {!generated ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={28} className="text-purple-400" />
                </div>
                <p className="text-slate-500 text-sm">Configurez vos paramètres et cliquez sur<br />« Générer l'article » pour créer votre contenu</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-4 text-sm">
              {generatedArticle && (
                <>
                  {generatedArticle.metaDescription && (
                    <div className="p-3 rounded-xl bg-[#070d22] border border-purple-500/15">
                      <div className="text-[10px] text-slate-500 font-mono mb-1 uppercase">Meta Description</div>
                      <p className="text-slate-300 text-xs">{generatedArticle.metaDescription}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h1 className="text-xl font-bold text-white leading-tight">{generatedArticle.title}</h1>
                    <div className="flex gap-2 flex-wrap">
                      {[mainKeyword].filter(Boolean).map(keyword => (
                        <span key={keyword} className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-[10px] font-mono">{keyword}</span>
                      ))}
                    </div>

                    <div className="prose prose-sm prose-invert max-w-none">
                      {generatedArticle.content.split(/\n{2,}/).map((section, index) => {
                        const text = section.trim();
                        if (!text) return null;
                        if (text.startsWith("## ")) {
                          return <h2 key={index} className="mt-3 text-sm font-semibold text-purple-300 mb-1.5">{text.slice(3)}</h2>;
                        }
                        return <p key={index} className="text-slate-400 leading-relaxed text-xs whitespace-pre-line">{text}</p>;
                      })}
                    </div>

                    {generatedArticle.faq.length > 0 && (
                      <div className="mt-4 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                        <div className="text-[10px] text-cyan-400 font-mono mb-2 uppercase">Section FAQ</div>
                        {generatedArticle.faq.map((item, index) => (
                          <div key={`${item.question}-${index}`} className="mb-2">
                            <p className="text-xs font-medium text-slate-300">Q : {item.question}</p>
                            <p className="text-xs text-slate-400 mt-0.5">R : {item.answer}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
              {/* Zone de prompt de modification IA */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/8 to-violet-500/5 border border-purple-500/25">
                <div className="flex items-center gap-2 mb-3">
                  <Wand2 size={13} className="text-purple-400" />
                  <span className="text-xs font-semibold text-purple-200">Modifier l'article avec l'IA</span>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    value={promptModify}
                    onChange={e => setPromptModify(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleApplyPrompt()}
                    placeholder="Ex : Rendre le ton plus professionnel, Raccourcir l'introduction, Ajouter des données chiffrées..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#070d22] border border-purple-500/25 text-sm text-white placeholder-slate-500 focus:border-purple-500/60 focus:outline-none transition-all"
                  />
                  <button onClick={handleApplyPrompt} disabled={applyingPrompt || !promptModify.trim()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:scale-105 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-40">
                    {applyingPrompt ? <RefreshCw size={11} className="animate-spin" /> : <Wand2 size={11} />}
                    Appliquer
                  </button>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {["Rendre plus professionnel", "Optimiser pour le SEO", "Raccourcir ce passage", "Ajouter des données", "Ton conversationnel"].map(s => (
                    <button key={s} onClick={() => setPromptModify(s)}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-slate-400 hover:text-purple-300 hover:border-purple-500/40 text-[10px] transition-all">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

// ─── Knowledge Base ─────────────────────────────────────────────────────────────
function KnowledgeScreen() {
  const sources = [
    { name: "Stratégie de communication 2025.pdf", type: "PDF", size: "2,4 Mo", status: "indexed", pages: 48 },
    { name: "Charte graphique T2.docx", type: "Word", size: "890 Ko", status: "indexed", pages: 22 },
    { name: "Rapport d'étude de marché.xlsx", type: "Excel", size: "1,1 Mo", status: "indexed", pages: 8 },
    { name: "Présentation direction.pptx", type: "PowerPoint", size: "4,7 Mo", status: "processing", pages: 32 },
    { name: "lelocal.fr/apropos", type: "Site web", size: "—", status: "indexed", pages: 0 },
    { name: "lelocal.fr/actualites", type: "Site web", size: "—", status: "pending", pages: 0 },
  ];

  const typeColors = { PDF: "pink", Word: "purple", Excel: "green", PowerPoint: "cyan", "Site web": "cyan" } as const;
  const typeIcons = { PDF: FileText, Word: FileText, Excel: BarChart3, PowerPoint: Layers, "Site web": Globe };

  return (
    <div className="p-5 h-full overflow-y-auto space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Zone d'import */}
        <GlassCard className="p-6" glow>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Upload size={14} className="text-purple-400" /> Importer des documents</h3>
          <div className="border-2 border-dashed border-purple-500/25 rounded-2xl p-8 text-center hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-500/20 transition-colors">
              <Upload size={22} className="text-purple-400" />
            </div>
            <p className="text-sm text-slate-400 font-medium">Déposez vos fichiers ici ou <span className="text-purple-400">parcourez</span></p>
            <p className="text-xs text-slate-600 mt-1">PDF, Word, Excel, PowerPoint — jusqu'à 50 Mo</p>
            <div className="flex justify-center gap-2 mt-4">
              {["PDF", "DOCX", "XLSX", "PPTX"].map(f => (
                <NeonBadge key={f} color="purple">{f}</NeonBadge>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Connecter un site */}
        <GlassCard className="p-6" glow>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Link size={14} className="text-cyan-400" /> Connecter un site web</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input type="url" placeholder="https://votresite.fr"
                className="flex-1 px-3 py-2 rounded-xl bg-[#070d22] border border-purple-500/20 text-white text-sm focus:border-cyan-500/50 focus:outline-none transition-all placeholder-slate-600" />
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium hover:scale-105 transition-transform shadow-lg shadow-cyan-500/20">
                Indexer
              </button>
            </div>
            <p className="text-xs text-slate-500">L'IA va crawler et ingérer le contenu de ce domaine comme source de confiance.</p>
            <div className="p-3 rounded-xl bg-[#070d22] border border-cyan-500/15">
              <div className="text-[10px] text-cyan-400 font-mono mb-2 uppercase">Options de crawl</div>
              {["Inclure les sous-pages", "Suivre les liens internes", "Extraire les données structurées"].map(opt => (
                <label key={opt} className="flex items-center gap-2 mb-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-cyan-500 w-3 h-3" />
                  <span className="text-xs text-slate-400">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Liste des sources */}
      <GlassCard className="p-5" glow>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Sources de la Knowledge Base ({sources.length})</h3>
          <div className="flex gap-2">
            <NeonBadge color="green"><CheckCircle size={8} /> {sources.filter(s => s.status === "indexed").length} indexées</NeonBadge>
            <NeonBadge color="cyan">{sources.filter(s => s.status === "processing").length} en cours</NeonBadge>
          </div>
        </div>
        <div className="space-y-2">
          {sources.map(s => {
            const Icon = typeIcons[s.type as keyof typeof typeIcons] || FileText;
            const color = typeColors[s.type as keyof typeof typeColors] || "purple";
            return (
              <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl bg-[#070d22] border border-purple-500/10 hover:border-purple-500/25 transition-all group">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color === "pink" ? "bg-pink-500/15" : color === "green" ? "bg-emerald-500/15" : color === "cyan" ? "bg-cyan-500/15" : "bg-purple-500/15"}`}>
                  <Icon size={14} className={color === "pink" ? "text-pink-400" : color === "green" ? "text-emerald-400" : color === "cyan" ? "text-cyan-400" : "text-purple-400"} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate font-medium">{s.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-600 font-mono">
                    <NeonBadge color={color as any}>{s.type}</NeonBadge>
                    {s.size !== "—" && <span>{s.size}</span>}
                    {s.pages > 0 && <span>{s.pages} pages</span>}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {s.status === "indexed" && <NeonBadge color="green"><CheckCircle size={8} /> Indexé</NeonBadge>}
                  {s.status === "processing" && <NeonBadge color="cyan"><RefreshCw size={8} className="animate-spin" /> En cours</NeonBadge>}
                  {s.status === "pending" && <NeonBadge color="purple"><Clock size={8} /> En attente</NeonBadge>}
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

// ─── WordPress ─────────────────────────────────────────────────────────────────
interface StoredArticle {
  id: string;
  title: string | null;
  subject?: string | null;
  main_keyword?: string | null;
  secondary_keywords?: string[] | null;
  audience?: string | null;
  tone?: string | null;
  article_length?: string | null;
  meta_description?: string | null;
  content?: string | null;
  status?: ArticleStatus;
}

function WordPressScreen({ articleId }: { articleId: string | null }) {
  const [publishStatus, setPublishStatus] = useState<"immediate" | "scheduled" | "draft">("immediate");
  const [published, setPublished] = useState(false);
  const [article, setArticle] = useState<StoredArticle | null>(null);
  const [articleError, setArticleError] = useState<string | null>(null);
  const [wordpressConnected, setWordpressConnected] = useState(false);
  const [wordpressSiteUrl, setWordpressSiteUrl] = useState("https://anthonyfontaine.wordpress.com");
  const [connectionLoading, setConnectionLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [wordpressError, setWordpressError] = useState<string | null>(null);
  const [wordpressPostUrl, setWordpressPostUrl] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setConnectionLoading(true);
    const query = new URLSearchParams(window.location.search);
    if (query.get("wordpress") === "error") setWordpressError("La connexion WordPress.com a échoué. Vous pouvez réessayer.");
    void fetch("http://localhost:3001/api/wordpress/status", { signal: controller.signal })
      .then(async response => {
        const result = await response.json() as { connected?: boolean; siteUrl?: string; error?: string };
        if (!response.ok) throw new Error(result.error || "Impossible de vérifier la connexion WordPress.");
        setWordpressConnected(result.connected === true);
        if (result.connected && result.siteUrl) setWordpressSiteUrl(result.siteUrl);
      })
      .catch(error => {
        if (error instanceof Error && error.name === "AbortError") return;
        setWordpressError(error instanceof Error ? error.message : "Impossible de vérifier la connexion WordPress.");
      })
      .finally(() => { if (!controller.signal.aborted) setConnectionLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setPublished(false);
    setWordpressPostUrl(null);
    if (!articleId) { setArticle(null); setArticleError(null); return; }
    const controller = new AbortController();
    void fetch(`http://localhost:3001/api/articles/${encodeURIComponent(articleId)}`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Impossible de charger cet article.");
        setArticle(await response.json() as StoredArticle);
        setArticleError(null);
      })
      .catch(error => {
        if (error instanceof Error && error.name === "AbortError") return;
        setArticleError(error instanceof Error ? error.message : "Erreur pendant le chargement de l'article.");
      });
    return () => controller.abort();
  }, [articleId]);

  const handleWordPressConnect = async () => {
    setConnecting(true);
    setWordpressError(null);
    try {
      const response = await fetch("http://localhost:3001/api/wordpress/connect", { credentials: "include" });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Impossible de démarrer la connexion WordPress.");
      const authorizationUrl = new URL(result.url);
      if (authorizationUrl.origin !== "https://public-api.wordpress.com" || authorizationUrl.pathname !== "/oauth2/authorize") {
        throw new Error("L'URL d'autorisation WordPress reçue est invalide.");
      }
      window.location.assign(authorizationUrl.toString());
    } catch (error) {
      setWordpressError(error instanceof Error ? error.message : "Impossible de démarrer la connexion WordPress.");
      setConnecting(false);
    }
  };

  const handleWordPressPublish = async () => {
    setWordpressError(null);
    setWordpressPostUrl(null);
    setPublished(false);
    if (publishStatus === "scheduled") {
      setWordpressError("La planification sera connectée ultérieurement.");
      return;
    }
    if (!articleId) {
      setWordpressError("Sélectionnez un article avant de le publier.");
      return;
    }
    if (publishStatus === "draft") {
      setPublishing(true);
      try {
        const response = await fetch(`http://localhost:3001/api/articles/${encodeURIComponent(articleId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "draft" }),
        });
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(result.error || "Impossible d'enregistrer le brouillon dans NexusSEO.");
        setPublished(true);
      } catch (error) {
        setWordpressError(error instanceof Error ? error.message : "Impossible d'enregistrer le brouillon dans NexusSEO.");
      } finally {
        setPublishing(false);
      }
      return;
    }
    if (!wordpressConnected) {
      setWordpressError("Connectez WordPress.com avant de publier.");
      return;
    }

    setPublishing(true);
    let receivedResponse = false;
    try {
      const response = await fetch(`http://localhost:3001/api/wordpress/publish/${encodeURIComponent(articleId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "publish" }),
      });
      receivedResponse = true;
      const result = await response.json().catch(() => null) as { success?: boolean; wordpressUrl?: string | null; error?: string } | null;
      if (!response.ok) {
        throw new Error(result?.error || "La publication WordPress a échoué.");
      }
      if (result?.success !== true) {
        throw new Error(result?.error || "La réponse du backend NexusSEO est invalide.");
      }
      setWordpressPostUrl(result.wordpressUrl || null);
      setPublished(true);
    } catch (error) {
      setWordpressError(receivedResponse
        ? error instanceof Error ? error.message : "La publication WordPress a échoué."
        : "Impossible de joindre le backend NexusSEO.");
    } finally {
      setPublishing(false);
    }
  };

  const btnLabel = publishStatus === "immediate" ? "Publier sur WordPress" :
    publishStatus === "scheduled" ? "Planifier la publication" : "Enregistrer comme brouillon";
  const btnIcon = publishStatus === "immediate" ? Globe : publishStatus === "scheduled" ? Calendar : Clock;
  const BtnIcon = btnIcon;

  return (
    <div className="p-5 h-full overflow-y-auto space-y-5">
      <WorkflowBreadcrumb activeIndex={5} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Connexion */}
        <GlassCard className="p-5" glow>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <Globe size={13} className="text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Connexion WordPress</h3>
          </div>
          <div className={`p-3 rounded-xl border mb-4 flex items-center gap-2 ${wordpressConnected ? "bg-emerald-500/10 border-emerald-500/25" : "bg-slate-500/10 border-slate-500/25"}`}>
            <CheckCircle size={13} className={wordpressConnected ? "text-emerald-400" : "text-slate-500"} />
            <div>
              <p className={`text-xs font-medium ${wordpressConnected ? "text-emerald-300" : "text-slate-300"}`}>
                {connectionLoading ? "Vérification..." : wordpressConnected ? "Connecté" : "Déconnecté"}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">{wordpressSiteUrl}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-300 font-mono mb-1">URL du site</label>
              <input value={wordpressSiteUrl} readOnly className="w-full px-3 py-2 rounded-xl bg-[#070d22] border border-purple-500/20 text-white text-xs focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-xs text-slate-300 font-mono mb-1">Auteur</label>
              <input defaultValue="Sarah Connor" className="w-full px-3 py-2 rounded-xl bg-[#070d22] border border-purple-500/20 text-white text-xs focus:outline-none" />
            </div>
            <button onClick={() => { void handleWordPressConnect(); }} disabled={connecting}
              className="w-full py-2 rounded-xl bg-[#070d22] border border-purple-500/20 text-slate-400 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-all hover:border-purple-500/40 disabled:opacity-60">
              <RefreshCw size={11} className={connecting ? "animate-spin" : ""} /> {connecting ? "Connexion..." : wordpressConnected ? "Reconnecter WordPress" : "Connecter WordPress"}
            </button>
          </div>
        </GlassCard>

        {/* Paramètres de publication */}
        <GlassCard className="lg:col-span-2 p-5" glow>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Newspaper size={14} className="text-purple-400" /> Paramètres de publication</h3>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-xs text-slate-300 font-mono mb-1.5">Article</label>
              <div className="px-3 py-2.5 rounded-xl bg-[#070d22] border border-purple-500/20 text-sm text-slate-200 truncate">
                {articleId ? (article?.title || (articleError ? articleError : "Chargement de l'article...")) : "Aucun article sélectionné"}
              </div>
              {articleId && article && (
                <div className="mt-2 space-y-1 text-xs text-slate-500">
                  <p className="truncate">Meta description : {article.meta_description || "Aucune meta description"}</p>
                  <p className="line-clamp-3 whitespace-pre-wrap">Contenu à publier : {article.content || "Aucun contenu"}</p>
                  {article.main_keyword && <p>Mot-clé principal : {article.main_keyword}</p>}
                </div>
              )}
            </div>

            {/* Statut en premier */}
            <div>
              <label className="block text-xs text-slate-300 font-mono mb-1.5">Action de publication</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { val: "immediate", label: "Publier immédiatement", icon: Globe, color: "purple" },
                  { val: "scheduled", label: "Planifier", icon: Calendar, color: "cyan" },
                  { val: "draft", label: "Brouillon", icon: Clock, color: "pink" },
                ] as const).map(opt => (
                  <button key={opt.val} onClick={() => setPublishStatus(opt.val as any)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                      publishStatus === opt.val
                        ? opt.color === "purple" ? "bg-purple-600/25 border-purple-500/60 text-white shadow-lg shadow-purple-500/15" :
                          opt.color === "cyan" ? "bg-cyan-600/20 border-cyan-500/50 text-cyan-200 shadow-lg shadow-cyan-500/10" :
                          "bg-pink-600/20 border-pink-500/50 text-pink-200"
                        : "bg-[#070d22] border-purple-500/15 text-slate-400 hover:border-purple-500/30 hover:text-slate-300"
                    }`}>
                    <opt.icon size={14} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date seulement si planifier */}
            {publishStatus === "scheduled" && (
              <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <label className="block text-xs text-cyan-300 font-mono mb-1.5">Date et heure de publication</label>
                <input type="datetime-local" defaultValue="2025-06-05T10:00"
                  className="w-full px-3 py-2 rounded-xl bg-[#070d22] border border-cyan-500/30 text-white text-sm focus:outline-none focus:border-cyan-500/60" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 font-mono mb-1.5">Catégorie</label>
                <select className="w-full px-3 py-2 rounded-xl bg-[#070d22] border border-purple-500/20 text-white text-sm focus:outline-none">
                  {articleId ? <option>Aucune catégorie associée</option> : <>
                    <option>Technologie & Innovation</option>
                    <option>Gouvernance</option>
                    <option>Stratégie</option>
                  </>}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-300 font-mono mb-1.5">Tags</label>
                <div className="flex gap-1.5 flex-wrap p-2 rounded-xl bg-[#070d22] border border-purple-500/20 min-h-[38px]">
                  {(articleId
                    ? [...new Set([article?.main_keyword, ...(article?.secondary_keywords || [])].filter((keyword): keyword is string => Boolean(keyword?.trim())))]
                    : ["SEO", "startup", "2025"]
                  ).map(tag => (
                    <div key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-200 text-xs">
                      {tag} <X size={9} className="cursor-pointer hover:text-white" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {wordpressError && <p className="mb-3 text-sm text-rose-300" role="alert">{wordpressError}</p>}

          {!published ? (
            <button onClick={() => { void handleWordPressPublish(); }} disabled={publishing}
              className={`w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform ${
                publishStatus === "immediate" ? "bg-gradient-to-r from-purple-600 to-violet-600 shadow-purple-500/25" :
                publishStatus === "scheduled" ? "bg-gradient-to-r from-cyan-600 to-blue-600 shadow-cyan-500/20" :
                "bg-gradient-to-r from-slate-600 to-slate-700 shadow-slate-500/15"
              } disabled:opacity-60`}>
              {publishing ? <RefreshCw size={15} className="animate-spin" /> : <BtnIcon size={15} />} {publishing ? publishStatus === "draft" ? "Enregistrement..." : "Publication en cours..." : btnLabel}
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-emerald-300">
                  {publishStatus === "immediate" ? "Article publié avec succès" :
                   publishStatus === "scheduled" ? "Article planifié pour publication" : "Article enregistré comme brouillon dans NexusSEO."}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {publishStatus === "immediate" ? wordpressSiteUrl.replace(/^https?:\/\//, "") :
                   publishStatus === "scheduled" ? "Planification non connectée" : "Statut enregistré dans NexusSEO"}
                </p>
                {wordpressPostUrl && <a href={wordpressPostUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-cyan-300 hover:text-cyan-200 underline">Ouvrir l'article WordPress</a>}
              </div>
              <button onClick={() => setPublished(false)} className="ml-auto text-slate-500 hover:text-slate-300"><X size={14} /></button>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Historique des publications */}
      <GlassCard className="p-5" glow>
        <h3 className="text-sm font-semibold text-white mb-4">Publications récentes</h3>
        <div className="space-y-2">
          {[
            { title: "SEO pour startups : stratégie complète 2025", date: "22 mai 2025", url: "lelocal.fr/blog/seo-startups", views: "12,4K" },
            { title: "Growth Marketing : 7 leviers d'acquisition PME", date: "18 mai 2025", url: "lelocal.fr/blog/growth-marketing", views: "8,7K" },
            { title: "Product-Market Fit : méthodologie complète", date: "10 mai 2025", url: "lelocal.fr/blog/pmf", views: "5,2K" },
          ].map(pub => (
            <div key={pub.title} className="flex items-center gap-3 p-3 rounded-xl bg-[#070d22] border border-purple-500/10 hover:border-purple-500/25 transition-all">
              <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 truncate">{pub.title}</p>
                <p className="text-xs text-slate-600 font-mono mt-0.5">{pub.url}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-slate-500">{pub.date}</p>
                <p className="text-xs text-cyan-400 font-mono">{pub.views} vues</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ─── Media ─────────────────────────────────────────────────────────────────────
function MediaScreen() {
  const images = [
    { id: 1, src: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&h=280&fit=crop&auto=format", label: "Intelligence Artificielle" },
    { id: 2, src: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=280&fit=crop&auto=format", label: "Réseau Digital" },
    { id: 3, src: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=280&fit=crop&auto=format", label: "Data Analytics" },
    { id: 4, src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop&auto=format", label: "Réunion stratégique" },
    { id: 5, src: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=280&fit=crop&auto=format", label: "Tableau de bord" },
    { id: 6, src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=280&fit=crop&auto=format", label: "Réseau mondial" },
  ];
  const [selected, setSelected] = useState<number | null>(1);

  return (
    <div className="p-5 h-full overflow-y-auto space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform">
          <Upload size={14} /> Importer des images
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0b1028] border border-purple-500/20 text-slate-400 hover:text-white text-sm transition-all">
          <Sparkles size={14} className="text-purple-400" /> Suggestions IA d'images
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0b1028] border border-purple-500/20 text-slate-400 hover:text-white text-sm transition-all">
          <Globe size={14} className="text-cyan-400" /> Bibliothèque WordPress
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Grille d'images */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map(img => (
            <div key={img.id} onClick={() => setSelected(img.id)}
              className={`relative rounded-xl overflow-hidden cursor-pointer transition-all group aspect-video ${selected === img.id ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/25" : "hover:ring-1 hover:ring-purple-500/40"}`}>
              <img src={img.src} alt={img.label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <span className="text-white text-xs font-medium">{img.label}</span>
              </div>
              {selected === img.id && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                  <CheckCircle size={11} className="text-white" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Détails */}
        <GlassCard className="p-4 space-y-4" glow>
          <h3 className="text-sm font-semibold text-white">Détails de l'image</h3>
          {selected !== null && (
            <>
              <div className="rounded-xl overflow-hidden aspect-video">
                <img src={images.find(i => i.id === selected)?.src} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Fichier</span>
                  <span className="text-slate-300">ia-technologie.jpg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dimensions</span>
                  <span className="text-slate-300">1920×1080 · 840 Ko</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source</span>
                  <span className="text-cyan-400">Unsplash</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 font-mono mb-1">Texte alt</label>
                <input defaultValue="Visualisation du concept de gouvernance IA" className="w-full px-3 py-2 rounded-xl bg-[#070d22] border border-purple-500/20 text-white text-xs focus:outline-none" />
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs hover:bg-purple-600/30 transition-colors flex items-center justify-center gap-1">
                  <Star size={10} /> Image à la une
                </button>
                <button className="flex-1 py-2 rounded-xl bg-[#070d22] border border-purple-500/15 text-slate-400 text-xs hover:text-white transition-colors flex items-center justify-center gap-1">
                  <Globe size={10} /> Envoyer vers WP
                </button>
              </div>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

// ─── Analytics ─────────────────────────────────────────────────────────────────
function AnalyticsScreen() {
  const trafficData = [
    { w: "S1", organic: 18200, direct: 4800, referral: 2200 },
    { w: "S2", organic: 22400, direct: 5100, referral: 2800 },
    { w: "S3", organic: 19800, direct: 4600, referral: 3100 },
    { w: "S4", organic: 27600, direct: 5800, referral: 3400 },
    { w: "S5", organic: 31200, direct: 6200, referral: 4100 },
    { w: "S6", organic: 28900, direct: 5900, referral: 3800 },
    { w: "S7", organic: 35400, direct: 7100, referral: 4600 },
  ];

  const keywords = [
    { kw: "SEO startup", rank: 1, prev: 3, volume: "4,2K", trend: "up" },
    { kw: "génération leads organiques", rank: 2, prev: 2, volume: "1,9K", trend: "stable" },
    { kw: "stratégie SEO PME", rank: 3, prev: 5, volume: "2,8K", trend: "up" },
    { kw: "growth marketing digital", rank: 4, prev: 7, volume: "3,6K", trend: "up" },
    { kw: "acquisition client SEO", rank: 8, prev: 6, volume: "1,4K", trend: "down" },
    { kw: "content marketing B2B startup", rank: 11, prev: 14, volume: "980", trend: "up" },
  ];

  const pieData = [
    { name: "Organique", value: 68, color: "#8b5cf6" },
    { name: "Direct", value: 19, color: "#06b6d4" },
    { name: "Référent", value: 13, color: "#ec4899" },
  ];

  const topArticles = [
    { title: "SEO pour startups 2025", views: "12,4K", bounce: "38%", seo: 96 },
    { title: "Growth Marketing PME", views: "8,7K", bounce: "42%", seo: 88 },
    { title: "Génération leads B2B", views: "7,2K", bounce: "35%", seo: 91 },
  ];

  return (
    <div className="p-5 h-full overflow-y-auto space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Traffic total", value: "124,3K", delta: "+34%", color: "#8b5cf6" },
          { label: "Traffic organique", value: "84,7K", delta: "+41%", color: "#06b6d4" },
          { label: "Position moyenne", value: "4,2", delta: "▲ 1,8", color: "#34d399" },
          { label: "Conversions leads", value: "847", delta: "+12%", color: "#ec4899" },
        ].map(kpi => (
          <GlassCard key={kpi.label} className="p-4 overflow-hidden" glow>
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${kpi.color}70, transparent)` }} />
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-15 blur-xl pointer-events-none" style={{ backgroundColor: kpi.color }} />
            <div className="text-xs text-slate-400 mb-1">{kpi.label}</div>
            <div className="text-2xl font-bold font-mono" style={{ color: kpi.color, textShadow: `0 0 20px ${kpi.color}40` }}>{kpi.value}</div>
            <div className="text-xs text-emerald-400 font-mono mt-1">{kpi.delta}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Graphique traffic */}
        <GlassCard className="lg:col-span-2 p-5" glow>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Traffic par canal</h3>
            <NeonBadge color="purple">7 dernières semaines</NeonBadge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
              <XAxis dataKey="w" tick={{ fill: "#6b7db3", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7db3", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ backgroundColor: "#0b1028", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px", color: "#e8eaf6", fontSize: "12px" }} formatter={(v: any) => [v.toLocaleString("fr-FR"), ""]} />
              <Bar dataKey="organic" fill="#8b5cf6" radius={[3, 3, 0, 0]} name="Organique" />
              <Bar dataKey="direct" fill="#06b6d4" radius={[3, 3, 0, 0]} name="Direct" />
              <Bar dataKey="referral" fill="#ec4899" radius={[3, 3, 0, 0]} name="Référent" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Sources de traffic */}
        <GlassCard className="p-5" glow>
          <h3 className="text-sm font-semibold text-white mb-4">Sources de traffic</h3>
          <div className="flex justify-center mb-3">
            <PieChart width={140} height={140}>
              <Pie data={pieData} cx={65} cy={65} innerRadius={42} outerRadius={65} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-slate-400">{d.name}</span>
                </div>
                <span className="text-xs font-mono text-white">{d.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Rankings de keywords */}
        <GlassCard className="p-5" glow>
          <h3 className="text-sm font-semibold text-white mb-4">Rankings de keywords</h3>
          <div className="space-y-2">
            {keywords.map(k => (
              <div key={k.kw} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#070d22] border border-purple-500/10">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-bold font-mono text-xs" style={{
                  backgroundColor: k.rank <= 3 ? "rgba(52,211,153,0.15)" : "rgba(124,58,237,0.15)",
                  color: k.rank <= 3 ? "#34d399" : "#a5b4fc"
                }}>#{k.rank}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 truncate">{k.kw}</p>
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5">{k.volume}/mois</p>
                </div>
                <div className={`text-xs font-mono flex items-center gap-1 ${k.trend === "up" ? "text-emerald-400" : k.trend === "down" ? "text-red-400" : "text-slate-500"}`}>
                  {k.trend === "up" ? "↑" : k.trend === "down" ? "↓" : "—"}
                  <span className="text-slate-600 text-[10px]">était #{k.prev}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Articles les plus performants */}
        <GlassCard className="p-5" glow>
          <h3 className="text-sm font-semibold text-white mb-4">Articles les plus performants</h3>
          <div className="space-y-3">
            {topArticles.map((a, i) => (
              <div key={a.title} className="p-3 rounded-xl bg-[#070d22] border border-purple-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-300 font-mono">#{i + 1}</div>
                  <p className="text-xs text-slate-300 truncate flex-1">{a.title}</p>
                  <SEOScoreCircle score={a.seo} />
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1"><Eye size={9} /> {a.views}</span>
                  <span className="flex items-center gap-1"><Activity size={9} /> Bounce : {a.bounce}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// ─── Recherche SEO ─────────────────────────────────────────────────────────────
type KeywordResult = {
  id: number; kw: string; volume: string; diff: "Faible" | "Moyenne" | "Élevée";
  intent: "Informationnel" | "Commercial" | "Transactionnel" | "Navigationnel";
  trend: "up" | "stable" | "down"; selected: boolean; role: "none" | "principal" | "secondaire";
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Faible: "green", Moyenne: "cyan", Élevée: "pink",
};
const INTENT_COLOR: Record<string, string> = {
  Informationnel: "purple", Commercial: "cyan", Transactionnel: "pink", Navigationnel: "green",
};

function ResearchScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [keywords, setKeywords] = useState<KeywordResult[]>([]);
  const [faqItems] = useState([
    "Comment faire du SEO pour une startup ?",
    "Quels sont les meilleurs outils SEO pour PME ?",
    "Combien de temps pour voir des résultats SEO ?",
    "Comment générer des leads avec le content marketing ?",
    "Quelle est la différence entre SEO et SEA pour startup ?",
  ]);

  const MOCK_RESULTS: KeywordResult[] = [
    { id: 1, kw: "SEO startup", volume: "4 200", diff: "Moyenne", intent: "Informationnel", trend: "up", selected: false, role: "none" },
    { id: 2, kw: "stratégie SEO PME", volume: "2 800", diff: "Faible", intent: "Informationnel", trend: "up", selected: false, role: "none" },
    { id: 3, kw: "génération leads organiques", volume: "1 900", diff: "Faible", intent: "Commercial", trend: "up", selected: false, role: "none" },
    { id: 4, kw: "acquisition client SEO", volume: "1 400", diff: "Moyenne", intent: "Commercial", trend: "up", selected: false, role: "none" },
    { id: 5, kw: "content marketing B2B startup", volume: "980", diff: "Faible", intent: "Informationnel", trend: "stable", selected: false, role: "none" },
    { id: 6, kw: "référencement naturel entrepreneur", volume: "3 600", diff: "Élevée", intent: "Informationnel", trend: "up", selected: false, role: "none" },
    { id: 7, kw: "growth marketing digital", volume: "720", diff: "Faible", intent: "Informationnel", trend: "stable", selected: false, role: "none" },
    { id: 8, kw: "visibilité organique business", volume: "1 100", diff: "Moyenne", intent: "Commercial", trend: "up", selected: false, role: "none" },
    { id: 9, kw: "ROI SEO vs SEA", volume: "850", diff: "Faible", intent: "Informationnel", trend: "stable", selected: false, role: "none" },
  ];

  const handleSearch = () => {
    if (!query.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setKeywords(MOCK_RESULTS);
      setLoading(false);
      setSearched(true);
    }, 1800);
  };

  const toggleRole = (id: number, role: "principal" | "secondaire") => {
    setKeywords(prev => prev.map(k => {
      if (k.id === id) {
        const newRole = k.role === role ? "none" : role;
        if (role === "principal" && newRole === "principal") {
          return { ...k, role: "principal", selected: true };
        }
        return { ...k, role: newRole, selected: newRole !== "none" };
      }
      if (role === "principal" && k.role === "principal") return { ...k, role: "none", selected: false };
      return k;
    }));
  };

  const principal = keywords.find(k => k.role === "principal");
  const secondaires = keywords.filter(k => k.role === "secondaire");
  const canGenerate = !!principal;

  return (
    <div className="p-5 h-full overflow-y-auto space-y-5">
      {/* En-tête workflow */}
      <WorkflowBreadcrumb activeIndex={0} />

      {/* Barre de recherche principale */}
      <GlassCard className="p-5" glow>
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical size={15} className="text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Recherche de mots-clés SEO</h3>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#070d22] border border-cyan-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_#06b6d4]" />
            <span className="text-[10px] text-cyan-400 font-mono">Semrush connecté</span>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Ex : gouvernance IA, communication de crise, stratégie digitale..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#070d22] border border-purple-500/20 text-white text-sm focus:border-purple-500/50 focus:outline-none transition-all placeholder-slate-600"
            />
          </div>
          <button onClick={handleSearch} disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.02] disabled:opacity-60 whitespace-nowrap">
            {loading ? <><RefreshCw size={13} className="animate-spin" /> Analyse IA...</> : <><Search size={13} /> Rechercher des mots-clés</>}
          </button>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {["SEO startup", "Growth marketing", "Génération leads B2B", "Content marketing SaaS", "Product-Market Fit"].map(s => (
            <button key={s} onClick={() => setQuery(s)}
              className="px-2.5 py-1 rounded-lg bg-[#070d22] border border-purple-500/15 text-slate-500 hover:text-purple-300 hover:border-purple-500/30 text-xs transition-all">
              {s}
            </button>
          ))}
        </div>
      </GlassCard>

      {!searched && !loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <FlaskConical size={28} className="text-purple-400" />
            </div>
            <p className="text-slate-400 text-sm font-medium">Entrez un sujet ou une idée de contenu</p>
            <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">L'IA analyse les données Semrush et suggère les meilleurs keywords pour votre audience.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 text-sm">Analyse Semrush + IA en cours...</p>
            <p className="text-slate-600 text-xs mt-1">Récupération des volumes de recherche et de la concurrence</p>
          </div>
        </div>
      )}

      {searched && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Panneau de sélection */}
          <div className="space-y-4">
            {/* Filtres */}
            <GlassCard className="p-4" glow>
              <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <SlidersHorizontal size={11} /> Filtres
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Difficulté SEO</label>
                  <div className="flex flex-col gap-1">
                    {["Faible", "Moyenne", "Élevée"].map(d => (
                      <label key={d} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="accent-purple-500 w-3 h-3" />
                        <span className="text-xs text-slate-400">{d}</span>
                        <NeonBadge color={DIFFICULTY_COLOR[d] as any}>{d}</NeonBadge>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block">Intention de recherche</label>
                  <div className="flex flex-col gap-1">
                    {["Informationnel", "Commercial", "Transactionnel"].map(i => (
                      <label key={i} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="accent-purple-500 w-3 h-3" />
                        <span className="text-xs text-slate-400 truncate">{i}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Volume minimum</label>
                  <input type="range" min={0} max={5000} defaultValue={0} className="w-full accent-purple-500" />
                  <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-0.5">
                    <span>0</span><span>5 000</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Sélection en cours */}
            <GlassCard className="p-4" glow>
              <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider mb-3">Ma sélection</h4>
              <div className="space-y-2">
                <div>
                  <div className="text-[10px] text-purple-400 font-mono mb-1">MOT-CLÉ PRINCIPAL</div>
                  {principal ? (
                    <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/25">
                      <p className="text-xs text-purple-300 font-medium truncate">{principal.kw}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{principal.volume}/mois</p>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-[#070d22] border border-dashed border-purple-500/20 text-center">
                      <p className="text-[10px] text-slate-600">Non sélectionné</p>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] text-cyan-400 font-mono mb-1">MOTS-CLÉS SECONDAIRES ({secondaires.length})</div>
                  <div className="space-y-1">
                    {secondaires.length === 0 ? (
                      <div className="p-2 rounded-lg bg-[#070d22] border border-dashed border-cyan-500/15 text-center">
                        <p className="text-[10px] text-slate-600">Aucun sélectionné</p>
                      </div>
                    ) : secondaires.map(k => (
                      <div key={k.id} className="flex items-center justify-between p-1.5 rounded-lg bg-cyan-500/5 border border-cyan-500/15">
                        <p className="text-[10px] text-cyan-300 truncate">{k.kw}</p>
                        <button onClick={() => toggleRole(k.id, "secondaire")}><X size={9} className="text-slate-500 hover:text-red-400" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => onNavigate("generate")} disabled={!canGenerate}
                className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed">
                <Sparkles size={12} /> Générer l'article <ArrowRight size={11} />
              </button>
            </GlassCard>
          </div>

          {/* Résultats */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">{keywords.length} mots-clés trouvés pour <span className="text-purple-300">"{query || "gouvernance IA"}"</span></p>
              <NeonBadge color="cyan"><Cpu size={8} /> Données Semrush + IA</NeonBadge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {keywords.map(k => (
                <GlassCard key={k.id} className={`p-4 transition-all duration-200 ${k.role === "principal" ? "border-purple-500/50 shadow-purple-500/10" : k.role === "secondaire" ? "border-cyan-500/40" : "hover:border-purple-500/30"}`} glow>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{k.kw}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {k.trend === "up" && <Flame size={12} className="text-orange-400" />}
                      {k.trend === "stable" && <ArrowUpRight size={12} className="text-slate-500" />}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-[#070d22] border border-purple-500/10">
                      <div className="text-[9px] text-slate-500 font-mono mb-0.5">VOLUME</div>
                      <div className="text-sm font-bold text-white font-mono">{k.volume}</div>
                      <div className="text-[9px] text-slate-600">recherches/mois</div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#070d22] border border-purple-500/10">
                      <div className="text-[9px] text-slate-500 font-mono mb-0.5">DIFFICULTÉ</div>
                      <NeonBadge color={DIFFICULTY_COLOR[k.diff] as any}>{k.diff}</NeonBadge>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="text-[9px] text-slate-500 font-mono">INTENTION</div>
                    <NeonBadge color={INTENT_COLOR[k.intent] as any}>{k.intent}</NeonBadge>
                  </div>

                  <div className="flex gap-1.5">
                    <button onClick={() => toggleRole(k.id, "principal")}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${k.role === "principal" ? "bg-purple-600 text-white" : "bg-[#070d22] border border-purple-500/20 text-slate-400 hover:text-purple-300 hover:border-purple-500/40"}`}>
                      {k.role === "principal" ? "✓ Principal" : "Principal"}
                    </button>
                    <button onClick={() => toggleRole(k.id, "secondaire")}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${k.role === "secondaire" ? "bg-cyan-600/50 text-cyan-200 border border-cyan-500/40" : "bg-[#070d22] border border-cyan-500/15 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30"}`}>
                      {k.role === "secondaire" ? "✓ Secondaire" : "Secondaire"}
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Questions fréquentes */}
            <GlassCard className="p-5" glow>
              <div className="flex items-center gap-2 mb-4">
                <BookMarked size={14} className="text-cyan-400" />
                <h4 className="text-sm font-semibold text-white">Questions fréquentes des internautes</h4>
                <NeonBadge color="cyan">FAQ potentielles</NeonBadge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {faqItems.map((q, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#070d22] border border-purple-500/10 hover:border-purple-500/25 cursor-pointer transition-all group">
                    <div className="w-5 h-5 rounded-full bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-bold text-purple-400">?</span>
                    </div>
                    <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">{q}</p>
                    <Plus size={11} className="text-slate-600 group-hover:text-purple-400 ml-auto flex-shrink-0 transition-colors" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-3">Cliquez sur une question pour l'ajouter à la structure de votre article.</p>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Éditeur d'article ─────────────────────────────────────────────────────────
const ARTICLE_CONTENT = [
  {
    id: "intro",
    type: "intro",
    heading: "",
    body: "Dans un écosystème digital où la visibilité organique détermine directement le succès commercial, les startups et PME font face à un défi crucial : comment générer un flux constant de leads qualifiés sans épuiser leur budget marketing ? Le SEO s'impose aujourd'hui comme le levier d'acquisition le plus rentable pour les entrepreneurs qui cherchent à développer leur business de manière durable et scalable.",
  },
  {
    id: "h2-1",
    type: "section",
    heading: "Pourquoi le SEO est essentiel pour les startups en 2025",
    body: "Contrairement aux canaux publicitaires payants qui exigent un investissement continu, le référencement naturel génère un trafic qualifié sur le long terme. Pour une startup avec des ressources limitées, chaque euro investi dans le SEO produit un ROI moyen 5 à 10 fois supérieur aux campagnes paid. De plus, 68% des parcours d'achat B2B commencent par une recherche organique, faisant du SEO un canal incontournable pour l'acquisition client.",
  },
  {
    id: "h2-2",
    type: "section",
    heading: "Les 4 piliers d'une stratégie SEO pour PME",
    body: "Une stratégie SEO efficace pour startup repose sur quatre fondamentaux : la recherche de mots-clés à forte intention commerciale et faible concurrence, l'optimisation technique pour la performance et l'indexation, la création de contenu expert qui répond aux problématiques de votre audience, et enfin le netlinking stratégique pour renforcer votre autorité de domaine. L'équilibre de ces quatre leviers détermine votre capacité à ranker rapidement.",
  },
  {
    id: "h2-3",
    type: "section",
    heading: "Comment identifier les bons mots-clés pour votre business",
    body: "La recherche de mots-clés pour startup doit privilégier les termes de longue traîne (3+ mots) avec un volume de recherche entre 100 et 1000 requêtes/mois et une difficulté SEO inférieure à 40. Ces keywords de niche offrent un taux de conversion 2,5 fois supérieur aux termes génériques tout en étant accessibles sans autorité de domaine établie. Utilisez des outils comme Semrush ou Ahrefs pour identifier les opportunités inexploitées par vos concurrents.",
  },
  {
    id: "h2-4",
    type: "section",
    heading: "Feuille de route : lancer votre stratégie SEO en 90 jours",
    body: "Un déploiement SEO efficace pour startup suit généralement quatre phases : l'audit technique et l'optimisation on-page (semaines 1-3), la création du cluster de contenu pilier autour de vos keywords stratégiques (semaines 4-8), le lancement d'une campagne de netlinking ciblée (semaines 9-10), puis l'optimisation continue basée sur les données Analytics et Search Console (semaines 11-12). Cette approche méthodique permet d'obtenir les premiers résultats visibles dès le 3ème mois.",
  },
];

type AiAction = "professionnel" | "seo" | "raccourcir" | "développer" | "simplifier";
const AI_ACTIONS: { id: AiAction; label: string; icon: any; color: string }[] = [
  { id: "professionnel", label: "Rendre plus professionnel", icon: Star, color: "text-yellow-400" },
  { id: "seo", label: "Optimiser SEO", icon: Target, color: "text-purple-400" },
  { id: "raccourcir", label: "Raccourcir", icon: Minimize2, color: "text-cyan-400" },
  { id: "développer", label: "Développer", icon: Maximize2, color: "text-emerald-400" },
  { id: "simplifier", label: "Simplifier", icon: Scissors, color: "text-pink-400" },
];

function EditorScreen({ onNavigate, articleId }: { onNavigate: (s: Screen) => void; articleId: string | null }) {
  const [sections, setSections] = useState<ArticleSection[]>(() => articleId ? [] : ARTICLE_CONTENT.map(s => ({ ...s, type: s.type as "intro" | "section" })));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [aiMenuId, setAiMenuId] = useState<string | null>(null);
  const [aiPromptTexts, setAiPromptTexts] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [articleStatus, setArticleStatus] = useState<ArticleStatus>("draft");
  const [articleLoading, setArticleLoading] = useState(Boolean(articleId));
  const [articleError, setArticleError] = useState<string | null>(null);
  const [seoScore] = useState(87);
  const [readability] = useState(74);
  const [lastSaved, setLastSaved] = useState("Il y a quelques secondes");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!articleId) {
      setArticleLoading(false);
      setArticleError(null);
      setTitle("SEO pour startups : stratégie complète de génération de leads organiques (2025)");
      setSections(ARTICLE_CONTENT.map(section => ({ ...section, type: section.type as "intro" | "section" })));
      return;
    }
    const controller = new AbortController();
    setArticleLoading(true);
    setArticleError(null);
    void fetch(`http://localhost:3001/api/articles/${encodeURIComponent(articleId)}`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error(response.status === 404 ? "Cet article n'existe plus." : "Impossible de charger l'article.");
        const article = await response.json() as StoredArticle;
        setTitle(article.title || "Article sans titre");
        setMetaDescription(article.meta_description || "");
        setSections(contentToSections(article.content || ""));
        setArticleStatus(article.status || "draft");
      })
      .catch(error => {
        if (error instanceof Error && error.name === "AbortError") return;
        setArticleError(error instanceof Error ? error.message : "Erreur pendant le chargement de l'article.");
      })
      .finally(() => { if (!controller.signal.aborted) setArticleLoading(false); });
    return () => controller.abort();
  }, [articleId]);

  const setPromptText = (sectionId: string, text: string) => {
    setAiPromptTexts(prev => ({ ...prev, [sectionId]: text }));
  };

  const applyFreePrompt = (sectionId: string) => {
    const prompt = aiPromptTexts[sectionId];
    if (!prompt?.trim()) return;
    setAiMenuId(null);
    setProcessingId(sectionId);
    setTimeout(() => {
      setSections(prev => prev.map(s => {
        if (s.id !== sectionId) return s;
        return { ...s, body: s.body + " [IA] " + prompt.trim().charAt(0).toUpperCase() + prompt.trim().slice(1) + "." };
      }));
      setProcessingId(null);
      setPromptText(sectionId, "");
    }, 1200);
  };

  const recommendations = [
    { type: "warning", msg: "Ajoutez le keyword \"SEO startup\" dans le premier paragraphe" },
    { type: "ok", msg: "Longueur optimale : 2 280 mots détectés" },
    { type: "warning", msg: "Densité keyword principale : 1,3% — cible : 1,5–2%" },
    { type: "ok", msg: "Structure H1/H2 conforme aux bonnes pratiques SEO" },
    { type: "warning", msg: "Meta description manquante — à renseigner avant publication" },
    { type: "ok", msg: "Liens internes : 4 détectés" },
  ];

  const keywordDensities = [
    { kw: "SEO startup", density: 1.3, target: 1.8 },
    { kw: "génération leads", density: 0.9, target: 1.0 },
    { kw: "stratégie SEO PME", density: 0.7, target: 0.8 },
  ];

  const applyAiAction = (sectionId: string, action: AiAction) => {
    setAiMenuId(null);
    setProcessingId(sectionId);
    setTimeout(() => {
      setSections(prev => prev.map(s => {
        if (s.id !== sectionId) return s;
        const suffixes: Record<AiAction, string> = {
          professionnel: " Cette approche méthodique permet aux startups de maximiser leur ROI marketing tout en construisant une présence organique pérenne.",
          seo: " Le SEO constitue ainsi le canal d'acquisition le plus rentable pour les entrepreneurs cherchant une croissance durable et scalable.",
          raccourcir: "",
          développer: " Il convient par ailleurs de souligner qu'une stratégie SEO bien exécutée représente également un avantage concurrentiel décisif, en réduisant le coût d'acquisition client de 40 à 60% comparé aux canaux paid et en générant une croissance composée sur le long terme.",
          simplifier: "",
        };
        const newBody = action === "raccourcir"
          ? s.body.split(". ").slice(0, 2).join(". ") + "."
          : s.body + (suffixes[action] || "");
        return { ...s, body: newBody };
      }));
      setProcessingId(null);
    }, 1200);
  };

  const scoreColor = seoScore >= 80 ? "#34d399" : seoScore >= 60 ? "#fbbf24" : "#f87171";
  const readColor = readability >= 70 ? "#34d399" : readability >= 50 ? "#fbbf24" : "#f87171";

  const handleSave = async (statusToSave = articleStatus) => {
    setSaving(true);
    try {
      if (articleId) {
        const response = await fetch(`http://localhost:3001/api/articles/${encodeURIComponent(articleId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content: sectionsToContent(sections), meta_description: metaDescription, status: statusToSave }),
        });
        if (!response.ok) {
          const body = await response.json() as { error?: string };
          throw new Error(body.error || "L'enregistrement de l'article a échoué.");
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      setArticleError(null);
      setLastSaved("À l'instant");
    } catch (error) {
      setArticleError(error instanceof Error ? error.message : "L'enregistrement de l'article a échoué.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-purple-500/20 bg-[#080e28]/80 backdrop-blur-sm flex-wrap">
        <WorkflowBreadcrumb activeIndex={2} onBack={() => onNavigate("generate")} />
        <div className="h-4 w-px bg-purple-500/20 hidden sm:block" />

        {/* Auto-save indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0b1028]/50 border border-purple-500/10">
          {saving ? (
            <>
              <RefreshCw size={10} className="text-cyan-400 animate-spin" />
              <span className="text-xs text-slate-500">Enregistrement...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={10} className="text-emerald-400" />
              <span className="text-xs text-slate-500">Enregistré {lastSaved}</span>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => { void handleSave(); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b1028] border border-purple-500/15 text-slate-400 hover:text-white text-xs transition-all"
          >
            <Download size={11} /> Enregistrer
          </button>
          {articleStatus === "draft" && (
            <button
              onClick={() => { setArticleStatus("review"); void handleSave("review"); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/30 text-xs font-medium transition-all"
            >
              <CheckCircle size={11} /> Passer en révision
            </button>
          )}
          <button
            onClick={() => onNavigate("visual")}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform"
          >
            <ArrowRight size={11} /> Enrichissement visuel
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Zone d'édition */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {articleLoading && <p className="text-sm text-slate-400">Chargement de l'article...</p>}
            {articleError && <p className="text-sm text-rose-300">{articleError}</p>}
            {/* Titre */}
            <div className="group relative">
              <textarea
                value={title}
                onChange={e => setTitle(e.target.value)}
                rows={2}
                className="w-full text-2xl font-bold text-white bg-transparent border-0 border-b-2 border-transparent hover:border-purple-500/20 focus:border-purple-500/40 focus:outline-none resize-none leading-tight transition-all"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              />
              <div className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Pencil size={12} className="text-slate-600" />
              </div>
            </div>

            {/* Meta description */}
            <div className="p-3 rounded-xl bg-[#070d22] border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertCircle size={11} className="text-yellow-400" />
                <span className="text-[10px] text-yellow-400 font-mono uppercase">{metaDescription ? "Meta description" : "Meta description manquante"}</span>
              </div>
              <input value={metaDescription} onChange={event => setMetaDescription(event.target.value)} placeholder="Rédigez votre meta description (150–160 caractères idéalement)..."
                className="w-full bg-transparent text-xs text-slate-400 placeholder-slate-600 focus:outline-none" />
            </div>

            {/* Sections */}
            {sections.map(section => (
              <div key={section.id}
                className="relative group"
                onMouseEnter={() => setHoveredId(section.id)}
                onMouseLeave={() => { setHoveredId(null); if (aiMenuId === section.id) setAiMenuId(null); }}>

                {/* Indicateur de traitement IA */}
                {processingId === section.id && (
                  <div className="absolute inset-0 rounded-xl bg-purple-500/5 border border-purple-500/30 flex items-center justify-center z-10 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-purple-300 text-sm">
                      <Wand2 size={14} className="animate-pulse" />
                      Traitement IA en cours...
                    </div>
                  </div>
                )}

                <div className={`rounded-xl p-4 border transition-all duration-200 ${editingId === section.id ? "border-purple-500/40 bg-purple-500/5" : "border-transparent hover:border-purple-500/15 hover:bg-white/[0.02]"}`}>
                  {section.type === "section" && section.heading && (
                    editingId === section.id ? (
                      <input
                        defaultValue={section.heading}
                        onChange={e => setSections(prev => prev.map(s => s.id === section.id ? { ...s, heading: e.target.value } : s))}
                        className="w-full text-base font-semibold text-purple-300 bg-transparent border-b border-purple-500/30 focus:outline-none mb-3 pb-1"
                      />
                    ) : (
                      <h2 className="text-base font-semibold text-purple-300 mb-3">{section.heading}</h2>
                    )
                  )}
                  {editingId === section.id ? (
                    <div className="space-y-2">
                      <textarea
                        defaultValue={section.body}
                        onChange={e => setSections(prev => prev.map(s => s.id === section.id ? { ...s, body: e.target.value } : s))}
                        rows={5}
                        className="w-full text-sm text-slate-300 bg-[#070d22] border border-purple-500/20 rounded-xl p-3 focus:border-purple-500/50 focus:outline-none resize-none leading-relaxed"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium">Valider</button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg bg-[#070d22] border border-purple-500/20 text-slate-400 text-xs">Annuler</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 leading-relaxed">{section.body}</p>
                  )}
                </div>

                {/* Actions contextuelles */}
                {hoveredId === section.id && editingId !== section.id && (
                  <div className="absolute -right-2 top-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={() => setEditingId(section.id)}
                      className="w-7 h-7 rounded-lg bg-[#0b1028] border border-purple-500/25 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/50 transition-all"
                      title="Modifier">
                      <Pencil size={11} />
                    </button>
                    <div className="relative">
                      <button onClick={() => setAiMenuId(aiMenuId === section.id ? null : section.id)}
                        className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600/80 to-violet-600/80 border border-purple-500/40 flex items-center justify-center text-white hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-500/20"
                        title="Actions IA">
                        <Wand2 size={11} />
                      </button>
                      {aiMenuId === section.id && (
                        <div className="absolute right-9 top-0 w-64 bg-[#0b1028] border border-purple-500/30 rounded-xl shadow-2xl shadow-purple-500/20 overflow-hidden z-30">
                          <div className="px-3 pt-2.5 pb-1">
                            <p className="text-[10px] text-purple-400 font-mono font-semibold uppercase tracking-wider mb-1.5">Actions rapides</p>
                          </div>
                          {AI_ACTIONS.map(a => (
                            <button key={a.id} onClick={() => applyAiAction(section.id, a.id)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-purple-500/10 transition-all text-left">
                              <a.icon size={11} className={a.color} /> {a.label}
                            </button>
                          ))}
                          <div className="border-t border-purple-500/10">
                            <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-purple-500/10 transition-all text-left">
                              <RotateCcw size={11} className="text-slate-500" /> Régénérer cette section
                            </button>
                          </div>
                          {/* Prompt libre par paragraphe */}
                          <div className="border-t border-purple-500/15 p-3 space-y-2">
                            <p className="text-[10px] text-purple-400 font-mono font-semibold uppercase tracking-wider">Prompt libre</p>
                            <textarea
                              value={aiPromptTexts[section.id] || ""}
                              onChange={e => setPromptText(section.id, e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); applyFreePrompt(section.id); } }}
                              placeholder="Ex : Adapter ce paragraphe à un ton institutionnel..."
                              rows={2}
                              className="w-full px-2.5 py-2 rounded-lg bg-[#070d22] border border-purple-500/20 text-xs text-white placeholder-slate-600 focus:border-purple-500/50 focus:outline-none resize-none transition-all"
                              onClick={e => e.stopPropagation()}
                            />
                            <div className="flex gap-1.5 flex-wrap">
                              {["Optimiser SEO", "Raccourcir", "Ton institutionnel", "Réécrire"].map(s => (
                                <button key={s}
                                  onClick={e => { e.stopPropagation(); setPromptText(section.id, s); }}
                                  className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] text-slate-400 hover:text-purple-300 hover:border-purple-500/40 transition-all">
                                  {s}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => applyFreePrompt(section.id)}
                              disabled={!aiPromptTexts[section.id]?.trim()}
                              className="w-full py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white text-[10px] font-semibold flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-transform disabled:opacity-40">
                              <Wand2 size={10} /> Appliquer à ce paragraphe
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Ajouter une section */}
            <button className="w-full py-3 rounded-xl border border-dashed border-purple-500/20 text-xs text-slate-500 hover:text-purple-400 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all flex items-center justify-center gap-2">
              <Plus size={12} /> Ajouter une section
            </button>

            {/* Zone de prompt IA global */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/8 to-violet-500/5 border border-purple-500/25">
              <div className="flex items-center gap-2 mb-2">
                <Wand2 size={13} className="text-purple-400" />
                <span className="text-xs font-semibold text-purple-200">Modifier l'article avec l'IA</span>
                <span className="text-[10px] text-slate-500 ml-auto">Sélectionnez un paragraphe ou appliquez à tout l'article</span>
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  placeholder="Ex : Rendre ce paragraphe plus professionnel, Optimiser pour le SEO, Raccourcir ce passage..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[#070d22] border border-purple-500/25 text-sm text-white placeholder-slate-500 focus:border-purple-500/60 focus:outline-none transition-all"
                />
                <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:scale-105 transition-all shadow-lg shadow-purple-500/20">
                  <Wand2 size={11} /> Appliquer
                </button>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {["Rendre plus professionnel", "Optimiser pour le SEO", "Raccourcir ce passage", "Développer cette idée"].map(s => (
                  <button key={s} className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-slate-400 hover:text-purple-300 hover:border-purple-500/40 text-[10px] transition-all">{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar SEO */}
        <div className="w-72 flex-shrink-0 border-l border-purple-500/10 overflow-y-auto p-4 space-y-4 bg-[#070d22]/40">
          {/* Score SEO */}
          <GlassCard className="p-4" glow>
            <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider mb-3">Score SEO</h4>
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0" style={{ padding: "5px" }}>
                <svg width={64} height={64} viewBox="0 0 64 64" overflow="visible" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx={32} cy={32} r={24} fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="5" />
                  <circle cx={32} cy={32} r={24} fill="none" stroke={scoreColor} strokeWidth="5"
                    strokeDasharray={2 * Math.PI * 24}
                    strokeDashoffset={2 * Math.PI * 24 * (1 - seoScore / 100)}
                    strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${scoreColor})` }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold font-mono" style={{ color: scoreColor, textShadow: `0 0 10px ${scoreColor}60` }}>{seoScore}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Score SEO</p>
                <NeonBadge color="cyan">Bon</NeonBadge>
                <p className="text-[10px] text-slate-500 mt-1">Optimisation possible</p>
              </div>
            </div>
          </GlassCard>

          {/* Lisibilité */}
          <GlassCard className="p-4" glow>
            <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider mb-3">Lisibilité</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Score Flesch</span>
                <span className="text-xs font-mono font-bold" style={{ color: readColor }}>{readability}/100</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#070d22] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${readability}%`, backgroundColor: readColor, boxShadow: `0 0 6px ${readColor}` }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-600">
                {["2 340 mots", "Niveau : Pro", "~9 min"].map(v => (
                  <span key={v}>{v}</span>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Densité keywords */}
          <GlassCard className="p-4" glow>
            <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider mb-3">Densité keywords</h4>
            <div className="space-y-3">
              {keywordDensities.map(k => (
                <div key={k.kw}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400 truncate">{k.kw}</span>
                    <span className="text-[10px] font-mono text-white ml-2">{k.density}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-[#070d22] overflow-hidden">
                    <div className="h-full rounded-full relative" style={{ width: `${(k.density / k.target) * 100}%`, backgroundColor: k.density >= k.target ? "#34d399" : "#fbbf24" }} />
                  </div>
                  <div className="text-[9px] text-slate-600 mt-0.5">Cible : {k.target}%</div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Recommandations */}
          <GlassCard className="p-4" glow>
            <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider mb-3">Recommandations</h4>
            <div className="space-y-2">
              {recommendations.map((r, i) => (
                <div key={i} className="flex gap-2 p-2 rounded-lg bg-[#070d22] border border-purple-500/10">
                  {r.type === "ok"
                    ? <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    : <AlertCircle size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />}
                  <p className="text-[10px] text-slate-400 leading-relaxed">{r.msg}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Status workflow */}
          <GlassCard className="p-4" glow>
            <h4 className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider mb-3">Workflow</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Statut actuel</span>
                <NeonBadge color={
                  articleStatus === "draft" ? "purple" :
                  articleStatus === "review" ? "cyan" :
                  "pink"
                }>{STATUS_FR[articleStatus]}</NeonBadge>
              </div>
              <div className="text-[10px] text-slate-500 leading-relaxed">
                {articleStatus === "draft" && "Continuez la rédaction et passez en révision quand vous êtes prêt."}
                {articleStatus === "review" && "Votre article est en cours de révision. Ajoutez des images avant publication."}
                {articleStatus === "scheduled" && "Votre article est planifié pour publication automatique."}
              </div>
            </div>
          </GlassCard>

          {/* CTA contextuel */}
          {articleStatus === "draft" && (
            <button
              onClick={() => { setArticleStatus("review"); void handleSave("review"); }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 hover:scale-[1.02] transition-transform"
            >
              <CheckCircle size={13} /> Passer en révision
            </button>
          )}
          {articleStatus === "review" && (
            <button
              onClick={() => onNavigate("visual")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:scale-[1.02] transition-transform"
            >
              <ArrowRight size={13} /> Enrichissement visuel
            </button>
          )}
          {articleStatus === "scheduled" && (
            <button
              onClick={() => onNavigate("wordpress")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 hover:scale-[1.02] transition-transform"
            >
              <Calendar size={13} /> Gérer la planification
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ─────────────────────────────────────────────────────────────────
function AppShell({ onLogout }: { onLogout: () => void }) {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null);
  const selectArticle = (id: string, destination: Screen) => {
    setCurrentArticleId(id);
    setScreen(destination);
  };

  const screenTitles: Record<Screen, { title: string; subtitle?: string }> = {
    landing: { title: "" },
    auth: { title: "" },
    dashboard: { title: "Dashboard", subtitle: "Bon retour, Sarah · 26 mai 2025" },
    articles: { title: "Articles", subtitle: "Gérez et publiez votre contenu SEO" },
    assistant: { title: "SEO Coach", subtitle: "Conseiller IA d'optimisation de contenu" },
    research: { title: "Recherche SEO", subtitle: "Identifiez les meilleurs mots-clés pour votre contenu" },
    generate: { title: "Générer un article", subtitle: "Créez du contenu optimisé par IA en quelques secondes" },
    editor: { title: "Éditeur d'article", subtitle: "Affinez et optimisez votre contenu avant publication" },
    visual: { title: "Enrichissement visuel", subtitle: "Ajoutez des images et prévisualisez votre article" },
    knowledge: { title: "Knowledge Base", subtitle: "Gérez vos sources de contenu de confiance" },
    wordpress: { title: "WordPress", subtitle: "Publiez et planifiez vos articles" },
    media: { title: "Media Manager", subtitle: "Images et ressources visuelles" },
    analytics: { title: "Analytics", subtitle: "Performance SEO et analyse du traffic" },
  };

  return (
    <div className="h-screen flex bg-[#050816] overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar active={screen} onChange={nextScreen => setScreen(nextScreen === "editor" && !currentArticleId ? "articles" : nextScreen)} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar {...screenTitles[screen]} />
        <main className="flex-1 overflow-hidden">
          {screen === "dashboard" && <DashboardScreen onNavigate={setScreen} />}
          {screen === "articles" && <ArticlesScreen onNavigate={setScreen} onSelectArticle={selectArticle} />}
          {screen === "assistant" && <AssistantScreen />}
          {screen === "research" && <ResearchScreen onNavigate={setScreen} />}
          {screen === "generate" && <GenerateScreen onNavigate={setScreen} onGeneratedArticle={setCurrentArticleId} />}
          {screen === "editor" && <EditorScreen onNavigate={setScreen} articleId={currentArticleId} />}
          {screen === "visual" && <VisualEnrichment
            articleId={currentArticleId}
            sections={[]}
            title=""
            onBack={() => setScreen("editor")}
            onNext={() => setScreen("articles")}
            onPublish={() => setScreen("wordpress")}
          />}
          {screen === "knowledge" && <KnowledgeScreen />}
          {screen === "wordpress" && <WordPressScreen articleId={currentArticleId} />}
          {screen === "media" && <MediaScreen />}
          {screen === "analytics" && <AnalyticsScreen />}
        </main>
      </div>
    </div>
  );
}

// ─── Racine ────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<"landing" | "auth" | "app">("landing");

  return (
    <div className="dark">
      {view === "landing" && <LandingPage onGetStarted={() => setView("auth")} />}
      {view === "auth" && <AuthPage onLogin={() => setView("app")} />}
      {view === "app" && <AppShell onLogout={() => setView("landing")} />}
    </div>
  );
}
