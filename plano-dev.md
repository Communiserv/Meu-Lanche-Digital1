# Plano de Desenvolvimento - Meu Lanche Digital

## Etapa 1: Aprovação de Cantinas (Admin)

### 1.1 Estrutura de Dados
- Criar tabela `canteen_approvals` no Supabase
  - id (uuid)
  - canteen_id (uuid, ref: canteens)
  - user_id (uuid, ref: auth.users)
  - status (enum: pending, approved, rejected)
  - created_at (timestamp)
  - updated_at (timestamp)
  - admin_notes (text)

### 1.2 Implementação da Página de Aprovação
- Desenvolver `CanteenApprovalPage.tsx`
  - Lista de cantinas pendentes
  - Detalhes da cantina
  - Botões de aprovar/rejeitar
  - Campo para observações
  - Histórico de aprovações

### 1.3 Funcionalidades Admin
- Visualização de detalhes
- Aprovação de cantinas
- Rejeição com justificativa
- Atualização automática do status do usuário
- Notificação por email

## Etapa 2: Criação da Cantina

### 2.1 Formulário de Cadastro
- Campos necessários:
  - Nome da cantina
  - CNPJ
  - Endereço completo
  - Telefone
  - Email
  - Horário de funcionamento
  - Responsável
  - Documentos (opcional)

### 2.2 Integração com Supabase
- Criar registro na tabela `canteens`
- Vincular ao perfil do usuário
- Definir status inicial
- Upload de documentos (opcional)

### 2.3 Validações
- CNPJ válido
- Campos obrigatórios
- Formato de email
- Formato de telefone
- Horários válidos

## Etapa 3: Gerenciamento de Produtos

### 3.1 Correções Técnicas
- Corrigir erros de tipagem no `ProductManagementPage.tsx`
- Ajustar queries do Supabase
- Implementar tratamento de erros

### 3.2 CRUD de Produtos
- Criar produto
  - Nome
  - Descrição
  - Preço
  - Imagem
  - Disponibilidade
  - Categoria (opcional)
- Listar produtos
  - Filtros
  - Ordenação
  - Paginação
- Atualizar produto
  - Edição de todos os campos
  - Histórico de alterações
- Excluir produto
  - Confirmação
  - Soft delete

### 3.3 Funcionalidades Adicionais
- Upload de imagens
  - Preview
  - Redimensionamento
  - Validação de formato
- Categorização
  - Categorias predefinidas
  - Subcategorias
- Controle de estoque (opcional)
- Promoções
  - Preço promocional
  - Período de validade

## Etapa 4: Melhorias na Interface

### 4.1 Feedback Visual
- Loading states
- Mensagens de sucesso/erro
- Confirmações de ações
- Tooltips informativos

### 4.2 Validações
- Validação em tempo real
- Mensagens de erro claras
- Prevenção de dados inválidos

### 4.3 UX/UI
- Design responsivo
- Animações suaves
- Acessibilidade
- Temas claro/escuro

## Etapa 5: Testes e Validações

### 5.1 Testes de Integração
- Fluxo completo de aprovação
- Cadastro de cantina
- CRUD de produtos
- Upload de imagens

### 5.2 Validações de Segurança
- Permissões de usuário
- Proteção de rotas
- Validação de dados
- Sanitização de inputs

### 5.3 Testes de Usabilidade
- Fluxos principais
- Casos de erro
- Responsividade
- Performance

## Próximos Passos

1. Criar branch `feature/canteen-management`
2. Implementar estrutura de dados no Supabase
3. Desenvolver página de aprovação de cantinas
4. Implementar formulário de cadastro de cantina
5. Corrigir e implementar gerenciamento de produtos
6. Realizar testes e ajustes
7. Fazer merge com `dev`

## Observações

- Manter documentação atualizada
- Seguir padrões de código
- Realizar commits atômicos
- Criar PRs com descrição detalhada
- Testar todas as funcionalidades antes do merge 