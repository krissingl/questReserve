import { createBrowserRouter } from 'react-router-dom'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { ProviderLayout } from '@/layouts/ProviderLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { CustomerHome } from '@/pages/CustomerHome'
import { ProviderHome } from '@/pages/ProviderHome'
import { AdminHome } from '@/pages/AdminHome'
import { LoginPage } from '@/pages/LoginPage'
import { HomePage } from '@/pages/HomePage'

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },

  // Customer routes — guarded by CustomerLayout
  {
    path: '/customer',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: <CustomerHome />,
      },
    ],
  },

  // Provider routes — guarded by ProviderLayout
  {
    path: '/provider',
    element: <ProviderLayout />,
    children: [
      {
        index: true,
        element: <ProviderHome />,
      },
    ],
  },

  // Admin routes — guarded by AdminLayout
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminHome />,
      },
    ],
  },
])
