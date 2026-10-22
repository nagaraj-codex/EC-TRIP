import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Icons } from './Icons';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { useAuthStore } from '../../store/slices/authStore';
import { apiClient } from '../../services/apiClient';

export const Header: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, sessionType, logout } = useAuthStore();
  const isSignedIn = sessionType === 'authenticated';

  const navLinks = [
    { href: '/app/explore', label: 'Parks' },
    { href: '/app/home', label: 'Forecast' },
    { href: '/app/plan', label: 'Planner' },
    { href: '/app/compare', label: 'FastTrack' },
    { href: '/app/trips', label: 'Trips' },
    { href: '/verify', label: 'Verify' },
  ];

  const handleLogout = async () => {
    try {
      await apiClient.logout();
    } catch (e) {}
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-100 h-14 md:h-16 bg-(--qc-surface) border-b border-(--qc-border) w-full">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-(--qc-primary) text-white px-4 py-2 z-200 rounded-(--qc-radius-button) font-medium">
        Skip to content
      </a>
      
      <div className="max-w-300 w-full mx-auto px-4 md:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link to="/" className="text-[20px] font-bold text-(--qc-primary) tracking-tight focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--qc-focus) rounded-xs">
            QueueCut
          </Link>
          
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.href);
              return (
                <Link 
                  key={link.href} 
                  to={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3 h-10 flex items-center text-[14px] font-medium rounded-(--qc-radius-button) transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--qc-focus)
                    ${isActive ? 'text-(--qc-primary) bg-(--qc-primary-bg)' : 'text-(--qc-ink-2) hover:text-(--qc-ink) hover:bg-(--qc-bg)'}
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 relative">
          {isSignedIn ? (
            <div>
              <button 
                className="focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--qc-focus) rounded-full block"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                aria-expanded={isAccountMenuOpen}
              >
                <Avatar name={user?.name || 'User'} />
              </button>
              {isAccountMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-(--qc-surface) border border-(--qc-border) rounded-(--qc-radius-card) shadow-(--qc-shadow-card) py-1 z-200">
                  <div className="px-4 py-2 border-b border-(--qc-border) truncate">
                    <p className="text-[14px] font-medium text-(--qc-ink) truncate">{user?.name}</p>
                    <p className="text-[12px] text-(--qc-muted) truncate">{user?.email}</p>
                  </div>
                  <Link to="/app/profile" className="block px-4 py-2 text-[14px] text-(--qc-ink-2) hover:text-(--qc-ink) hover:bg-(--qc-bg)" onClick={() => setIsAccountMenuOpen(false)}>Profile</Link>
                  <Link to="/app/settings" className="block px-4 py-2 text-[14px] text-(--qc-ink-2) hover:text-(--qc-ink) hover:bg-(--qc-bg)" onClick={() => setIsAccountMenuOpen(false)}>Settings</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-[14px] text-(--qc-danger) hover:bg-(--qc-danger-bg)">Log out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hidden md:block focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--qc-focus) rounded-(--qc-radius-button)">
              <Button variant="ghost">Log in</Button>
            </Link>
          )}
          
          <button 
            className="md:hidden p-2 -mr-2 text-(--qc-ink) focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--qc-focus) rounded-xs"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={isDrawerOpen}
          >
            <Icons.Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-300 md:hidden">
          <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-xs" onClick={() => setIsDrawerOpen(false)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" aria-label="Navigation Menu" className="absolute top-0 right-0 bottom-0 w-70 bg-(--qc-surface) shadow-(--qc-shadow-raised) flex flex-col focus-visible:outline-hidden">
            <div className="flex items-center justify-between p-4 border-b border-(--qc-border)">
              <span className="text-[18px] font-bold text-(--qc-primary)">QueueCut</span>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close menu"
                className="p-2 -mr-2 text-(--qc-muted) hover:text-(--qc-ink) rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--qc-focus)"
              >
                <Icons.X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 flex flex-col">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.href);
                return (
                  <Link 
                    key={link.href} 
                    to={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`px-6 py-4 text-[16px] font-medium border-b border-(--qc-border)/50 focus-visible:outline-hidden focus-visible:bg-(--qc-bg)
                      ${isActive ? 'text-(--qc-primary) bg-(--qc-primary-bg)' : 'text-(--qc-ink)'}
                    `}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-(--qc-border)">
              {!isSignedIn ? (
                <Link to="/login" className="block w-full">
                  <Button fullWidth>Log in</Button>
                </Link>
              ) : (
                <Button variant="ghost" fullWidth onClick={handleLogout}>Log out</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
