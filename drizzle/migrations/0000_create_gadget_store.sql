-- ROLES ---------------------------------------------------------------
create type public.app_role as enum ('admin', 'staff', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can read own roles"
on public.user_roles for select to authenticated
using (user_id = auth.uid());

create policy "Admins can read all roles"
on public.user_roles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- bootstrap: first ever signup becomes admin
create or replace function public.bootstrap_first_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created_bootstrap_admin
after insert on auth.users
for each row execute function public.bootstrap_first_admin();

-- CATEGORIES ----------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;

create policy "Categories are publicly readable"
on public.categories for select to anon, authenticated using (true);

create policy "Admins manage categories"
on public.categories for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- PRODUCTS ------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references public.categories(id) on delete set null,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2),
  short_description text not null default '',
  description text not null default '',
  image_url text not null default '',
  colours text[] not null default '{}',
  stock integer not null default 0,
  in_stock boolean not null default true,
  featured boolean not null default false,
  best_seller boolean not null default false,
  rating numeric(2,1) not null default 4.7,
  popularity integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;

create policy "Products are publicly readable"
on public.products for select to anon, authenticated using (true);

create policy "Admins manage products"
on public.products for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- ORDERS --------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  full_name text not null,
  phone text not null,
  whatsapp text not null,
  email text,
  address text not null,
  city text not null,
  state text not null,
  notes text,
  total numeric(12,2) not null default 0,
  item_count integer not null default 0,
  status text not null default 'new_order',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant insert on public.orders to anon;
grant select, insert, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;

create policy "Anyone can submit an order"
on public.orders for insert to anon, authenticated with check (true);

create policy "Admins read orders"
on public.orders for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins update orders"
on public.orders for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins delete orders"
on public.orders for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  colour text,
  unit_price numeric(12,2) not null,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

grant insert on public.order_items to anon;
grant select, insert, update, delete on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;

create policy "Anyone can add order items"
on public.order_items for insert to anon, authenticated with check (true);

create policy "Admins read order items"
on public.order_items for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins manage order items"
on public.order_items for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- SEED ----------------------------------------------------------------
insert into public.categories (name, slug, description, sort_order) values
  ('Smartphones','smartphones','Sealed 4G and 5G phones',1),
  ('Smartwatches','smartwatches','Fitness and lifestyle wearables',2),
  ('Earbuds & Headphones','audio','True wireless and over-ear audio',3),
  ('Bluetooth Speakers','speakers','Portable and rugged speakers',4),
  ('Power Banks','power-banks','Fast-charging portable power',5),
  ('Chargers & Cables','chargers','GaN chargers and braided cables',6),
  ('Laptop Accessories','laptop-accessories','Stands, hubs and docks',7),
  ('Gaming Accessories','gaming','Controllers and gaming audio',8),
  ('Computer Accessories','computer-accessories','Keyboards, mice and desk gear',9);

