import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/orderService";
import { paymentService } from "../services/paymentService";
import { authService } from "../services/authService";
import KHQRModal from "../components/payment/KHQRModal";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  TruckIcon,
  CreditCardIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart, cartVersion } = useCart();
  const { user, login } = useAuth();

  const total = useMemo(() => getCartTotal(), [getCartTotal, cartVersion]);

  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [registerAccount, setRegisterAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    address: "",
    postalcode: "",
    phone: "",
    notes: "",
  });

  const canCheckout = cart.items && cart.items.length > 0;
  const EXCHANGE_RATE = 4100;

  // Debug logging
  useEffect(() => {
    console.log("🛒 Current cart items:", cart.items.length);
    console.log("🛒 Cart version:", cartVersion);
    console.log("🛒 Cart total:", total);
  }, [cart, cartVersion, total]);

  // Get display amount based on selected currency
  const getDisplayAmount = () => {
    if (selectedCurrency === "USD") {
      return {
        value: total,
        formatted: `$${total.toFixed(2)}`,
        currency: "USD",
        symbol: "$",
      };
    } else {
      const khrAmount = Math.round(total * EXCHANGE_RATE);
      return {
        value: khrAmount,
        formatted: `${khrAmount.toLocaleString()} ៛`,
        currency: "KHR",
        symbol: "៛",
      };
    }
  };

  const displayAmount = getDisplayAmount();

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullname: user.fullname ?? user.username ?? prev.fullname,
        email: user.email ?? prev.email,
        phone: user.phone ?? prev.phone,
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canCheckout) {
      toast.error("Cart is empty");
      return;
    }

    if (!user && !registerAccount) {
      toast.error("Please login or register before checkout.");
      navigate("/login");
      return;
    }

    if (!user && registerAccount) {
      if (!password || password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    setQrData(null);

    try {
      let currentUser = user;

      // Register new account if needed
      if (!currentUser && registerAccount) {
        const registerData = await authService.register({
          fullname: form.fullname,
          email: form.email,
          password,
          phone: form.phone,
        });

        if (!registerData?.success) {
          throw new Error(registerData?.message || "Registration failed.");
        }

        const loginData = await authService.login({
          email: form.email,
          password,
        });

        if (!loginData?.isLogin || !loginData?.token) {
          throw new Error(
            loginData?.message || "Login failed after registration.",
          );
        }

        login(loginData.token, {
          ...loginData.customer,
          username: loginData.customer?.fullname || form.fullname,
        });
        currentUser = loginData.customer;
        toast.success("Account created and logged in successfully.");
      }

      // Prepare order items
      const items = cart.items.map((i) => ({
        prd_id: i.prd_id,
        unit_price: Number(i.unit_cost ?? 0),
        qty: Number(i.quantity ?? 0),
      }));

      // Create order payload
      const orderPayload = {
        fullname: form.fullname,
        email: form.email,
        address: form.address,
        postalcode: form.postalcode,
        phone: form.phone,
        notes: form.notes,
        amount: total,
        status_payment: "pending",
        customer_id: currentUser?.customer_id,
        created_by:
          currentUser?.fullname ?? currentUser?.username ?? form.fullname,
        items,
      };

      // Create order
      console.log("📦 Creating order...", orderPayload);
      const orderResponse = await orderService.createOrder(orderPayload);

      if (!orderResponse?.success) {
        throw new Error(orderResponse?.message || "Failed to create order");
      }

      // ✅ IMPORTANT: Get the correct order_id from response
      const orderId = orderResponse.data?.order_id || orderResponse.order_id;
      console.log("✅ Order created with ID:", orderId);
      setCreatedOrderId(orderId);

      // Calculate KHQR amount
      let khqrAmount = total;
      if (selectedCurrency === "KHR") {
        khqrAmount = Math.round(total * EXCHANGE_RATE);
      }

      console.log("========== CHECKOUT DEBUG ==========");
      console.log("Total USD:", total);
      console.log("Selected Currency:", selectedCurrency);
      console.log("KHQR Amount:", khqrAmount);
      console.log("Order ID:", orderId);
      console.log("Cart Items:", cart.items.length);
      console.log("====================================");

      // ✅ IMPORTANT: Generate KHQR with orderId
      const qrRes = await paymentService.generateKHQR({
        amount: khqrAmount,
        currency: selectedCurrency,
        orderId: orderId, // ← This is CRITICAL - must send orderId
      });

      console.log("📡 KHQR Response:", qrRes);

      if (!qrRes?.success) {
        toast.error(qrRes?.message || "Could not generate KHQR code");
        return;
      }

      const qrInfo = qrRes.data ?? qrRes;
      setQrData(qrInfo);
      toast.success("Order created! Please scan KHQR to complete payment.");
    } catch (err) {
      console.error("❌ Checkout error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Checkout failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle payment completion
  const handlePaymentComplete = async () => {
    if (isPaymentComplete) return;

    setIsPaymentComplete(true);

    try {
      console.log("💰 Payment completed! Starting cart cleanup...");
      console.log("Cart items before clear:", cart.items.length);
      console.log("Order ID:", createdOrderId);

      // Clear cart
      await clearCart();

      // Force delay to ensure localStorage is updated
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Verify cart is cleared
      const storedCart = localStorage.getItem("cart");
      console.log("LocalStorage cart after clear:", storedCart);

      if (storedCart && JSON.parse(storedCart).items?.length > 0) {
        console.warn("Cart still has items, forcing clear...");
        localStorage.removeItem("cart");
      }

      // Navigate to home with success
      navigate("/", {
        replace: true,
        state: {
          paymentSuccess: true,
          orderId: createdOrderId,
          message: "Payment successful! Thank you for your order.",
        },
      });

      toast.success("Payment successful! Thank you for your order.", {
        duration: 4000,
      });
    } catch (error) {
      console.error("Error completing payment:", error);
      localStorage.removeItem("cart");
      navigate("/", {
        replace: true,
        state: {
          paymentSuccess: true,
          orderId: createdOrderId,
          message: "Payment processed. Please refresh to update cart.",
        },
      });
    }
  };

  const handleModalClose = () => {
    setQrData(null);
  };

  // Empty cart state
  if (!canCheckout && !qrData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link
            to="/shop"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Continue Shopping →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">Back to Cart</span>
          </button>
          <h1 className="text-3xl font-extrabold text-gray-800">Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Form */}
          <div className="lg:flex-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                Shipping Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Login/Register Section */}
                {!user && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                    <p className="font-semibold mb-2">
                      Need an account to checkout?
                    </p>
                    <p className="mb-3">
                      Register during checkout or login if you have an account.
                    </p>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <Link
                        to="/login"
                        className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-blue-600 border border-blue-200 shadow-sm hover:bg-blue-50 transition-colors"
                      >
                        Login instead
                      </Link>
                      <button
                        type="button"
                        onClick={() => setRegisterAccount((prev) => !prev)}
                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 transition-colors"
                      >
                        {registerAccount
                          ? "Hide registration"
                          : "Register an account"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Registration Fields */}
                {registerAccount && !user && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 space-y-4">
                    <div className="text-sm font-semibold text-blue-800">
                      Register account while you checkout
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700 text-sm">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Create password"
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-gray-700 text-sm">
                          Confirm Password{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Repeat password"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700 text-sm">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={form.fullname}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, fullname: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700 text-sm">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700 text-sm">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={form.address}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, address: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={2}
                    placeholder="Street address, apartment, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700 text-sm">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={form.postalcode}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, postalcode: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="12345"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700 text-sm">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="+855 XX XXX XXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-700 text-sm">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={2}
                    placeholder="Special delivery instructions, etc."
                  />
                </div>

                {/* Payment Method Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mt-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCardIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-800">
                      Payment Method
                    </h3>
                  </div>

                  {/* Currency Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Currency
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedCurrency("USD")}
                        className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                          selectedCurrency === "USD"
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <CurrencyDollarIcon className="w-5 h-5" />
                        USD
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCurrency("KHR")}
                        className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                          selectedCurrency === "KHR"
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <BanknotesIcon className="w-5 h-5" />
                        KHR
                      </button>
                    </div>

                    {/* Payment Info */}
                    <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">🏦</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            KHQR / Bakong
                          </p>
                          <p className="text-xs text-gray-500">
                            Scan QR code with any banking app
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Currency Info */}
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-gray-500">
                        {selectedCurrency === "USD"
                          ? `💵 Pay in US Dollars - Amount: $${total.toFixed(2)} USD`
                          : `🇰🇭 Pay in Cambodian Riel - Amount: ${Math.round(total * EXCHANGE_RATE).toLocaleString()} KHR`}
                      </p>
                      {selectedCurrency === "KHR" && (
                        <p className="text-xs text-gray-400">
                          Exchange Rate: 1 USD ={" "}
                          {EXCHANGE_RATE.toLocaleString()} KHR
                        </p>
                      )}
                      <p className="text-xs text-amber-600">
                        ⚠️ Ensure your bank account has sufficient balance in{" "}
                        {selectedCurrency}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 shadow-lg mt-4"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    `Place Order & Pay (${displayAmount.formatted})`
                  )}
                </button>

                <p className="text-xs text-center text-gray-500 mt-4 flex items-center justify-center gap-1">
                  <ShieldCheckIcon className="w-4 h-4" />
                  Your payment information is secure
                </p>
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-extrabold text-gray-800 mb-4">
                Order Summary
              </h3>

              {/* Cart Items */}
              <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div
                    key={item.prd_id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-600">
                      {item.prd_name}{" "}
                      <span className="font-semibold">x{item.quantity}</span>
                    </span>
                    <span className="font-semibold text-gray-800">
                      $
                      {(
                        Number(item.unit_cost ?? 0) * Number(item.quantity ?? 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal (USD)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">
                    Total (USD)
                  </span>
                  <span className="text-2xl font-extrabold text-blue-600">
                    ${total.toFixed(2)}
                  </span>
                </div>

                {selectedCurrency === "KHR" && (
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-gray-200">
                    <span className="text-sm font-semibold text-gray-700">
                      Total in KHR:
                    </span>
                    <span className="text-xl font-extrabold text-green-600">
                      {Math.round(total * EXCHANGE_RATE).toLocaleString()} ៛
                    </span>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                  <TruckIcon className="w-3 h-3" />
                  Free delivery on all orders
                </p>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl">🔒</div>
                    <p className="text-xs text-gray-500 mt-1">Secure</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl">🚚</div>
                    <p className="text-xs text-gray-500 mt-1">Fast Delivery</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl">💯</div>
                    <p className="text-xs text-gray-500 mt-1">Guarantee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KHQR Modal */}
      {qrData && (
        <KHQRModal
          qrData={qrData}
          onClose={handleModalClose}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
