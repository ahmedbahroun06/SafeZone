import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Report from './pages/Report';
import MapView from './pages/Map';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Moderator from './pages/Moderator';
import About from './pages/About';
import Login from './pages/Login';
import Emergency from './pages/Emergency';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;
  return children;
};

const ModeratorRoute = ({ children }) => {
  const { currentUser, canModerate } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  if (!canModerate) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main id="app-content" style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/browse/:id" element={<Browse />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/about" element={<About />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/moderator" element={<ModeratorRoute><Moderator /></ModeratorRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
