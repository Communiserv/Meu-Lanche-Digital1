-- É recomendado não habilitar RLS na tabela auth.users.
-- Se por algum motivo o RLS estiver habilitado, pode ser desabilitado com:
-- ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
-- Mas geralmente esta linha NÃO é necessária em scripts de migração padrão.

-- Create user_profiles table
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('canteen', 'parent', 'student', 'admin')),
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    parent_id UUID REFERENCES public.user_profiles(id),
    canteen_id UUID,
    student_id UUID
);

-- Adicione índice no role para buscas rápidas
CREATE INDEX user_profiles_role_idx ON public.user_profiles (role);

-- Create canteens table
CREATE TABLE public.canteens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add foreign key constraint for canteen_id in user_profiles
ALTER TABLE public.user_profiles
    ADD CONSTRAINT fk_canteen
    FOREIGN KEY (canteen_id)
    REFERENCES public.canteens(id);

-- Create students table
CREATE TABLE public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    canteen_id UUID NOT NULL REFERENCES public.canteens(id),
    full_name TEXT NOT NULL,
    nickname TEXT,
    photo_url TEXT,
    qr_code_value TEXT UNIQUE NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
    daily_limit DECIMAL(10,2) CHECK (daily_limit >= 0 OR daily_limit IS NULL),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add foreign key constraint for student_id in user_profiles
ALTER TABLE public.user_profiles
    ADD CONSTRAINT fk_student
    FOREIGN KEY (student_id)
    REFERENCES public.students(id);

-- Create products table
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    canteen_id UUID NOT NULL REFERENCES public.canteens(id),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    available BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Adicionar índice para busca de produtos por cantina
CREATE INDEX products_canteen_id_idx ON public.products (canteen_id);

-- Create orders table
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id),
    canteen_id UUID NOT NULL REFERENCES public.canteens(id),
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'canceled')),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Adicionar índices para buscas rápidas
CREATE INDEX orders_student_id_idx ON public.orders (student_id);
CREATE INDEX orders_canteen_id_idx ON public.orders (canteen_id);
CREATE INDEX orders_status_idx ON public.orders (status);
CREATE INDEX orders_order_date_idx ON public.orders (order_date);

-- Create transactions table
CREATE TABLE public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id),
    parent_id UUID REFERENCES public.user_profiles(id),
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    method TEXT NOT NULL CHECK (method IN ('pix', 'cash', 'card', 'cashless')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Adicionar índices para buscas rápidas
CREATE INDEX transactions_student_id_idx ON public.transactions (student_id);
CREATE INDEX transactions_parent_id_idx ON public.transactions (parent_id);
CREATE INDEX transactions_type_idx ON public.transactions (type);
CREATE INDEX transactions_status_idx ON public.transactions (status);
CREATE INDEX transactions_created_at_idx ON public.transactions (created_at);

-- Enable Row Level Security on all public tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canteens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id OR auth.uid() = parent_id);

CREATE POLICY "Users can update their own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create policies for canteens
CREATE POLICY "Anyone can view canteens"
    ON public.canteens FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only admins can insert canteens"
    ON public.canteens FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for students
CREATE POLICY "Parents can view their students"
    ON public.students FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND (id = parent_id OR role = 'admin')
        )
    );

-- Create policies for products
CREATE POLICY "Anyone can view products"
    ON public.products FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Canteen staff can manage their products"
    ON public.products FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND (canteen_id = products.canteen_id OR role = 'admin')
        )
    );

-- Create policies for orders
CREATE POLICY "Students can view their orders"
    ON public.orders FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.students
            WHERE id = orders.student_id AND parent_id = auth.uid()
        )
    );

-- Create policies for transactions
CREATE POLICY "Parents can view their children's transactions"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.students
            WHERE id = transactions.student_id AND parent_id = auth.uid()
        )
    );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = new.id) THEN
        INSERT INTO public.user_profiles (id, email, role, full_name)
        VALUES (
            new.id,
            new.email,
            COALESCE(new.raw_user_meta_data->>'role', 'parent')::TEXT,
            new.raw_user_meta_data->>'full_name'
        );
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Check if the trigger exists
SELECT tgname FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass;