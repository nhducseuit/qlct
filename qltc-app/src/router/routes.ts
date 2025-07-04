import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true }, // Protect all routes under MainLayout
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'categories',
        name: 'categoriesManagement',
        component: () => import('pages/CategoriesPage.vue'),
      },
      {
        path: 'transactions',
        name: 'Transactions',
        component: () => import('pages/TransactionsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'quick-entry',
        name: 'QuickEntry',
        component: () => import('components/Transaction/QuickEntryForm.vue'), // Corrected path if it's a component
        meta: { requiresAuth: true },
      },
      {
        path: 'members',
        name: 'HouseholdMembers',
        component: () => import('pages/HouseholdMembersPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('pages/ReportsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'settlements',
        name: 'Settlements',
        component: () => import('pages/SettlementsPage.vue'),
        meta: { requiresAuth: true, title: 'Cân đối & Thanh toán', icon: 'sym_o_account_balance' },
      },
    ],
  },

  // Auth Layout for Login/Register
  {
    path: '/', // Use a common path prefix if desired, or keep them separate
    component: () => import('layouts/AuthLayout.vue'), // Use the new AuthLayout
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
        meta: { requiresGuest: true }, // Redirect if already logged in
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('pages/RegisterPage.vue'),
        meta: { requiresGuest: true }, // Redirect if already logged in
      },
    ]
  },

  // Auth routes should be outside the MainLayout if they have a different layout
  // or no layout (like a centered login form).

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
