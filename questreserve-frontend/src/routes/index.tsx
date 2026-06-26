import { createBrowserRouter, Navigate } from 'react-router-dom'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { GuestLayout } from '@/layouts/GuestLayout'
import { ProviderLayout } from '@/layouts/ProviderLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AlreadyAuthRedirect } from '@/layouts/AlreadyAuthRedirect'
import { AdminHome } from '@/pages/AdminHome'
import { LoginPage } from '@/pages/LoginPage'
import { CustomerLogin } from '@/pages/CustomerLogin/CustomerLogin'
import { CustomerRegister } from '@/pages/CustomerRegister/CustomerRegister'
import { ProviderLogin } from '@/pages/ProviderLogin/ProviderLogin'
import { ProviderRegister } from '@/pages/ProviderRegister/ProviderRegister'
import { BrowseLocations } from '@/pages/BrowseLocations/BrowseLocations'
import { LocationDetail } from '@/pages/LocationDetail/LocationDetail'
import { MyBookings } from '@/pages/MyBookings/MyBookings'
import { CustomerSettings } from '@/pages/CustomerSettings/CustomerSettings'
import { CustomerMessages } from '@/pages/CustomerMessages/CustomerMessages'
import { PaymentStub } from '@/pages/PaymentStub/PaymentStub'
import { About } from '@/pages/About/About'
import { ProviderDashboard } from '@/pages/ProviderDashboard/ProviderDashboard'
import { ProviderLocationNew } from '@/pages/ProviderLocationNew/ProviderLocationNew'
import { ProviderLocationDetail } from '@/pages/ProviderLocationDetail/ProviderLocationDetail'
import { ProviderLocationEdit } from '@/pages/ProviderLocationEdit/ProviderLocationEdit'
import { ProviderAdventures } from '@/pages/ProviderAdventures/ProviderAdventures'
import { ProviderBookings } from '@/pages/ProviderBookings/ProviderBookings'
import { ProviderAccount } from '@/pages/ProviderAccount/ProviderAccount'
import { PublicProviderProfile } from '@/pages/PublicProviderProfile/PublicProviderProfile'
import { ProviderCustomerProfile } from '@/pages/ProviderCustomerProfile/ProviderCustomerProfile'
import { CustomerMessageThread } from '@/pages/CustomerMessageThread/CustomerMessageThread'
import { ProviderMessageThread } from '@/pages/ProviderMessageThread/ProviderMessageThread'
import { RouteErrorPage } from '@/pages/RouteErrorPage/RouteErrorPage'
import { AdminLogin } from '@/pages/AdminLogin/AdminLogin'
import { AdminProviders } from '@/pages/AdminProviders/AdminProviders'
import { AdminProviderDetail } from '@/pages/AdminProviderDetail/AdminProviderDetail'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/locations" replace />,
    errorElement: <RouteErrorPage />,
  },
  {
    path: '/locations',
    element: <GuestLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: <BrowseLocations />,
      },
      {
        path: ':id',
        element: <LocationDetail />,
      },
    ],
  },
  {
    path: '/about',
    element: <GuestLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: <About />,
      },
    ],
  },
  {
    path: '/providers/:providerId/profile',
    element: <GuestLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: <PublicProviderProfile />,
      },
    ],
  },
  {
    path: '/login',
    element: (
      <AlreadyAuthRedirect>
        <LoginPage />
      </AlreadyAuthRedirect>
    ),
    errorElement: <RouteErrorPage />,
  },
  {
    path: '/customer/login',
    element: (
      <AlreadyAuthRedirect pageRole="customer">
        <CustomerLogin />
      </AlreadyAuthRedirect>
    ),
    errorElement: <RouteErrorPage />,
  },
  {
    path: '/customer/register',
    element: (
      <AlreadyAuthRedirect pageRole="customer">
        <CustomerRegister />
      </AlreadyAuthRedirect>
    ),
    errorElement: <RouteErrorPage />,
  },
  {
    path: '/provider/login',
    element: (
      <AlreadyAuthRedirect pageRole="provider">
        <ProviderLogin />
      </AlreadyAuthRedirect>
    ),
    errorElement: <RouteErrorPage />,
  },
  {
    path: '/provider/register',
    element: (
      <AlreadyAuthRedirect pageRole="provider">
        <ProviderRegister />
      </AlreadyAuthRedirect>
    ),
    errorElement: <RouteErrorPage />,
  },
  {
    path: '/customer',
    element: <CustomerLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/locations" replace />,
      },
      {
        path: 'bookings',
        element: <MyBookings />,
      },
      {
        path: 'messages',
        element: <CustomerMessages />,
      },
      {
        path: 'messages/:bookingId',
        element: <CustomerMessageThread />,
      },
      {
        path: 'settings',
        element: <CustomerSettings />,
      },
      {
        path: 'payment',
        element: <PaymentStub />,
      },
    ],
  },
  {
    path: '/provider',
    element: <ProviderLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/provider/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <ProviderDashboard />,
      },
      {
        path: 'adventures',
        element: <ProviderAdventures />,
      },
      {
        path: 'locations/new',
        element: <ProviderLocationNew />,
      },
      {
        path: 'locations/:id',
        element: <ProviderLocationDetail />,
      },
      {
        path: 'locations/:id/edit',
        element: <ProviderLocationEdit />,
      },
      {
        path: 'bookings',
        element: <ProviderBookings />,
      },
      {
        path: 'account',
        element: <ProviderAccount />,
      },
      {
        path: 'customers/:customerId',
        element: <ProviderCustomerProfile />,
      },
      {
        path: 'messages/:bookingId',
        element: <ProviderMessageThread />,
      },
    ],
  },
  {
    path: '/admin/login',
    element: (
      <AlreadyAuthRedirect pageRole="admin">
        <AdminLogin />
      </AlreadyAuthRedirect>
    ),
    errorElement: <RouteErrorPage />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: <AdminHome />,
      },
      {
        path: 'providers',
        element: <AdminProviders />,
      },
      {
        path: 'providers/:id',
        element: <AdminProviderDetail />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/locations" replace />,
  },
])
