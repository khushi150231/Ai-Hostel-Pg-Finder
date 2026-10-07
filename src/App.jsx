import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingAIAssistant from './components/FloatingAIAssistant';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import FindHostel from './pages/FindHostel';
import HostelDetails from './pages/HostelDetails';
import AIFinder from './pages/AIFinder';
import Compare from './pages/Compare';
import Favourites from './pages/Favourites';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
          <div className="flex flex-col min-h-screen bg-dark-900 text-white selection:bg-primary-500 selection:text-white">
            <ScrollToTop />
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Protected Portal Routes (Require Login) */}
                <Route
                  path="/find"
                  element={
                    <ProtectedRoute>
                      <FindHostel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hostel/:slug"
                  element={
                    <ProtectedRoute>
                      <HostelDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-finder"
                  element={
                    <ProtectedRoute>
                      <AIFinder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/compare"
                  element={
                    <ProtectedRoute>
                      <Compare />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favourites"
                  element={
                    <ProtectedRoute>
                      <Favourites />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback route */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <FloatingAIAssistant />
            <Footer />
          </div>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
