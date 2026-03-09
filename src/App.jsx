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
import EmployeeDashboard from './pages/EmployeeDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Helper component to handle scrolling to hash
const ScrollToHash = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return null;
};

// Helper component to hide specific components on Dashboard pages
const ConditionalLayout = ({ children }) => {
  const location = useLocation();
  const hideOn = ['/admin', '/employee', '/employees'];
  
  if (hideOn.some(path => location.pathname.startsWith(path))) {
    return null;
  }
  
  return children;
};

// Helper component to hide FeaturesSlider on Dashboard pages
const ConditionalFeaturesSlider = () => {
  const location = useLocation();
  const hideOn = ['/admin', '/employee', '/employees', '/dashboard', '/my-bookings', '/login', '/signup', '/contact', '/products'];
  
  if (hideOn.some(path => location.pathname.startsWith(path))) {
    return null;
  }
  
  return <FeaturesSlider />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToHash />
        <div className="min-h-screen flex flex-col font-sans">
          <ConditionalLayout>
            <Navbar />
          </ConditionalLayout>
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/products" element={<ProductsListing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={['customer']}><MyBookings /></ProtectedRoute>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/employee/*" element={<ProtectedRoute allowedRoles={['employee', 'admin']}><EmployeeDashboard /></ProtectedRoute>} />
              <Route path="/employees/*" element={<ProtectedRoute allowedRoles={['employee', 'admin']}><EmployeeDashboard /></ProtectedRoute>} />
            </Routes>
          </main>
          
          <ConditionalFeaturesSlider />
          
          <ConditionalLayout>
            <Footer />
          </ConditionalLayout>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
