import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCartIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const stock = Number(product?.qty ?? 0);
  const disabled = stock === 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (disabled) return;
    addToCart(product, 1);
    toast.success(`${product.prd_name} added`, { icon: "🛒" });
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
      <Link to={`/product/${product.prd_id}`} className="block">
        <div className="relative overflow-hidden bg-gray-100 aspect-square">
          <img
            src={product.photo || "/placeholder.jpg"}
            alt={product.prd_name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <EyeIcon className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
          {stock <= 5 && stock > 0 && (
            <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Low stock
            </span>
          )}
        </div>

        <div className="p-4 space-y-2">
          <h3 className="font-bold text-lg line-clamp-1 group-hover:text-indigo-600 transition">
            {product.prd_name}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-1">
            {product?.brand?.desc ?? "Brand"} |{" "}
            {product?.category?.desc ?? "Category"}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-black text-indigo-600">
              ${Number(product.unit_cost ?? 0).toFixed(2)}
            </span>
            <span
              className={`text-sm font-semibold ${stock > 0 ? "text-green-600" : "text-red-500"}`}
            >
              {stock > 0 ? `Stock: ${stock}` : "Out"}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4 pt-0">
        <button
          onClick={handleAdd}
          disabled={disabled}
          className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300 ${
            disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-xl transform hover:scale-105 active:scale-95"
          }`}
        >
          <ShoppingCartIcon className="w-5 h-5" />
          {disabled ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
