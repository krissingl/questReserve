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
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: (
      <AlreadyAuthRedirect>
        <LoginPage />
      </AlreadyAuthRedirect>
    ),
  },
  {
    path: '/customer/login',
    element: (
      <AlreadyAuthRedirect pageRole="customer">
        <CustomerLogin />
      </AlreadyAuthRedirect>
    ),
  },
  {
    path: '/customer/register',
    element: (
      <AlreadyAuthRedirect pageRole="customer">
        <CustomerRegister />
      </AlreadyAuthRedirect>
    ),
  },
  {
    path: '/provider/login',
    element: (
      <AlreadyAuthRedirect pageRole="provider">
        <ProviderLogin />
      </AlreadyAuthRedirect>
    ),
  },
  {
    path: '/provider/register',
    element: (
      <AlreadyAuthRedirect pageRole="provider">
        <ProviderRegister />
      </AlreadyAuthRedirect>
    ),
  },
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
