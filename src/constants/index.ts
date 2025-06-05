export const APP_NAME = 'Meu Lanche Digital';

export const ROLES = {
  ADMIN: 'admin',
  CANTEEN: 'canteen',
  PARENT: 'parent',
  STUDENT: 'student',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
} as const;

export const TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
} as const;

export const TRANSACTION_METHODS = {
  PIX: 'pix',
  CASH: 'cash',
  CARD: 'card',
  CASHLESS: 'cashless',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
  
  // Parent routes
  PARENT_DASHBOARD: '/parent/dashboard',
  PARENT_CREDLANCHE: '/parent/credlanche',
  PARENT_MANAGE_CHILDREN: '/parent/manage-children',
  PARENT_MENU: '/parent/menu',
  PARENT_CONSUMPTION: '/parent/consumption',
  
  // Student routes
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_MENU: '/student/menu',
  STUDENT_CONSUMPTION: '/student/consumption',
  
  // Canteen routes
  CANTEEN_DASHBOARD: '/canteen/dashboard',
  CANTEEN_SCAN: '/canteen/scan',
  CANTEEN_STUDENTS: '/canteen/students',
  CANTEEN_PRODUCTS: '/canteen/products',
  CANTEEN_REPORTS: '/canteen/reports',
  
  // Admin routes
  ADMIN_CANTEENS: '/admin/canteens',
} as const;

export const NAV_ITEMS = {
  PUBLIC: [
    { to: ROUTES.LOGIN, label: 'Entrar', icon: '🔑' },
    { to: ROUTES.REGISTER, label: 'Registrar', icon: '📝' },
  ],
  PARENT: [
    { to: ROUTES.PARENT_DASHBOARD, label: 'Dashboard', icon: '📊' },
    { to: ROUTES.PARENT_CREDLANCHE, label: 'CredLanche', icon: '💳' },
    { to: ROUTES.PARENT_MANAGE_CHILDREN, label: 'Meus Filhos', icon: '👨‍👩‍👧‍👦' },
    { to: ROUTES.PARENT_MENU, label: 'Cardápio', icon: '🍽️' },
  ],
  STUDENT: [
    { to: ROUTES.STUDENT_DASHBOARD, label: 'Dashboard', icon: '📊' },
    { to: ROUTES.STUDENT_MENU, label: 'Cardápio', icon: '🍽️' },
    { to: ROUTES.STUDENT_CONSUMPTION, label: 'Meus Pedidos', icon: '📝' },
  ],
  CANTEEN: [
    { to: ROUTES.CANTEEN_DASHBOARD, label: 'Dashboard', icon: '📊' },
    { to: ROUTES.CANTEEN_SCAN, label: 'Escanear QR', icon: '📱' },
    { to: ROUTES.CANTEEN_STUDENTS, label: 'Alunos', icon: '👨‍🎓' },
    { to: ROUTES.CANTEEN_PRODUCTS, label: 'Produtos', icon: '🍔' },
    { to: ROUTES.CANTEEN_REPORTS, label: 'Relatórios', icon: '📈' },
  ],
  ADMIN: [
    { to: ROUTES.ADMIN_CANTEENS, label: 'Cantinas', icon: '🏫' },
  ],
} as const; 