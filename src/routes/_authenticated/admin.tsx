import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { categoriesQuery, productsQuery, type Product } from "@/lib/catalogue";
import { ORDER_STATUSES, formatNaira, statusLabel, store } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard · VOLTA" },
      { name: "description", content: "Manage products, categories and incoming orders." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

type OrderRow = {
  id: string;
  order_number: string;
  full_name: string;
  phone: string;
  whatsapp: string;
  email: string | null;
  address: string;
  city: string;
  state: string;
  notes: string | null;
  total: number;
  item_count: number;
  status: string;
  created_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_name: string;
  colour: string | null;
  unit_price: number;
  quantity: number;
};

const ordersQuery = {
  queryKey: ["admin", "orders"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as OrderRow[];
  },
};

const orderItemsQuery = {
  queryKey: ["admin", "order-items"],
  queryFn: async () => {
    const { data, error } = await supabase.from("order_items").select("*");
    if (error) throw error;
    return (data ?? []) as unknown as OrderItemRow[];
  },
};

const emptyProduct = {
  name: "",
  slug: "",
  category_id: "",
  price: "",
  compare_at_price: "",
  short_description: "",
  description: "",
  image_url: "",
  colours: "",
  stock: "0",
  featured: false,
  best_seller: false,
};

type ProductForm = typeof emptyProduct;

function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"orders" | "products" | "categories">("orders");

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      if (error) throw error;
      return Boolean(data);
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (roleLoading) {
    return <div className="p-10 text-sm text-muted-foreground">Checking your access…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="display-title text-3xl">No admin access</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This account isn't an admin for {store.name}. Ask the store owner to grant access.
        </p>
        <button
          type="button"
          onClick={signOut}
          className="mt-6 rounded-full border border-line px-5 py-2.5 text-sm"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/" className="font-display text-xl tracking-wide">
            {store.name}
            <span className="text-primary">.</span>
          </Link>
          <h1 className="display-title mt-1 text-3xl">Admin dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/" className="rounded-full border border-line px-4 py-2 text-sm">
            View store
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="rounded-full border border-line px-4 py-2 text-sm"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mt-8 flex gap-2">
        {(["orders", "products", "categories"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2.5 text-sm capitalize ${
              tab === t
                ? "bg-primary font-bold text-primary-foreground"
                : "border border-line text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "orders" && <OrdersPanel />}
        {tab === "products" && <ProductsPanel />}
        {tab === "categories" && <CategoriesPanel />}
      </div>
    </div>
  );
}

function OrdersPanel() {
  const queryClient = useQueryClient();
  const { data: orders = [] } = useQuery(ordersQuery);
  const { data: items = [] } = useQuery(orderItemsQuery);
  const [open, setOpen] = useState<string | null>(null);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: () => toast.error("Couldn't update that order"),
  });

  if (orders.length === 0) {
    return <p className="text-sm text-muted-foreground">No orders yet.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const orderItems = items.filter((i) => i.order_id === o.id);
        const expanded = open === o.id;
        return (
          <div key={o.id} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : o.id)}
                  className="font-mono text-sm text-primary"
                >
                  {o.order_number}
                </button>
                <div className="text-sm font-semibold">{o.full_name}</div>
                <div className="text-xs text-muted-foreground">
                  {o.item_count} items · {new Date(o.created_at).toLocaleString("en-NG")}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-xl text-primary">{formatNaira(o.total)}</span>
                <select
                  value={o.status}
                  onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value })}
                  className="rounded-full border border-line bg-background px-3 py-2 text-xs"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {expanded && (
              <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
                <div className="text-sm">
                  <h3 className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    Customer
                  </h3>
                  <p className="mt-2">{o.full_name}</p>
                  <p className="text-muted-foreground">Phone: {o.phone}</p>
                  <p className="text-muted-foreground">WhatsApp: {o.whatsapp}</p>
                  {o.email && <p className="text-muted-foreground">{o.email}</p>}
                  <h3 className="mt-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    Delivery
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {o.address}, {o.city}, {o.state}
                  </p>
                  {o.notes && <p className="mt-1 text-muted-foreground">Notes: {o.notes}</p>}
                  <p className="mt-3 text-xs text-muted-foreground">
                    Status: {statusLabel(o.status)}
                  </p>
                </div>
                <div className="text-sm">
                  <h3 className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                    Products
                  </h3>
                  <div className="mt-2 space-y-2">
                    {orderItems.map((i) => (
                      <div key={i.id} className="flex justify-between">
                        <span>
                          {i.product_name}
                          {i.colour ? ` · ${i.colour}` : ""} × {i.quantity}
                        </span>
                        <span className="font-mono">{formatNaira(i.unit_price * i.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between border-t border-line pt-3 font-semibold">
                    <span>Total</span>
                    <span>{formatNaira(o.total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProductsPanel() {
  const queryClient = useQueryClient();
  const { data: products = [] } = useQuery(productsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const [form, setForm] = useState<ProductForm | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      slug: p.slug,
      category_id: p.category_id ?? "",
      price: String(p.price),
      compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
      short_description: p.short_description,
      description: p.description,
      image_url: p.image_url,
      colours: p.colours.join(", "),
      stock: String(p.stock),
      featured: p.featured,
      best_seller: p.best_seller,
    });
  }

  const save = useMutation({
    mutationFn: async (values: ProductForm) => {
      const payload = {
        name: values.name.trim(),
        slug:
          values.slug.trim() ||
          values.name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
        category_id: values.category_id || null,
        price: Number(values.price) || 0,
        compare_at_price: values.compare_at_price ? Number(values.compare_at_price) : null,
        short_description: values.short_description,
        description: values.description,
        image_url: values.image_url,
        colours: values.colours
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        stock: Number(values.stock) || 0,
        in_stock: (Number(values.stock) || 0) > 0,
        featured: values.featured,
        best_seller: values.best_seller,
        updated_at: new Date().toISOString(),
      };
      if (editingId) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Product updated" : "Product added");
      setForm(null);
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Delete failed"),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="display-title text-2xl">Products ({products.length})</h2>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm({ ...emptyProduct });
          }}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          Add product
        </button>
      </div>

      {form && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(form);
          }}
          className="mt-6 grid gap-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-2"
        >
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field
            label="Slug (URL)"
            value={form.slug}
            onChange={(v) => setForm({ ...form, slug: v })}
          />
          <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            Category
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="rounded-xl border border-line bg-background px-4 py-3 text-sm text-foreground"
            >
              <option value="">Uncategorised</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Price (₦)"
            value={form.price}
            onChange={(v) => setForm({ ...form, price: v })}
            required
          />
          <Field
            label="Compare-at price (₦)"
            value={form.compare_at_price}
            onChange={(v) => setForm({ ...form, compare_at_price: v })}
          />
          <Field label="Stock" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} />
          <Field
            label="Image URL (e.g. /images/watch.jpg)"
            value={form.image_url}
            onChange={(v) => setForm({ ...form, image_url: v })}
          />
          <Field
            label="Colours (comma separated)"
            value={form.colours}
            onChange={(v) => setForm({ ...form, colours: v })}
          />
          <Field
            label="Short description"
            value={form.short_description}
            onChange={(v) => setForm({ ...form, short_description: v })}
          />
          <Field
            label="Detailed description"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            textarea
          />
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Featured
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.best_seller}
                onChange={(e) => setForm({ ...form, best_seller: e.target.checked })}
              />
              Best seller
            </label>
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={save.isPending}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
            >
              {save.isPending ? "Saving…" : editingId ? "Save changes" : "Add product"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(null);
                setEditingId(null);
              }}
              className="rounded-full border border-line px-5 py-2.5 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-3"
          >
            <img src={p.image_url} alt="" loading="lazy" className="size-12 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="text-sm font-semibold">{p.name}</div>
              <div className="text-xs text-muted-foreground">
                {formatNaira(p.price)} · stock {p.stock}
                {p.featured ? " · featured" : ""}
                {p.best_seller ? " · best seller" : ""}
              </div>
            </div>
            <button
              type="button"
              onClick={() => startEdit(p)}
              className="rounded-full border border-line px-4 py-2 text-xs"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete ${p.name}?`)) remove.mutate(p.id);
              }}
              className="rounded-full border border-line px-4 py-2 text-xs text-destructive"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoriesPanel() {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useQuery(categoriesQuery);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const add = useMutation({
    mutationFn: async () => {
      const slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const { error } = await supabase.from("categories").insert({
        name: name.trim(),
        slug,
        description: description.trim() || null,
        sort_order: categories.length + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category created");
      setName("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Create failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Delete failed"),
  });

  return (
    <div>
      <h2 className="display-title text-2xl">Categories ({categories.length})</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length < 2) {
            toast.error("Enter a category name");
            return;
          }
          add.mutate();
        }}
        className="mt-5 grid gap-4 rounded-2xl border border-line bg-surface p-5 sm:grid-cols-[1fr_1fr_auto]"
      >
        <Field label="Name" value={name} onChange={setName} />
        <Field label="Description" value={description} onChange={setDescription} />
        <button
          type="submit"
          className="self-end rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          Add
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {categories.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3"
          >
            <div className="flex-1">
              <div className="text-sm font-semibold">{c.name}</div>
              <div className="text-xs text-muted-foreground">
                /{c.slug} · {c.description}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete ${c.name}?`)) remove.mutate(c.id);
              }}
              className="rounded-full border border-line px-4 py-2 text-xs text-destructive"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
      {label}
      {textarea ? (
        <textarea
          value={value}
          rows={3}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl border border-line bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/60"
        />
      ) : (
        <input
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl border border-line bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary/60"
        />
      )}
    </label>
  );
}
