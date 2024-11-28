import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import WhatsAppButton from "./components/WhatsAppButton";
import Catalog from "./pages/Catalog";
import CategoryProducts from "./pages/CategoryProducts";
import ProductDetailPage from "./pages/ProductDetailPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import LoginPage from "./pages/LoginPage";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from './context/CartContext';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const App = () => {
  const [showCart, setShowCart] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar setShowCart={setShowCart} showCart={showCart} />
            <ScrollToTop />
            <div className="flex-1 pt-16">
              <Routes>
                <Route path="/" element={<Navigate to="/catalogo" replace />} />
                <Route path="/catalogo">
                  <Route index element={<Catalog showCart={showCart} setShowCart={setShowCart} />} />
                  <Route 
                    path=":categorySlug" 
                    element={<CategoryProducts showCart={showCart} setShowCart={setShowCart} />} 
                  />
                  <Route 
                    path=":categorySlug/:productSlug" 
                    element={<ProductDetailPage showCart={showCart} setShowCart={setShowCart} />} 
                  />
                </Route>
                <Route 
                  path="/nosotros" 
                  element={<About showCart={showCart} setShowCart={setShowCart} />} 
                />
                <Route 
                  path="/contacto" 
                  element={<Contact showCart={showCart} setShowCart={setShowCart} />} 
                />
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/catalogo" replace />} />
              </Routes>
            </div>
            <Footer />
            <WhatsAppButton />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;