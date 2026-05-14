import api from "./api";

export const brandService = {
  getAllBrands: () =>
    api.get("/brands").then((res) => res.data)
};
