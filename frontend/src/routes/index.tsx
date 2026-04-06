import Main from '@/components/layout/Main';
import NotFound from '@/components/layout/NotFound';
import Common from '@/components/layout/Common';
import { createBrowserRouter } from 'react-router';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import PermissionRoute from '@/components/layout/PermissionRoute';
import Signin from '@/pages/Signin';
import Test from '@/pages/Test';

export default createBrowserRouter([
  {
    path: '/',
    element: <Main />,
    errorElement: <Main />,
    children: [
      // Handle Common Pages doesent require any authentication
      {
        path: '/',
        element: <Common />,
        children: [
          {
            index: true,
            element: <Home />,
          },
        ],
      },
      // Handle Pages that require authentication
      {
        path: '/dashboard',
        element: <Dashboard />,
        errorElement: <Dashboard />,
        children: [
          {
            path: 'admin-only',
            element: <PermissionRoute roles={['admin']}>Admin Users only</PermissionRoute>,
          },
          {
            path: 'anyone',
            element: <Test />,
          },
        ],
      },
      // Handle Pages that only unauthenticated users can access like sign in and sign up
      {
        path: '/sign-in',
        element: <Signin />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
