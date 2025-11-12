import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Auth
import SimpleAuth from './components/auth/SimpleAuth';

// Pages
import Home from './pages/Home';
import Studios from './pages/Studios';
import RateCard from './pages/RateCard';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import HowToBook from './pages/HowToBook';
import Guidelines from './pages/Guidelines';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';

// Store
import { useAuthStore } from './store/useAuthStore';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/studios" element={<Studios />} />
            <Route path="/rates" element={<RateCard />} />
            <Route path="/services" element={<Services />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/how-to-book" element={<HowToBook />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>

        <Footer />

        {/* Auth Modal */}
        <SimpleAuth />

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;