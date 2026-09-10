import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Receipt, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { toast } from "sonner";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { CartPanel } from "@/components/vendas/CartPanel";
import { ProductPicker } from "@/components/vendas/ProductPicker";
import { SalesHistoryTable } from "@/components/vendas/SalesHistoryTable";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cancelSale, createSale, getPosData, type SaleInput } from "@/services/data/salesService";
import type { PaymentMethod, Product, Sale, SaleItem } from "@/types/business";
import { formatCurrency, formatNumber } from "@/lib/format";

export function SalesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [customer, setCustomer] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Pix");
  const [discount, setDiscount] = useState(0);
  const [historySearch, setHistorySearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("todos");
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["pos"], queryFn: getPosData });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["pos"] });
    queryClient.invalidateQueries({ queryKey: ["stock"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const checkout = useMutation({
    mutationFn: (values: SaleInput) => createSale(values),
    onSuccess: (sale) => {
      invalidate();
      setItems([]);
      setCustomer("");
      setDiscount(0);
      toast.success(`Venda ${sale.id} concluída — ${formatCurrency(sale.total)}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const cancellation = useMutation({
    mutationFn: (id: string) => cancelSale(id),
    onSuccess: (sale) => {
      invalidate();
      setSaleToCancel(null);
      toast.success(`Venda ${sale.id} cancelada e estoque estornado.`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const products = data?.products ?? [];
  const sales = data?.sales ?? [];

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term),
    );
  }, [products, search]);

  const filteredSales = useMemo(() => {
    const term = historySearch.trim().toLowerCase();
    return sales.filter((sale) => {
      const matchesTerm =
        !term ||
        sale.id.toLowerCase().includes(term) ||
        sale.customer.toLowerCase().includes(term);
      const matchesMethod = methodFilter === "todos" || sale.method === methodFilter;
      return matchesTerm && matchesMethod;
    });
  }, [sales, historySearch, methodFilter]);

  const summary = useMemo(() => {
    const completed = sales.filter((sale) => sale.status === "Concluída");
    const revenue = completed.reduce((acc, sale) => acc + sale.total, 0);
    const units = completed.reduce(
      (acc, sale) => acc + sale.items.reduce((sum, item) => sum + item.quantity, 0),
      0,
    );
    return {
      revenue,
      orders: completed.length,
      averageTicket: completed.length ? revenue / completed.length : 0,
      units,
    };
  }, [sales]);

  function addProduct(product: Product) {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(`Estoque disponível: ${product.stock} un.`);
          return current;
        }
        return current.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  }

  function changeQuantity(productId: string, delta: number) {
    const product = products.find((item) => item.id === productId);
    setItems((current) =>
      current.flatMap((item) => {
        if (item.productId !== productId) return [item];
        const next = item.quantity + delta;
        if (next <= 0) return [];
        if (product && next > product.stock) {
          toast.error(`Estoque disponível: ${product.stock} un.`);
          return [item];
        }
        return [{ ...item, quantity: next }];
      }),
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Vendas / PDV</h1>
        <p className="text-sm text-muted-foreground">
          Registre vendas no balcão e acompanhe o histórico do caixa.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Faturamento</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Wallet className="size-5 text-primary" /> {formatCurrency(summary.revenue)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Vendas concluídas</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Receipt className="size-5 text-primary" /> {formatNumber(summary.orders)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Ticket médio</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <TrendingUp className="size-5 text-primary" /> {formatCurrency(summary.averageTicket)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-xs text-muted-foreground">Itens vendidos</p>
          <p className="mt-1 flex items-center gap-2 text-2xl font-semibold text-foreground">
            <ShoppingCart className="size-5 text-primary" /> {formatNumber(summary.units)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title="Frente de caixa"
          description="Selecione produtos para adicionar ao carrinho."
          className="xl:col-span-2"
        >
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <ProductPicker
              products={filteredProducts}
              search={search}
              onSearchChange={setSearch}
              onSelect={addProduct}
            />
          )}
        </SectionCard>

        <SectionCard title="Carrinho" description="Resumo da venda atual." className="h-fit">
          <CartPanel
            items={items}
            customer={customer}
            method={method}
            discount={discount}
            isPending={checkout.isPending}
            onCustomerChange={setCustomer}
            onMethodChange={setMethod}
            onDiscountChange={setDiscount}
            onChangeQuantity={changeQuantity}
            onRemove={(productId) =>
              setItems((current) => current.filter((item) => item.productId !== productId))
            }
            onClear={() => {
              setItems([]);
              setDiscount(0);
            }}
            onCheckout={() => checkout.mutate({ customer, method, discount, items })}
          />
        </SectionCard>
      </div>

      <SectionCard title="Histórico de vendas" description="Vendas registradas no PDV.">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <Input
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            placeholder="Buscar por venda ou cliente"
            aria-label="Buscar vendas"
            className="flex-1"
          />
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="sm:w-48" aria-label="Filtrar por pagamento">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os pagamentos</SelectItem>
              <SelectItem value="Dinheiro">Dinheiro</SelectItem>
              <SelectItem value="Pix">Pix</SelectItem>
              <SelectItem value="Cartão">Cartão</SelectItem>
              <SelectItem value="Fiado">Fiado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        ) : (
          <SalesHistoryTable sales={filteredSales} onCancel={setSaleToCancel} />
        )}
      </SectionCard>

      <AlertDialog open={!!saleToCancel} onOpenChange={(open) => !open && setSaleToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar venda {saleToCancel?.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              Os itens voltarão para o estoque como entrada de estorno.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                if (saleToCancel) cancellation.mutate(saleToCancel.id);
              }}
            >
              {cancellation.isPending ? "Cancelando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
