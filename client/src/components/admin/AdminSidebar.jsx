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
  BarChart3,
  TrendingUp
} from 'lucide-react';

import Logo from '../common/Logo';

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
      to: '/admin/analytics',
      label: 'Sales Analytics',
      icon: BarChart3,
      soon: true
    },
    {
      to: '/admin/demand-forecasting',
      label: 'Demand Forecast',
      icon: TrendingUp,
      soon: true
    },
    {
      to: '/admin/orders',
      label: 'Orders Monitor',
      icon: ShoppingBag,
      soon: true
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-bakery-200/80 p-5 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        
        {/* Brand Header */}
        <div className="px-2 pb-4 border-b border-bakery-200">
          <Logo variant="dark" size="sm" to="/" />
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-caramel uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Control Center</span>
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
                {item.soon && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                    Soon
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
