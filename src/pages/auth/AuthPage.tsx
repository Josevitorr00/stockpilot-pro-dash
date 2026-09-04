import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Boxes, Loader2, Mail, ShieldCheck, TrendingUp, User2 } from "lucide-react";
import { toast } from "sonner";

import { AuthPanel } from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup" | "forgot";

type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  company?: string;
};

const highlights = [
  { icon: TrendingUp, title: "Visão financeira", text: "Receitas, despesas e lucro em tempo real." },
  { icon: Boxes, title: "Estoque sob controle", text: "Alertas automáticos de estoque baixo." },
  { icon: ShieldCheck, title: "Pronto para escalar", text: "Estrutura preparada para integração futura." },
];

export function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [remember, setRemember] = useState(true);
  const { login, register, recoverPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      confirmPassword: String(form.get("confirmPassword") ?? ""),
      name: String(form.get("name") ?? ""),
      company: String(form.get("company") ?? ""),
    };
    const nextErrors: FieldErrors = {};

    if (!data.email.includes("@")) nextErrors.email = "Informe um e-mail válido.";
    if (mode !== "forgot" && data.password.length < 6)
      nextErrors.password = "A senha deve ter ao menos 6 caracteres.";
    if (mode === "signup") {
      if (data.confirmPassword !== data.password) nextErrors.confirmPassword = "As senhas não coincidem.";
      if (!data.name.trim()) nextErrors.name = "Informe seu nome.";
      if (!data.company.trim()) nextErrors.company = "Informe o nome do comércio.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email: data.email, password: data.password }, remember);
        toast.success("Bem-vindo de volta!", { description: "Acesso liberado ao StockPilot." });
        navigate({ to: "/dashboard" });
      } else if (mode === "signup") {
        const signedIn = await register({
          email: data.email,
          password: data.password,
          name: data.name,
          company: data.company,
        });
        if (signedIn) {
          toast.success("Conta criada com sucesso!", { description: "Sua área já está pronta." });
          navigate({ to: "/dashboard" });
        } else {
          toast.success("Conta criada!", { description: "Confirme seu e-mail para entrar." });
          setMode("login");
        }
      } else {
        await recoverPassword(data.email);
        toast.success("Link de recuperação enviado", {
          description: "Simulação: verifique seu e-mail em instantes.",
        });
        setMode("login");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível continuar.";
      toast.error(message);
      if (mode === "login") setErrors({ password: message });
    } finally {
      setLoading(false);
    }
  }

  const titles: Record<Mode, { title: string; subtitle: string; cta: string }> = {
    login: { title: "Acesse sua conta", subtitle: "Entre para gerenciar o seu comércio.", cta: "Entrar" },
    signup: { title: "Criar conta", subtitle: "Comece a organizar seu negócio hoje.", cta: "Criar conta" },
    forgot: {
      title: "Recuperar senha",
      subtitle: "Enviaremos um link de redefinição para o seu e-mail.",
      cta: "Enviar link",
    },
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section
        className="relative hidden flex-col justify-between p-12 text-primary-foreground lg:flex"
        style={{ background: "var(--gradient-brand)" }}
      >
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-primary-foreground/12 backdrop-blur">
            <Boxes className="size-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">StockPilot</p>
            <p className="text-xs text-primary-foreground/70">Controle Inteligente para o seu Comércio.</p>
          </div>
        </div>

        <div className="max-w-md space-y-8">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Gestão comercial completa, com a elegância de um ERP moderno.
          </h1>
          <div className="space-y-5">
            {highlights.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-foreground/12">
                  <item.icon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-primary-foreground/70">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-primary-foreground/60">© {new Date().getFullYear()} StockPilot</p>
      </section>

      <section className="flex items-center justify-center bg-background px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Boxes className="size-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">StockPilot</p>
              <p className="text-xs text-muted-foreground">Controle Inteligente para o seu Comércio.</p>
            </div>
          </div>

          <AuthPanel>
            {mode !== "login" && (
              <button
                type="button"
                onClick={() => setMode("login")}
                className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" /> Voltar ao login
              </button>
            )}

            <h2 className="text-2xl font-semibold tracking-tight">{titles[mode].title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{titles[mode].subtitle}</p>

            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                onSubmit={handleSubmit}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="mt-7 space-y-4"
              >
                {mode === "signup" && (
                  <>
                    <Field label="Nome completo" error={errors.name}>
                      <div className="relative">
                        <User2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input name="name" placeholder="Seu nome" className="h-11 pl-9" />
                      </div>
                    </Field>
                    <Field label="Nome do comércio" error={errors.company}>
                      <Input name="company" placeholder="Minha Loja Ltda." className="h-11" />
                    </Field>
                  </>
                )}

                <Field label="E-mail" error={errors.email}>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="voce@comercio.com"
                      className={cn("h-11 pl-9", errors.email && "border-destructive")}
                    />
                  </div>
                </Field>

                {mode !== "forgot" && (
                  <Field label="Senha" error={errors.password}>
                    <PasswordInput
                      name="password"
                      placeholder="••••••"
                      autoComplete={mode === "login" ? "current-password" : "new-password"}
                      invalid={Boolean(errors.password)}
                    />
                  </Field>
                )}

                {mode === "signup" && (
                  <Field label="Confirmar senha" error={errors.confirmPassword}>
                    <PasswordInput
                      name="confirmPassword"
                      placeholder="••••••"
                      autoComplete="new-password"
                      invalid={Boolean(errors.confirmPassword)}
                    />
                  </Field>
                )}

                {mode === "login" && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                      <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
                      Lembrar-me
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                )}

                <Button type="submit" size="lg" disabled={loading} className="mt-2 h-11 w-full">
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {titles[mode].cta}
                </Button>
              </motion.form>
            </AnimatePresence>

            {mode === "login" && (
              <>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Não tem conta?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="font-medium text-primary transition-colors hover:text-primary-hover"
                  >
                    Cadastre-se
                  </button>
                </p>
              </>
            )}
          </AuthPanel>
        </div>
      </section>
    </main>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}