-- Test RLS policies for user_profiles
-- Substitua 'seu-user-id-aqui' pelo ID do usuário que está tendo problemas
SELECT auth.uid() as current_user_id;

-- Teste a política de visualização
SELECT * FROM public.user_profiles 
WHERE id = 'seu-user-id-aqui';

-- Teste a política de inserção
INSERT INTO public.user_profiles (id, email, role, full_name)
VALUES ('seu-user-id-aqui', 'test@example.com', 'parent', 'Test User')
ON CONFLICT (id) DO NOTHING
RETURNING *;

-- Verifique se o usuário existe na tabela auth.users
SELECT * FROM auth.users WHERE id = 'seu-user-id-aqui';

-- Verifique as políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Verifique as permissões do usuário
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'user_profiles'; 