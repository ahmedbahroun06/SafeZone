import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User as UserIcon, Mail, Phone, MapPin, ShieldCheck, Search, Trash2, X, ShieldAlert } from 'lucide-react';
import CustomSelect from '../components/common/CustomSelect';

const Admin = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Error updating user role', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm(t('admin.confirmDeleteUser') || 'Are you sure you want to delete this user? This cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        console.error('Error deleting user', err);
      }
    }
  };

  const handleToggleDeactivate = async (userId, currentState) => {
    try {
      await updateDoc(doc(db, 'users', userId), { disabled: !currentState });
      setUsers(users.map(u => u.id === userId ? { ...u, disabled: !currentState } : u));
    } catch (err) {
      console.error('Error toggling user status', err);
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="view container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>{t('admin.title')}</h2>
          <p style={{ color: 'var(--clr-text-muted)' }}>{t('admin.subtitle')}</p>
        </div>
        <div className="card-premium" style={{ padding: '0.8rem 1.5rem', display: 'flex', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--clr-text-muted)', textTransform: 'uppercase' }}>{t('admin.totalCitizens')}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{users.length}</div>
          </div>
          <div style={{ width: '1px', backgroundColor: 'var(--clr-border)' }}></div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--clr-text-muted)', textTransform: 'uppercase' }}>{t('admin.moderators')}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--clr-info)' }}>
              {users.filter(u => u.role === 'moderator').length}
            </div>
          </div>
        </div>
      </div>
      
      <div className="form-group" style={{ marginBottom: '2rem', position: 'relative' }}>
        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }}>
          <Search size={18} />
        </span>
        <input 
          type="text" 
          className="form-control" 
          placeholder={t('admin.searchPlaceholder') || "Search by name or email..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '3rem' }}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')} 
            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--clr-text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        )}
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #eee', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        </div>
      ) : (
        <>
          {users.length === 0 ? (
            <div className="card-premium" style={{ padding: '4rem', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
              <p>{t('admin.noUsers')}</p>
            </div>
          ) : (
            <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <AnimatePresence>
                {filteredUsers.map((user) => (
                  <motion.div 
                    key={user.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="card-premium"
                    style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', overflow: 'visible' }}
                  >
                    <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: user.role === 'admin' ? 'rgba(231,0,19,0.1)' : user.role === 'moderator' ? 'rgba(59,130,246,0.1)' : 'var(--clr-bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {user.role === 'admin' ? <Shield size={24} color="var(--clr-primary)" /> : user.role === 'moderator' ? <ShieldCheck size={24} color="var(--clr-info)" /> : <UserIcon size={24} color="var(--clr-text-muted)" />}
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="badge" style={{ 
                          backgroundColor: user.role === 'admin' ? 'rgba(231,0,19,0.08)' : user.role === 'moderator' ? 'rgba(59,130,246,0.08)' : 'rgba(0,0,0,0.05)',
                          color: user.role === 'admin' ? 'var(--clr-primary)' : user.role === 'moderator' ? 'var(--clr-info)' : 'var(--clr-text-muted)',
                          padding: '0.2rem 0.6rem', fontSize: '0.7rem' 
                        }}>
                          {(user.role || 'user').toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--clr-text)' }}>
                          {user.fullName || t('admin.citizen')}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <Mail size={14} /> {user.email}
                        </span>
                        {user.phone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Phone size={14} /> {user.phone}
                          </span>
                        )}
                        {user.city && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <MapPin size={14} /> {user.city}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '0.75rem',
                      borderLeft: '1px solid var(--clr-border)',
                      paddingLeft: '1.5rem',
                      marginLeft: '0.5rem',
                      flexShrink: 0
                    }}>
                      <div style={{ minWidth: '160px' }}>
                        <CustomSelect 
                          value={user.role || 'user'}
                          onChange={(val) => handleRoleChange(user.id, val)}
                          options={[
                            { value: 'user', label: `👤 ${t('admin.citizen') || 'Citizen'}` },
                            { value: 'moderator', label: `🛡️ ${t('nav.moderator') || 'Moderator'}` },
                            { value: 'admin', label: `⭐ Admin` }
                          ]}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700, backgroundColor: 'var(--clr-surface)', border: '1px solid var(--clr-border)' }}
                        />
                      </div>
                      <button 
                        onClick={() => handleToggleDeactivate(user.id, user.disabled)}
                        className="btn"
                        style={{ 
                          padding: '0.6rem', 
                          backgroundColor: user.disabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                          color: user.disabled ? 'var(--clr-success)' : 'var(--clr-error)', 
                          border: 'none', 
                          borderRadius: 'var(--r-md)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}
                        title={user.disabled ? "Activate Account" : "Deactivate Account"}
                      >
                        {user.disabled ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="btn"
                        style={{ padding: '0.6rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--clr-error)', border: 'none', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Admin;
