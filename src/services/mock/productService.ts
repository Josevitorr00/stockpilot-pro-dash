import type { Product } from "@/types/business";

export const productCategories = [
  "Mercearia",
  "Bebidas",
  "Limpeza",
  "Higiene",
  "Hortifruti",
  "Padaria",
] as const;

let products: Product[] = [
  { id: "p-102", name: "Arroz Tipo 1 5kg", sku: "ARZ-5KG", category: "Mercearia", price: 28.9, cost: 21.4, stock: 4, minStock: 20 },
  { id: "p-118", name: "Café Torrado 500g", sku: "CAF-500", category: "Mercearia", price: 19.5, cost: 13.2, stock: 6, minStock: 25 },
  { id: "p-129", name: "Feijão Carioca 1kg", sku: "FEI-1KG", category: "Mercearia", price: 8.75, cost: 5.9, stock: 84, minStock: 30 },
  { id: "p-141", name: "Óleo de Soja 900ml", sku: "OLE-900", category: "Mercearia", price: 7.49, cost: 5.1, stock: 52, minStock: 24 },
  { id: "p-233", name: "Detergente Neutro", sku: "DET-NEU", category: "Limpeza", price: 3.29, cost: 1.85, stock: 9, minStock: 40 },
  { id: "p-238", name: "Água Sanitária 2L", sku: "AGS-2L", category: "Limpeza", price: 6.9, cost: 4.2, stock: 61, minStock: 20 },
  { id: "p-341", name: "Refrigerante 2L", sku: "REF-2L", category: "Bebidas", price: 9.99, cost: 6.4, stock: 12, minStock: 30 },
  { id: "p-347", name: "Cerveja Lata 350ml", sku: "CER-350", category: "Bebidas", price: 4.49, cost: 2.95, stock: 240, minStock: 96 },
  { id: "p-352", name: "Suco de Uva 1L", sku: "SUC-UVA", category: "Bebidas", price: 12.4, cost: 8.3, stock: 38, minStock: 18 },
  { id: "p-410", name: "Papel Higiênico 12un", sku: "PAP-12", category: "Higiene", price: 24.9, cost: 17.1, stock: 5, minStock: 18 },
  { id: "p-418", name: "Sabonete 90g", sku: "SAB-90", category: "Higiene", price: 2.79, cost: 1.6, stock: 130, minStock: 50 },
  { id: "p-505", name: "Banana Prata kg", sku: "BAN-KG", category: "Hortifruti", price: 6.99, cost: 4.1, stock: 27, minStock: 15 },
  { id: "p-512", name: "Tomate Italiano kg", sku: "TOM-KG", category: "Hortifruti", price: 9.9, cost: 6.2, stock: 11, minStock: 12 },
  { id: "p-601", name: "Pão Francês kg", sku: "PAO-KG", category: "Padaria", price: 15.9, cost: 9.4, stock: 18, minStock: 10 },
  { id: "p-608", name: "Bolo de Cenoura un", sku: "BOL-CEN", category: "Padaria", price: 22.0, cost: 12.8, stock: 7, minStock: 6 },
];

export type ProductInput = Omit<Product, "id">;

function delay(ms = 320) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getProducts(): Promise<Product[]> {
  await delay();
  return products.map((product) => ({ ...product }));
}

export async function createProduct(input: ProductInput): Promise<Product> {
  await delay(200);
  const product: Product = { ...input, id: `p-${Math.random().toString(36).slice(2, 8)}` };
  products = [product, ...products];
  return product;
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  await delay(200);
  const updated: Product = { ...input, id };
  products = products.map((product) => (product.id === id ? updated : product));
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  await delay(200);
  products = products.filter((product) => product.id !== id);
}

export function getProductsSync(): Product[] {
  return products.map((product) => ({ ...product }));
}

export function applyStockChange(id: string, nextStock: number): Product | undefined {
  let updated: Product | undefined;
  products = products.map((product) => {
    if (product.id !== id) return product;
    updated = { ...product, stock: nextStock };
    return updated;
  });
  return updated;
}