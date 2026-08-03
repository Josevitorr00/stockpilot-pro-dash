import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CategoryShare } from "@/types/business";
import { formatCurrency } from "@/lib/format";

export function CategoryChart({ data }: { data: CategoryShare[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="category"
            tickLine={false}
            axisLine={false}
            width={92}
            stroke="var(--color-muted-foreground)"
            fontSize={12}
          />
          <Tooltip
            cursor={{ fill: "var(--color-muted)" }}
            formatter={(value: number) => [formatCurrency(value), "Faturamento"]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              background: "var(--color-card)",
              color: "var(--color-card-foreground)",
              fontSize: 12,
            }}
          />
          <Bar dataKey="revenue" radius={[0, 8, 8, 0]} fill="var(--color-primary)" barSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}