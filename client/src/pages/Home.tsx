import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { RefreshCw, ExternalLink, Search, UserCircle, ShieldCheck } from "lucide-react";

const SYNE  = "'Syne', sans-serif";
const MONO  = "'JetBrains Mono', monospace";
const NAVY  = "#0A1628";
const BLUE  = "#2563EB";

function fmtData(val: string | Date | null | undefined): string {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("pt-BR");
}

function calcStatus(c: { dataInscricaoInicio: string | Date; dataInscricaoFim: string | Date }) {
  const hoje   = new Date();
  const inicio = new Date(c.dataInscricaoInicio);
  const fim    = new Date(c.dataInscricaoFim);
  if (inicio <= hoje && hoje <= fim) return "aberto"    as const;
  if (hoje < inicio)                 return "previsto"  as const;
  return "encerrado" as const;
}

const STATUS = {
  aberto:    { label: "ABERTO",    color: "#059669", light: "#ECFDF5" },
  previsto:  { label: "PREVISTO",  color: "#D97706", light: "#FFFBEB" },
  encerrado: { label: "ENCERRADO", color: "#94A3B8", light: "#F1F5F9" },
};

/* ─────────────────────────────────────────────────────────── */

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchTerm,   setSearchTerm]   = useState("");
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
      r = r.filter((c) =>
        c.nome.toLowerCase().includes(t) ||
        c.cargo.toLowerCase().includes(t) ||
        c.banca.toLowerCase().includes(t)
      );
    }
    return r;
  }, [concursos, searchTerm, filterStatus]);

  return (
    <div className="min-h-screen" style={{ background: "#EAEFF6", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header + stats ─────────────────────────────────── */}
      <header style={{ background: NAVY }} className="relative overflow-hidden">
        {/* dot-grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 flex items-center justify-between gap-4">
          {/* Branding */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-extrabold text-white shrink-0"
              style={{ background: BLUE, fontFamily: SYNE }}
            >
              BR
            </div>
            <div>
              <p
                className="text-[10px] font-semibold tracking-[0.24em] uppercase"
                style={{ color: "rgba(147,197,253,0.6)" }}
              >
                República Federativa do Brasil
              </p>
              <h1
                className="text-xl sm:text-2xl font-bold text-white leading-none mt-0.5"
                style={{ fontFamily: SYNE }}
              >
                Portal de Concursos Públicos
              </h1>
            </div>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => atualizarMutation.mutate()}
              disabled={atualizarMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${atualizarMutation.isPending ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">
                {atualizarMutation.isPending ? "Atualizando…" : "Atualizar"}
              </span>
            </button>
            {isAuthenticated && (
              <>
                <button
                  onClick={() => navigate("/candidato")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <UserCircle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Meu Painel</span>
                </button>
                {user?.role === "admin" && (
                  <button
                    onClick={() => navigate("/admin")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stats integradas no header */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-6 flex items-end gap-6 sm:gap-10">
          <HeaderStat value={contadores.abertos}    label="inscrições abertas" color="#34D399" />
          <div className="w-px h-8 bg-white/10" />
          <HeaderStat value={contadores.previstos}  label="previstos"          color="#FCD34D" />
          <div className="w-px h-8 bg-white/10" />
          <HeaderStat value={contadores.encerrados} label="encerrados"         color="#475569" />
          <span
            className="ml-auto text-[11px] text-slate-600 pb-0.5 hidden sm:block"
            style={{ fontFamily: MONO }}
          >
            {concursos.length} total
          </span>
        </div>
      </header>

      {/* ── Busca + filtros ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por órgão, cargo ou banca…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-10 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            {(["todos", "aberto", "previsto", "encerrado"] as const).map((s) => {
              const active = filterStatus === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: active ? NAVY : "transparent",
                    color:      active ? "#fff" : "#64748B",
                  }}
                >
                  {s === "todos" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Lista de cards ──────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        {isLoading ? (
          <p className="text-center py-20 text-sm text-slate-400">Carregando concursos…</p>
        ) : filtrados.length === 0 ? (
          <p className="text-center py-20 text-sm text-slate-400">Nenhum concurso encontrado.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtrados.map((c) => {
              const status = calcStatus(c);
              return (
                <ConcursoCard
                  key={c.id}
                  concurso={c}
                  status={status}
                  cfg={STATUS[status]}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

function HeaderStat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-3xl sm:text-4xl font-bold leading-none" style={{ color, fontFamily: MONO }}>
        {value}
      </span>
      <span className="text-xs text-slate-500 leading-tight hidden sm:block">{label}</span>
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
    dataInscricaoInicio: string | Date;
    dataInscricaoFim: string | Date;
    dataProva?: string | Date | null;
    edital?: string | null;
    urlBanca?: string | null;
  };
  status: "aberto" | "previsto" | "encerrado";
  cfg: typeof STATUS["aberto"];
};

function ConcursoCard({ concurso: c, status, cfg }: CardProps) {
  const pciLink   = c.edital   || null;
  const bancaLink = c.urlBanca || pciLink;
  const valorFmt  = Number(c.valorInscricao).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden flex transition-all duration-200 hover:shadow-md hover:-translate-y-px"
      style={{ borderLeft: `4px solid ${cfg.color}` }}
    >
      {/* Orelha de status — assinatura visual */}
      <div
        className="shrink-0 w-11 flex items-center justify-center"
        style={{ background: cfg.light }}
      >
        <span
          className="text-[9px] font-bold tracking-[0.12em] select-none"
          style={{
            color: cfg.color,
            fontFamily: MONO,
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
          }}
        >
          {cfg.label}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 px-4 py-3.5 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 truncate">
              {c.banca}
            </p>
            <h2
              className="text-[15px] font-semibold text-slate-900 leading-snug mt-0.5 group-hover:text-blue-700 transition-colors"
              style={{ fontFamily: SYNE }}
            >
              {c.nome}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{c.cargo}</p>
          </div>

          {/* Vagas em destaque */}
          <div className="shrink-0 text-right pt-0.5">
            <span
              className="text-2xl font-bold leading-none block"
              style={{ color: cfg.color, fontFamily: MONO }}
            >
              {c.vagas.toLocaleString("pt-BR")}
            </span>
            <span className="text-[9px] text-slate-400 font-semibold tracking-wide uppercase">
              vagas
            </span>
          </div>
        </div>

        {/* Datas e taxa */}
        <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1">
          <Chip
            label="Inscrições"
            value={`${fmtData(c.dataInscricaoInicio)} → ${fmtData(c.dataInscricaoFim)}`}
          />
          {c.dataProva && <Chip label="Prova" value={fmtData(c.dataProva)} />}
          {Number(c.valorInscricao) > 0 && (
            <Chip label="Taxa" value={`R$ ${valorFmt}`} highlight />
          )}
        </div>

        {/* Botões */}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          {status === "encerrado" && (
            <span className="text-[11px] text-slate-400 italic mr-1">Inscrições encerradas</span>
          )}
          {pciLink && (
            <a
              href={pciLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all"
            >
              <ExternalLink className="h-3 w-3" />
              Edital PCI
            </a>
          )}
          {bancaLink && (
            <a
              href={bancaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all hover:opacity-85"
              style={{ background: cfg.color }}
            >
              <ExternalLink className="h-3 w-3" />
              Portal da Banca
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      <span className="text-slate-400">{label}</span>
      <span
        className="font-semibold"
        style={{ fontFamily: MONO, color: highlight ? BLUE : "#334155" }}
      >
        {value}
      </span>
    </div>
  );
}
