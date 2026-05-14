import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaTruck,
  FaUndo,
  FaCreditCard,
  FaHeadset,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaStore,
} from "react-icons/fa";
import { MdShoppingBag } from "react-icons/md";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "My Orders", path: "/orders" },
    { name: "Cart", path: "/cart" },
  ];

  const customerService = [
    { name: "Contact Us", path: "/contact" },
    { name: "FAQs", path: "/faqs" },
    { name: "Shipping Info", path: "/shipping" },
    { name: "Returns Policy", path: "/returns" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms & Conditions", path: "/terms" },
  ];

  const features = [
    { icon: FaTruck, title: "Free Shipping", desc: "On orders over $50" },
    { icon: FaUndo, title: "Easy Returns", desc: "30-day return policy" },
    {
      icon: FaCreditCard,
      title: "Secure Payment",
      desc: "100% secure payments",
    },
    { icon: FaHeadset, title: "24/7 Support", desc: "Customer service" },
  ];

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10 mb-10 border-b border-gray-800">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <feature.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MdShoppingBag className="w-8 h-8 text-blue-500" />
              <h2 className="text-2xl font-bold text-white">SHOPPING</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Your one-stop destination for quality products at affordable
              prices. Shop with confidence and enjoy the best shopping
              experience.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-blue-500 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">
              Customer Service
            </h3>
            <ul className="space-y-2">
              {customerService.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-blue-500 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  123 Street Name, Phnom Penh, Cambodia
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="w-5 h-5 text-blue-500" />
                <span className="text-gray-400 text-sm">+855 XX XXX XXX</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="w-5 h-5 text-blue-500" />
                <span className="text-gray-400 text-sm">
                  support@shopping.com
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <FaStore className="w-4 h-4" />
              <span>© {currentYear} SHOPPING. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <Link
                to="/privacy"
                className="hover:text-blue-500 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="hover:text-blue-500 transition-colors"
              >
                Terms of Use
              </Link>
              <Link
                to="/sitemap"
                className="hover:text-blue-500 transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
