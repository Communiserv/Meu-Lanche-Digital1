# Estrutura do Projeto

## Visão Geral

O Meu Lanche Digital é uma aplicação web moderna construída com React, TypeScript e Tailwind CSS. A estrutura do projeto segue as melhores práticas de organização de código e separação de responsabilidades.

## Estrutura de Diretórios

```
meu-lanche-digital/
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   ├── ui/           # Componentes de UI básicos
│   │   └── layout/       # Componentes de layout
│   ├── contexts/         # Contextos React
│   ├── lib/             # Utilitários e configurações
│   ├── pages/           # Páginas da aplicação
│   │   ├── admin/       # Páginas do administrador
│   │   ├── auth/        # Páginas de autenticação
│   │   ├── canteen/     # Páginas da cantina
│   │   ├── parent/      # Páginas dos pais
│   │   └── student/     # Páginas dos alunos
│   ├── routes/          # Configuração de rotas
│   ├── styles/          # Estilos globais
│   └── types/           # Definições de tipos TypeScript
├── public/              # Arquivos estáticos
├── docs/               # Documentação
└── tests/              # Testes
```

## Descrição dos Diretórios

### `src/components/`
- `ui/`: Componentes básicos como botões, inputs, cards
- `layout/`: Componentes de layout como header, footer, sidebar

### `src/contexts/`
Contextos React para gerenciamento de estado global, como:
- Autenticação
- Tema
- Configurações do usuário

### `src/lib/`
Utilitários e configurações:
- Cliente Supabase
- Helpers
- Configurações de ambiente

### `src/pages/`
Páginas organizadas por tipo de usuário:
- `admin/`: Gerenciamento do sistema
- `auth/`: Login, registro, recuperação de senha
- `canteen/`: Gestão da cantina
- `parent/`: Área dos pais
- `student/`: Área dos alunos

### `src/routes/`
Configuração de rotas e proteção de rotas

### `src/styles/`
Estilos globais e configuração do Tailwind

### `src/types/`
Definições de tipos TypeScript

## Padrões de Nomenclatura

- **Arquivos**: kebab-case (ex: `user-profile.tsx`)
- **Componentes**: PascalCase (ex: `UserProfile.tsx`)
- **Funções**: camelCase (ex: `getUserData`)
- **Tipos/Interfaces**: PascalCase (ex: `UserProfile`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `MAX_RETRY_COUNT`)

## Convenções de Importação

```typescript
// Importações de bibliotecas externas
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Importações internas (usando aliases)
import { Button } from '@components/ui/Button';
import { useAuth } from '@contexts/AuthContext';
import { UserProfile } from '@types/types';
```

## Configuração de Aliases

O projeto usa aliases para importações mais limpas:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@contexts/*": ["src/contexts/*"],
      "@lib/*": ["src/lib/*"],
      "@pages/*": ["src/pages/*"],
      "@styles/*": ["src/styles/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
``` 