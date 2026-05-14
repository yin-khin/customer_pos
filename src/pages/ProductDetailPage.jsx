import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { productService } from "../services/productService";
import { useCart } from "../context/CartContext";
import Loader from "../components/common/Loader";
import ProductCard from "../components/products/ProductCard";
import toast from "react-hot-toast";
import {
  ShoppingCartIcon,
  CheckIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  HeartIcon,
  ShareIcon,
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  GiftIcon,
  ClockIcon,
  TagIcon,
  CubeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);

  // Mock product images
  const productImages = useMemo(() => {
    if (!product) return [];
    return [
      product.photo || "/placeholder.jpg",
      product.photo2 || product.photo || "/placeholder.jpg",
      product.photo3 || product.photo || "/placeholder.jpg",
    ].filter(Boolean);
  }, [product]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    productService
      .getProductById(id)
      .then(async (res) => {
        if (!mounted) return;
        const p = res?.product ?? res ?? null;
        setProduct(p);
        setSelectedImage(0);
        if (p) {
          try {
            const allProducts = await productService.getAllProducts();
            const productsList = allProducts?.products ?? allProducts ?? [];
            const related = productsList
              .filter(
                (item) =>
                  item.prd_id !== p.prd_id &&
                  (item.category_id === p.category_id ||
                    item.brand_id === p.brand_id),
              )
              .slice(0, 8);
            setRelatedProducts(related);
          } catch (err) {
            console.error(err);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const stock = useMemo(() => Number(product?.qty ?? 0), [product]);
  const isOutOfStock = stock <= 0;
  const discount = product?.discount || 0;
  const originalPrice = Number(product?.unit_cost ?? 0);
  const finalPrice =
    discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
  const savedAmount = originalPrice - finalPrice;

  const handleAdd = () => {
    if (isOutOfStock) return toast.error("Out of stock");
    const qtyToAdd = Math.min(quantity, stock);
    addToCart(product, qtyToAdd);
    setAddedToCart(true);
    toast.success(`${product.prd_name} added to cart!`, { duration: 2000 });
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    window.location.href = "/checkout";
  };

  const handleMouseMove = (e) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  if (loading) return <Loader />;
  if (!product) return <NotFound />;

  return (
    <div className="product-detail-page">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      <div className="product-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb-link">
            Home
          </Link>
          <ChevronRightIcon className="breadcrumb-icon" />
          <Link to="/shop" className="breadcrumb-link">
            Shop
          </Link>
          <ChevronRightIcon className="breadcrumb-icon" />
          <span className="breadcrumb-current">{product.prd_name}</span>
        </nav>

        {/* Main Product Grid */}
        <div className="product-grid">
          {/* Left Column - Image Gallery */}
          <div className="product-gallery">
            <div
              ref={imageContainerRef}
              className={`gallery-main ${isZoomed ? "zoomed" : ""}`}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={productImages[selectedImage] || "/placeholder.jpg"}
                alt={product.prd_name}
                className="gallery-img"
                style={{
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                }}
              />
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="zoom-btn"
              >
                <MagnifyingGlassIcon className="zoom-icon" />
              </button>

              {discount > 0 && (
                <div className="discount-badge">-{discount}% OFF</div>
              )}

              {!isOutOfStock && stock <= 5 && (
                <div className="stock-badge-low">🔥 Only {stock} left</div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="gallery-thumbnails">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`thumbnail-btn ${selectedImage === idx ? "active" : ""}`}
                  >
                    <img
                      src={img}
                      alt={`Thumb ${idx + 1}`}
                      className="thumbnail-img"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Details */}
          <div className="product-info">
            <h1 className="product-title">{product.prd_name}</h1>

            <div className="rating-section">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarSolid key={star} className="star-filled" />
                ))}
              </div>
              <span className="rating-count">(128 reviews)</span>
            </div>

            <div className="brand-tags">
              <span className="brand-tag">
                {product.brand?.desc || "Premium Brand"}
              </span>
              <span className="category-tag">
                {product.category?.desc || "Uncategorized"}
              </span>
            </div>

            <div className="price-section">
              <div className="price-wrapper">
                <span className="current-price">${finalPrice.toFixed(2)}</span>
                {discount > 0 && (
                  <>
                    <span className="original-price">
                      ${originalPrice.toFixed(2)}
                    </span>
                    <span className="saved-badge">
                      Save ${savedAmount.toFixed(2)}
                    </span>
                  </>
                )}
              </div>
              <div className="shipping-info">
                <TruckIcon className="shipping-icon" />
                <span>Free Shipping Worldwide</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="quantity-section">
              <label className="quantity-label">Quantity</label>
              <div className="quantity-selector">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="qty-btn"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    let val = Number(e.target.value);
                    if (val > stock) val = stock;
                    if (val < 1) val = 1;
                    setQuantity(val);
                  }}
                  className="qty-input"
                  disabled={isOutOfStock}
                />
                <button
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  disabled={quantity >= stock || isOutOfStock}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`add-to-cart-btn ${addedToCart ? "added" : ""}`}
              >
                {addedToCart ? (
                  <>
                    <CheckIcon className="btn-icon" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCartIcon className="btn-icon" />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="buy-now-btn"
              >
                Buy Now
              </button>

              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
              >
                <HeartIcon className="wishlist-icon" />
              </button>
            </div>

            {/* Features Grid */}
            <div className="features-grid">
              <div className="feature-card">
                <TruckIcon className="feature-icon" />
                <div>
                  <p className="feature-label">Delivery</p>
                  <p className="feature-value">Free Shipping</p>
                </div>
              </div>
              <div className="feature-card">
                <ShieldCheckIcon className="feature-icon" />
                <div>
                  <p className="feature-label">Warranty</p>
                  <p className="feature-value">2 Years</p>
                </div>
              </div>
              <div className="feature-card">
                <ArrowPathIcon className="feature-icon" />
                <div>
                  <p className="feature-label">Returns</p>
                  <p className="feature-value">30 Days</p>
                </div>
              </div>
              <div className="feature-card">
                <ClockIcon className="feature-icon" />
                <div>
                  <p className="feature-label">Support</p>
                  <p className="feature-value">24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="tabs-section">
          <div className="tabs-header">
            {["description", "specifications", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && <span className="tab-indicator" />}
              </button>
            ))}
          </div>

          <div className="tab-content">
            {activeTab === "description" && (
              <div className="description-content">
                <p>
                  {product.remark ||
                    "Experience premium quality with this amazing product. Crafted with attention to detail and built to last."}
                </p>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="specs-content">
                <div className="specs-grid">
                  <div className="spec-item">
                    <span className="spec-label">Brand</span>
                    <span className="spec-value">
                      {product.brand?.desc || "Premium"}
                    </span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Category</span>
                    <span className="spec-value">
                      {product.category?.desc || "General"}
                    </span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">SKU</span>
                    <span className="spec-value">
                      {product.prd_id || "N/A"}
                    </span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Stock Status</span>
                    <span
                      className={`spec-value ${stock > 0 ? "in-stock" : "out-stock"}`}
                    >
                      {stock > 0 ? `${stock} units available` : "Out of stock"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="reviews-content">
                <p className="no-reviews">
                  No reviews yet. Be the first to review!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-section">
            <div className="related-header">
              <h2 className="related-title">You May Also Like</h2>
              <Link to="/shop" className="view-all-link">
                View All
                <ChevronRightIcon className="view-all-icon" />
              </Link>
            </div>

            <div className="related-grid">
              {relatedProducts.map((relatedProduct, idx) => (
                <div
                  key={relatedProduct.prd_id}
                  className="related-item"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Newsletter Section */}
        <div className="newsletter-section">
          <GiftIcon className="newsletter-icon" />
          <h3 className="newsletter-title">Get 10% Off Your Next Order</h3>
          <p className="newsletter-text">
            Subscribe to our newsletter and get exclusive deals
          </p>
          <form className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-btn">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .product-detail-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #f8f9fc 100%);
          padding-top: 5rem;
          overflow-x: hidden;
          position: relative;
        }

        /* Animated Background */
        .animated-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.3;
          animation: float 20s infinite ease-in-out;
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #6366f1, #a855f7);
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #a855f7, #ec4899);
          bottom: -150px;
          right: -150px;
          animation-delay: 5s;
        }

        .orb-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #06b6d4, #3b82f6);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 10s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .product-container {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        /* Breadcrumb */
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          font-size: 0.875rem;
          animation: slideDown 0.5s ease-out;
        }

        .breadcrumb-link {
          color: #6b7280;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .breadcrumb-link:hover {
          color: #6366f1;
        }

        .breadcrumb-icon {
          width: 1rem;
          height: 1rem;
          color: #9ca3af;
        }

        .breadcrumb-current {
          color: #1f2937;
          font-weight: 500;
        }

        /* Product Grid */
        .product-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
          animation: fadeInUp 0.6s ease-out;
        }

        @media (min-width: 1024px) {
          .product-grid {
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
          }
        }

        /* Gallery */
        .product-gallery {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .gallery-main {
          position: relative;
          background: white;
          border-radius: 1.5rem;
          overflow: hidden;
          aspect-ratio: 1 / 1;
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.1);
          cursor: zoom-in;
          transition: box-shadow 0.3s ease;
        }

        .gallery-main:hover {
          box-shadow: 0 30px 50px -15px rgba(0, 0, 0, 0.15);
        }

        .gallery-main.zoomed {
          cursor: zoom-out;
        }

        .gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .gallery-main.zoomed .gallery-img {
          transform: scale(1.8);
        }

        .zoom-btn {
          position: absolute;
          bottom: 1rem;
          right: 1rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0;
          transform: scale(0.9);
        }

        .gallery-main:hover .zoom-btn {
          opacity: 1;
          transform: scale(1);
        }

        .zoom-btn:hover {
          background: white;
          transform: scale(1.05);
        }

        .zoom-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #374151;
        }

        .discount-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: linear-gradient(135deg, #ef4444, #f97316);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: bold;
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
          animation: pulse 2s infinite;
        }

        .stock-badge-low {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #f59e0b;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: bold;
          animation: shake 0.5s ease;
        }

        /* Thumbnails */
        .gallery-thumbnails {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }

        .thumbnail-btn {
          width: 5rem;
          height: 5rem;
          border-radius: 0.75rem;
          overflow: hidden;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          padding: 0;
        }

        .thumbnail-btn.active {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .thumbnail-btn:hover:not(.active) {
          border-color: #cbd5e1;
          transform: scale(1.05);
        }

        .thumbnail-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Product Info */
        .product-info {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .product-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          line-height: 1.2;
        }

        @media (min-width: 768px) {
          .product-title {
            font-size: 2.5rem;
          }
        }

        .rating-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .stars {
          display: flex;
          gap: 0.25rem;
        }

        .star-filled {
          width: 1.25rem;
          height: 1.25rem;
          color: #fbbf24;
        }

        .rating-count {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .brand-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .brand-tag,
        .category-tag {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .brand-tag {
          background: #e0e7ff;
          color: #4338ca;
        }

        .category-tag {
          background: #f3e8ff;
          color: #6b21a5;
        }

        .price-section {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          padding: 1.25rem;
          border-radius: 1rem;
        }

        .price-wrapper {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 0.5rem;
        }

        .current-price {
          font-size: 2.5rem;
          font-weight: 800;
          color: #6366f1;
        }

        .original-price {
          font-size: 1.25rem;
          color: #9ca3af;
          text-decoration: line-through;
        }

        .saved-badge {
          background: #10b981;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: bold;
        }

        .shipping-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .shipping-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        /* Quantity */
        .quantity-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .quantity-label {
          font-weight: 600;
          color: #374151;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .qty-btn {
          width: 2.5rem;
          height: 2.5rem;
          background: #f9fafb;
          border: none;
          font-size: 1.25rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .qty-btn:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .qty-input {
          width: 4rem;
          height: 2.5rem;
          text-align: center;
          border: none;
          font-size: 1rem;
          font-weight: 600;
        }

        .qty-input:focus {
          outline: none;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .add-to-cart-btn,
        .buy-now-btn,
        .wishlist-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
        }

        .add-to-cart-btn {
          flex: 2;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
        }

        .add-to-cart-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
        }

        .add-to-cart-btn.added {
          background: #10b981;
        }

        .add-to-cart-btn:disabled,
        .buy-now-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .buy-now-btn {
          flex: 1;
          background: linear-gradient(135deg, #f59e0b, #ea580c);
          color: white;
        }

        .buy-now-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
        }

        .wishlist-btn {
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          background: white;
        }

        .wishlist-btn:hover {
          border-color: #ef4444;
          transform: scale(1.05);
        }

        .wishlist-btn.active {
          background: #fee2e2;
          border-color: #ef4444;
        }

        .wishlist-btn.active .wishlist-icon {
          fill: #ef4444;
          color: #ef4444;
        }

        .wishlist-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #6b7280;
        }

        .btn-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        /* Features */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .feature-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.75rem;
          transition: all 0.2s ease;
        }

        .feature-card:hover {
          background: #f3f4f6;
          transform: translateY(-2px);
        }

        .feature-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: #6366f1;
        }

        .feature-label {
          font-size: 0.7rem;
          color: #6b7280;
        }

        .feature-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
        }

        /* Tabs */
        .tabs-section {
          margin: 3rem 0;
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .tabs-header {
          display: flex;
          gap: 0.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
        }

        .tab-btn {
          position: relative;
          padding: 1rem 1.5rem;
          background: transparent;
          border: none;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          color: #6366f1;
        }

        .tab-btn.active {
          color: #6366f1;
        }

        .tab-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          animation: slideIn 0.3s ease;
        }

        .tab-content {
          padding: 2rem;
        }

        .description-content p {
          color: #4b5563;
          line-height: 1.6;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .spec-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.5rem;
        }

        .spec-label {
          font-weight: 600;
          color: #374151;
        }

        .spec-value {
          color: #6b7280;
        }

        .spec-value.in-stock {
          color: #10b981;
        }

        .spec-value.out-stock {
          color: #ef4444;
        }

        .no-reviews {
          text-align: center;
          color: #6b7280;
          padding: 2rem;
        }

        /* Related Products */
        .related-section {
          margin: 4rem 0;
        }

        .related-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .related-title {
          font-size: 1.875rem;
          font-weight: 800;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .view-all-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #6366f1;
          text-decoration: none;
          font-weight: 600;
          transition: gap 0.3s ease;
        }

        .view-all-link:hover {
          gap: 0.75rem;
        }

        .view-all-icon {
          width: 1rem;
          height: 1rem;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .related-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .related-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .related-item {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }

        /* Newsletter */
        .newsletter-section {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 2rem;
          padding: 3rem;
          text-align: center;
          color: white;
          margin: 3rem 0;
        }

        .newsletter-icon {
          width: 4rem;
          height: 4rem;
          margin: 0 auto 1rem;
          opacity: 0.8;
        }

        .newsletter-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .newsletter-text {
          opacity: 0.9;
          margin-bottom: 1.5rem;
        }

        .newsletter-form {
          display: flex;
          gap: 0.5rem;
          max-width: 400px;
          margin: 0 auto;
        }

        .newsletter-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 0.75rem;
          font-size: 1rem;
        }

        .newsletter-input:focus {
          outline: none;
        }

        .newsletter-btn {
          padding: 0.75rem 1.5rem;
          background: #1f2937;
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .newsletter-btn:hover {
          background: #111827;
          transform: translateY(-2px);
        }

        /* Animations */
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @keyframes slideIn {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
}

const NotFound = () => (
  <div className="not-found">
    <div className="not-found-content">
      <div className="not-found-icon">🔍</div>
      <h2 className="not-found-title">Product Not Found</h2>
      <p className="not-found-text">
        The product you're looking for doesn't exist.
      </p>
      <Link to="/shop" className="not-found-btn">
        Continue Shopping
      </Link>
    </div>
    <style jsx>{`
      .not-found {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #f5f7fa, #f8f9fc);
      }
      .not-found-content {
        text-align: center;
        padding: 2rem;
      }
      .not-found-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        animation: bounce 1s ease infinite;
      }
      .not-found-title {
        font-size: 1.875rem;
        font-weight: 800;
        color: #1f2937;
        margin-bottom: 0.5rem;
      }
      .not-found-text {
        color: #6b7280;
        margin-bottom: 1.5rem;
      }
      .not-found-btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, #6366f1, #a855f7);
        color: white;
        text-decoration: none;
        border-radius: 0.75rem;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      .not-found-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
      }
      @keyframes bounce {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }
    `}</style>
  </div>
);
