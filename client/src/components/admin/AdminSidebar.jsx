import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  FolderTree,
  Users,
  ShoppingBag,
  Shield,
  ArrowLeft,
  Cake
} from 'lucide-react';

const AdminSidebar = ({ pendingCount = 0 }) => {
  const navItems = [
    {
      to: '/admin/dashboard',
      label: 'Overview',
      icon: LayoutDashboard
    },
    {
      to: '/admin/sellers',
      label: 'Seller Approvals',
      icon: UserCheck,
      badge: pendingCount > 0 ? pendingCount : null
    },
    {
      to: '/admin/categories',
      label: 'Categories',
      icon: FolderTree
    },
    {
      to: '/admin/users',
      label: 'User Directory',
      icon: Users
    },
    {
      to: '/admin/orders',
      label: 'Orders Monitor',
      icon: ShoppingBag,
      subtext: 'M4'
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-bakery-200/80 p-5 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        
        {/* Admin Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-chocolate text-base leading-tight">
              Admin Portal
            </h2>
            <span className="text-[11px] font-semibold text-amber-800 tracking-wider uppercase">
              MeethaCart Control
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-bakery-700 hover:bg-bakery-100 hover:text-chocolate'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-950">
                    {item.badge}
                  </span>
                )}
                {item.subtext && (
                  <span className="text-[10px] uppercase font-bold opacity-60">
                    {item.subtext}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Return to Marketplace */}
      <div className="pt-6 border-t border-bakery-200/60 mt-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-bakery-600 hover:text-amber-800 transition-colors px-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Marketplace</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
