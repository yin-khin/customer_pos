import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  UserIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  SparklesIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { MdShoppingBag } from "react-icons/md";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartCount } = useCart();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const cartCount = getCartCount?.() ?? 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isUserDropdownOpen && !e.target.closest(".user-menu")) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isUserDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
    toast.success("Logged out successfully");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${searchQuery}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { to: "/", label: "Home", icon: HomeIcon },
    { to: "/shop", label: "Shop", icon: ShoppingBagIcon },
    { to: "/orders", label: "My Orders", icon: ClipboardDocumentListIcon },
    { to: "/wishlist", label: "Wishlist", icon: HeartIcon },
  ];

  return (
    <>
      <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="navbar-container">
          {/* Logo */}
          <div className="logo-wrapper">
            <Link to="/" className="logo-link">
              <div className="logo-icon">
                <MdShoppingBag className="logo-icon-svg" />
              </div>
              <span className="logo-text">SHOPPING</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                icon={link.icon}
                isActive={location.pathname === link.to}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="right-actions">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="action-btn"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="action-icon" />
            </button>

            {/* Cart Icon */}
            <Link to="/cart" className="cart-btn">
              <ShoppingCartIcon className="action-icon" />
              {cartCount > 0 && (
                <span className="cart-badge">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Checkout Button */}
            <Link
              to="/checkout"
              className={`checkout-btn ${cartCount === 0 ? "disabled" : ""}`}
            >
              Checkout
            </Link>

            {/* Auth Section */}
            {user ? (
              <div className="user-menu">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="user-menu-trigger"
                >
                  <div className="user-avatar">
                    {user.username?.[0]?.toUpperCase() ||
                      user.email?.[0]?.toUpperCase() ||
                      "U"}
                  </div>
                  <ChevronDownIcon
                    className={`dropdown-icon ${isUserDropdownOpen ? "rotate" : ""}`}
                  />
                </button>

                {isUserDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <p className="dropdown-name">
                        {user.username || user.fullname}
                      </p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                    <div className="dropdown-divider" />
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <UserIcon className="dropdown-icon-svg" />
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="dropdown-item"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <ClipboardDocumentListIcon className="dropdown-icon-svg" />
                      My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      className="dropdown-item"
                      onClick={() => setIsUserDropdownOpen(false)}
                    >
                      <HeartIcon className="dropdown-icon-svg" />
                      Wishlist
                    </Link>
                    <div className="dropdown-divider" />
                    <button
                      onClick={handleLogout}
                      className="dropdown-item logout"
                    >
                      <ArrowRightOnRectangleIcon className="dropdown-icon-svg" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="login-btn">
                  Login
                </Link>
                <Link to="/register" className="register-btn">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-menu-btn"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="action-icon" />
              ) : (
                <Bars3Icon className="action-icon" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        <div className={`search-dropdown ${isSearchOpen ? "open" : ""}`}>
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <MagnifyingGlassIcon className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="search-input"
                autoFocus
              />
              <button type="submit" className="search-submit">
                Search
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div
        className={`mobile-drawer-overlay ${isMobileMenuOpen ? "open" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <div className={`mobile-drawer ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-logo">
            <div className="logo-icon-small">
              <SparklesIcon className="logo-icon-svg" />
            </div>
            <span className="logo-text">ShopName</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="drawer-close"
          >
            <XMarkIcon className="action-icon" />
          </button>
        </div>

        <div className="drawer-nav">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className="drawer-nav-link"
            >
              <link.icon className="drawer-nav-icon" />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="drawer-divider" />

        <div className="drawer-cart-section">
          <Link
            to="/cart"
            onClick={() => setIsMobileMenuOpen(false)}
            className="drawer-cart-link"
          >
            <div className="drawer-cart-left">
              <ShoppingCartIcon className="drawer-nav-icon" />
              Cart
            </div>
            {cartCount > 0 && (
              <span className="drawer-cart-badge">{cartCount}</span>
            )}
          </Link>
          <Link
            to="/checkout"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`drawer-checkout-link ${cartCount === 0 ? "disabled" : ""}`}
          >
            <ShoppingBagIcon className="drawer-nav-icon" />
            Checkout
          </Link>
        </div>

        <div className="drawer-divider" />

        <div className="drawer-auth-section">
          {user ? (
            <>
              <div className="drawer-user-info">
                <div className="drawer-avatar">
                  {user.username?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="drawer-user-name">
                    {user.username || user.fullname}
                  </p>
                  <p className="drawer-user-email">{user.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="drawer-logout-btn">
                <ArrowRightOnRectangleIcon className="drawer-nav-icon" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="drawer-login-btn"
              >
                <UserIcon className="drawer-nav-icon" />
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="drawer-register-btn"
              >
                <UserPlusIcon className="drawer-nav-icon" />
                Register
              </Link>
            </>
          )}
        </div>

        <div className="drawer-footer">
          <p>© {new Date().getFullYear()} ShopName. All rights reserved.</p>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        /* Navbar Styles */
        .navbar {
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 1000;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .navbar-scrolled {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.1);
          border-bottom-color: rgba(0, 0, 0, 0.1);
        }

        .navbar-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 70px;
        }

        /* Logo Styles */
        .logo-wrapper {
          animation: fadeInRight 0.5s ease-out;
        }

        .logo-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }

        .logo-icon {
          background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
          padding: 0.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
          transition: all 0.3s ease;
        }

        .logo-link:hover .logo-icon {
          transform: rotate(360deg) scale(1.05);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }

        .logo-icon-svg {
          width: 1.25rem;
          height: 1.25rem;
          color: white;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        /* Desktop Navigation */
        .desktop-nav {
          display: none;
          align-items: center;
          gap: 0.25rem;
        }

        @media (min-width: 768px) {
          .desktop-nav {
            display: flex;
          }
          .mobile-menu-btn {
            display: none;
          }
        }

        .nav-link {
          position: relative;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .nav-link-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .nav-link.active .nav-link-content {
          color: #6366f1;
        }

        .nav-link:not(.active) .nav-link-content {
          color: #374151;
        }

        .nav-link:not(.active):hover .nav-link-content {
          color: #6366f1;
        }

        .nav-link-underline {
          position: absolute;
          bottom: 0;
          left: 50%;
          right: 50%;
          height: 2px;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-link.active .nav-link-underline {
          left: 0;
          right: 0;
        }

        .nav-link:not(.active):hover .nav-link-underline {
          left: 0;
          right: 0;
        }

        /* Right Actions */
        .right-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem;
          border-radius: 9999px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          transform: scale(1.05);
        }

        .action-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #374151;
        }

        /* Cart Button */
        .cart-btn {
          position: relative;
          padding: 0.5rem;
          border-radius: 9999px;
          transition: all 0.2s ease;
        }

        .cart-btn:hover {
          background: rgba(0, 0, 0, 0.05);
          transform: scale(1.05);
        }

        .cart-badge {
          position: absolute;
          top: -0.25rem;
          right: -0.25rem;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          font-size: 0.65rem;
          font-weight: bold;
          border-radius: 9999px;
          min-width: 1.25rem;
          height: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 0.25rem;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          animation: bounce 0.5s ease;
        }

        /* Checkout Button */
        .checkout-btn {
          display: none;
          padding: 0.5rem 1.25rem;
          border-radius: 0.75rem;
          font-weight: 700;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        @media (min-width: 768px) {
          .checkout-btn {
            display: block;
          }
        }

        .checkout-btn:not(.disabled) {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
        }

        .checkout-btn:not(.disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }

        .checkout-btn.disabled {
          background: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
          pointer-events: none;
        }

        /* Auth Buttons */
        .auth-buttons {
          display: none;
          align-items: center;
          gap: 0.5rem;
        }

        @media (min-width: 768px) {
          .auth-buttons {
            display: flex;
          }
        }

        .login-btn {
          padding: 0.5rem 1rem;
          border: 2px solid #6366f1;
          border-radius: 0.75rem;
          color: #6366f1;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .login-btn:hover {
          background: #6366f1;
          color: white;
          transform: translateY(-2px);
        }

        .register-btn {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 0.75rem;
          color: white;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .register-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }

        /* User Menu */
        .user-menu {
          position: relative;
          display: none;
        }

        @media (min-width: 768px) {
          .user-menu {
            display: block;
          }
        }

        .user-menu-trigger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border-radius: 0.75rem;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .user-menu-trigger:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .user-avatar {
          width: 2rem;
          height: 2rem;
          border-radius: 9999px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 0.875rem;
        }

        .dropdown-icon {
          width: 1rem;
          height: 1rem;
          color: #4b5563;
          transition: transform 0.3s ease;
        }

        .dropdown-icon.rotate {
          transform: rotate(180deg);
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          width: 240px;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.05);
          overflow: hidden;
          z-index: 100;
          animation: dropdownSlide 0.2s ease-out;
        }

        .dropdown-header {
          padding: 0.75rem 1rem;
          background: #f8fafc;
        }

        .dropdown-name {
          font-weight: 600;
          color: #1f2937;
        }

        .dropdown-email {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .dropdown-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 0.25rem 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: #374151;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .dropdown-item:hover {
          background: #f3f4f6;
          color: #6366f1;
        }

        .dropdown-item.logout:hover {
          color: #ef4444;
        }

        .dropdown-icon-svg {
          width: 1rem;
          height: 1rem;
        }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          padding: 0.5rem;
          border-radius: 0.5rem;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-menu-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        /* Search Dropdown */
        .search-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .search-dropdown.open {
          max-height: 120px;
        }

        .search-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
        }

        .search-form {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1.25rem;
          height: 1.25rem;
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .search-submit {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          padding: 0.375rem 1rem;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-submit:hover {
          transform: translateY(-50%) scale(1.02);
        }

        /* Mobile Drawer */
        .mobile-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1001;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .mobile-drawer-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .mobile-drawer {
          position: fixed;
          right: 0;
          top: 0;
          width: 80%;
          max-width: 320px;
          height: 100%;
          background: white;
          z-index: 1002;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
        }

        .mobile-drawer.open {
          transform: translateX(0);
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .drawer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .logo-icon-small {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          padding: 0.375rem;
          border-radius: 0.5rem;
        }

        .drawer-close {
          padding: 0.5rem;
          border-radius: 0.5rem;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .drawer-nav {
          flex: 1;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .drawer-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: #374151;
          text-decoration: none;
          border-radius: 0.75rem;
          transition: all 0.2s ease;
        }

        .drawer-nav-link:hover {
          background: #f3f4f6;
          color: #6366f1;
        }

        .drawer-nav-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .drawer-divider {
          height: 1px;
          background: #f3f4f6;
          margin: 0.5rem 1rem;
        }

        .drawer-cart-section {
          padding: 0.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .drawer-cart-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-radius: 0.75rem;
          text-decoration: none;
          color: #374151;
        }

        .drawer-cart-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .drawer-cart-badge {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: bold;
        }

        .drawer-checkout-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          text-decoration: none;
          border-radius: 0.75rem;
          font-weight: 600;
        }

        .drawer-checkout-link.disabled {
          background: #e5e7eb;
          color: #9ca3af;
          pointer-events: none;
        }

        .drawer-auth-section {
          padding: 0.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .drawer-user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-radius: 0.75rem;
        }

        .drawer-avatar {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 9999px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1rem;
        }

        .drawer-user-name {
          font-weight: 600;
          color: #1f2937;
        }

        .drawer-user-email {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .drawer-login-btn,
        .drawer-register-btn,
        .drawer-logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .drawer-login-btn {
          border: 2px solid #6366f1;
          color: #6366f1;
        }

        .drawer-register-btn {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
        }

        .drawer-logout-btn {
          background: #fee2e2;
          color: #ef4444;
          border: none;
          cursor: pointer;
        }

        .drawer-footer {
          padding: 1rem;
          text-align: center;
          font-size: 0.75rem;
          color: #9ca3af;
          border-top: 1px solid #f3f4f6;
        }

        /* Animations */
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }

        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

// Desktop NavLink Component
const NavLink = ({ to, children, icon: Icon, isActive }) => {
  return (
    <Link to={to} className={`nav-link ${isActive ? "active" : ""}`}>
      <div className="nav-link-content">
        {Icon && <Icon className="action-icon" />}
        {children}
      </div>
      <div className="nav-link-underline" />
    </Link>
  );
};
