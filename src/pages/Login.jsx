import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Camera, Mail, Lock, LogIn, UserPlus, AlertCircle, ArrowLeft, User, ShieldCheck, Phone, MapPin, Loader2, X } from 'lucide-react';
import bgCommunity from '../assets/bg-community.png';
import { tunisianLocations } from '../data/locations';
import CustomSelect from '../components/common/CustomSelect';
import { uploadToCloudinary } from '../utils/cloudinary';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        let photoURL = '';
        if (image) {
          photoURL = await uploadToCloudinary(image, t);
        }
        await signup(email, password, name, phone, city, photoURL);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size shouldn't exceed 5MB");
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="view" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.8)), url(${bgCommunity})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        margin: 0,
        padding: '2rem 1rem'
      }}
    >
      <div className="container" style={{ maxWidth: '480px' }}>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="card-premium" 
          style={{ padding: '3rem' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '16px', 
              background: 'var(--grad-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <ShieldCheck color="white" size={32} />
            </div>
            <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>
              {isLogin ? 'Welcome Back' : 'Join SafeZone'}
            </h2>
            <p style={{ color: 'var(--clr-text-light)', fontSize: '0.95rem' }}>
              {isLogin 
                ? 'Sign in to your citizen account to continue.' 
                : 'Create an account to start reporting issues in your area.'}
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                  <div style={{ position: 'relative' }}>
                    <div className="avatar avatar-xl" style={{ boxShadow: 'var(--shadow-glow)', overflow: 'hidden', backgroundColor: 'var(--clr-bg-raised)' }}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <User size={32} color="var(--clr-text-muted)" />
                      )}
                    </div>
                    <label style={{ 
                      position: 'absolute', 
                      bottom: '-5px', 
                      right: '-5px', 
                      backgroundColor: 'var(--clr-primary)', 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'white',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-md)',
                      border: '2px solid var(--clr-surface)',
                    }}>
                      <Camera size={14} />
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                    </label>
                    {imagePreview && (
                      <button 
                        type="button"
                        onClick={() => { setImage(null); setImagePreview(null); }}
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          backgroundColor: 'var(--clr-error)',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }}>
                      <User size={18} />
                    </span>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      style={{ paddingLeft: '3rem' }}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }}>
                      <Phone size={18} />
                    </span>
                    <input 
                      type="tel" 
                      className="form-control" 
                      placeholder="+216 XX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required={!isLogin}
                      style={{ paddingLeft: '3rem' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">City (Governorate)</label>
                  <CustomSelect 
                    value={city}
                    onChange={setCity}
                    options={Object.keys(tunisianLocations)}
                    placeholder="Select your city"
                    icon={MapPin}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }}>
                  <Mail size={18} />
                </span>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '3rem' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }}>
                  <Lock size={18} />
                </span>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '3rem' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? (
                <div className="spinner" style={{ color: 'white' }} />
              ) : (
                <>
                  {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: 'var(--clr-text-light)', fontSize: '0.9rem' }}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--clr-primary)', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </motion.div>
        
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/" style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
