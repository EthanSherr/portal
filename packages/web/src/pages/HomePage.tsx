import { Link } from "react-router-dom"

const links = [
  // './PortalCamPage',
  // './PortalXrPage',
  // './PortalZapparPage',
  // './SocketPage',
  './WebRTCPage',
  '/PortalFeed',
  '/PortalViewer'
]

export const HomePage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {links.map(link => <Link key={link} to={link}>{link}</Link>)}
    </div>
  )
}