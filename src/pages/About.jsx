import { Info, Code, Map, Shield, Users, Target, Eye, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  const values = [
    { title: 'Transparency', desc: 'Direct visibility into how urban issues are handled by local authorities.', icon: Eye },
    { title: 'Community', desc: 'Connecting residents to work together for a better Tunisia.', icon: Users },
    { title: 'Efficiency', desc: 'Streamlining the reporting process to ensure faster resolutions.', icon: Zap }
  ];

  return (
    <div className="view">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="section-header">
          <div className="section-label">Our Mission</div>
          <h2 className="section-title">The SafeZone Vision</h2>
          <p className="section-subtitle">
            Bridging the gap between citizens and authorities to build safer, 
            cleaner, and more efficient neighborhoods across Tunisia.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium" 
          style={{ padding: '3.5rem', marginBottom: '4rem' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>About the Platform</h3>
              <p style={{ color: 'var(--clr-text-light)', lineHeight: '1.8', marginBottom: '1.25rem' }}>
                SafeZone was born from a simple idea: every citizen should have a voice in their community's 
                maintenance and safety. Our platform provides a direct, transparent channel for 
                reporting urban problems.
              </p>
              <p style={{ color: 'var(--clr-text-light)', lineHeight: '1.8' }}>
                Whether it's a pothole in Ariana, a broken streetlight in Sousse, or a sanitation 
                issue in Sfax, SafeZone ensures your report is mapped, tracked, and seen.
              </p>
            </div>
            <div style={{ background: 'var(--clr-bg-raised)', padding: '2rem', borderRadius: 'var(--r-lg)' }}>
              <h4 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Code size={18} color="var(--clr-primary)" /> Tech Stack
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { name: 'Firebase', desc: 'Secure Auth & Real-time DB' },
                  { name: 'React', desc: 'Modern UI Framework' },
                  { name: 'Framer Motion', desc: 'Smooth Animations' },
                  { name: 'Leaflet', desc: 'Interactive Geo-mapping' }
                ].map((tech, i) => (
                  <li key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{tech.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{tech.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="grid-3" style={{ marginBottom: '4rem' }}>
          {[
            { title: 'Transparency', desc: 'Public tracking of every report from submission to fix.', icon: Eye },
            { title: 'Community', desc: 'Upvote and validate issues with your neighbors.', icon: Users },
            { title: 'Accuracy', desc: 'GPS-tagged locations and photo evidence.', icon: Target }
          ].map((v, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--clr-primary-ultra)', 
                color: 'var(--clr-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <v.icon size={22} />
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>{v.title}</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--clr-text-muted)', lineHeight: '1.6' }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
