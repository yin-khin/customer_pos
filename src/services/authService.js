import api from "./api";

export const authService = {
  login: async ({ email, password }) => {
    const res = await api.post("/customers/login", { email, password });
    const data = res.data;

    // CustomerController.loginCustomer returns:
    // { success: true, message, customer }  (no JWT token)
    if (data?.success && data?.customer) {
      return {
        isLogin: true,
        token: null,
        customer: data.customer,
      };
    }

    // UserController.login (admin/user) returns:
    // { isLogin: true, token }
    if (data?.isLogin && data?.token) {
      return {
        isLogin: true,
        token: data.token,
        // user controller doesn't always return customer object
        customer: data.customer || { email },
      };
    }

    return {
      isLogin: false,
      message: data?.message || "Login failed",
    };
  },

  register: async ({ fullname, email, password, phone }) => {
    const res = await api.post("/customers", {
      fullname,
      email,
      password,
      phone,
    });
    return res.data;
  },
};
