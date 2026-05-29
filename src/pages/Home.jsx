import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  Users, 
  BarChart3,
  MessageSquare
} from 'lucide-react';
import bgCity from '../assets/bg-city.png';

const Home = () => {
  const { t } = useTranslation();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const features = [
    { 
      title: 'Community Driven', 
      desc: 'Powered by citizens like you who care about their surroundings and want to make a difference.', 
      icon: Users,
      color: 'hsl(var(--h-primary), 92%, 45%)'
    },
    { 
      title: 'Real-time Tracking', 
      desc: 'Track the status of your reports from submission to resolution with transparent updates.', 
      icon: Zap,
      color: 'hsl(var(--h-amber), 92%, 48%)'
    },
    { 
      title: 'Visual Mapping', 
      desc: 'See reported issues on a live interactive map of your city or neighborhood in Tunisia.', 
      icon: MapPin,
      color: 'hsl(211, 85%, 52%)'
    }
  ];

  const stats = [
    { label: 'Reports Fixed', value: '1.2k+' },
    { label: 'Active Citizens', value: '450+' },
    { label: 'Cities Covered', value: '24' }
  ];

  return (
    <div className="view">
      {/* Hero Section */}
      <section 
        className="container" 
        style={{ 
          paddingBottom: '6rem',
          paddingTop: '4rem',
          position: 'relative',
          backgroundImage: `linear-gradient(hsla(var(--h-navy), 47%, 11%, 0.75), hsla(var(--h-navy), 47%, 11%, 0.85)), url(${bgCity})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 'var(--r-2xl)',
          marginTop: '1rem',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center', 
            maxWidth: '1000px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 2,
            color: 'white'
          }}
        >
          <motion.div variants={itemVariants} className="section-label" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
            🇹🇳 Empowering Tunisian Citizens
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            style={{ 
              fontSize: 'clamp(2.5rem, 8vw, 4.2rem)', 
              lineHeight: '1.05', 
              marginBottom: '1.5rem',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: 'white'
            }}
          >
            {t('hero.title')} <br/>
            <span className="text-gradient-white">{t('hero.titleAccent')}</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            style={{ 
              fontSize: '1.2rem', 
              color: 'rgba(255,255,255,0.8)', 
              maxWidth: '650px', 
              marginBottom: '3rem',
              lineHeight: '1.7'
            }}
          >
            {t('hero.subtitle')}
          </motion.p>
          
          <motion.div 
            variants={itemVariants} 
            style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <Link to="/report" className="btn btn-primary btn-lg">
              {t('hero.ctaStart')}
              <ArrowRight size={18} />
            </Link>
            <Link to="/map" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
              {t('hero.ctaBrowse')}
            </Link>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            variants={itemVariants}
            className="grid-3"
            style={{ 
              marginTop: '5rem', 
              width: '100%',
              maxWidth: '900px'
            }}
          >
            {stats.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section style={{ backgroundColor: 'var(--clr-bg-raised)', padding: '6rem 0' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-label">Features</div>
            <h2 className="section-title">Built for the Community</h2>
            <p className="section-subtitle">
              We provide the tools you need to effectively communicate with local authorities and improve your city.
            </p>
          </div>

          <div className="grid-3" style={{ marginTop: '4rem' }}>
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card-premium"
                style={{ padding: '2.5rem' }}
              >
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '16px', 
                  backgroundColor: `${feature.color}15`, 
                  color: feature.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <feature.icon size={28} />
                </div>
                <h3 style={{ marginBottom: '0.8rem', fontSize: '1.4rem' }}>{feature.title}</h3>
                <p style={{ color: 'var(--clr-text-light)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container" style={{ padding: '7rem 1.75rem' }}>
        <div className="glass-panel" style={{ 
          padding: '4rem 2rem', 
          textAlign: 'center',
          background: 'var(--grad-navy)',
          color: 'white',
          border: 'none',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background decoration */}
          <div style={{ 
            position: 'absolute', 
            top: '-50%', 
            right: '-10%', 
            width: '400px', 
            height: '400px', 
            background: 'var(--clr-primary)', 
            filter: 'blur(100px)', 
            opacity: 0.1, 
            borderRadius: '50%'
          }} />
          
          <h2 className="section-title" style={{ color: 'white', marginBottom: '1.5rem' }}>
            Ready to make a change?
          </h2>
          <p style={{ 
            fontSize: '1.1rem', 
            color: 'rgba(255,255,255,0.7)', 
            maxWidth: '600px', 
            margin: '0 auto 2.5rem',
            lineHeight: '1.7'
          }}>
            Join thousands of residents in Tunisia who are helping to build better cities. 
            Your report can help make a street safer today.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary btn-lg">
              Get Started Now
            </Link>
            <Link to="/about" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
