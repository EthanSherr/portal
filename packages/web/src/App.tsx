import { FC } from "react"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import { HomePage } from "./pages/HomePage"
import { PortalCamPage } from "./pages/PortalCamPage"
import { PortalXrPage } from "./pages/PortalXrPage"
import { PortalZapparPage } from "./pages/PortalZapparPage"
import { SocketPage } from "./pages/SocketPage"
import { WebRTCPage } from "./pages/WebRTCPage"
import { PortalFeed } from "./pages/PortalFeed"
import { PortalViewer } from "./pages/PortalViewer"

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
}, {
  path: '/WebRTCPage',
  element: <WebRTCPage />
}, {
  path: '/PortalFeed',
  element: <PortalFeed />
}, {
  path: '/PortalViewer/:cameraId',
  element: <PortalViewer />
}])

export const App: FC = () =>
  <RouterProvider router={router} />
