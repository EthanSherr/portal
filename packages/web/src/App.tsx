import { FC } from "react"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import { HomePage } from "./pages/HomePage"
import { PortalCamPage } from "./pages/PortalCamPage"
import { PortalXrPage } from "./pages/PortalXrPage"
import { PortalZapparPage } from "./pages/PortalZapparPage"
import { SocketPage } from "./pages/SocketPage"

const router = createBrowserRouter([{
  path: '/',
  element: <HomePage />
}, {
  path: '/PortalCamPage',
  element: <PortalCamPage />
}, {
  path: '/PortalXrPage',
  element: <PortalXrPage />
}, {
  path: '/PortalZapparPage',
  element: <PortalZapparPage />
}, {
  path: '/SocketPage',
  element: <SocketPage />
}])

export const App: FC = () =>
  <RouterProvider router={router} />
