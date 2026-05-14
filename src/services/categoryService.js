import api from "./api";

export const categoryService = {
  getAllCategories: () =>
    api.get("/categories").then((res) => res.data),

  getCategoryById: (id) =>
    api.get(`/categories/${id}`).then((res) => res.data)
};
