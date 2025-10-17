-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_interactions table for tracking behavior
CREATE TABLE public.user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'view', 'add_to_cart', 'purchase'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recommendations table to cache AI recommendations
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  score DECIMAL(3,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Products are viewable by everyone
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (true);

-- Users can view their own interactions
CREATE POLICY "Users can view own interactions"
  ON public.user_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions"
  ON public.user_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own recommendations
CREATE POLICY "Users can view own recommendations"
  ON public.recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON public.recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can manage their own cart
CREATE POLICY "Users can view own cart"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own cart"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- Insert sample products
INSERT INTO public.products (name, category, description, price, image_url, tags) VALUES
('Travel Backpack Anti-Theft', 'Accessories', 'Water-resistant backpack with USB charging port and hidden pockets', 79.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', ARRAY['travel', 'security', 'tech']),
('Electric Toothbrush Pro', 'Beauty', 'Sonic toothbrush with 5 modes and smart pressure sensor', 129.99, 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800', ARRAY['dental', 'health', 'tech']),
('Hair Dryer Professional', 'Beauty', 'Ionic hair dryer with multiple heat settings and concentrator', 179.99, 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800', ARRAY['hair care', 'professional', 'styling']),
('Massage Gun Deep Tissue', 'Sports', 'Percussion massage device with 20 speed levels', 199.99, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', ARRAY['wellness', 'fitness', 'recovery']),
('Wireless Earbuds Pro', 'Electronics', 'Active noise cancellation with 30-hour battery life', 249.99, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800', ARRAY['audio', 'wireless', 'premium']),
('Smart Watch Fitness', 'Electronics', 'Health tracking smartwatch with GPS and heart rate monitor', 299.99, 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800', ARRAY['fitness', 'tech', 'health']),
('Yoga Mat Premium', 'Sports', 'Non-slip eco-friendly yoga mat with carrying strap', 49.99, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800', ARRAY['yoga', 'fitness', 'eco-friendly']),
('Coffee Maker Smart', 'Home', 'Programmable coffee maker with thermal carafe', 159.99, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800', ARRAY['kitchen', 'smart home', 'coffee']),
('Reading Lamp LED', 'Home', 'Adjustable LED desk lamp with touch control', 39.99, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800', ARRAY['lighting', 'study', 'home office']),
('Running Shoes Ultra', 'Fashion', 'Lightweight running shoes with responsive cushioning', 139.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', ARRAY['athletic', 'comfort', 'performance']),
('Leather Wallet Slim', 'Accessories', 'Minimalist RFID-blocking leather wallet', 59.99, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800', ARRAY['leather', 'minimal', 'security']),
('Cookbook Mediterranean', 'Books', 'Complete guide to Mediterranean cuisine with 200+ recipes', 34.99, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800', ARRAY['cooking', 'recipes', 'healthy']),
('Desk Organizer Bamboo', 'Home', 'Eco-friendly bamboo desk organizer with multiple compartments', 44.99, 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800', ARRAY['organization', 'eco-friendly', 'workspace']),
('Sunglasses Polarized', 'Accessories', 'UV protection polarized sunglasses with metal frame', 89.99, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800', ARRAY['fashion', 'protection', 'outdoor']),
('Portable Blender', 'Home', 'USB rechargeable portable blender for smoothies', 39.99, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800', ARRAY['kitchen', 'portable', 'healthy']),
('Resistance Bands Set', 'Sports', 'Exercise resistance bands with 5 strength levels', 29.99, 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800', ARRAY['fitness', 'home workout', 'strength']);