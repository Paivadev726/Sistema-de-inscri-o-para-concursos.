import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Inscricao() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  // Pegar ID do concurso da URL
  // Pegar ID do concurso da URL
  const params = new URLSearchParams(window.location.search);
  const concursoIdStr = params.get("id") || "0";
  const concursoId = parseInt(concursoIdStr, 10);

  // Se não está autenticado, redireciona
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Estados do formulário
  const [formData, setFormData] = useState({
    cpf: "",
    telefone: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    isencao: "nao",
  });

  const [taxaCalculada, setTaxaCalculada] = useState(0);
  const [enviando, setEnviando] = useState(false);

  // Buscar dados do concurso
  const { data: concurso } = trpc.concursos.getById.useQuery(
    { id: concursoId },
    { enabled: concursoId > 0 }
  );

  // Mutation para criar inscrição
  const criarInscricao = trpc.inscricoes.create.useMutation({
    onSuccess: () => {
      navigate("/candidato");
    },
  });

  // FUNÇÃO 1: Formatar CPF (123.456.789-00)
  const formatarCPF = (valor: string) => {
    // Remove tudo que não é número
    const apenasNumeros = valor.replace(/\D/g, "");
    
    // Vai adicionando os pontos e hífen conforme o usuário digita
    if (apenasNumeros.length <= 3) return apenasNumeros;
    if (apenasNumeros.length <= 6)
      return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3)}`;
    if (apenasNumeros.length <= 9)
      return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(
        3,
        6
      )}.${apenasNumeros.slice(6)}`;
    return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(
      3,
      6
    )}.${apenasNumeros.slice(6, 9)}-${apenasNumeros.slice(9, 11)}`;
  };

  // FUNÇÃO 2: Formatar Telefone ((11) 98765-4321)
  const formatarTelefone = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    if (apenasNumeros.length <= 2) return apenasNumeros;
    if (apenasNumeros.length <= 7)
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(
      2,
      7
    )}-${apenasNumeros.slice(7, 11)}`;
  };

  // FUNÇÃO 3: Formatar CEP (12345-678)
  const formatarCEP = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    if (apenasNumeros.length <= 5) return apenasNumeros;
    return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5, 8)}`;
  };

  // FUNÇÃO 4: Manipular mudanças nos inputs
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    // Aplicar máscaras de formatação
    let valorFormatado = value;
    if (name === "cpf") {
      valorFormatado = formatarCPF(value);
    } else if (name === "telefone") {
      valorFormatado = formatarTelefone(value);
    } else if (name === "cep") {
      valorFormatado = formatarCEP(value);
    }

    // Atualizar o estado
    setFormData((prev) => ({
      ...prev,
      [name]: valorFormatado,
    }));

    // Se mudou a isenção, recalcular taxa
    if (name === "isencao") {
      calcularTaxa(value);
    }
  };

  // FUNÇÃO 5: Calcular taxa baseada em isenção
  const calcularTaxa = (tipoIsencao: string) => {
    if (!concurso) return;

    const valorOriginal = parseFloat(concurso.valorInscricao);

    // Se tem isenção, taxa é ZERO
    if (tipoIsencao !== "nao") {
      setTaxaCalculada(0);
    } else {
      // Sem isenção, paga o valor normal
      setTaxaCalculada(valorOriginal);
    }
  };

  // Quando concurso carrega, calcular taxa inicial
  useEffect(() => {
    if (concurso) {
      calcularTaxa(formData.isencao);
    }
  }, [concurso]);

  // FUNÇÃO 6: Validar CPF (algoritmo simples)
  const validarCPF = (cpf: string) => {
    const apenasNumeros = cpf.replace(/\D/g, "");
    
    // CPF deve ter 11 dígitos
    if (apenasNumeros.length !== 11) return false;
    
    // CPF não pode ter todos os dígitos iguais
    if (/^(\d)\1{10}$/.test(apenasNumeros)) return false;
    
    return true;
  };

  // FUNÇÃO 7: Submeter formulário
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Validar CPF
    if (!validarCPF(formData.cpf)) {
      alert("CPF inválido");
      return;
    }

    // Validar Telefone
    if (formData.telefone.replace(/\D/g, "").length < 10) {
      alert("Telefone inválido");
      return;
    }

    // Validar CEP
    if (formData.cep.replace(/\D/g, "").length !== 8) {
      alert("CEP inválido");
      return;
    }

    // Validar campos obrigatórios
    if (
      !formData.endereco ||
      !formData.numero ||
      !formData.bairro ||
      !formData.cidade ||
      !formData.estado
    ) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setEnviando(true);

    try {
      // Enviar para o servidor
      await criarInscricao.mutateAsync({
        concursoId: concursoId,
        cpf: formData.cpf,
        telefone: formData.telefone,
        cep: formData.cep,
        endereco: formData.endereco,
        numero: formData.numero,
        complemento: formData.complemento || "",
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado,
        taxaInscricao: taxaCalculada.toFixed(2),
        isencao: formData.isencao as "nao" | "doador_sangue" | "baixa_renda",
      });
    } catch (erro: any) {
      alert(`Erro ao se inscrever: ${erro.message}`);
      setEnviando(false);
    }
  };

  if (!concurso) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Botão Voltar */}
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          ← Voltar
        </Button>

        <Card className="p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Inscrição em Concurso
          </h1>
          <p className="text-slate-600 mb-8">{concurso.nome}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SEÇÃO 1: Dados Pessoais */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Dados Pessoais
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cpf">CPF (obrigatório)</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={handleChange}
                    maxLength={14}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Formato: 000.000.000-00
                  </p>
                </div>

                <div>
                  <Label htmlFor="telefone">Telefone (obrigatório)</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    placeholder="(11) 98765-4321"
                    value={formData.telefone}
                    onChange={handleChange}
                    maxLength={15}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Formato: (11) 98765-4321
                  </p>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: Endereço */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Endereço
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cep">CEP (obrigatório)</Label>
                  <Input
                    id="cep"
                    name="cep"
                    placeholder="12345-678"
                    value={formData.cep}
                    onChange={handleChange}
                    maxLength={9}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Formato: 12345-678
                  </p>
                </div>

                <div>
                  <Label htmlFor="endereco">Endereço (obrigatório)</Label>
                  <Input
                    id="endereco"
                    name="endereco"
                    placeholder="Rua/Avenida"
                    value={formData.endereco}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numero">Número (obrigatório)</Label>
                    <Input
                      id="numero"
                      name="numero"
                      placeholder="123"
                      value={formData.numero}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      name="complemento"
                      placeholder="Apt 101"
                      value={formData.complemento}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bairro">Bairro (obrigatório)</Label>
                  <Input
                    id="bairro"
                    name="bairro"
                    placeholder="Bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cidade">Cidade (obrigatório)</Label>
                    <Input
                      id="cidade"
                      name="cidade"
                      placeholder="Brasília"
                      value={formData.cidade}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="estado">Estado (obrigatório)</Label>
                    <Input
                      id="estado"
                      name="estado"
                      placeholder="DF"
                      value={formData.estado}
                      onChange={handleChange}
                      maxLength={2}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: Isenção e Taxa */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Taxa de Inscrição
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="isencao">Solicitar Isenção</Label>
                  <select
                    id="isencao"
                    name="isencao"
                    value={formData.isencao}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  >
                    <option value="nao">Não tenho isenção</option>
                    <option value="doador_sangue">Doador de Sangue</option>
                    <option value="baixa_renda">Baixa Renda</option>
                  </select>
                </div>

                {/* Card mostrando taxa calculada */}
                <div className="bg-slate-100 p-4 rounded-lg border border-slate-300">
                  <p className="text-sm text-slate-600 mb-2">Taxa a Pagar:</p>
                  <p className="text-3xl font-bold text-slate-900">
                    R$ {taxaCalculada.toFixed(2)}
                  </p>
                  {formData.isencao !== "nao" && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Isenção aplicada
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-4 pt-6">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                disabled={enviando}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={enviando}
              >
                {enviando ? "Processando..." : "Confirmar Inscrição"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
