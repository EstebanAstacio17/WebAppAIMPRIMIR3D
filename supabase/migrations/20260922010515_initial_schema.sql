-- Crear extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Perfiles (Extensión de auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Productos (Catálogo)
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  time_estimate TEXT,
  category TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Pedidos (Orders)
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_production', 'payment_confirmed', 'completed', 'cancelled')),
  total NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Ítems del Pedido (Order Items)
CREATE TABLE public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INT DEFAULT 1,
  unit_price NUMERIC DEFAULT 0
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING ( (SELECT auth.uid()) = id );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING ( (SELECT auth.uid()) = id ) WITH CHECK ( (SELECT auth.uid()) = id );

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING ( 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND is_admin = true)
  );

-- Políticas de RLS para Products
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT TO public USING ( true );

CREATE POLICY "Only admins can modify products" ON public.products
  FOR ALL TO authenticated USING ( 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND is_admin = true)
  );

-- Políticas de RLS para Orders
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT TO authenticated USING ( (SELECT auth.uid()) = user_id );

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK ( (SELECT auth.uid()) = user_id );

CREATE POLICY "Admins can view and update all orders" ON public.orders
  FOR ALL TO authenticated USING ( 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND is_admin = true)
  );

-- Políticas de RLS para Order Items
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT TO authenticated USING ( 
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Users can create their own order items" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK ( 
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = (SELECT auth.uid()))
  );

CREATE POLICY "Admins can view and update all order items" ON public.order_items
  FOR ALL TO authenticated USING ( 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND is_admin = true)
  );

-- Trigger para crear un profile automáticamente al registrar un usuario (Auth)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
