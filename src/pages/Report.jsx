import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// Removed Firebase Storage since the project is on the free plan
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  AlertCircle,
  Loader2,
  Navigation,
  Search,
  Camera,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { uploadToCloudinary } from '../utils/cloudinary';
import { tunisianLocations } from '../data/locations';
import { delegationCoords } from '../data/delegationCoords';

// Haversine distance formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const findNearestDelegation = (lat, lng, preferredGov = '') => {
  let nearest = null;
  let minDistance = Infinity;

  // Filter by governorate if possible to avoid matching a border delegation in another gov
  const filteredCoords = preferredGov 
    ? delegationCoords.filter(d => d.gov.toLowerCase().includes(preferredGov.toLowerCase()) || preferredGov.toLowerCase().includes(d.gov.toLowerCase()))
    : delegationCoords;

  const targetCoords = filteredCoords.length > 0 ? filteredCoords : delegationCoords;

  targetCoords.forEach(del => {
    const dist = calculateDistance(lat, lng, del.lat, del.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = del;
    }
  });

  return nearest ? nearest.name : null;
};

// Fix for default marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const tunisiaBounds = [[30.24, 7.52], [37.54, 11.60]];

const ChangeMapView = ({ center }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo(center, 13);
    }
  }, [center[0], center[1]]);
  return null;
};

const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker 
      position={position} 
      icon={DefaultIcon} 
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          setPosition(e.target.getLatLng());
        }
      }}
    />
  );
};

