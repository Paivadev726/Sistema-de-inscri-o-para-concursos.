import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  // Buscar concursos da API
  const { data: concursos = [], isLoading } = trpc.concursos.list.useQuery();

  // Filtrar concursos baseado na busca e status
  const concursosFiltrados = useMemo(() => {
    let resultado = concursos;

    // Filtrar por status (aberto, previsto, encerrado)
    if (filterStatus !== "todos") {
      const hoje = new Date();
      resultado = resultado.filter((concurso) => {
        const dataInicio = new Date(concurso.dataInscricaoInicio);
        const dataFim = new Date(concurso.dataInscricaoFim);

        if (filterStatus === "aberto") {
          return dataInicio <= hoje && hoje <= dataFim;
        } else if (filterStatus === "previsto") {
          return hoje < dataInicio;
        } else if (filterStatus === "encerrado") {
          return hoje > dataFim;
        }
        return true;
      });
    }

    // Filtrar por termo de busca (nome, cargo, banca)
    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      resultado = resultado.filter(
        (c) =>
          c.nome.toLowerCase().includes(termo) ||
          c.cargo.toLowerCase().includes(termo) ||
          c.banca.toLowerCase().includes(termo)
      );
    }

    return resultado;
  }, [concursos, searchTerm, filterStatus]);

  // Contar concursos por status
  const contadores = useMemo(() => {
    const hoje = new Date();
    let abertos = 0,
      previstos = 0,
      encerrados = 0;

    concursos.forEach((c) => {
      const dataInicio = new Date(c.dataInscricaoInicio);
      const dataFim = new Date(c.dataInscricaoFim);

      if (dataInicio <= hoje && hoje <= dataFim) {
        abertos++;
      } else if (hoje < dataInicio) {
        previstos++;
      } else {
        encerrados++;
      }
    });

    return { abertos, previstos, encerrados };
  }, [concursos]);

  // Função para obter status do concurso
  const obterStatus = (concurso: any) => {
    const hoje = new Date();
    const dataInicio = new Date(concurso.dataInscricaoInicio);
    const dataFim = new Date(concurso.dataInscricaoFim);

    if (dataInicio <= hoje && hoje <= dataFim) {
      return { texto: "Aberto", cor: "bg-green-100 text-green-800" };
    } else if (hoje < dataInicio) {
      return { texto: "Previsto", cor: "bg-yellow-100 text-yellow-800" };
    } else {
      return { texto: "Encerrado", cor: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Portal de Concursos
              </h1>
              <p className="text-slate-600 mt-1">
                Encontre e se inscreva em concursos públicos
              </p>
            </div>
            <div className="flex gap-3">
              {isAuthenticated ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/candidato")}
                  >
                    Meu Painel
                  </Button>
                  {user?.role === "admin" && (
                    <Button
                      variant="outline"
                      onClick={() => navigate("/admin")}
                    >
                      Painel Admin
                    </Button>
                  )}
                </>
              ) : (
                <Button onClick={() => (window.location.href = getLoginUrl())}>
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Barra de Estatísticas */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-medium">Abertos</p>
              <p className="text-3xl font-bold text-green-700">
                {contadores.abertos}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-600 font-medium">Previstos</p>
              <p className="text-3xl font-bold text-yellow-700">
                {contadores.previstos}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Encerrados</p>
              <p className="text-3xl font-bold text-gray-700">
                {contadores.encerrados}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, cargo ou banca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              {["todos", "aberto", "previsto", "encerrado"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  onClick={() => setFilterStatus(status)}
                  className="capitalize"
                >
                  {status === "todos" ? "Todos" : status}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Concursos */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Carregando concursos...</p>
          </div>
        ) : concursosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">
              Nenhum concurso encontrado
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {concursosFiltrados.map((concurso) => {
              const status = obterStatus(concurso);
              return (
                <Card
                  key={concurso.id}
                  className="hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-slate-900 flex-1">
                        {concurso.nome}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${status.cor}`}
                      >
                        {status.texto}
                      </span>
                    </div>

                    {/* Informações */}
                    <div className="space-y-3 mb-6 text-sm text-slate-600">
                      <p>
                        <span className="font-medium text-slate-900">
                          Cargo:
                        </span>{" "}
                        {concurso.cargo}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">
                          Vagas:
                        </span>{" "}
                        {concurso.vagas}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">
                          Banca:
                        </span>{" "}
                        {concurso.banca}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">
                          Taxa:
                        </span>{" "}
                        R$ {parseFloat(concurso.valorInscricao).toFixed(2)}
                      </p>
                      <p>
                        <span className="font-medium text-slate-900">
                          Inscrições:
                        </span>{" "}
                        {new Date(concurso.dataInscricaoInicio).toLocaleDateString(
                          "pt-BR"
                        )}{" "}
                        a{" "}
                        {new Date(concurso.dataInscricaoFim).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </div>

                    {/* Botão de Ação */}
                    {isAuthenticated ? (
                      <Button
                        className="w-full"
                        onClick={() =>
                          navigate(`/inscricao/${concurso.id}`)
                        }
                      >
                        Se Inscrever
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          (window.location.href = getLoginUrl())
                        }
                      >
                        Faça Login para se Inscrever
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
