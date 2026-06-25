import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Candidato() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [cancelando, setCancelando] = useState<number | null>(null);

  // Se não está autenticado, redireciona
  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  // Buscar inscrições do usuário
  const { data: inscricoes = [], refetch } = trpc.inscricoes.getByUsuario.useQuery();

  // Buscar dados pessoais
  const { data: dadosPessoais } = trpc.dadosPessoais.getByUsuario.useQuery();

  // Mutation para cancelar inscrição
  const cancelarInscricao = trpc.inscricoes.cancelar.useMutation();

  // Função para cancelar inscrição
  const handleCancelar = async (inscricaoId: number) => {
    if (!confirm("Tem certeza que deseja cancelar esta inscrição?")) {
      return;
    }

    setCancelando(inscricaoId);
    try {
      await cancelarInscricao.mutateAsync({ id: inscricaoId });
      alert("Inscrição cancelada com sucesso");
      refetch();
    } catch (erro: any) {
      alert(`Erro ao cancelar: ${erro.message}`);
    } finally {
      setCancelando(null);
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
                Meu Painel
              </h1>
              <p className="text-slate-600 mt-1">
                Bem-vindo, {user?.name || "Candidato"}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/")}>
                Voltar ao Portal
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Seção: Minhas Inscrições */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Minhas Inscrições
          </h2>

          {inscricoes.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-slate-600 mb-4">
                Você ainda não se inscreveu em nenhum concurso
              </p>
              <Button onClick={() => navigate("/")}>
                Explorar Concursos
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inscricoes.map((inscricao) => (
                <Card key={inscricao.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Inscrição #{inscricao.id}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Concurso ID: {inscricao.concursoId}
                      </p>
                    </div>
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
                  </div>

                  <div className="space-y-3 text-sm text-slate-600 mb-6">
                    <p>
                      <span className="font-medium text-slate-900">CPF:</span>{" "}
                      {inscricao.cpf}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">
                        Telefone:
                      </span>{" "}
                      {inscricao.telefone}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">
                        Endereço:
                      </span>{" "}
                      {inscricao.endereco}, {inscricao.numero} -{" "}
                      {inscricao.bairro}, {inscricao.cidade} - {inscricao.estado}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">Taxa:</span>{" "}
                      R$ {parseFloat(inscricao.taxaInscricao).toFixed(2)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">
                        Isenção:
                      </span>{" "}
                      {inscricao.isencao === "nao"
                        ? "Nenhuma"
                        : inscricao.isencao === "doador_sangue"
                        ? "Doador de Sangue"
                        : "Baixa Renda"}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">
                        Data da Inscrição:
                      </span>{" "}
                      {new Date(inscricao.dataInscricao).toLocaleDateString(
                        "pt-BR"
                      )}
                    </p>
                  </div>

                  {inscricao.status === "confirmada" && (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleCancelar(inscricao.id)}
                      disabled={cancelando === inscricao.id}
                    >
                      {cancelando === inscricao.id
                        ? "Cancelando..."
                        : "Cancelar Inscrição"}
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Seção: Dados Pessoais */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Dados Pessoais
          </h2>

          {dadosPessoais ? (
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600">CPF</p>
                  <p className="text-lg font-medium text-slate-900">
                    {dadosPessoais.cpf}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Data de Nascimento</p>
                  <p className="text-lg font-medium text-slate-900">
                    {dadosPessoais.dataNascimento
                      ? new Date(dadosPessoais.dataNascimento).toLocaleDateString(
                          "pt-BR"
                        )
                      : "Não informado"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Gênero</p>
                  <p className="text-lg font-medium text-slate-900">
                    {dadosPessoais.genero || "Não informado"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Nacionalidade</p>
                  <p className="text-lg font-medium text-slate-900">
                    {dadosPessoais.nacionalidade || "Não informado"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">RG</p>
                  <p className="text-lg font-medium text-slate-900">
                    {dadosPessoais.rg || "Não informado"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600">Mãe</p>
                  <p className="text-lg font-medium text-slate-900">
                    {dadosPessoais.mae || "Não informado"}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-slate-600">
                Nenhum dado pessoal cadastrado ainda
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
