import { createFileRoute } from "@tanstack/react-router";
import { FinancePage } from "@/pages/financeiro/FinancePage";

export const Route = createFileRoute("/_app/financeiro")({
  head: () => ({
    meta: [
      { title: "Financeiro — StockPilot" },
      {
        name: "description",
        content:
          "Contas a pagar e a receber, fluxo de caixa mensal e alertas de lançamentos vencidos.",
      },
      { property: "og:title", content: "Financeiro — StockPilot" },
      { property: "og:description", content: "Contas a pagar, a receber e fluxo de caixa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FinancePage,
});