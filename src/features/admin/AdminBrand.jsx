import { Link } from 'react-router-dom';
export default function AdminBrand() {
  return <Link className="admin-brand" to="/" aria-label="Pantiss Foundation home"><img src="/assets/pantiss_logo.png" alt="Pantiss Foundation" width="246" height="124" /><span>Content workspace</span></Link>;
}
