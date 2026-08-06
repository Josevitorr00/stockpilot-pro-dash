import { createFileRoute } from "@tanstack/react-router";
import { CustomersPage } from "@/pages/clientes/CustomersPage";

export const Route = createFileRoute("/_app/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — StockPilot" },
      {
        name: "description",
        content:
          "Cadastro de clientes com contatos, filtros por tipo e histórico de compras do PDV.",
      },
      { property: "og:title", content: "Clientes — StockPilot" },
      { property: "og:description", content: "Base de clientes e histórico de compras." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CustomersPage,
});
