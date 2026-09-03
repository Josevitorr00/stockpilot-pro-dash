import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/pages/auth/AuthPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StockPilot — Controle Inteligente para o seu Comércio" },
      {
        name: "description",
        content:
          "Acesse o StockPilot: sistema de gestão comercial com estoque, vendas, clientes e financeiro em um só painel.",
      },
      { property: "og:title", content: "StockPilot — Controle Inteligente para o seu Comércio" },
      {
        property: "og:description",
        content: "Gestão comercial completa para pequenos comércios: estoque, vendas, clientes e financeiro.",
      },
    ],
  }),
  component: AuthPage,
});
