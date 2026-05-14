import api from "./api";

export const productService = {
  getAllProducts: () =>
    api.get("/products").then((res) => res.data),

  getProductById: (id) =>
    api.get(`/products/${id}`).then((res) => res.data),

  getProductsByCategory: (categoryId) =>
    api.get(`/products/category/${categoryId}`).then((res) => res.data),

  getProductsByBrand: (brandId) =>
    api.get(`/products/brand/${brandId}`).then((res) => res.data),

  searchProducts: (keyword) =>
    api.get(`/products/search?keyword=${encodeURIComponent(keyword)}`).then((res) => res.data)
};
