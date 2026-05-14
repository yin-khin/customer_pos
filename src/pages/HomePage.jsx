import React, { useEffect, useMemo, useState } from "react";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { productService } from "../services/productService";
import ProductList from "../components/products/ProductList";
import Loader from "../components/common/Loader";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero Slides Data with Guaranteed Working Images
  const heroSlides = [
    {
      id: 1,
      title: "Summer Sale 2024",
      subtitle: "Up to 50% Off on Selected Items",
      description:
        "Shop the latest trends at unbeatable prices. Limited time offer!",
      buttonText: "Shop Now",
      buttonLink: "/shop",
      image:
        "https://cdn.prod.website-files.com/68f9e3f8013dbcd952d08590/68f9e3f8013dbcd952d093fa_64e2e826f3a712dd989e3357_YDBqk6Rg0MabPN7Jo5etqac0ua1GDwpROW0ioKZnXLWP0EuIA-out-0.png",
      bgColor: "from-purple-100",
    },
    {
      id: 2,
      title: "Electronics Deals",
      subtitle: "Best Prices on Gadgets",
      description:
        "Get the latest electronics at amazing discounts. Don't miss out!",
      buttonText: "Shop Electronics",
      buttonLink: "/shop",
      image:
        "https://www.visualspiders.com/wp-content/uploads/2022/09/Product-Graphic-b10.jpg",
      //   bgColor: "from-purple-300 to-purple-400",
    },
    {
      id: 3,
      title: "Fashion Week",
      subtitle: "New Arrivals Every Day",
      description:
        "Discover the latest fashion trends. Style that speaks for itself!",
      buttonText: "Shop Fashion",
      buttonLink: "/shop",
      image:
        "https://img.magnific.com/free-psd/black-friday-super-sale-facebook-cover-banner-template_106176-5893.jpg?semt=ais_hybrid&w=740&q=80",
      //   bgColor: "from-purple-300 to-purple-400",
    },
  ];

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    productService
      .getAllProducts()
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res) ? res : (res?.products ?? []);
        setProducts(list);
      })
      .catch(() => {
        if (!mounted) return;
        setProducts([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      String(p.prd_name || "")
        .toLowerCase()
        .includes(q),
    );
  }, [products, search]);

  if (loading) return <Loader />;

  return (
    <div>
      {/* Hero Carousel Section */}
      <section className="relative w-full overflow-hidden">
        <div className="relative h-[400px] sm:h-[500px] md:h-[550px] lg:h-[600px] w-full">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                index === currentSlide
                  ? "opacity-100 visible"
                  : "opacity-0 invisible"
              }`}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/50" />
                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} opacity-60`}
                />
              </div>

              {/* Content */}
              <div className="relative h-full flex items-center z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl text-white">
                    <h2 className="text-sm sm:text-base font-semibold tracking-wide uppercase mb-2">
                      {slide.subtitle}
                    </h2>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-4">
                      {slide.title}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-gray-100">
                      {slide.description}
                    </p>
                    <a
                      href={slide.buttonLink}
                      className="inline-block bg-white text-gray-900 font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base shadow-lg"
                    >
                      {slide.buttonText} →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-colors z-20"
        >
          <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-colors z-20"
        >
          <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white w-8 sm:w-10"
                  : "bg-white/50 hover:bg-white/80 w-2"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="max-w-xl mx-auto relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search products..."
              className="w-full border rounded-lg px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-extrabold mb-8">Our Products</h2>
        <ProductList products={filtered} />
      </section>
    </div>
  );
}
