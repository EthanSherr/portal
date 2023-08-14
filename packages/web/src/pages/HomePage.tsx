import { Link } from "react-router-dom"

const links = [
  './PortalCamPage',
  './PortalXrPage',
  './PortalZapparPage',
  './SocketPage',
  './WebRTCPage'
]

export const HomePage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {links.map(link => <Link key={link} to={link}>{link}</Link>)}
    </div>
  )
}