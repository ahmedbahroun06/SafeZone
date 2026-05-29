import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Ensure L is global for leaflet.heat
window.L = L;
import 'leaflet.heat';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Filter, 
  Maximize, 
  Navigation, 
  Info, 
  Zap, 
  Map as MapIcon,
  Flame,
  LayoutGrid,
  RefreshCw,
  MapPin
} from 'lucide-react';

// Fix for default marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Heatmap Layer Component
const HeatmapLayer = ({ points }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!points || points.length === 0) return;
    
    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
    }).addTo(map);
    
    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);
  
  return null;
};

const MapView = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setReports(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = useMemo(() => {
    if (activeFilter === 'All') return reports;
    return reports.filter(r => r.category === activeFilter);
  }, [reports, activeFilter]);

  const heatmapPoints = useMemo(() => {
    return filteredReports
      .filter(r => r.location && r.location.lat && r.location.lng)
      .map(r => [r.location.lat, r.location.lng, 0.5]); // intensity 0.5
  }, [filteredReports]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Reported': return 'var(--clr-warning)';
      case 'In Progress': return 'hsl(var(--h-amber), 92%, 48%)';
      case 'Resolved': return 'var(--clr-success)';
      default: return 'var(--clr-text-muted)';
    }
  };

  const mapCenter = [33.8, 9.5]; // Center of Tunisia
  const tunisiaBounds = [[30.24, 7.52], [37.54, 11.60]]; // SW and NE corners of Tunisia

  return (
    <div className="view">
      <div className="container">
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div className="section-label">Spatial Analysis</div>
          <h2 className="section-title">National Safety Map</h2>
          <p className="section-subtitle">
            Visualize problem density and geographic distribution of reports across Tunisia. 
            Toggle between Heatmap and Marker views for different perspectives.
          </p>
        </header>

        <div style={{ position: 'relative', height: '700px', borderRadius: 'var(--r-2xl)', overflow: 'hidden', boxShadow: 'var(--shadow-2xl)', border: '1px solid var(--clr-border)' }}>
          
          {loading && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 9999, backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={48} className="spinner" color="var(--clr-primary)" />
            </div>
          )}

          <MapContainer
            center={mapCenter}
            zoom={6}
            minZoom={6}
            maxBounds={tunisiaBounds}
            maxBoundsViscosity={1.0}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
          >
            <TileLayer 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
            />
            
            {showHeatmap ? (
              <HeatmapLayer points={heatmapPoints} />
            ) : (
              filteredReports.map(report => (
                (report.location?.lat && report.location?.lng) && (
                  <Marker key={report.id} position={[report.location.lat, report.location.lng]}>
                    <Popup className="premium-popup">
                      <div style={{ padding: '0.25rem', minWidth: '220px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span className="badge" style={{ fontSize: '0.65rem', backgroundColor: `${getStatusColor(report.status)}15`, color: getStatusColor(report.status) }}>
                            {report.status}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)' }}>{report.category}</span>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{report.title}</h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                          <MapPin size={12} /> {report.city}, {report.neighborhood}
                        </div>
                        <Link to="/browse" className="btn btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}>
                          View Details
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))
            )}
          </MapContainer>

          {/* Map Controls Overlay */}
          <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.75rem', pointerEvents: 'auto' }} onMouseOver={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); setShowHeatmap(!showHeatmap); }}
              className={`btn ${showHeatmap ? 'btn-primary' : 'btn-white'}`}
              style={{ width: '50px', height: '50px', padding: '0', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', pointerEvents: 'auto' }}
              title={showHeatmap ? "Switch to Markers" : "Switch to Heatmap"}
            >
              {showHeatmap ? <LayoutGrid size={22} /> : <Flame size={22} />}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="btn btn-white"
              onClick={(e) => { e.stopPropagation(); document.getElementById('map-filter-nav')?.scrollIntoView({behavior: 'smooth'}); }}
              style={{ width: '50px', height: '50px', padding: '0', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', pointerEvents: 'auto' }}
              title="Filter by category"
            >
              <Filter size={22} />
            </motion.button>
          </div>

          {/* Category Quick Filters */}
          <div id="map-filter-nav" style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', gap: '0.5rem', backgroundColor: 'var(--glass-bg)', padding: '0.5rem', borderRadius: 'var(--r-xl)', backdropFilter: 'blur(12px)', border: '1px solid var(--clr-border)', boxShadow: 'var(--shadow-xl)', pointerEvents: 'auto' }} onMouseOver={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
            {['All', 'Roads', 'Lighting', 'Sanitation', 'Water'].map(cat => (
              <button 
                key={cat}
                onClick={(e) => { e.stopPropagation(); setActiveFilter(cat); }}
                style={{ 
                  padding: '0.6rem 1.25rem', 
                  borderRadius: 'var(--r-lg)', 
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: activeFilter === cat ? 'var(--clr-primary)' : 'transparent',
                  color: activeFilter === cat ? 'white' : 'var(--clr-text)',
                  transition: 'var(--trans-md)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid-3" style={{ marginTop: '4rem' }}>
          <div className="card-premium" style={{ padding: '2rem' }}>
            <div style={{ color: 'var(--clr-primary)', marginBottom: '1rem' }}><Flame size={32} /></div>
            <h4 style={{ marginBottom: '0.75rem' }}>Density Heatmap</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-light)' }}>Identify hotspots where multiple complaints are concentrated to prioritize large-scale repairs.</p>
          </div>
          <div className="card-premium" style={{ padding: '2rem' }}>
            <div style={{ color: 'var(--clr-primary)', marginBottom: '1rem' }}><Zap size={32} /></div>
            <h4 style={{ marginBottom: '0.75rem' }}>Real-time Points</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-light)' }}>See individual reports as they happen. Click any marker to view evidence and discussion.</p>
          </div>
          <div className="card-premium" style={{ padding: '2rem' }}>
            <div style={{ color: 'var(--clr-primary)', marginBottom: '1rem' }}><MapIcon size={32} /></div>
            <h4 style={{ marginBottom: '0.75rem' }}>Smart Filtering</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-light)' }}>Focus on specific infrastructure issues like water leaks or broken lights in your area.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
