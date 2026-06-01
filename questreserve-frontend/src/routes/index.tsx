import { createBrowserRouter, Navigate } from 'react-router-dom'
import { CustomerLayout } from '@/layouts/CustomerLayout'
import { GuestLayout } from '@/layouts/GuestLayout'
import { ProviderLayout } from '@/layouts/ProviderLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AlreadyAuthRedirect } from '@/layouts/AlreadyAuthRedirect'
import { CustomerHome } from '@/pages/CustomerHome'
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/locations" replace />,
  },
  {
    path: '/locations',
    element: <GuestLayout />,
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
      {
        path: 'bookings',
        element: <MyBookings />,
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
  {
    path: '*',
    element: <Navigate to="/locations" replace />,
  },
])
