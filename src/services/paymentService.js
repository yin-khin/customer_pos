import api from "./api";

export const paymentService = {
  // Generate KHQR code
  generateKHQR: (data) =>
    api.post("/khqr/generate", data).then((res) => res.data),

  // Verify payment (local only)
  verifyPayment: (md5) =>
    api.get(`/khqr/verify/${md5}`).then((res) => res.data),

  // Confirm payment with Bakong API
  confirmPayment: (md5) =>
    api.post(`/khqr/confirm/${md5}`).then((res) => res.data),

  // Manual confirm when Bakong can't auto-verify
  manualConfirmPayment: (md5) =>
    api.post(`/khqr/manual-confirm/${md5}`).then((res) => res.data),

  // Test endpoints
  markPaymentAsPaid: (md5) =>
    api.post(`/khqr/mark-paid/${md5}`).then((res) => res.data),

  resetPaymentAsUnpaid: (md5) =>
    api.post(`/khqr/reset-paid/${md5}`).then((res) => res.data),

  // Check payment
  checkPayment: (data) => api.post("/khqr/check", data).then((res) => res.data),
};
