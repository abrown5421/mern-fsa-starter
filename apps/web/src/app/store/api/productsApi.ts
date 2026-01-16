import {
  CreateProductDto,
  IProduct,
  UpdateProductDto,
} from "../../../types/product.types";
import { baseApi } from "./baseApi";

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<IProduct[], void>({
      query: () => "/products",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Product" as const,
                id: _id,
              })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),

    getProductById: builder.query<IProduct, string>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    createProduct: builder.mutation<IProduct, CreateProductDto>({
      query: (data) => ({
        url: "/products",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    updateProduct: builder.mutation<
      IProduct,
      { id: string; data: UpdateProductDto }
    >({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useLazyGetProductsQuery,
  useLazyGetProductByIdQuery,
} = productsApi;
