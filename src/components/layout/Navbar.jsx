import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Map, Search, User, Shield, Users, LogOut,
  Plus, Menu, X, AlertTriangle, Moon, Sun, ShieldCheck
} from 'lucide-react';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile, isAdmin, canModerate, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { label: t('nav.home'),     path: '/',         icon: Home },
    { label: t('nav.browse'),   path: '/browse',   icon: Search },
    { label: t('nav.map'),      path: '/map',       icon: Map },
    { label: t('nav.admin'),           path: '/admin',    icon: Shield, admin: true },
    { label: t('nav.moderator'),       path: '/moderator', icon: Shield, moderate: true },
    { label: t('nav.emergency'),path: '/emergency', icon: AlertTriangle },
    { label: t('nav.profile'),  path: '/profile',   icon: User,   auth: true },
  ].filter(link => {
    if (link.auth && !currentUser) return false;
    if (link.moderate && !canModerate) return false;
    if (link.admin && !isAdmin) return false;
    return true;
  });

  useEffect(() => {
    document.documentElement.dir = i18n.dir();
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const navStyle = {
    position: 'sticky',
    top: '0',
    zIndex: 1000,
    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
  };

  const innerStyle = {
    margin: '0 auto',
    maxWidth: '1200px',
    padding: '0 1.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '68px',
  };

  return (
    <header style={navStyle}>
      <div style={{
        background: scrolled
          ? 'var(--glass-bg)'
          : 'var(--glass-bg)',
        backdropFilter: 'blur(18px) saturate(180%)',
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
        borderBottom: '1px solid var(--clr-border)',
        boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <nav style={innerStyle}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexShrink: 0 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              boxShadow: 'var(--shadow-glow)',
            }}>
              <ShieldCheck size={20} color="white" strokeWidth={2.5} />
            </div>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.45rem',
              letterSpacing: '-0.04em',
              color: 'var(--clr-text)',
            }}>
              Safe<span style={{ color: 'var(--clr-primary)' }}>Zone</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {navLinks.map(({ label, path, icon: Icon }) => {
              const active = isActive(path);
              return (
                <Link
                  key={path}
                  to={path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--r-md)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.9rem',
                    color: active ? 'var(--clr-primary)' : 'var(--clr-text-light)',
                    background: active ? 'var(--clr-primary-ultra)' : 'transparent',
                    transition: 'var(--trans-sm)',
                  }}
                >
                  {label === t('nav.profile') && userProfile?.photoURL ? (
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'hidden' }}>
                      <img src={userProfile.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                  )}
                  {label}
                </Link>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.4rem', color: 'var(--clr-text-light)' }}
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <div style={{ width: '1px', height: '20px', background: 'var(--clr-border)', margin: '0 0.25rem' }} />

            {currentUser ? (
              <>
                <Link to="/report" className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
                  <Plus size={15} strokeWidth={2.5} />
                  {t('nav.report')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--clr-text-light)', gap: '0.4rem' }}
                >
                  <LogOut size={14} />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                {t('nav.login')}
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="btn btn-ghost btn-sm"
            style={{ display: 'none', padding: '0.4rem' }}
            onClick={() => setMobileOpen(prev => !prev)}
            id="mobile-menu-btn"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div style={{
            padding: '1rem 1.25rem 1.5rem',
            borderTop: '1px solid var(--clr-border)',
            background: 'var(--clr-surface)',
            animation: 'slideDown 0.25s var(--ease)',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {navLinks.map(({ label, path, icon: Icon }) => {
                const active = isActive(path);
                return (
                  <Link
                    key={path}
                    to={path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--r-md)',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.95rem',
                      color: active ? 'var(--clr-primary)' : 'var(--clr-text)',
                      background: active ? 'var(--clr-primary-ultra)' : 'transparent',
                    }}
                  >
                    <Icon size={17} />
                    {label}
                  </Link>
                );
              })}
              <hr style={{ margin: '0.5rem 0', borderColor: 'var(--clr-border)' }} />
              {currentUser ? (
                <>
                  <Link to="/report" className="btn btn-primary" style={{ marginBottom: '0.5rem' }}>
                    <Plus size={16} /> {t('nav.report')}
                  </Link>
                  <button onClick={handleLogout} className="btn btn-outline" style={{ gap: '0.5rem' }}>
                    <LogOut size={15} /> {t('nav.logout')}
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn btn-primary">{t('nav.login')}</Link>
              )}
              <hr style={{ margin: '0.5rem 0', borderColor: 'var(--clr-border)' }} />
              <button 
                onClick={toggleTheme} 
                className="btn btn-outline" 
                style={{ width: '100%', gap: '0.5rem' }}
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile button visibility fix */}
      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
