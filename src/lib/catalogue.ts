import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  price: number;
  compare_at_price: number | null;
  short_description: string;
  description: string;
  image_url: string;
  colours: string[];
  stock: number;
  in_stock: boolean;
  featured: boolean;
  best_seller: boolean;
  rating: number;
  popularity: number;
  created_at: string;
};

export const categoriesQuery = {
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, sort_order")
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
};

export const productsQuery = {
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Product[];
  },
};

export function productAvailable(p: Product) {
  return p.in_stock && p.stock > 0;
}

export function stockLabel(p: Product) {
  if (!productAvailable(p)) return { text: "Out of stock", tone: "out" as const };
  if (p.stock <= 5) return { text: `Low stock · ${p.stock} left`, tone: "low" as const };
  return { text: "In stock", tone: "in" as const };
}
