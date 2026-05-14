import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import Loader from "../components/common/Loader";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const isValid = useMemo(() => {
    return (
      fullname.trim().length >= 3 &&
      email.trim().length > 0 &&
      email.includes("@") &&
      password.trim().length >= 6 &&
      password === confirmPassword &&
      agreeTerms
    );
  }, [fullname, email, password, confirmPassword, agreeTerms]);

  const passwordStrength = useMemo(() => {
    if (password.length === 0) return { score: 0, label: "", color: "" };
    if (password.length < 6)
      return { score: 1, label: "Weak", color: "text-red-600 bg-red-100" };
    if (password.length >= 6 && password.length < 8)
      return {
        score: 2,
        label: "Fair",
        color: "text-orange-600 bg-orange-100",
      };
    if (password.length >= 8 && /[!@#$%^&*]/.test(password))
      return {
        score: 3,
        label: "Good",
        color: "text-yellow-600 bg-yellow-100",
      };
    if (
      password.length >= 8 &&
      /[!@#$%^&*]/.test(password) &&
      /[0-9]/.test(password)
    )
      return {
        score: 4,
        label: "Strong",
        color: "text-green-600 bg-green-100",
      };
    return { score: 2, label: "Fair", color: "text-orange-600 bg-orange-100" };
  }, [password]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (fullname.trim().length < 3) {
      setError("Full name must be at least 3 characters.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms & Conditions.");
      return;
    }

    try {
      setSubmitting(true);
      const data = await authService.register({
        fullname,
        email,
        password,
      });

      if (!data?.success) {
        setError(data?.message || "Registration failed.");
        return;
      }

      // Show success message
      navigate("/login", {
        state: { message: "Registration successful! Please login." },
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) return <Loader />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl mb-4 shadow-lg">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="text-gray-600 mt-2">Join us and start shopping</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 animate-shake">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  type="text"
                  placeholder="John Doe"
                  required
                />
              </div>
              {fullname.length > 0 && fullname.length < 3 && (
                <p className="text-xs text-red-500 mt-1">
                  Full name must be at least 3 characters
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score === 1
                            ? "w-1/4 bg-red-500"
                            : passwordStrength.score === 2
                              ? "w-2/4 bg-orange-500"
                              : passwordStrength.score === 3
                                ? "w-3/4 bg-yellow-500"
                                : passwordStrength.score === 4
                                  ? "w-full bg-green-500"
                                  : "w-0"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${passwordStrength.color}`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CheckBadgeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
              {confirmPassword.length > 0 &&
                password === confirmPassword &&
                password.length > 0 && (
                  <p className="text-xs text-green-500 mt-1">
                    ✓ Passwords match
                  </p>
                )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
              />
              <label className="text-sm text-gray-700">
                I agree to the{" "}
                <Link
                  to="/terms"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold py-3 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 shadow-lg"
            >
              {submitting ? "Creating Account..." : "Create Account"}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-green-600 hover:text-green-700 underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
