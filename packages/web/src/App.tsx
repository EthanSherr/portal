import { FC } from "react"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import { HomePage } from "./pages/HomePage"

import { PortalFeed } from "./pages/PortalFeed"
import { PortalViewer } from "./pages/PortalViewer"

const router = createBrowserRouter([{
  path: '/',
  element: <HomePage />
}, {
  path: '/PortalFeed',
  element: <PortalFeed />
}, {
  path: '/PortalViewer/:cameraId',
  element: <PortalViewer />
}])

export const App: FC = () =>
  <RouterProvider router={router} />
