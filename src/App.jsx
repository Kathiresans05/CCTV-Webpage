import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FeaturesSlider from './components/FeaturesSlider';
import Home from './pages/Home';
import AboutPage from './pages/AboutPage';
import ProductsListing from './pages/ProductsListing';
import Contact from './pages/Contact';
import MyBookings from './pages/MyBookings';
import UserDashboard from './pages/UserDashboard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';

// Helper component to handle scrolling to hash
const ScrollToHash = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Small delay to ensure the component is rendered
      const timeoutId = setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [hash]);

  return null;
};

// Helper component to conditionally render FeaturesSlider
// Hide on /contact (per previous request) and /about (since it's inside AboutPage)
const ConditionalFeaturesSlider = () => {
  const { pathname } = useLocation();
  const hiddenPaths = ['/contact', '/about', '/dashboard', '/login', '/signup', '/admin', '/my-bookings'];
  if (hiddenPaths.includes(pathname)) return null;
  return <FeaturesSlider />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToHash />
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/products" element={<ProductsListing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <ConditionalFeaturesSlider />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
