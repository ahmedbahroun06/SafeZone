import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GithubAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' or 'user'
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const signup = async (email, password, fullName, phone, city, photoURL) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      fullName: fullName || '',
      phone: phone || '',
      city: city || '',
      email: email,
      photoURL: photoURL || '',
      role: 'user',
      createdAt: serverTimestamp()
    });
    return userCredential;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGithub = () => {
    const provider = new GithubAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    console.log("AuthContext: Setting up onAuthStateChanged");
    if (!auth) {
      console.error("AuthContext: Firebase Auth not initialized!");
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("AuthContext: Auth state changed", user ? user.uid : 'No user');
      setCurrentUser(user);
      setError(null); // Clear any previous errors on auth state change
      if (user) {
        try {
          if (!db) {
            console.error("AuthContext: Firestore DB not initialized!");
            setUserRole('user');
            setLoading(false);
            return;
          }
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log("AuthContext: User data loaded", data.role);
            if (data.disabled) {
              await signOut(auth);
              setCurrentUser(null);
              setUserRole(null);
              setUserProfile(null);
              setError('Your account has been deactivated. Please contact support.');
              return;
            }
            setUserRole(data.role || 'user');
            setUserProfile(data);
          } else {
            // Auto-create missing legacy profile
            const newProfile = {
              fullName: user.displayName || 'Verified Citizen',
              email: user.email,
              role: 'user',
              createdAt: serverTimestamp()
            };
            await setDoc(doc(db, 'users', user.uid), newProfile);
            setUserRole('user');
            setUserProfile(newProfile);
          }
        } catch {
          setUserRole('user');
          setUserProfile(null);
        }
      } else {
        setUserRole(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const updateProfileData = async (newData) => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, { ...userProfile, ...newData }, { merge: true });
    setUserProfile(prev => ({ ...prev, ...newData }));
  };

  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator';
  const canModerate = isAdmin || isModerator;

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      userRole, 
      userProfile, 
      isAdmin, 
      isModerator, 
      canModerate, 
      signup, 
      login, 
      loginWithGithub, 
      logout,
      updateProfileData,
      error,
      setError
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
