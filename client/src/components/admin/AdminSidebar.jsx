import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  UserCheck,
  FolderTree,
  Users,
  Shield,
  ArrowLeft
} from 'lucide-react';
import Logo from '../common/Logo';
import ThemePicker from '../common/ThemePicker';
import { slideInLeft, buttonTap } from '../../animations/motion';

const AdminSidebar = ({ pendingCount = 0 }) => {
  // Built features only; "Soon" placeholder routes removed from navigation as requested
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
    }
  ];

  return (
    <motion.aside
      variants={slideInLeft}
      initial="hidden"
      animate="visible"
      className="w-full md:w-64 border-r p-5 flex flex-col justify-between shrink-0 shadow-xs"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRightWidth: 'var(--border-width)'
      }}
    >
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-2 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <Logo variant="dark" size={32} wordmarkText="Admin" to="/admin/dashboard" />
            <ThemePicker />
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-primary)' }}>
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
                  `relative flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 ${
                    isActive
                      ? 'shadow-xs font-bold'
                      : 'hover:bg-bakery-100 text-bakery-700'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? 'var(--color-on-primary)' : 'var(--color-text)',
                  borderRadius: 'var(--radius-md)'
                })}
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 relative z-10">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <motion.span
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.9, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2.2 }}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-amber-950 border border-amber-300 shadow-2xs"
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Return to Marketplace Footer */}
      <div className="pt-4 border-t mt-6" style={{ borderColor: 'var(--color-border)' }}>
        <motion.div whileHover={{ x: -2 }} whileTap={buttonTap}>
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Marketplace</span>
          </Link>
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
