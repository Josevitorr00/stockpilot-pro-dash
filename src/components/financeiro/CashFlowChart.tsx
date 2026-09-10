import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/format";
import type { CashFlowPoint } from "@/services/data/financeService";

export function CashFlowChart({ data }: { data: CashFlowPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            width={70}
            tickFormatter={(value: number) => formatCurrency(value).replace(/\s/g, " ")}
          />
          <Tooltip
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--card-foreground)",
            }}
          />
          <Legend />
          <Bar dataKey="receitas" name="Receitas" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="despesas" name="Despesas" fill="var(--destructive)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}