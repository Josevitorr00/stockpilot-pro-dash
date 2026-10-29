import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calculator, RotateCcw, Package, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { getProducts } from "@/services/data/productService";
import { calculatePricing, parseDecimal, type PricingInput } from "@/lib/pricing";
import { formatCurrency, formatNumber } from "@/lib/format";

const empty = { cost: "", units: "", price: "", taxes: "", fees: "", margin: "", bales: "" };
const labels: Record<keyof typeof empty, string> = {
  cost: "Custo por fardo (R$)", units: "Unidades por fardo", price: "Preço de venda desejado por unidade (R$)",
  taxes: "Impostos (%)", fees: "Taxas de cartão ou pagamento (%)", margin: "Margem de lucro desejada (%)", bales: "Quantidade de fardos — opcional",
};
const money = (value: number | null | undefined) => value == null ? "—" : formatCurrency(value);
const percent = (value: number | undefined) => value === undefined ? "—" : `${formatNumber(value)}%`;

export function PricingSimulator() {
  const [form, setForm] = useState(empty);
  const [mode, setMode] = useState<"profit" | "ideal">("profit");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [productId, setProductId] = useState("");
  const { data: products = [], isLoading, isError } = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const input = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, parseDecimal(value)])) as unknown as PricingInput;
  const fields: (keyof typeof empty)[] = ["cost", "units", ...(mode === "profit" ? ["price" as const] : []), "taxes", "fees", ...(mode === "ideal" ? ["margin" as const] : []), "bales"];
  const invalidInput = fields.some(key => form[key].trim() && input[key] === null);
  const result = invalidInput ? null : calculatePricing(input, mode);
  const required = fields.filter(key => key !== "bales");
  const missing = required.some(key => !form[key].trim());
  const percentages = (input.taxes ?? 0) + (input.fees ?? 0) + (mode === "ideal" ? input.margin ?? 0 : 0);
  const malformed = fields.some(key => form[key].trim() && input[key] === null);
  const message = malformed ? "Informe apenas números válidos." : percentages >= 100 ? "A soma dos percentuais deve ser menor que 100%." : missing ? "Preencha os campos obrigatórios." : !result ? "Confira os valores: custos e percentuais não podem ser negativos; unidades devem ser inteiras e maiores que zero." : null;
  const positiveClass = (value: number | null | undefined) => value == null || value === 0 ? "text-foreground" : value > 0 ? "text-success" : "text-destructive";

  function loadProduct() {
    const product = products.find(item => item.id === productId);
    if (!product) return;
    setForm(prev => ({ ...prev, cost: String(product.costPerBale), units: String(product.unitsPerBale), price: String(product.price) }));
    setPickerOpen(false);
  }

  return <div className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground"><Calculator className="size-5 text-primary" />Simulador de Preços</h1>
      <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => { setProductId(""); setPickerOpen(true); }} disabled={isLoading || isError || !products.length}><Package className="mr-2 size-4" />Preencher com produto</Button><Button variant="outline" onClick={() => { setForm(empty); setProductId(""); }}><RotateCcw className="mr-2 size-4" />Limpar</Button></div>
    </header>
    <Tabs value={mode} onValueChange={value => setMode(value === "ideal" ? "ideal" : "profit")}>
      <TabsList className="h-auto w-full flex-wrap justify-start sm:w-auto"><TabsTrigger value="profit" className="whitespace-normal">Lucro com preço informado</TabsTrigger><TabsTrigger value="ideal" className="whitespace-normal">Preço de venda ideal</TabsTrigger></TabsList>
    </Tabs>
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.5fr)]">
      <section className="space-y-5" aria-label="Dados da simulação">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">{fields.map(key => <div key={key} className="space-y-2"><Label htmlFor={`sim-${key}`}>{labels[key]}</Label><Input id={`sim-${key}`} inputMode={key === "units" ? "numeric" : "decimal"} placeholder={key === "bales" ? "Não informado" : key === "units" ? "24" : "0"} value={form[key]} onChange={event => setForm(prev => ({ ...prev, [key]: event.target.value }))} aria-invalid={Boolean(form[key].trim() && (input[key] === null || (input[key] ?? 0) < 0 || (key === "units" && (!Number.isSafeInteger(input.units) || (input.units ?? 0) <= 0))))} /></div>)}</div>
        {message && <p role="status" className={missing && !malformed && percentages < 100 ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>{message}</p>}
      </section>
      <section className="min-w-0 space-y-5" aria-label="Resultados da simulação">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"><p className="text-sm text-muted-foreground">{mode === "ideal" ? "Preço recomendado por unidade" : "Lucro líquido por unidade"}</p><p className={`mt-2 break-words text-3xl font-semibold ${mode === "ideal" ? "text-primary" : positiveClass(result?.netProfit)}`} data-testid="primary-result">{money(mode === "ideal" ? result?.price : result?.netProfit)}</p><p className="mt-2 text-xs text-muted-foreground">{mode === "ideal" ? `Por fardo: ${money(result?.balePrice)}` : `Margem efetiva: ${percent(result?.effectiveMargin)}`}</p></div>
          <div className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"><p className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingUp className="size-4" />Lucro estimado total</p><p className={`mt-2 break-words text-3xl font-semibold ${positiveClass(result?.totalProfit)}`}>{money(result?.totalProfit)}</p><p className="mt-2 text-xs text-muted-foreground">{input.bales === null ? "Quantidade de fardos não informada" : `${formatNumber(input.bales)} fardos`}</p></div>
        </div>
        <dl className="divide-y divide-border">
          {[
            ["Custo por unidade", money(result?.cost)],
            ...(mode === "ideal" ? [["Margem divisora", result ? percent(result.divisor * 100) : "—"], ["Preço matemático por unidade", result ? `R$ ${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 8 }).format(result.mathematicalPrice)}` : "—"], ["Preço recomendado por fardo", money(result?.balePrice)]] : []),
            ["Lucro bruto por unidade", money(result?.grossProfit)], ["Impostos estimados por unidade", money(result?.taxes)], ["Taxas estimadas por unidade", money(result?.fees)],
            ["Lucro líquido estimado por unidade", money(result?.netProfit)], ["Margem efetiva sobre o preço de venda", percent(result?.effectiveMargin)], ["Faturamento projetado", money(result?.revenue)], ["Custo total dos fardos", money(result?.totalCost)],
          ].map(([label, value]) => <div key={label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"><dt className="text-sm text-muted-foreground">{label}</dt><dd className={`text-right text-sm font-semibold ${label.includes("Lucro") ? positiveClass(label.includes("bruto") ? result?.grossProfit : result?.netProfit) : "text-foreground"}`}>{value}</dd></div>)}
        </dl>
        <p className="border-t border-border pt-4 text-xs text-muted-foreground">O lucro estimado não inclui outras despesas que não tenham sido cadastradas.</p>
      </section>
    </div>
    <Dialog open={pickerOpen} onOpenChange={setPickerOpen}><DialogContent><DialogHeader><DialogTitle>Preencher com produto</DialogTitle><DialogDescription>Produto cadastrado</DialogDescription></DialogHeader><Select value={productId} onValueChange={setProductId}><SelectTrigger aria-label="Produto para simulação"><SelectValue placeholder="Selecione um produto" /></SelectTrigger><SelectContent>{products.map(product => <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>)}</SelectContent></Select><DialogFooter><Button variant="outline" onClick={() => setPickerOpen(false)}>Cancelar</Button><Button onClick={loadProduct} disabled={!productId}>Preencher dados</Button></DialogFooter></DialogContent></Dialog>
  </div>;
}