import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminSidebar from './components/layout/AdminSidebar';
import Home from './pages/client/Home';
import Services from './pages/client/Services';
import Gallery from './pages/client/Gallery';
import Contact from './pages/client/Contact';
import Reservation from './pages/client/Reservation';
import AdminDashboard from './pages/admin/Dashboard';
import ServicesManager from './pages/admin/ServicesManager';
import AppointmentsManager from './pages/admin/AppointmentsManager';
import GalleryManager from './pages/admin/GalleryManager';
import AdminLogin from './pages/admin/Login';
import SplashScreen from './components/ui/SplashScreen';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider } from './context/DataContext';

// Scroll to top on route change
import MessagesManager from './pages/admin/MessagesManager';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/admin/login';
  const showSidebar = isAdminPath && !isLoginPage;

  const [showSplash, setShowSplash] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      <div className={`min-h-screen flex ${showSidebar ? 'flex-row' : 'flex-col'} ${isAdminPath ? 'bg-[#050505]' : 'bg-obsidian'} selection:bg-gold selection:text-obsidian`}>
        
        {/* Conditional Layout Elements */}
        {showSidebar && <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
        {!isAdminPath && <Navbar />}
        
        <div className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
          {showSidebar && (
            <div className="lg:hidden bg-[#0A0B10] border-b border-gold/10 p-4 flex justify-between items-center sticky top-0 z-[55]">
              <button onClick={() => setIsSidebarOpen(true)} className="text-gold p-2">
                <Menu size={24} />
              </button>
              <div className="text-gold font-heading font-bold tracking-widest text-xs">ADMIN PANEL</div>
              <div className="w-10"></div> {/* Spacer to center the title */}
            </div>
          )}
          <main className="flex-grow">
            <Routes>
              {/* Client Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/reservation" element={<Reservation />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/services" element={<ServicesManager />} />
              <Route path="/admin/appointments" element={<AppointmentsManager />} />
              <Route path="/admin/gallery" element={<GalleryManager />} />
              <Route path="/admin/messages" element={<MessagesManager />} />
              
              {/* Fallback to Home */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>

          {!isAdminPath && <Footer />}
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <DataProvider>
      <LanguageProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </LanguageProvider>
    </DataProvider>
  );
}

export default App;
