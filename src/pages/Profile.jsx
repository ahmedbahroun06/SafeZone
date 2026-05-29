import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  BarChart3, 
  LogOut, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  ChevronRight,
  ShieldAlert,
  Camera,
  Loader2,
  Edit2
} from 'lucide-react';
import { tunisianLocations } from '../data/locations';
import CustomSelect from '../components/common/CustomSelect';
import { uploadToCloudinary } from '../utils/cloudinary';

const Profile = () => {
  const { currentUser, userProfile, updateProfileData, logout, isAdmin, canModerate } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    phone: '',
    city: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (userProfile) {
      setEditData({
        fullName: userProfile.fullName || '',
        phone: userProfile.phone || '',
        city: userProfile.city || ''
      });
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const q = query(
          collection(db, 'reports'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        setReports(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching reports:', err);
        if (err.code === 'failed-precondition') {
          setError('Profile reports require a database index.');
        } else {
          setError('Failed to load your reports.');
        }
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchData();
  }, [currentUser]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size shouldn't exceed 5MB");
      return;
    }

    setUploading(true);
    setError('');
    try {
      const photoURL = await uploadToCloudinary(file, t);
      await updateProfileData({ photoURL });
    } catch (err) {
      console.error("Profile photo upload failed:", err);
      setError(err.message || "Failed to update profile photo.");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    try {
      await updateProfileData(editData);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Reported': return 'badge-reported';
      case 'In Progress': return 'badge-progress';
      case 'Resolved': return 'badge-resolved';
      case 'Rejected': return 'badge-rejected';
      case 'Under Review': return 'badge-review';
      default: return 'badge-other';
    }
  };

  const initials = (userProfile?.fullName || currentUser?.email || 'V').charAt(0).toUpperCase();

  return (
    <div className="view">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '3rem', alignItems: 'start' }}>
          
          {/* Profile Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-premium" 
            style={{ position: 'sticky', top: '7rem', padding: '2.5rem', overflow: 'visible' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <div className="avatar avatar-xl" style={{ boxShadow: 'var(--shadow-glow)', overflow: 'hidden' }}>
                  {uploading ? (
                    <Loader2 className="spinner" size={32} color="var(--clr-primary)" />
                  ) : userProfile?.photoURL ? (
                    <img src={userProfile.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    initials
                  )}
                </div>
                <label style={{ 
                  position: 'absolute', 
                  bottom: '-5px', 
                  right: '-5px', 
                  backgroundColor: 'var(--clr-primary)', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-md)',
                  border: '3px solid var(--clr-surface)',
                  transition: 'var(--trans-sm)'
                }}>
                  <Camera size={16} />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} disabled={uploading} />
                </label>
              </div>
              <div style={{ width: '100%', textAlign: 'center' }}>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', width: '100%' }}>
                    <input 
                      name="fullName"
                      value={editData.fullName}
                      onChange={handleEditChange}
                      className="form-control"
                      style={{ 
                        fontSize: '1.4rem', 
                        fontWeight: 700, 
                        textAlign: 'center',
                        width: '100%',
                        padding: '0.6rem 1rem',
                        borderRadius: 'var(--r-md)',
                        backgroundColor: 'var(--clr-bg-raised)',
                        border: '2px solid var(--clr-primary)'
                      }}
                      placeholder="Full Name"
                    />
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', width: '100%' }}>
                      <button onClick={handleSaveProfile} className="btn btn-primary" style={{ flex: 1, padding: '0.6rem' }} disabled={loading}>
                        {loading ? <Loader2 className="spinner" size={18} /> : t('common.save')}
                      </button>
                      <button onClick={() => setIsEditing(false)} className="btn btn-outline" style={{ flex: 1, padding: '0.6rem' }} disabled={loading}>
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{userProfile?.fullName || t('profile.verifiedCit')}</h3>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="btn btn-icon btn-sm"
                        style={{ backgroundColor: 'var(--clr-bg-raised)', borderRadius: '50%' }}
                        title={t('profile.edit')}
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                    {isAdmin && <span className="badge badge-reported" style={{ fontSize: '0.7rem' }}>{t('nav.admin')}</span>}
                  </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                  {canModerate && <span className="badge badge-progress" style={{ fontSize: '0.65rem' }}>{t('nav.moderator')}</span>}
                  <span className="badge badge-other" style={{ fontSize: '0.65rem' }}>{t('profile.verified')}</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ color: 'var(--clr-primary)' }}><Mail size={18} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', fontWeight: 600 }}>{t('profile.email')}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, wordBreak: 'break-all' }}>{currentUser.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ color: 'var(--clr-primary)' }}><Phone size={18} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>{t('profile.phone')}</div>
                {isEditing ? (
                  <input 
                    name="phone"
                    value={editData.phone}
                    onChange={handleEditChange}
                    className="form-control"
                    style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}
                    placeholder="+216 ..."
                  />
                ) : (
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{userProfile?.phone || t('profile.notProvided')}</div>
                )}
              </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ color: 'var(--clr-primary)' }}><MapPin size={18} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>{t('profile.location')}</div>
                {isEditing ? (
                  <CustomSelect 
                    value={editData.city}
                    onChange={(val) => setEditData(prev => ({ ...prev, city: val }))}
                    options={Object.keys(tunisianLocations)}
                    style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}
                  />
                ) : (
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{userProfile?.city || 'Tunisia'}</div>
                )}
              </div>
              </div>
            </div>

            <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', marginTop: '3rem', gap: '0.6rem', color: 'var(--clr-error)', borderColor: 'var(--clr-error-bg)' }}>
              <LogOut size={16} />
              {t('profile.signOut')}
            </button>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <div>
                <h2 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>{t('profile.title')}</h2>
                <p style={{ color: 'var(--clr-text-light)' }}>{t('profile.subtitle')}</p>
              </div>
              <Link to="/report" className="btn btn-primary" style={{ gap: '0.5rem' }}>
                <Plus size={18} />
                {t('nav.report')}
              </Link>
            </div>

            {/* Stats Summary Bar */}
            <div className="grid-3" style={{ marginBottom: '3rem' }}>
              <div className="stat-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
                <div className="stat-value" style={{ fontSize: '2rem' }}>{reports.length}</div>
                <div className="stat-label">{t('profile.total')}</div>
              </div>
              <div className="stat-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
                <div className="stat-value" style={{ fontSize: '2rem', color: 'var(--clr-success)' }}>
                  {reports.filter(r => r.status === 'Resolved').length}
                </div>
                <div className="stat-label">{t('profile.solved')}</div>
              </div>
              <div className="stat-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
                <div className="stat-value" style={{ fontSize: '2rem', color: 'var(--clr-warning)' }}>
                   {reports.filter(r => r.status === 'In Progress' || r.status === 'Under Review').length}
                </div>
                <div className="stat-label">{t('profile.pending')}</div>
              </div>
            </div>

            <div className="divider" style={{ margin: '0 0 2.5rem 0' }}></div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
                <ShieldAlert size={20} />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton" style={{ height: '100px', width: '100%' }}></div>
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem', borderStyle: 'dashed' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--clr-bg-raised)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}>
                  <FileText size={32} color="var(--clr-text-muted)" />
                </div>
                <h3 style={{ marginBottom: '0.75rem' }}>{t('profile.noReportsTitle')}</h3>
                <p style={{ color: 'var(--clr-text-muted)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                  {t('profile.noReportsDesc')}
                </p>
                <Link to="/report" className="btn btn-primary btn-lg">
                  {t('profile.submitFirst')}
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reports.map((report, i) => (
                  <motion.div 
                    key={report.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.2 }}
                    className="card-premium" 
                    onClick={() => navigate(`/browse/${report.id}`)}
                    style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '12px', 
                        backgroundColor: 'var(--clr-bg-raised)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FileText size={20} color="var(--clr-text-muted)" />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{report.title}</h4>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={12} /> {report.city} &bull; {report.neighborhood}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                             {t(`category.${report.category}`)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <span className={`badge ${getStatusBadgeClass(report.status)}`}>
                        {report.status === 'Reported' ? t('browse.statusReported') : 
                         report.status === 'In Progress' ? t('browse.statusActive') : 
                         report.status === 'Resolved' ? t('browse.statusSolved') : report.status}
                      </span>
                      <div style={{ color: 'var(--clr-text-muted)' }}><ChevronRight size={20} /></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
