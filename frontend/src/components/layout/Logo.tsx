import { Link } from 'react-router';
import logo from '@/assets/logo.svg';

export default function Logo({ className }: { className?: string }) {
  return (
    <Link to='/'>
      <img className={`w-auto h-10 object-contain ${className}`} src={logo} alt='logo' />
    </Link>
  );
}
