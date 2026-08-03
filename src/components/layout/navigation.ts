import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  Truck,
  Wallet,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  description: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Visão geral",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        description: "Indicadores e resumo do seu comércio.",
      },
    ],
  },
  {
    label: "Operação",
    items: [
      {
        title: "Produtos",
        url: "/produtos",
        icon: Package,
        description: "Cadastro e catálogo de produtos.",
      },
      {
        title: "Estoque",
        url: "/estoque",
        icon: Boxes,
        description: "Entradas, saídas e níveis de estoque.",
      },
      {
        title: "Vendas / PDV",
        url: "/vendas",
        icon: ShoppingCart,
        description: "Frente de caixa e histórico de vendas.",
      },
    ],
  },
  {
    label: "Relacionamento",
    items: [
      {
        title: "Clientes",
        url: "/clientes",
        icon: Users,
        description: "Base de clientes e histórico de compras.",
      },
      {
        title: "Fornecedores",
        url: "/fornecedores",
        icon: Truck,
        description: "Parceiros, contatos e condições de compra.",
      },
    ],
  },
  {
    label: "Gestão",
    items: [
      {
        title: "Financeiro",
        url: "/financeiro",
        icon: Wallet,
        description: "Contas a pagar, a receber e fluxo de caixa.",
      },
      {
        title: "Relatórios",
        url: "/relatorios",
        icon: BarChart3,
        description: "Análises de vendas, estoque e resultados.",
      },
      {
        title: "Configurações",
        url: "/configuracoes",
        icon: Settings,
        description: "Preferências da empresa e do sistema.",
      },
    ],
  },
];

export const allNavItems: NavItem[] = navGroups.flatMap((group) => group.items);