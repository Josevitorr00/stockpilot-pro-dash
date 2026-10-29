export function parseDecimal(value: string): number | null {
  if (!value.trim()) return null;
  const normalized = value.trim().includes(",") ? value.trim().replace(/\./g, "").replace(",", ".") : value.trim();
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

export function unitCost(cost: number | null, units: number | null): number | null {
  if (cost === null || units === null || !Number.isFinite(cost) || cost < 0 || !Number.isSafeInteger(units) || units <= 0) return null;
  return cost / units;
}

export function roundPriceUp(value: number) {
  const scaled = value * 100;
  const nearest = Math.round(scaled);
  return (Math.abs(scaled - nearest) < 1e-10 ? nearest : Math.ceil(scaled)) / 100;
}

export interface PricingInput {
  cost: number | null;
  units: number | null;
  price: number | null;
  taxes: number | null;
  fees: number | null;
  margin: number | null;
  bales: number | null;
}

export function calculatePricing(input: PricingInput, mode: "profit" | "ideal") {
  const cost = unitCost(input.cost, input.units);
  const percentages = mode === "ideal" ? [input.taxes, input.fees, input.margin] : [input.taxes, input.fees];
  if (cost === null || percentages.some(value => value === null || !Number.isFinite(value) || value < 0)) return null;
  const sum = percentages.reduce<number>((total, value) => total + (value ?? 0), 0);
  if (sum >= 100 || (input.bales !== null && (!Number.isFinite(input.bales) || input.bales < 0))) return null;
  const divisor = 1 - sum / 100;
  const mathematicalPrice = mode === "ideal" ? cost / divisor : input.price;
  if (mathematicalPrice === null || !Number.isFinite(mathematicalPrice) || mathematicalPrice <= 0) return null;
  const price = mode === "ideal" ? roundPriceUp(mathematicalPrice) : mathematicalPrice;
  const taxes = price * (input.taxes ?? 0) / 100;
  const fees = price * (input.fees ?? 0) / 100;
  const grossProfit = price - cost;
  const netProfit = grossProfit - taxes - fees;
  const totalUnits = input.bales === null ? null : input.bales * (input.units ?? 0);
  return {
    cost, divisor, mathematicalPrice, price, balePrice: price * (input.units ?? 0), taxes, fees, grossProfit, netProfit,
    effectiveMargin: netProfit / price * 100,
    revenue: totalUnits === null ? null : totalUnits * price,
    totalCost: input.bales === null ? null : input.bales * (input.cost ?? 0),
    totalProfit: totalUnits === null ? null : totalUnits * netProfit,
  };
}

export function stockUnits(bales: number | null, units: number): number | null {
  if (bales === null) return null;
  const result = bales * units;
  const rounded = Math.round(result);
  if (!Number.isFinite(bales) || bales < 0 || !Number.isSafeInteger(units) || units <= 0 || Math.abs(result - rounded) > 1e-7 || !Number.isSafeInteger(rounded)) return null;
  return rounded;
}