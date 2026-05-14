import api from "./api";

export const orderService = {
  createOrder: (orderData) => api.post("/orders", orderData).then((res) => res.data),

  // Backend route exists: GET /api/orders
  // Your app can still “filter my orders” client-side if you store user/customer_id.
  getMyOrders: () => api.get("/orders").then((res) => res.data),

  getOrderById: (id) => api.get(`/orders/${id}`).then((res) => res.data),

  cancelOrder: (id) => api.put(`/orders/${id}/cancel`).then((res) => res.data)
};
