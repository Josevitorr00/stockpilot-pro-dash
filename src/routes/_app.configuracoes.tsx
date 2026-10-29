import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/pages/configuracoes/SettingsPage";

export const Route = createFileRoute("/_app/configuracoes")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Configurações — StockPilot" },
      { name: "description", content: "Perfil, dados da empresa e preferências do sistema." },
      { property: "og:title", content: "Configurações — StockPilot" },
      { property: "og:description", content: "Perfil, dados da empresa e preferências do sistema." },
    ],
  }),
  component: SettingsPage,
});
