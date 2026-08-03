import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const Route = createFileRoute("/_app/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — StockPilot" },
      { name: "description", content: "Contas a pagar, a receber e fluxo de caixa." },
      { property: "og:title", content: "Financeiro — StockPilot" },
      { property: "og:description", content: "Contas a pagar, a receber e fluxo de caixa." },
    ],
  }),
  component: () => (
    <PagePlaceholder
      icon={Wallet}
      title="Financeiro"
      description="Lançamentos, contas a pagar e receber e fluxo de caixa."
      step="Conteúdo na etapa 9"
    />
  ),
});