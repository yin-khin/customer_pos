import React, { useState, useEffect } from "react";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { brandService } from "../services/brandService";
import ProductList from "../components/products/ProductList";
import Loader from "../components/common/Loader";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  useEffect(() => {
    Promise.all([
      productService.getAllProducts(),
      categoryService.getAllCategories(),
      brandService.getAllBrands(),
    ])
      .then(([prods, cats, br]) => {
        setProducts(prods.products || prods || []);
        setCategories(cats.category || cats || []);
        setBrands(br.brand || br || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = products.filter((p) => {
    if (selectedCategory && p.category_id !== selectedCategory) return false;
    if (selectedBrand && p.brand_id !== selectedBrand) return false;
    return true;
  });

  if (loading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 space-y-6">
          {/* Categories Filter */}
          <div>
            <h3 className="font-bold text-lg mb-2">Categories</h3>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option key="all-categories" value="">
                All Categories
              </option>
              {categories.map((category, idx) => {
                const value = category.cat_id ?? category.id ?? "";
                const label = category.desc ?? category.name ?? `Category ${idx + 1}`;
                const safeKey = value ? `cat-${value}` : `cat-fallback-${idx}-${label}`;
                return (
                  <option key={safeKey} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Brands Filter */}
          <div>
            <h3 className="font-bold text-lg mb-2">Brands</h3>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option key="all-brands" value="">
                All Brands
              </option>
              {brands.map((brand, idx) => {
                const value = brand.brand_id ?? brand.id ?? "";
                const label = brand.desc ?? brand.name ?? `Brand ${idx + 1}`;
                const safeKey = value ? `brand-${value}` : `brand-fallback-${idx}-${label}`;
                return (
                  <option key={safeKey} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory || selectedBrand) && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Category filtered
                    <button
                      onClick={() => setSelectedCategory("")}
                      className="hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedBrand && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Brand filtered
                    <button
                      onClick={() => setSelectedBrand("")}
                      className="hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1">
          {/* Results Count */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">Found {filtered.length} products</p>
            <button
              onClick={() => {
                setSelectedCategory("");
                setSelectedBrand("");
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear all filters
            </button>
          </div>

          <ProductList products={filtered} />
        </main>
      </div>
    </div>
  );
}
