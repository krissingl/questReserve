import { createBrowserRouter } from 'react-router-dom'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { ProviderLayout } from '@/layouts/ProviderLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AlreadyAuthRedirect } from '@/layouts/AlreadyAuthRedirect'
import { CustomerHome } from '@/pages/CustomerHome'
import { ProviderHome } from '@/pages/ProviderHome'
import { AdminHome } from '@/pages/AdminHome'
import { LoginPage } from '@/pages/LoginPage'
import { HomePage } from '@/pages/HomePage'
import { CustomerLogin } from '@/pages/CustomerLogin/CustomerLogin'
import { CustomerRegister } from '@/pages/CustomerRegister/CustomerRegister'
import { ProviderLogin } from '@/pages/ProviderLogin/ProviderLogin'
import { ProviderRegister } from '@/pages/ProviderRegister/ProviderRegister'

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

  // Auth pages — publicly accessible, redirect to role root if already authenticated
  {
    path: '/customer/login',
    element: (
      <AlreadyAuthRedirect>
        <CustomerLogin />
      </AlreadyAuthRedirect>
    ),
  },
  {
    path: '/customer/register',
    element: (
      <AlreadyAuthRedirect>
        <CustomerRegister />
      </AlreadyAuthRedirect>
    ),
  },
  {
    path: '/provider/login',
    element: (
      <AlreadyAuthRedirect>
        <ProviderLogin />
      </AlreadyAuthRedirect>
    ),
  },
  {
    path: '/provider/register',
    element: (
      <AlreadyAuthRedirect>
        <ProviderRegister />
      </AlreadyAuthRedirect>
    ),
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