insert into public.products (name, slug, category_id, price, compare_at_price, short_description, description, image_url, colours, stock, featured, best_seller, rating, popularity) values
  ('Volt One 5G · 256GB','volt-one-5g',(select id from public.categories where slug='smartphones'),312500,349000,'Snapdragon flagship, 120Hz AMOLED','Sealed in tray. 6.7" 120Hz AMOLED display, Snapdragon 8-series chip, 50MP triple camera and a 5000mAh battery with 65W fast charging. Ships Lagos-wide in 24 hours with a 12-month warranty.','/images/phone-flagship.jpg','{"Cyan Frost","Silver","Midnight"}',12,true,true,4.8,980),
  ('Nova Lite 5G · 128GB','nova-lite-5g',(select id from public.categories where slug='smartphones'),178000,195000,'Big battery, clean display','A dependable daily driver: 6.6" 90Hz screen, 8GB RAM, 128GB storage, 5000mAh battery and dual SIM. Great value for students and light users.','/images/phone-mid.jpg','{"Ocean Blue","Graphite"}',20,true,false,4.6,760),
  ('Halo ANC Pro','halo-anc-pro',(select id from public.categories where slug='audio'),148900,169000,'40h battery, hybrid ANC','Over-ear headphones with hybrid active noise cancelling, 40 hours of playback, multipoint Bluetooth 5.3 and memory-foam cups tuned for long listening.','/images/headphones.jpg','{"Graphite","Ice"}',9,true,true,4.9,870),
  ('AeroBuds 3 ANC','aerobuds-3-anc',(select id from public.categories where slug='audio'),42500,52000,'ANC earbuds, 36h with case','True wireless earbuds with active noise cancelling, transparency mode, IPX5 sweat resistance and 36 hours total playtime with the charging case.','/images/earbuds.jpg','{"Black","Cyan","White"}',34,false,true,4.7,1120),
  ('Pulse Fit 3','pulse-fit-3',(select id from public.categories where slug='smartwatches'),96200,110000,'AMOLED · GPS · 5ATM','A bright AMOLED smartwatch with built-in GPS, heart-rate and SpO2 tracking, 100+ sport modes, 5ATM water resistance and up to 10 days of battery.','/images/watch.jpg','{"Midnight","Steel","Sand"}',15,true,false,4.6,690),
  ('Boom 200 IPX7','boom-200-ipx7',(select id from public.categories where slug='speakers'),67400,79000,'30W · 24h · dual driver','A rugged 30W speaker with dual drivers, deep passive bass, IPX7 waterproofing, 24-hour battery and a carabiner clip for travel.','/images/speaker.jpg','{"Black","Teal"}',4,false,true,4.7,540),
  ('VoltCell 20,000mAh','voltcell-20000',(select id from public.categories where slug='power-banks'),38900,45000,'65W PD, digital display','Charge a laptop and two phones at once. 65W USB-C Power Delivery, digital percentage display, built-in 3-in-1 cable and airline-safe capacity.','/images/powerbank.jpg','{"Black"}',28,true,true,4.8,1010),
  ('GaN 45W Charger + Cable','gan-45w-charger',(select id from public.categories where slug='chargers'),18500,22000,'Compact GaN with braided cable','A pocket-size 45W GaN USB-C charger bundled with a 1.8m braided USB-C cable rated for 100W. Charges most phones to 50% in about 20 minutes.','/images/charger.jpg','{"Black","White"}',60,false,false,4.7,820),
  ('Riser Alu Stand + 7-in-1 Hub','riser-alu-hub',(select id from public.categories where slug='laptop-accessories'),46700,55000,'Aluminium stand with USB-C hub','Raise your laptop to eye level on a solid aluminium stand, then expand ports with a 7-in-1 USB-C hub: HDMI 4K, 2x USB-A, USB-C PD, SD and microSD.','/images/laptop-stand.jpg','{"Space Grey"}',18,false,false,4.6,430),
  ('Apex Wireless Controller','apex-wireless-controller',(select id from public.categories where slug='gaming'),52300,60000,'Low-latency wireless pad','Hall-effect sticks, textured grips, low-latency 2.4GHz and Bluetooth modes, 30-hour battery and remappable back buttons. Works with PC, Android and consoles.','/images/controller.jpg','{"Black"}',11,true,false,4.7,610),
  ('Vortex RGB Gaming Headset','vortex-rgb-headset',(select id from public.categories where slug='gaming'),39800,47000,'7.1 surround, RGB','Virtual 7.1 surround sound, 50mm drivers, noise-cancelling boom mic and RGB lighting. Braided cable with in-line volume control.','/images/gaming-headset.jpg','{"Black"}',0,false,false,4.5,380),
  ('TKL Mech Keyboard + Mouse Set','tkl-mech-set',(select id from public.categories where slug='computer-accessories'),34900,41000,'Hot-swap TKL with 12K mouse','A tenkeyless hot-swappable mechanical keyboard with cyan backlight, paired with a 12,000 DPI lightweight wireless mouse. Desk-ready out of the box.','/images/keyboard-mouse.jpg','{"Black"}',22,false,true,4.6,700);