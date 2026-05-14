import React, { useEffect, useMemo, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  XMarkIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { paymentService } from "../../services/paymentService";

const PAYMENT_TIMEOUT_SECONDS = 600;
const VERIFY_INTERVAL_SECONDS = 3;

export default function KHQRModal({ qrData, onClose, onPaymentComplete }) {
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT_SECONDS);
  const [paymentTimeout, setPaymentTimeout] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [manualCheckMode, setManualCheckMode] = useState(false);
  const [currentQr, setCurrentQr] = useState(qrData);
  const [verifyAttempts, setVerifyAttempts] = useState(0);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const timerRef = useRef(null);
  const completionGuardRef = useRef(false);

  useEffect(() => {
    console.log("📱 KHQRModal received qrData:", qrData);
    setCurrentQr(qrData);
  }, [qrData]);

  const qrText = useMemo(
    () => currentQr?.qrCode || currentQr?.qr_code || "",
    [currentQr],
  );
  const md5Hash = useMemo(
    () => currentQr?.md5Hash || currentQr?.qr_md5 || "",
    [currentQr],
  );

  const formatAmount = (amount, currency) => {
    if (!amount && amount !== 0) return "0.00";
    const numAmount = Number(amount);
    return numAmount.toLocaleString();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrText);
      toast.success("KHQR text copied to clipboard");
    } catch {
      toast.error("Failed to copy QR text");
    }
  };

  const stopAllTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const completePayment = async () => {
    if (completionGuardRef.current) return;
    completionGuardRef.current = true;

    console.log("🎉 Completing payment...");
    stopAllTimers();
    setPaymentCompleted(true);
    setShowSuccess(true);

    toast.success("Payment successful! Processing your order...", {
      duration: 3000,
    });

    // Wait 2 seconds then close and redirect
    setTimeout(async () => {
      if (onPaymentComplete && typeof onPaymentComplete === "function") {
        await onPaymentComplete();
      }
      if (onClose && typeof onClose === "function") {
        onClose();
      }
    }, 2000);
  };

  const checkPaymentStatus = async () => {
    if (!md5Hash || paymentTimeout || paymentCompleted || verifying) {
      return;
    }

    setVerifying(true);
    setVerifyAttempts((prev) => prev + 1);

    try {
      console.log(
        `🔍 Checking payment #${verifyAttempts + 1} for MD5: ${md5Hash}`,
      );

      // First check local status
      const verifyRes = await paymentService.verifyPayment(md5Hash);
      console.log("📡 Verify response:", verifyRes);

      if (verifyRes?.success === true && verifyRes?.data?.paid === true) {
        console.log("✅ PAYMENT CONFIRMED VIA VERIFY!");
        await completePayment();
        return;
      }

      // Then try to confirm with Bakong
      const confirmRes = await paymentService.confirmPayment(md5Hash);
      console.log("📡 Confirm response:", confirmRes);

      if (confirmRes?.success === true && confirmRes?.data?.paid === true) {
        console.log("✅ PAYMENT CONFIRMED VIA BAKONG!");
        await completePayment();
        return;
      }

      if (confirmRes?.requiresManualCheck === true) {
        console.log("⚠️ Manual check required");
        if (!manualCheckMode) {
          stopAllTimers();
          setManualCheckMode(true);
          toast.info(
            "Please click 'Confirm Payment' after completing payment in your bank app",
            {
              duration: 8000,
            },
          );
        }
        return;
      }

      if (confirmRes?.message?.includes("expired")) {
        console.log("⏰ QR code expired");
        stopAllTimers();
        setPaymentTimeout(true);
        toast.error("QR code has expired. Please generate a new one.");
        return;
      }

      console.log(`⏳ Waiting for payment... (attempt ${verifyAttempts + 1})`);
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setVerifying(false);
    }
  };

  const handleManualConfirm = async () => {
    if (!md5Hash) return;

    try {
      const loadingToast = toast.loading("Confirming payment...");
      const res = await paymentService.manualConfirmPayment(md5Hash);
      toast.dismiss(loadingToast);

      console.log("Manual confirm response:", res);

      if (res?.success && res?.data?.paid === true) {
        await completePayment();
      } else {
        toast.error(res?.message || "Confirmation failed. Please try again.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Error confirming payment");
      console.error("Manual confirm error:", error);
    }
  };

  useEffect(() => {
    if (!md5Hash || paymentTimeout || paymentCompleted || manualCheckMode)
      return;

    console.log("🔄 Starting payment verification polling...");

    // Start checking immediately
    setTimeout(() => checkPaymentStatus(), 1000);

    // Set up interval
    intervalRef.current = setInterval(
      checkPaymentStatus,
      VERIFY_INTERVAL_SECONDS * 1000,
    );

    // Set payment timeout
    timeoutRef.current = setTimeout(() => {
      console.log("⏰ Payment session timeout");
      stopAllTimers();
      setPaymentTimeout(true);
      toast.error("Payment session expired. Please try again.");
    }, PAYMENT_TIMEOUT_SECONDS * 1000);

    return () => stopAllTimers();
  }, [md5Hash, paymentTimeout, paymentCompleted, manualCheckMode]);

  useEffect(() => {
    if (!md5Hash || paymentTimeout || paymentCompleted || manualCheckMode)
      return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [md5Hash, paymentTimeout, paymentCompleted, manualCheckMode]);

  const handleClose = () => {
    stopAllTimers();
    if (onClose) onClose();
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const displayAmount = formatAmount(currentQr?.amount, currentQr?.currency);
  const displayCurrency = currentQr?.currency ?? "USD";
  const currencySymbol = displayCurrency === "USD" ? "$" : "៛";

  // Don't render if no QR data
  if (!qrText && !paymentCompleted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No QR Data</h2>
          <p className="text-gray-600">
            Failed to generate QR code. Please try again.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Success Screen
  if (showSuccess && paymentCompleted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-center animate-fadeIn">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Payment Successful! 🎉
          </h2>
          <p className="text-gray-600 mb-4">
            Amount: {currencySymbol}
            {displayAmount} {displayCurrency}
          </p>
          <p className="text-sm text-gray-500">Thank you for your purchase!</p>
          <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-green-600 h-1.5 rounded-full animate-pulse"
              style={{ width: "100%" }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Redirecting to home page...
          </p>
        </div>
      </div>
    );
  }

  // Main Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100"
        >
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        </button>

        <h2 className="text-2xl font-extrabold mb-2 text-center">
          Scan KHQR to Pay
        </h2>

        {/* Timer */}
        <div
          className={`text-center mb-4 p-2 rounded-lg ${
            timeLeft <= 60 && !paymentTimeout
              ? "bg-orange-100 text-orange-700"
              : paymentTimeout
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ClockIcon className="w-5 h-5" />
            <p className="text-sm font-semibold">
              Time remaining:{" "}
              <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
            </p>
          </div>

          {!paymentTimeout && !paymentCompleted && !manualCheckMode && (
            <p className="text-xs text-green-600 mt-1 flex items-center justify-center gap-1">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Auto-verifying payment... (Attempt {verifyAttempts})
            </p>
          )}

          {manualCheckMode && !paymentCompleted && (
            <p className="text-xs text-orange-600 font-bold mt-1">
              ⚠️ Please click the confirm button after completing payment
            </p>
          )}

          {paymentTimeout && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <p className="text-red-600 font-bold">Session expired!</p>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-4 bg-white p-4 rounded-lg border">
          <QRCodeSVG value={qrText} size={220} level="H" />
        </div>

        {/* Payment details */}
        <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between">
            <span className="font-bold">Amount:</span>
            <span className="font-semibold text-lg">
              {currencySymbol}
              {displayAmount} {displayCurrency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Order ID:</span>
            <span className="font-mono text-xs">
              {currentQr?.userId || "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Reference:</span>
            <span className="font-mono text-xs">
              {md5Hash?.substring(0, 12)}...
            </span>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center gap-2 text-blue-600 w-full py-1 mt-2 hover:text-blue-700"
          >
            <ClipboardDocumentIcon className="w-4 h-4" /> Copy QR Text
          </button>
        </div>

        {/* Manual Confirm Button - Show only in manual mode */}
        {manualCheckMode && !paymentCompleted && (
          <button
            onClick={handleManualConfirm}
            disabled={verifying}
            className="w-full mt-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            {verifying ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Checking...
              </span>
            ) : (
              "✅ I have completed payment"
            )}
          </button>
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800 text-center">
            📱 1. Open banking app (ABA, ACLEDA, Wing)
            <br />
            🔍 2. Scan QR code above
            <br />
            💰 3. Complete payment
            <br />
            {manualCheckMode
              ? "✅ 4. Click the green button above after payment"
              : "✅ 4. System will auto-confirm when payment is complete"}
          </p>
        </div>
      </div>
    </div>
  );
}
