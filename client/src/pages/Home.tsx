import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { RefreshCw, ExternalLink, LogIn, UserCircle, ShieldCheck } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";

const SYNE = "'Syne', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const NAVY = "#0C1B33";
const BLUE = "#2563EB";

function fmtData(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function calcStatus(c: { dataInscricaoInicio: string; dataInscricaoFim: string }) {
  const hoje = new Date();
  const inicio = new Date(c.dataInscricaoInicio);
  const fim = new Date(c.dataInscricaoFim);
  if (inicio <= hoje && hoje <= fim) return "aberto" as const;
  if (hoje < inicio) return "previsto" as const;
  return "encerrado" as const;
}

const STATUS = {
  aberto:    { label: "Aberto",    stripe: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  previsto:  { label: "Previsto",  stripe: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border border-amber-200"       },
  encerrado: { label: "Encerrado", stripe: "bg-slate-300",   badge: "bg-slate-100 text-slate-500 border border-slate-200"      },
};

export default function Home() {
  const { user, isAuthenticated, refresh } = useAuth();
  const [, navigate] = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | "aberto" | "previsto" | "encerrado">("todos");
  const utils = trpc.useUtils();

  const atualizarMutation = trpc.concursos.atualizar.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.total} concursos atualizados!`);
      utils.concursos.list.invalidate();
    },
    onError: (err) => toast.error(`Erro ao atualizar: ${err.message}`),
  });

  const { data: concursos = [], isLoading } = trpc.concursos.list.useQuery();

  const contadores = useMemo(() => {
    let abertos = 0, previstos = 0, encerrados = 0;
    concursos.forEach((c) => {
      const s = calcStatus(c);
      if (s === "aberto") abertos++;
      else if (s === "previsto") previstos++;
      else encerrados++;
    });
    return { abertos, previstos, encerrados };
  }, [concursos]);

  const filtrados = useMemo(() => {
    let r = concursos;
    if (filterStatus !== "todos") r = r.filter((c) => calcStatus(c) === filterStatus);
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      r = r.filter(
        (c) =>
          c.nome.toLowerCase().includes(t) ||
          c.cargo.toLowerCase().includes(t) ||
          c.banca.toLowerCase().includes(t)
      );
    }
    return r;
  }, [concursos, searchTerm, filterStatus]);

  return (
    <div className="min-h-screen" style={{ background: "#F1F5F9", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <div>
            <p
              className="text-[11px] font-semibold tracking-[0.2em] uppercase"
              style={{ color: "#60A5FA", fontFamily: SYNE }}
            >
              República Federativa do Brasil
            </p>
            <h1
              className="text-xl sm:text-2xl font-bold text-white leading-tight mt-0.5"
              style={{ fontFamily: SYNE }}
            >
              Portal de Concursos Públicos
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => atualizarMutation.mutate()}
              disabled={atualizarMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${atualizarMutation.isPending ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">
                {atualizarMutation.isPending ? "Atualizando…" : "Atualizar"}
              </span>
            </button>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/candidato")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <UserCircle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Meu Painel</span>
                </button>
                {user?.role === "admin" && (
                  <button
                    onClick={() => navigate("/admin")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => setLoginOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: BLUE }}
              >
                <LogIn className="h-3.5 w-3.5" />
                Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Stats strip ────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-6 sm:gap-10">
          <Stat value={contadores.abertos}    label="Abertos"    color="#10B981" />
          <div className="w-px h-6 bg-slate-200" />
          <Stat value={contadores.previstos}  label="Previstos"  color="#F59E0B" />
          <div className="w-px h-6 bg-slate-200" />
          <Stat value={contadores.encerrados} label="Encerrados" color="#94A3B8" />
          <span className="ml-auto text-[11px] text-slate-400 hidden sm:block">
            {concursos.length} concursos
          </span>
        </div>
      </div>

      {/* ── Search & Filters ───────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Buscar por órgão, cargo ou banca…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 h-9 text-sm"
          />
          <div className="flex gap-1.5">
            {(["todos", "aberto", "previsto", "encerrado"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                style={{
                  background: filterStatus === s ? NAVY : "#F1F5F9",
                  color: filterStatus === s ? "#fff" : "#64748B",
                }}
              >
                {s === "todos" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Card list ──────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <p className="text-center py-16 text-sm text-slate-400">Carregando concursos…</p>
        ) : filtrados.length === 0 ? (
          <p className="text-center py-16 text-sm text-slate-400">Nenhum concurso encontrado.</p>
        ) : (
          <div className="grid gap-3">
            {filtrados.map((c) => {
              const status = calcStatus(c);
              const cfg = STATUS[status];
              return (
                <ConcursoCard
                  key={c.id}
                  concurso={c}
                  status={status}
                  cfg={cfg}
                  isAuthenticated={isAuthenticated}
                  onLoginClick={() => setLoginOpen(true)}
                  onInscreverClick={() => navigate(`/inscricao/${c.id}`)}
                />
              );
            })}
          </div>
        )}
      </main>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => refresh()}
      />
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold" style={{ color, fontFamily: MONO }}>
        {value}
      </span>
      <span className="text-xs text-slate-500 font-medium">{label}</span>
    </div>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-700" style={{ fontFamily: MONO }}>
        {value}
      </span>
    </div>
  );
}

type CardProps = {
  concurso: {
    id: number;
    nome: string;
    cargo: string;
    banca: string;
    vagas: number;
    valorInscricao: string;
    dataInscricaoInicio: string;
    dataInscricaoFim: string;
    dataProva?: string | null;
    edital?: string | null;
  };
  status: "aberto" | "previsto" | "encerrado";
  cfg: typeof STATUS["aberto"];
  isAuthenticated: boolean;
  onLoginClick: () => void;
  onInscreverClick: () => void;
};

function ConcursoCard({ concurso: c, status, cfg, isAuthenticated, onLoginClick, onInscreverClick }: CardProps) {
  const pciLink = c.edital || null;
  const valorFmt = Number(c.valorInscricao).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  return (
    <div className="relative bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      {/* Status stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.stripe}`} />

      <div className="pl-5 pr-4 pt-4 pb-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-slate-400">
              {c.banca}
            </p>
            <h2
              className="text-[15px] font-semibold text-slate-900 leading-snug mt-0.5 group-hover:text-blue-700 transition-colors"
              style={{ fontFamily: SYNE }}
            >
              {c.nome}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{c.cargo}</p>
          </div>
          <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>

        {/* Data grid */}
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5">
          <DataItem label="Vagas"      value={String(c.vagas)} />
          <DataItem label="Taxa"       value={`R$ ${valorFmt}`} />
          <DataItem label="Inscrições" value={`${fmtData(c.dataInscricaoInicio)} → ${fmtData(c.dataInscricaoFim)}`} />
          {c.dataProva && <DataItem label="Prova" value={fmtData(c.dataProva)} />}
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          {status === "encerrado" ? (
            <span className="text-xs text-slate-400 font-medium">Inscrições encerradas</span>
          ) : isAuthenticated ? (
            <button
              onClick={onInscreverClick}
              className="px-3 py-1.5 rounded text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: BLUE }}
            >
              Se Inscrever
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border text-blue-700 border-blue-200 hover:bg-blue-50 transition-colors"
            >
              <LogIn className="h-3 w-3" />
              Entrar para se inscrever
            </button>
          )}

          {pciLink && (
            <>
              <a href={pciLink} target="_blank" rel="noopener noreferrer">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                  <ExternalLink className="h-3 w-3" />
                  Edital PCI
                </button>
              </a>
              <a href={pciLink} target="_blank" rel="noopener noreferrer">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
                  <ExternalLink className="h-3 w-3" />
                  Portal da Banca
                </button>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