const Report = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    city: '', // Governorate
    neighborhood: '', // Delegation
    description: '',
    location: { lat: 36.8065, lng: 10.1815 } // Default to Tunis
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'Roads', label: 'Roads / Potholes', icon: '🛣️' },
    { id: 'Lighting', label: 'Broken Lights', icon: '💡' },
    { id: 'Sanitation', label: 'Sanitation', icon: '🗑️' },
    { id: 'Water', label: 'Water Leaks', icon: '💧' },
    { id: 'Other', label: 'Other Issue', icon: '⚠️' }
  ];

  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      
      if (data && data.address) {
        const addr = data.address;
        
        // Map Nominatim attributes to Tunisian administrative divisions
        // Governorate is usually in 'state' or 'county'
        const governorate = addr.state || addr.county || '';
        // Delegation is usually in one of these fields in Tunisia
        const delegation = addr.city_district || addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.neighbourhood || addr.residential || addr.hamlet || addr.county || '';
        
        // Clean up governorate name
        const cleanGov = governorate.replace(/Governorate|Wilayah|Wilayat|ولاية|Manouba/gi, (match) => match.toLowerCase() === 'manouba' ? 'Manouba' : '').trim();
        
        // Attempt to match with our structured data
        const matchedGov = Object.keys(tunisianLocations).find(gov => 
          cleanGov.toLowerCase().includes(gov.toLowerCase()) || 
          gov.toLowerCase().includes(cleanGov.toLowerCase())
        ) || cleanGov || 'Tunis';

        // Try to match the delegation name with our list
        const possibleDelegations = tunisianLocations[matchedGov] || [];
        let matchedDelFromList = possibleDelegations.find(del => 
          delegation.toLowerCase().includes(del.toLowerCase()) || 
          del.toLowerCase().includes(delegation.toLowerCase())
        );

        // SMART FALLBACK: If still unknown, find nearest delegation by distance
        if (!matchedDelFromList && (!delegation || delegation.toLowerCase().includes('unknown'))) {
          matchedDelFromList = findNearestDelegation(lat, lng, matchedGov);
        }

        const matchedDel = matchedDelFromList || delegation || 'Unknown Area';

        setFormData(prev => ({ 
          ...prev, 
          city: matchedGov,
          neighborhood: matchedDel,
          location: { lat, lng }
        }));
      } else {
        setFormData(prev => ({ ...prev, city: 'Tunis', neighborhood: 'Unknown Area', location: { lat, lng } }));
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setFormData(prev => ({ ...prev, city: 'Tunis', neighborhood: 'Unknown Area', location: { lat, lng } }));
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleLocationChange = (latlng) => {
    setFormData(prev => ({ ...prev, location: { lat: latlng.lat, lng: latlng.lng } }));
    reverseGeocode(latlng.lat, latlng.lng);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        handleLocationChange({ 
          lat: position.coords.latitude, 
          lng: position.coords.longitude 
        });
      }, (err) => {
        console.error(err);
        setError('Could not get your current location.');
      });
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to submit a report.');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      let imageUrl = '';
      if (image) {
        console.log("Starting image upload for:", image.name);
        imageUrl = (await uploadToCloudinary(image)) || '';
        console.log("Upload successful! URL:", imageUrl);
      } else {
        console.log("No image selected for upload.");
      }

      const reportData = {
        ...formData,
        imageUrl: imageUrl,
        status: 'Reported',
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        userName: userProfile?.fullName || null,
        userPhotoURL: userProfile?.photoURL || null,
        userEmail: currentUser.email,
        upvotes: [],
        commentCount: 0
      };

      console.log("Saving report to Firestore:", reportData);
      await addDoc(collection(db, 'reports'), reportData);

      navigate('/browse');
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while submitting the report. Please try again.');
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.category) return;
    if (step === 2 && (!formData.city || !formData.neighborhood)) return;
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="view">
      <div className="container" style={{ maxWidth: '800px' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="section-title">{t('report.title')}</h2>
          <p className="section-subtitle">{t('report.subtitle')}</p>
        </header>

        {/* Custom Progress Stepper */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '3rem', gap: '0.5rem' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: step >= s ? 'var(--clr-primary)' : 'var(--clr-bg-raised)',
                color: step >= s ? 'white' : 'var(--clr-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 800,
                transition: 'var(--trans-md)',
                boxShadow: step === s ? '0 0 0 4px var(--clr-primary-glow)' : 'none'
              }}>
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              {s < 3 && (
                <div style={{ 
                  width: '40px', 
                  height: '3px', 
                  backgroundColor: step > s ? 'var(--clr-primary)' : 'var(--clr-border)',
                  borderRadius: 'var(--r-full)',
                  transition: 'var(--trans-md)'
                }} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="card-premium" style={{ padding: '3rem', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            {/* STEP 1: CATEGORY */}
            {step === 1 && (
              <motion.div 
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>{t('report.step1')}</h3>
                <div className="grid-3" style={{ gap: '1.5rem' }}>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setFormData({ ...formData, category: cat.id });
                        nextStep();
                      }}
                      className={`card ${formData.category === cat.id ? 'active' : ''}`}
                      style={{
                        padding: '2.5rem 1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1.25rem',
                        cursor: 'pointer',
                        borderColor: formData.category === cat.id ? 'var(--clr-primary)' : 'var(--clr-border)',
                        backgroundColor: formData.category === cat.id ? 'var(--clr-primary-ultra)' : 'var(--clr-surface)',
                        transition: 'var(--trans-sm)'
                      }}
                    >
                      <span style={{ fontSize: '3rem' }}>{cat.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{t(`category.${cat.id}`)}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: LOCATION */}
            {step === 2 && (
              <motion.div 
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>{t('report.step2')}</h3>

                <div className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ marginBottom: '0.25rem' }}>{t('report.stepPin')}</h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: '20px' }}>
                      {isGeocoding ? (
                        <><Loader2 size={14} className="spinner" /> {t('report.detecting')}</>
                      ) : formData.city ? (
                        <><MapPin size={14} color="var(--clr-primary)" /> {formData.neighborhood}, {formData.city}</>
                      ) : (
                        t('report.clickMap')
                      )}
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={getUserLocation}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--clr-primary)', gap: '0.4rem', padding: '0.4rem 0.8rem' }}
                  >
                    <Navigation size={14} /> {t('report.useLocation')}
                  </button>
                </div>
                
                <div style={{ position: 'relative', height: '350px', width: '100%', borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1.5px solid var(--clr-border)', marginBottom: '2rem' }}>
                  {/* Location Search Overlay */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '1rem', 
                    left: '1rem', 
                    right: '1rem', 
                    zIndex: 1000,
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input 
                        type="text" 
                        placeholder="Search for a neighborhood or street..." 
                        className="form-control"
                        style={{ 
                          height: '45px', 
                          paddingLeft: '2.5rem', 
                          backgroundColor: 'var(--clr-surface)', 
                          boxShadow: 'var(--shadow-lg)',
                          border: 'none'
                        }}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            const query = e.target.value;
                            if (!query) return;
                            try {
                              const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Tunisia')}&limit=1`);
                              const data = await res.json();
                              if (data && data.length > 0) {
                                const { lat, lon } = data[0];
                                handleLocationChange({ lat: parseFloat(lat), lng: parseFloat(lon) });
                              }
                            } catch (err) {
                              console.error('Search error:', err);
                            }
                          }
                        }}
                      />
                      <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-primary)' }} />
                    </div>
                  </div>

                  <MapContainer
                    center={[formData.location.lat, formData.location.lng]}
                    zoom={13}
                    minZoom={7}
                    maxBounds={tunisiaBounds}
                    maxBoundsViscosity={1.0}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <ChangeMapView center={[formData.location.lat, formData.location.lng]} />
                    <LocationMarker position={formData.location} setPosition={handleLocationChange} />
                  </MapContainer>
                </div>


                <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                  <button onClick={prevStep} className="btn btn-outline" style={{ flex: 1 }}>
                    <ChevronLeft size={18} /> {t('report.back')}
                  </button>
                  <button 
                    onClick={nextStep} 
                    disabled={!formData.city || isGeocoding}
                    className="btn btn-primary" 
                    style={{ flex: 1.5 }}
                  >
                    {t('report.next')} <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: DETAILS */}
            {step === 3 && (
              <motion.div 
                key="step3"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <h3 style={{ textAlign: 'center', marginBottom: '2rem' }}>{t('report.step3')}</h3>
                
                <div className="form-group">
                  <label className="form-label">{t('report.issueTitle')}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder={t('report.titlePlaceholder')}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('report.issueDesc')}</label>
                  <textarea 
                    className="form-control" 
                    rows="6"
                    placeholder={t('report.descPlaceholder')}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">{t('report.addPhoto') || 'Add a Photo'}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: imagePreview ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                    {!imagePreview ? (
                      <>
                        <label className="card" style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          padding: '2rem', 
                          cursor: 'pointer',
                          gap: '0.5rem',
                          border: '2px dashed var(--clr-border)'
                        }}>
                          <Camera size={32} color="var(--clr-primary)" />
                          <span style={{ fontWeight: 600 }}>{t('report.takePhoto') || 'Take Photo'}</span>
                          <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: 'none' }} />
                        </label>
                        <label className="card" style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          padding: '2rem', 
                          cursor: 'pointer',
                          gap: '0.5rem',
                          border: '2px dashed var(--clr-border)',
                          position: 'relative'
                        }}>
                          <ImageIcon size={32} color="var(--clr-primary)" />
                          <span style={{ fontWeight: 600 }}>{t('report.uploadImage') || 'Upload Image'}</span>
                          <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                          <button 
                            type="button" 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Create a small blue pixel image for testing
                              const mockBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA6DAwjgAAAABJRU5ErkJggg==";
                              fetch(mockBase64)
                                .then(res => res.blob())
                                .then(blob => {
                                  const file = new File([blob], "mock.png", { type: "image/png" });
                                  setImage(file);
                                  setImagePreview(mockBase64);
                                });
                            }} 
                            style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', fontSize: '0.6rem', padding: '0.2rem', opacity: 0.5 }}
                          >
                            Mock
                          </button>
                        </label>
                      </>
                    ) : (
                      <div style={{ position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden', height: '250px' }}>
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          onClick={() => { setImage(null); setImagePreview(null); }}
                          style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 0, 0, 0.8)',
                            color: 'white',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-md)'
                          }}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Debug Info for Subagent */}
                  <div id="cloudinary-debug" style={{ fontSize: '0.6rem', color: 'var(--clr-text-muted)', marginTop: '0.5rem', opacity: 0.2 }}>
                    {`Cloudinary: ${!!import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ? 'CONNECTED' : 'MISSING'}`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button onClick={prevStep} className="btn btn-outline" style={{ flex: 1 }}>
                    <ChevronLeft size={18} /> {t('report.back')}
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={submitting || !formData.title || !formData.description}
                    className="btn btn-primary" 
                    style={{ flex: 2 }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="spinner" size={18} /> {t('report.submitting')}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} /> {t('report.submit')}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Report;
