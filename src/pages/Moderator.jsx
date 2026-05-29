import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Trash2, ShieldAlert } from 'lucide-react';
import CustomSelect from '../components/common/CustomSelect';

const Moderator = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setReports(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'reports', id), { status: newStatus });
      setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('mod.confirmDel') || 'Are you sure you want to delete this report permanently?')) {
      try {
        await deleteDoc(doc(db, 'reports', id));
        setReports(reports.filter(r => r.id !== id));
      } catch (err) {
        console.error('Error deleting report', err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Reported': return 'var(--clr-warning)';
      case 'In Progress': return 'var(--clr-info)';
      case 'Resolved': return 'var(--clr-success)';
      default: return 'var(--clr-text-muted)';
    }
  };

  return (
    <div className="view container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>{t('mod.title')}</h2>
          <p style={{ color: 'var(--clr-text-muted)' }}>{t('mod.subtitle')}</p>
        </div>
        <div className="card-premium" style={{ padding: '0.8rem 1.5rem', display: 'flex', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--clr-text-muted)', textTransform: 'uppercase' }}>{t('mod.totalIssues')}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{reports.length}</div>
          </div>
          <div style={{ width: '1px', backgroundColor: 'var(--clr-border)' }}></div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--clr-text-muted)', textTransform: 'uppercase' }}>{t('mod.pending')}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--clr-warning)' }}>
              {reports.filter(r => r.status === 'Reported').length}
            </div>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #eee', borderTopColor: 'var(--clr-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        </div>
      ) : (
        <>
          {reports.length === 0 ? (
            <div className="card-premium" style={{ padding: '4rem', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
              <p>{t('mod.noReports')}</p>
            </div>
          ) : (
            <motion.div layout style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <AnimatePresence>
                {reports.map((report) => {
                  const statusColor = getStatusColor(report.status);
                  return (
                   <motion.div 
                    key={report.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="card-premium"
                    style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', overflow: 'visible' }}
                   >
                    <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: `${statusColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ShieldAlert size={24} color={statusColor} />
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="badge" style={{ backgroundColor: `${statusColor}15`, color: statusColor, padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>
                          {report.status}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--clr-primary)', textTransform: 'uppercase' }}>
                          {t(`category.${report.category}`)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
                          <Clock size={12} /> {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                      
                      <h4 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', lineHeight: '1.3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {report.title}
                      </h4>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><MapPin size={14} /> {report.city}, {report.neighborhood}</span>
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
                          value={report.status}
                          onChange={(val) => handleStatusChange(report.id, val)}
                          options={[
                            { value: 'Reported', label: `🔴 ${t('browse.statusReported') || 'Reported'}` },
                            { value: 'In Progress', label: `🟡 ${t('browse.statusActive') || 'In Progress'}` },
                            { value: 'Resolved', label: `🟢 ${t('browse.statusSolved') || 'Resolved'}` }
                          ]}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700, backgroundColor: 'var(--clr-surface)', border: '1px solid var(--clr-border)' }}
                        />
                      </div>
                      <button 
                        className="btn" 
                        style={{ padding: '0.6rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--clr-error)', border: 'none', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => handleDelete(report.id)}
                        title={t('mod.delete')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                   </motion.div>
                  );
                })}
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

export default Moderator;
