import { createFileRoute } from "@tanstack/react-router";
import { PricingSimulator } from "@/components/pricing/PricingSimulator";

export const Route = createFileRoute("/_app/simulador")({
  head: () => ({ meta: [
    { title: "Simulador de Preços — StockPilot" },
    { name: "description", content: "Simule preços por fardo e unidade, impostos, taxas e margens de lucro." },
    { property: "og:title", content: "Simulador de Preços — StockPilot" },
    { property: "og:description", content: "Calcule preços recomendados e lucro estimado para seus produtos." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PricingSimulator,
});