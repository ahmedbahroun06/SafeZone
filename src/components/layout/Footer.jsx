import { Link } from 'react-router-dom';
import { Mail, Github, Twitter, Facebook, ExternalLink, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { label: 'Home', path: '/' },
        { label: 'Browse Issues', path: '/browse' },
        { label: 'Live Map', path: '/map' },
        { label: 'Report Issue', path: '/report' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Emergency Contacts', path: '/emergency' },
        { label: 'About Us', path: '/about' },
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' }
      ]
    }
  ];

  return (
    <footer style={{ 
      backgroundColor: 'var(--clr-navy)', 
      color: 'white', 
      padding: '5rem 0 2rem',
      marginTop: 'auto',
      borderTop: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div className="container">
        <div className="grid-4" style={{ marginBottom: '4rem', gap: '3rem' }}>
          {/* Brand Column */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link to="/" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              marginBottom: '1.5rem',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.5rem'
            }}>
              <span style={{ filter: 'drop-shadow(0 2px 4px rgba(231,0,19,0.3))' }}>🌍</span> SafeZone
            </Link>
            <p style={{ 
              color: 'rgba(255,255,255,0.6)', 
              fontSize: '0.9rem', 
              lineHeight: '1.7',
              marginBottom: '1.5rem'
            }}>
              Empowering citizens of Tunisia to build better, safer, and cleaner neighborhoods 
              through transparent urban issue reporting and real-time community engagement.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="#" style={{ color: 'rgba(255,255,255,0.6)', transition: 'var(--trans-sm)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                <Facebook size={20} />
              </a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.6)', transition: 'var(--trans-sm)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                <Twitter size={20} />
              </a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.6)', transition: 'var(--trans-sm)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--clr-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((section, i) => (
            <div key={i}>
              <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {section.title}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {section.links.map((link, j) => (
                  <li key={j}>
                    <Link to={link.path} style={{ 
                      color: 'rgba(255,255,255,0.6)', 
                      fontSize: '0.9rem',
                      transition: 'var(--trans-sm)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }} onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Column */}
          <div>
            <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Stay Updated
            </h4>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.6' }}>
              Subscribe to get news on resolved issues in your district.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="email" 
                placeholder="email@example.com" 
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: 'var(--r-md)',
                  padding: '0.6rem 1rem',
                  color: 'white',
                  fontSize: '0.85rem',
                  width: '100%'
                }} 
              />
              <button className="btn btn-primary btn-sm" style={{ padding: '0.6rem' }}>
                <Mail size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ 
          borderTop: '1px solid rgba(255,255,255,0.05)', 
          paddingTop: '2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            &copy; {currentYear} SafeZone Tunisia. All rights reserved.
          </p>
          <p style={{ 
            color: 'rgba(255,255,255,0.4)', 
            fontSize: '0.85rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem' 
          }}>
            Made with <Heart size={14} color="var(--clr-primary)" fill="var(--clr-primary)" /> for public good.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
