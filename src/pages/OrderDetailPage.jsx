import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loader from "../components/common/Loader";
import { orderService } from "../services/orderService";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    orderService
      .getOrderById(id)
      .then((res) => {
        if (!mounted) return;
        const data = res?.order ?? res?.data ?? res ?? null;
        setOrder(data);
      })
      .catch(() => {
        if (!mounted) return;
        setOrder(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <Loader />;

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center font-extrabold">
        Order not found
      </div>
    );
  }

  const orderId = order?.order_id ?? order?.id ?? id;
  const status = order?.status_payment ?? order?.payment_status ?? "";
  const created = order?.created_on ?? order?.createdAt ?? null;

  const items = order?.OrderItems || order?.order_items || order?.items || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-6">Order Details</h1>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="font-extrabold">Order ID</div>
            <div className="text-gray-700">{orderId}</div>
          </div>
          <div>
            <div className="font-extrabold">Date</div>
            <div className="text-gray-700">
              {created ? new Date(created).toLocaleString() : "—"}
            </div>
          </div>
          <div>
            <div className="font-extrabold">Status</div>
            <div className="text-gray-700">{status}</div>
          </div>
          <div>
            <div className="font-extrabold">Total</div>
            <div className="text-gray-700">
              ${Number(order?.amount ?? order?.total ?? 0).toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="font-extrabold mb-1">Customer</div>
          <div className="text-gray-700">
            {order?.fullname ?? order?.customer_name ?? "—"} (
            {order?.email ?? order?.customer_email ?? "—"})
          </div>
          <div className="text-gray-700 mt-1">{order?.address ?? "—"}</div>
          {order?.postalcode ? (
            <div className="text-gray-700 mt-1">Postal: {order.postalcode}</div>
          ) : null}
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-extrabold">Product</th>
                <th className="text-right py-3 px-4 font-extrabold">Price</th>
                <th className="text-right py-3 px-4 font-extrabold">Qty</th>
                <th className="text-right py-3 px-4 font-extrabold">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-8 px-4 text-center text-gray-500 font-bold"
                  >
                    No items found for this order.
                  </td>
                </tr>
              ) : (
                items.map((it) => {
                  const prdId = it?.prd_id ?? it?.Product?.prd_id ?? "-";
                  const name =
                    it?.prd_name ??
                    it?.Product?.prd_name ??
                    it?.Product?.name ??
                    "Product";
                  const unitPrice = Number(
                    it?.unit_price ?? it?.unit_cost ?? 0,
                  );
                  const qty = Number(it?.qty ?? it?.quantity ?? 0);
                  const lineTotal = unitPrice * qty;

                  return (
                    <tr key={it?.id ?? `${prdId}-${name}`}>
                      <td className="py-3 px-4 border-t">
                        <div className="font-extrabold">{name}</div>
                        <div className="text-xs text-gray-500">#{prdId}</div>
                      </td>
                      <td className="text-right py-3 px-4 border-t">
                        ${unitPrice.toFixed(2)}
                      </td>
                      <td className="text-right py-3 px-4 border-t">{qty}</td>
                      <td className="text-right py-3 px-4 border-t font-extrabold">
                        ${lineTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
