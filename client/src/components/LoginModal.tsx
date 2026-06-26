import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function LoginModal({ open, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const loginMutation = trpc.auth.devLogin.useMutation({
    onSuccess: () => {
      toast.success("Login realizado com sucesso!");
      onSuccess();
      onClose();
    },
    onError: (err) => {
      toast.error(`Erro ao fazer login: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ name: name.trim(), email: email.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Entrar</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nome completo</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">E-mail</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}