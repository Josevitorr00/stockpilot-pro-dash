export const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const number = new Intl.NumberFormat("pt-BR");

export function formatCurrency(value: number) {
  return currency.format(value);
}

export function formatNumber(value: number) {
  return number.format(value);
}

export function formatPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1).replace(".", ",")}%`;
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}