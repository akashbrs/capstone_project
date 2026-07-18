import { NavLink, Outlet } from 'react-router-dom';
import { LayoutGrid, UtensilsCrossed, ClipboardList, BookOpenText, LogOut, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/tables', label: 'Tables', icon: UtensilsCrossed },
  { to: '/pos', label: 'New Order', icon: Ticket },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/menu', label: 'Menu', icon: BookOpenText },
];

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-ink-950">
      <aside className="w-60 shrink-0 bg-ink-900 border-r border-ink-800 flex flex-col">
        <div className="px-5 py-6 border-b border-ink-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded overflow-hidden">
              <img src="/logo.jpg" alt="Comanda Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-display text-lg tracking-wide text-paper-100 leading-none">COMANDA</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-ink-500">Table Service</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-ink-500 hover:text-paper-100 hover:bg-ink-800 border border-transparent'
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-ink-800">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm text-paper-100 font-medium truncate">{user?.fullName}</p>
            <p className="text-xs text-ink-500 uppercase tracking-wide">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-ink-500 hover:text-rust-400 hover:bg-ink-800 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <Outlet />
      </main>
    </div>
  );
}
