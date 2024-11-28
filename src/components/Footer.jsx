import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Check } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Mi cuenta */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Zurpack</h3>
          </div>

          {/* Interés */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interés</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/catalogo" className="text-gray-600 hover:text-green-600">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-gray-600 hover:text-green-600">
                  Empresa
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-gray-600 hover:text-green-600">
                  Servicios
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-gray-600 hover:text-green-600">
                  Sustentabilidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <a href="tel:+56123456789" className="hover:text-green-600">
                  +56 1 2345 6789
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <a href="mailto:ventas@zurpack.cl" className="hover:text-green-600">
                  ventas@zurpack.cl
                </a>
              </li>
              <li className="flex items-start gap-2 text-gray-600">
                <MapPin className="w-4 h-4 mt-1" />
                <span>Dirección comercial, Ciudad, Región</span>
              </li>
            </ul>
          </div>

          {/* Condiciones generales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Condiciones generales</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-gray-600">
                <Check className="w-4 h-4 mt-1 text-green-600" />
                <span>Despacho gratuito en RM por compras sobre $80.000 + IVA.</span>
              </li>
              <li className="flex items-start gap-2 text-gray-600">
                <Check className="w-4 h-4 mt-1 text-green-600" />
                <span>Para compras bajo el monto ya mencionado, se entrega opción de pago de envío solo en RM.</span>
              </li>
              <li className="flex items-start gap-2 text-gray-600">
                <Check className="w-4 h-4 mt-1 text-green-600" />
                <span>Para regiones, solicitar condiciones comerciales con su ejecutivo de ventas.</span>
              </li>
              <li className="flex items-start gap-2 text-gray-600">
                <Check className="w-4 h-4 mt-1 text-green-600" />
                <span>Realizamos envíos a todo Chile.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Redes sociales y copyright */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <img 
                src="/images/logo.png" 
                alt="Zurpack" 
                className="h-8"
              />
              <p className="text-gray-600">
                © {new Date().getFullYear()} Zurpack. Todos los derechos reservados.
              </p>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-gray-600 hover:text-green-600" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-green-600" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-600 hover:text-green-600" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;