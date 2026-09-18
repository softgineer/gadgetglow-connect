create or replace function public.place_order(
  _full_name text,
  _phone text,
  _whatsapp text,
  _email text,
  _address text,
  _city text,
  _state text,
  _notes text,
  _items jsonb
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  _order_id uuid;
  _order_number text;
  _total numeric(12,2) := 0;
  _count integer := 0;
  _item jsonb;
begin
  if jsonb_typeof(_items) <> 'array' or jsonb_array_length(_items) = 0 then
    raise exception 'No items in order';
  end if;

  for _item in select * from jsonb_array_elements(_items) loop
    _total := _total + ((_item->>'unit_price')::numeric * (_item->>'quantity')::int);
    _count := _count + (_item->>'quantity')::int;
  end loop;

  _order_number := 'VLT-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 5));

  insert into public.orders (
    order_number, full_name, phone, whatsapp, email, address, city, state, notes, total, item_count
  ) values (
    _order_number,
    trim(_full_name), trim(_phone), trim(_whatsapp), nullif(trim(coalesce(_email, '')), ''),
    trim(_address), trim(_city), trim(_state), nullif(trim(coalesce(_notes, '')), ''),
    _total, _count
  )
  returning id into _order_id;

  insert into public.order_items (order_id, product_id, product_name, colour, unit_price, quantity)
  select
    _order_id,
    nullif(i->>'product_id', '')::uuid,
    i->>'product_name',
    nullif(i->>'colour', ''),
    (i->>'unit_price')::numeric,
    (i->>'quantity')::int
  from jsonb_array_elements(_items) as i;

  return _order_number;
end;
$$;

grant execute on function public.place_order(text, text, text, text, text, text, text, text, jsonb) to anon, authenticated;