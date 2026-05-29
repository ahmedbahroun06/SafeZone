import { Phone, Shield, UserPlus, Heart, FireExtinguisher, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const Emergency = () => {
  const contacts = [
    { name: 'Police / First Aid', number: '197', icon: Shield, color: 'var(--clr-primary)' },
    { name: 'Civil Protection (Fire)', number: '198', icon: FireExtinguisher, color: 'hsl(var(--h-amber), 92%, 48%)' },
    { name: 'Ambulance (SAMU)', number: '190', icon: Heart, color: 'hsl(160, 68%, 42%)' },
    { name: 'National Guard', number: '193', icon: Shield, color: 'var(--clr-navy-soft)' },
    { name: 'Water (SONEDE)', number: '80 100 861', icon: Info, color: 'hsl(211, 85%, 52%)' },
    { name: 'Electricity (STEG)', number: '80 100 444', icon: Info, color: 'hsl(38, 92%, 48%)' }
  ];

  return (
    <div className="view">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="section-header">
          <div className="section-label">Emergency</div>
          <h2 className="section-title">Emergency Contacts</h2>
          <p className="section-subtitle">
            Quick access to essential services across Tunisia. 
            In case of immediate danger, please call 197 or your local authority.
          </p>
        </div>

        <div className="grid-2" style={{ marginTop: '3rem' }}>
          {contacts.map((contact, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="emergency-card"
            >
              <div style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '12px', 
                backgroundColor: `${contact.color}15`, 
                color: contact.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <contact.icon size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  {contact.name}
                </div>
                <div className="emergency-number">{contact.number}</div>
              </div>
              <a 
                href={`tel:${contact.number.replace(/\s/g, '')}`} 
                className="btn btn-primary" 
                style={{ padding: '0.6rem', minWidth: '44px', borderRadius: '12px' }}
              >
                <Phone size={18} />
              </a>
            </motion.div>
          ))}
        </div>

        <div className="alert alert-info" style={{ marginTop: '4rem' }}>
          <Info size={20} style={{ flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Helpful Tip</p>
            <p style={{ fontSize: '0.85rem' }}>
              These numbers are toll-free and available 24/7. When calling, stay calm and 
              provide your exact location (City, Neighborhood, Street name).
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Other Utilities</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div className="card" style={{ padding: '1.25rem 2rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: '0.25rem' }}>Anti-Corruption</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>80 10 22 22</div>
            </div>
            <div className="card" style={{ padding: '1.25rem 2rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: '0.25rem' }}>Social Security</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>80 10 10 17</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
