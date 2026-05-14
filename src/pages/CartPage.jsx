import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  TrashIcon,
  ArrowLeftIcon,
  ShoppingBagIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useCart();

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 mb-3">
              Your Cart is Empty
            </h2>
            <p className="text-gray-500 mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/shop")}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">Continue Shopping</span>
          </button>
          <h1 className="text-3xl font-extrabold text-gray-800">
            Shopping Cart
          </h1>
          <div className="w-32" /> {/* Spacer for alignment */}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:flex-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 bg-gray-50 px-6 py-4 border-b font-bold text-gray-600">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Items */}
              <div className="divide-y">
                {cart.items.map((item) => (
                  <div
                    key={item.prd_id}
                    className="p-4 md:p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Product Image & Info */}
                      <div className="flex gap-4 md:flex-1">
                        <img
                          src={item.photo || "/placeholder.jpg"}
                          alt={item.prd_name}
                          className="w-24 h-24 object-cover rounded-xl border shadow-sm"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800 mb-1">
                            {item.prd_name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {item.brand?.desc || "Brand"} |{" "}
                            {item.category?.desc || "Category"}
                          </p>
                          <div className="md:hidden">
                            <div className="text-xl font-bold text-blue-600 mb-2">
                              ${Number(item.unit_cost ?? 0).toFixed(2)}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.prd_id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Price (Desktop) */}
                      <div className="hidden md:block md:text-center md:w-32 font-semibold text-gray-700">
                        ${Number(item.unit_cost ?? 0).toFixed(2)}
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center justify-between md:justify-center md:w-32">
                        <label className="md:hidden text-sm font-medium text-gray-600">
                          Qty:
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.prd_id,
                                Math.max(1, item.quantity - 1),
                              )
                            }
                            className="w-8 h-8 border rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.prd_id, item.quantity + 1)
                            }
                            className="w-8 h-8 border rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="flex items-center justify-between md:justify-end md:w-32">
                        <label className="md:hidden text-sm font-medium text-gray-600">
                          Total:
                        </label>
                        <span className="text-lg font-bold text-blue-600">
                          $
                          {(
                            Number(item.unit_cost ?? 0) * item.quantity
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between gap-4 border-t">
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to clear your cart?",
                      )
                    ) {
                      clearCart();
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  <TrashIcon className="w-4 h-4" />
                  Clear Cart
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/shop")}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Add More Items
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-96">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-extrabold text-gray-800 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>
                    Subtotal (
                    {cart.items.reduce((sum, i) => sum + i.quantity, 0)} items)
                  </span>
                  <span className="font-semibold">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-extrabold text-blue-600">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Taxes and shipping calculated at checkout
                </p>
              </div>

              <Link
                to="/checkout"
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                <CreditCardIcon className="w-5 h-5" />
                Proceed to Checkout
              </Link>

              {/* Payment Methods */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-xs text-center text-gray-500 mb-2">
                  Secure Payment Methods
                </p>
                <div className="flex justify-center gap-3">
                  <span className="text-2xl">💳</span>
                  <span className="text-2xl">🏦</span>
                  <span className="text-2xl">📱</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
