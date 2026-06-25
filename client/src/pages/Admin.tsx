import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [abaSelecionada, setAbaSelecionada] = useState("concursos");

  // Se não é admin, redireciona
  if (!isAuthenticated || user?.role !== "admin") {
    navigate("/");
    return null;
  }

  // Buscar concursos
  const { data: concursos = [], refetch: refetchConcursos } = trpc.concursos.list.useQuery();

  // Buscar todas as inscrições
  const { data: inscricoes = [], refetch: refetchInscricoes } = trpc.inscricoes.getAll.useQuery();

  // Mutations
  const criarConcurso = trpc.concursos.create.useMutation();
  const deletarConcurso = trpc.concursos.delete.useMutation();

  // Estados do formulário de novo concurso
  const [formConcurso, setFormConcurso] = useState({
    nome: "",
    cargo: "",
    vagas: "",
    banca: "",
    dataInscricaoInicio: "",
    dataInscricaoFim: "",
    dataProva: "",
    valorInscricao: "",
    descricao: "",
  });

  const [criando, setCriando] = useState(false);

  // Função para criar concurso
  const handleCriarConcurso = async (e: any) => {
    e.preventDefault();

    if (
      !formConcurso.nome ||
      !formConcurso.cargo ||
      !formConcurso.vagas ||
      !formConcurso.banca ||
      !formConcurso.dataInscricaoInicio ||
      !formConcurso.dataInscricaoFim ||
      !formConcurso.valorInscricao
    ) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setCriando(true);
    try {
      await criarConcurso.mutateAsync({
        nome: formConcurso.nome,
        cargo: formConcurso.cargo,
        vagas: parseInt(formConcurso.vagas),
        banca: formConcurso.banca,
        dataInscricaoInicio: new Date(formConcurso.dataInscricaoInicio),
        dataInscricaoFim: new Date(formConcurso.dataInscricaoFim),
        dataProva: formConcurso.dataProva
          ? new Date(formConcurso.dataProva)
          : undefined,
        valorInscricao: formConcurso.valorInscricao,
        descricao: formConcurso.descricao,
      });

      alert("Concurso criado com sucesso!");
      setFormConcurso({
        nome: "",
        cargo: "",
        vagas: "",
        banca: "",
        dataInscricaoInicio: "",
        dataInscricaoFim: "",
        dataProva: "",
        valorInscricao: "",
        descricao: "",
      });
      refetchConcursos();
    } catch (erro: any) {
      alert(`Erro ao criar concurso: ${erro.message}`);
    } finally {
      setCriando(false);
    }
  };

  // Função para deletar concurso
  const handleDeletarConcurso = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este concurso?")) {
      return;
    }

    try {
      await deletarConcurso.mutateAsync({ id });
      alert("Concurso deletado com sucesso!");
      refetchConcursos();
    } catch (erro: any) {
      alert(`Erro ao deletar: ${erro.message}`);
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
                Painel Administrativo
              </h1>
              <p className="text-slate-600 mt-1">
                Gerencie concursos e inscrições
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>
              Voltar ao Portal
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Abas */}
        <div className="flex gap-4 mb-8 border-b border-slate-200">
          <button
            onClick={() => setAbaSelecionada("concursos")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              abaSelecionada === "concursos"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Concursos ({concursos.length})
          </button>
          <button
            onClick={() => setAbaSelecionada("inscricoes")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              abaSelecionada === "inscricoes"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Inscrições ({inscricoes.length})
          </button>
        </div>

        {/* ABA 1: Concursos */}
        {abaSelecionada === "concursos" && (
          <div className="space-y-8">
            {/* Formulário para criar novo concurso */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Novo Concurso
              </h2>

              <form onSubmit={handleCriarConcurso} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome do Concurso</Label>
                    <Input
                      id="nome"
                      value={formConcurso.nome}
                      onChange={(e) =>
                        setFormConcurso({ ...formConcurso, nome: e.target.value })
                      }
                      placeholder="Ex: Concurso Público 2026"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input
                      id="cargo"
                      value={formConcurso.cargo}
                      onChange={(e) =>
                        setFormConcurso({ ...formConcurso, cargo: e.target.value })
                      }
                      placeholder="Ex: Analista de Sistemas"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="vagas">Vagas</Label>
                    <Input
                      id="vagas"
                      type="number"
                      value={formConcurso.vagas}
                      onChange={(e) =>
                        setFormConcurso({ ...formConcurso, vagas: e.target.value })
                      }
                      placeholder="Ex: 10"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="banca">Banca</Label>
                    <Input
                      id="banca"
                      value={formConcurso.banca}
                      onChange={(e) =>
                        setFormConcurso({ ...formConcurso, banca: e.target.value })
                      }
                      placeholder="Ex: CESPE"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="dataInicio">Data Inscrição Início</Label>
                    <Input
                      id="dataInicio"
                      type="date"
                      value={formConcurso.dataInscricaoInicio}
                      onChange={(e) =>
                        setFormConcurso({
                          ...formConcurso,
                          dataInscricaoInicio: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="dataFim">Data Inscrição Fim</Label>
                    <Input
                      id="dataFim"
                      type="date"
                      value={formConcurso.dataInscricaoFim}
                      onChange={(e) =>
                        setFormConcurso({
                          ...formConcurso,
                          dataInscricaoFim: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="dataProva">Data da Prova</Label>
                    <Input
                      id="dataProva"
                      type="date"
                      value={formConcurso.dataProva}
                      onChange={(e) =>
                        setFormConcurso({
                          ...formConcurso,
                          dataProva: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="valor">Valor Inscrição (R$)</Label>
                    <Input
                      id="valor"
                      value={formConcurso.valorInscricao}
                      onChange={(e) =>
                        setFormConcurso({
                          ...formConcurso,
                          valorInscricao: e.target.value,
                        })
                      }
                      placeholder="Ex: 100.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <textarea
                    id="descricao"
                    value={formConcurso.descricao}
                    onChange={(e) =>
                      setFormConcurso({
                        ...formConcurso,
                        descricao: e.target.value,
                      })
                    }
                    placeholder="Descrição do concurso..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    rows={4}
                  />
                </div>

                <Button type="submit" disabled={criando} className="w-full">
                  {criando ? "Criando..." : "Criar Concurso"}
                </Button>
              </form>
            </Card>

            {/* Lista de concursos */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Concursos Cadastrados
              </h2>

              {concursos.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-slate-600">Nenhum concurso cadastrado</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {concursos.map((concurso) => (
                    <Card key={concurso.id} className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {concurso.nome}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        {concurso.cargo}
                      </p>

                      <div className="space-y-2 text-sm text-slate-600 mb-4">
                        <p>
                          <span className="font-medium">Vagas:</span>{" "}
                          {concurso.vagas}
                        </p>
                        <p>
                          <span className="font-medium">Banca:</span>{" "}
                          {concurso.banca}
                        </p>
                        <p>
                          <span className="font-medium">Taxa:</span> R${" "}
                          {parseFloat(concurso.valorInscricao).toFixed(2)}
                        </p>
                      </div>

                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleDeletarConcurso(concurso.id)}
                      >
                        Deletar
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA 2: Inscrições */}
        {abaSelecionada === "inscricoes" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Todas as Inscrições
            </h2>

            {inscricoes.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-slate-600">Nenhuma inscrição cadastrada</p>
              </Card>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 border-b border-slate-300">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">
                        CPF
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">
                        Telefone
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">
                        Cidade
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">
                        Taxa
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-900">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inscricoes.map((inscricao) => (
                      <tr
                        key={inscricao.id}
                        className="border-b border-slate-200 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-slate-900">
                          {inscricao.id}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {inscricao.cpf}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {inscricao.telefone}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {inscricao.cidade}
                        </td>
                        <td className="px-4 py-3 text-slate-900 font-medium">
                          R$ {parseFloat(inscricao.taxaInscricao).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              inscricao.status === "confirmada"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {inscricao.status === "confirmada"
                              ? "Confirmada"
                              : "Cancelada"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {new Date(inscricao.dataInscricao).toLocaleDateString(
                            "pt-BR"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
