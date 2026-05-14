import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { orderService } from "../services/orderService";
import Loader from "../components/common/Loader";
import toast from "react-hot-toast";
import {
  EyeIcon,
  TrashIcon,
  ShoppingBagIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TruckIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getMyOrders();
      // Handle different response formats
      let ordersList = [];
      if (res?.data && Array.isArray(res.data)) {
        ordersList = res.data;
      } else if (res?.orders && Array.isArray(res.orders)) {
        ordersList = res.orders;
      } else if (Array.isArray(res)) {
        ordersList = res;
      } else if (res?.success && res?.data) {
        ordersList = Array.isArray(res.data) ? res.data : [];
      }
      setOrders(ordersList);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;

    const orderId = selectedOrder?.order_id ?? selectedOrder?.id;
    setDeletingId(orderId);

    try {
      await orderService.deleteOrder(orderId);
      toast.success(`Order #${orderId} deleted successfully`);
      // Remove from list
      setOrders(
        orders.filter((order) => {
          const id = order?.order_id ?? order?.id;
          return id !== orderId;
        }),
      );
      setShowDeleteModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error(error?.response?.data?.message || "Failed to delete order");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelOrder = async (order) => {
    const orderId = order?.order_id ?? order?.id;
    toast.loading(`Cancelling order #${orderId}...`);

    try {
      await orderService.cancelOrder(orderId);
      toast.success(`Order #${orderId} cancelled successfully`);
      fetchOrders(); // Refresh the list
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error(error?.response?.data?.message || "Failed to cancel order");
    }
  };

  const getStatusConfig = (status) => {
    const statusLower = (status || "").toLowerCase();
    if (
      statusLower === "paid" ||
      statusLower === "completed" ||
      statusLower === "delivered"
    ) {
      return {
        label: status === "delivered" ? "Delivered" : "Paid",
        icon: CheckCircleIcon,
        color: "green",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        borderColor: "border-green-200",
      };
    } else if (statusLower === "pending" || statusLower === "processing") {
      return {
        label: "Pending",
        icon: ClockIcon,
        color: "yellow",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-200",
      };
    } else if (statusLower === "failed" || statusLower === "cancelled") {
      return {
        label: "Cancelled",
        icon: XCircleIcon,
        color: "red",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        borderColor: "border-red-200",
      };
    } else if (statusLower === "shipped") {
      return {
        label: "Shipped",
        icon: TruckIcon,
        color: "blue",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        borderColor: "border-blue-200",
      };
    }
    return {
      label: status || "Unknown",
      icon: ClockIcon,
      color: "gray",
      bgColor: "bg-gray-100",
      textColor: "text-gray-800",
      borderColor: "border-gray-200",
    };
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((order) => {
        const status = (
          order?.status_payment ??
          order?.payment_status ??
          order?.status ??
          ""
        ).toLowerCase();
        return status === filter;
      });
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((order) => {
        const orderId = String(order?.order_id ?? order?.id ?? "");
        const amount = String(order?.amount ?? order?.total ?? "");
        return orderId.includes(term) || amount.includes(term);
      });
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a?.created_on ?? a?.createdAt ?? 0);
      const dateB = new Date(b?.created_on ?? b?.createdAt ?? 0);
      return dateB - dateA;
    });
  };

  const filteredOrders = getFilteredOrders();
  const stats = {
    total: orders.length,
    paid: orders.filter((o) => {
      const status = (
        o?.status_payment ??
        o?.payment_status ??
        ""
      ).toLowerCase();
      return status === "paid" || status === "completed";
    }).length,
    pending: orders.filter((o) => {
      const status = (
        o?.status_payment ??
        o?.payment_status ??
        ""
      ).toLowerCase();
      return status === "pending";
    }).length,
    cancelled: orders.filter((o) => {
      const status = (
        o?.status_payment ??
        o?.payment_status ??
        ""
      ).toLowerCase();
      return status === "cancelled" || status === "failed";
    }).length,
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            My Orders
          </h1>
          <p className="text-gray-500">
            Track and manage all your orders in one place
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <ShoppingBagIcon className="w-8 h-8 text-indigo-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.paid}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.cancelled}
                </p>
              </div>
              <XCircleIcon className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by order ID or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {["all", "paid", "pending", "cancelled"].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filter === filterType
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No Orders Found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filter !== "all"
                ? "No orders match your search criteria"
                : "You haven't placed any orders yet"}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => {
              const orderId = order?.order_id ?? order?.id;
              const status =
                order?.status_payment ??
                order?.payment_status ??
                order?.status ??
                "";
              const statusConfig = getStatusConfig(status);
              const StatusIcon = statusConfig.icon;
              const created =
                order?.created_on ?? order?.createdAt ?? order?.created_date;
              const amount = Number(order?.amount ?? order?.total ?? 0);
              const itemsCount =
                order?.OrderItems?.length ||
                order?.order_items?.length ||
                order?.items?.length ||
                0;
              const canCancel = status.toLowerCase() === "pending";
              const canDelete =
                status.toLowerCase() === "cancelled" ||
                status.toLowerCase() === "failed";

              return (
                <div
                  key={orderId}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden animate-fadeIn"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left section */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            Order #{orderId}
                          </h3>
                          <div
                            className={`px-3 py-1 rounded-full ${statusConfig.bgColor} flex items-center gap-1`}
                          >
                            <StatusIcon
                              className={`w-4 h-4 ${statusConfig.textColor}`}
                            />
                            <span
                              className={`text-xs font-semibold ${statusConfig.textColor}`}
                            >
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{formatDate(created)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CurrencyDollarIcon className="w-4 h-4" />
                            <span>Total: ${amount.toFixed(2)}</span>
                          </div>
                          {itemsCount > 0 && (
                            <div className="flex items-center gap-1">
                              <ShoppingBagIcon className="w-4 h-4" />
                              <span>
                                {itemsCount} item{itemsCount !== 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right section - Actions */}
                      <div className="flex gap-2">
                        <Link
                          to={`/order/${orderId}`}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View Details
                        </Link>

                        {canCancel && (
                          <button
                            onClick={() => handleCancelOrder(order)}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-all"
                          >
                            <ArrowPathIcon className="w-4 h-4" />
                            Cancel
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDeleteModal(true);
                            }}
                            disabled={deletingId === orderId}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all disabled:opacity-50"
                          >
                            <TrashIcon className="w-4 h-4" />
                            {deletingId === orderId ? "Deleting..." : "Delete"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Payment Method */}
                    {order?.payment_method && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CreditCardIcon className="w-4 h-4" />
                          <span>Paid via {order.payment_method}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <TrashIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Order?
              </h3>
              <p className="text-gray-500 mb-4">
                Are you sure you want to delete order #
                {selectedOrder?.order_id ?? selectedOrder?.id}?
                <br />
                <span className="text-sm text-red-500">
                  This action cannot be undone.
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedOrder(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteOrder}
                  disabled={
                    deletingId ===
                    (selectedOrder?.order_id ?? selectedOrder?.id)
                  }
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {deletingId ? "Deleting..." : "Delete Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
