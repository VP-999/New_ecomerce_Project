-- Create Products Table
-- Note: PostgreSQL converts unquoted identifiers to lowercase
-- So imageUrl becomes imageurl in the database
-- imageurl is TEXT to support both URLs and base64 data URLs
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  imageurl TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_address TEXT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products RLS Policies
CREATE POLICY "Allow public read access to products"
ON products FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Allow public insert products"
ON products FOR INSERT
TO PUBLIC
WITH CHECK (true);

CREATE POLICY "Allow public update products"
ON products FOR UPDATE
TO PUBLIC
USING (true);

CREATE POLICY "Allow public delete products"
ON products FOR DELETE
TO PUBLIC
USING (true);

-- Orders RLS Policies
CREATE POLICY "Allow public read access to orders"
ON orders FOR SELECT
TO PUBLIC
USING (true);

CREATE POLICY "Allow public insert orders"
ON orders FOR INSERT
TO PUBLIC
WITH CHECK (true);

CREATE POLICY "Allow public update orders"
ON orders FOR UPDATE
TO PUBLIC
USING (true);

-- Order Items RLS Policies
CREATE POLICY "Allow public insert order_items"
ON order_items FOR INSERT
TO PUBLIC
WITH CHECK (true);

CREATE POLICY "Allow public read order_items"
ON order_items FOR SELECT
TO PUBLIC
USING (true);

-- Insert Sample Products
INSERT INTO products (name, description, price, category, imageurl) VALUES
('Classic T-Shirt', 'Comfortable and stylish classic t-shirt', 29.99, 'Men', 'https://cdn.pixabay.com/photo/2023/05/30/23/17/t-shirt-8027987_640.jpg'),
('Elegant Dress', 'Perfect for any occasion', 59.99, 'Women', 'https://cdn.pixabay.com/photo/2023/09/01/17/16/dress-8224717_640.jpg'),
('Designer Sunglasses', 'UV protection and stylish design', 89.99, 'Accessories', 'https://cdn.pixabay.com/photo/2017/01/04/15/38/sunglasses-1951652_640.jpg'),
('Premium Jacket', 'Stylish winter jacket', 129.99, 'Men', 'https://cdn.pixabay.com/photo/2016/12/11/17/38/clothing-1899161_640.jpg'),
('Casual Sneakers', 'Comfortable everyday shoes', 79.99, 'Accessories', 'https://cdn.pixabay.com/photo/2023/04/21/09/15/shoe-7941046_640.jpg')
ON CONFLICT DO NOTHING;
