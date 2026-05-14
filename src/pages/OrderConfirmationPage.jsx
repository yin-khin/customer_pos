import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Loader from "../components/common/Loader";
import { orderService } from "../services/orderService";

export default function OrderConfirmationPage() {
  const location = useLocation();
  const orderIdFromState = location?.state?.orderId;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [notReady, setNotReady] = useState(false);

  const pollTimerRef = useRef(null);

  const refreshOrder = async () => {
    const id = orderIdFromState;
    if (!id) return null;

    const res = await orderService.getOrderById(id);
    const data = res?.order ?? res?.data ?? res ?? null;
    return data;
  };

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        setLoading(true);
        setNotReady(false);

        const id = orderIdFromState;
        if (!id) {
          setOrder(null);
          return;
        }

        const data = await refreshOrder();
        if (!mounted) return;
        setOrder(data);

        // If still pending, keep polling a bit so user doesn't miss the success popup
        const status = (
          data?.status_payment ??
          data?.payment_status ??
          ""
        ).toLowerCase();
        if (!data || status !== "completed") {
          setNotReady(true);
          let attempts = 0;
          pollTimerRef.current = setInterval(async () => {
            attempts += 1;
            try {
              const latest = await refreshOrder();
              if (!mounted) return;
              setOrder(latest);

              const latestStatus = (
                latest?.status_payment ??
                latest?.payment_status ??
                ""
              ).toLowerCase();
              if (latestStatus === "completed") {
                clearInterval(pollTimerRef.current);
                pollTimerRef.current = null;
                setNotReady(false);
              }
            } catch (e) {
              // ignore polling errors
            }

            if (attempts >= 12) {
              // ~12 * 2s = 24 seconds
              clearInterval(pollTimerRef.current);
              pollTimerRef.current = null;
              setNotReady(false);
            }
          }, 2000);
        }
      } catch (e) {
        if (!mounted) return;
        setOrder(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    run();

    return () => {
      mounted = false;
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIdFromState]);

  const paymentStatus = useMemo(() => {
    return order?.status_payment || order?.payment_status || "";
  }, [order]);

  const isPaid = String(paymentStatus).toLowerCase() === "completed";

  if (loading) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-14 text-center">
      {isPaid ? (
        <div className="bg-green-100 border border-green-400 text-green-800 font-extrabold px-5 py-4 rounded-lg mb-6">
          <div className="text-2xl">Thank you for your order!</div>
          <div className="text-sm mt-1 font-bold opacity-90">
            Payment successful ✅
          </div>
        </div>
      ) : (
        <div className="bg-amber-100 border border-amber-400 text-amber-900 font-extrabold px-5 py-4 rounded-lg mb-6">
          <div className="text-2xl">Payment not confirmed yet</div>
          <div className="text-sm mt-1 font-bold opacity-90">
            {notReady
              ? "Checking your KHQR payment..."
              : `Payment status: ${paymentStatus ? paymentStatus : "pending"}`}
          </div>
        </div>
      )}

      <Link
        to="/orders"
        className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-extrabold px-7 py-3 rounded-lg"
      >
        View My Orders
      </Link>
    </div>
  );
}
