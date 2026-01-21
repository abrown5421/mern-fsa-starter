import {
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
} from "../../app/store/api/ordersApi";
import {
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} from "../../app/store/api/productsApi";
import {
  useGetBlogPostByIdQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
} from "../../app/store/api/blogPostsApi";
import {
  useCreateUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "../../app/store/api/usersApi";
import { CollectionConfig } from "./types";

export const collectionRegistry: Record<string, CollectionConfig> = {
  user: {
    feature: "user",
    api: {
      useGetById: useGetUserByIdQuery,
      useCreate: useCreateUserMutation,
      useUpdate: useUpdateUserMutation,
    },
    schema: {
      name: "User",
      fields: [
        { name: "firstName", type: "String", required: true },
        { name: "lastName", type: "String", required: true },
        { name: "email", type: "String", required: true },
        { name: "password", type: "String", required: true },
        {
          name: "type",
          type: "String",
          required: true,
          enum: ["user", "editor", "admin"],
        },
        { name: "profileImage", type: "String" },
      ],
    },
  },
  blogPost: {
    feature: "blogPost",
    api: {
      useGetById: useGetBlogPostByIdQuery,
      useCreate: useCreateBlogPostMutation,
      useUpdate: useUpdateBlogPostMutation,
    },
    schema: {
      name: "BlogPost",
      fields: [
        {
          name: "post_title",
          type: "String",
          required: true,
        },
        {
          name: "post_body",
          type: "String",
          required: true,
        },
        {
          name: "post_author",
          type: "String",
          required: true,
        },
        {
          name: "post_category",
          type: "String",
          required: true,
        },
        {
          name: "post_image",
          type: "String",
          required: false,
        },
      ],
    },
  },
  product: {
    feature: "product",
    api: {
      useGetById: useGetProductByIdQuery,
      useCreate: useCreateProductMutation,
      useUpdate: useUpdateProductMutation,
    },
    schema: {
      name: "Product",
      fields: [
        {
          name: "product_name",
          type: "String",
          required: true,
        },
        {
          name: "product_category",
          type: "String",
          required: true,
        },
        {
          name: "product_description",
          type: "String",
          required: true,
        },
        {
          name: "product_price",
          type: "Number",
          required: true,
        },
        {
          name: "product_image",
          type: "String",
          required: false,
        },
      ],
    },
  },
  order: {
    feature: "order",
    api: {
      useGetById: useGetOrderByIdQuery,
      useCreate: useCreateOrderMutation,
      useUpdate: useUpdateOrderMutation,
    },
    schema: {
      name: "Order",
      fields: [
        {
          name: "order_user_id",
          type: "ObjectId",
          ref: "User",
          required: true,
        },
        {
          name: "order_item_count",
          type: "Number",
          required: true,
        },
        {
          name: "order_items",
          type: "Array",
          required: true,
          ref: "Product",
        },
        {
          name: "order_item_subtotal",
          type: "Number",
          required: true,
        },
        {
          name: "order_item_tax",
          type: "Number",
          required: true,
        },
        {
          name: "order_item_shipping",
          type: "Number",
          required: true,
        },
        {
          name: "order_item_total",
          type: "Number",
          required: true,
        },
        {
          name: "order_paid",
          type: "Boolean",
          required: true,
        },
        {
          name: "order_shipped",
          type: "Boolean",
          required: false,
        },
        {
          name: "order_status",
          type: "String",
          required: true,
          enum: ["pending", "purchased", "completed"],
          default: "pending",
        },
      ],
    },
  },
};
