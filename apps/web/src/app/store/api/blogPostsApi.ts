import {
  CreateBlogPostDto,
  IBlogPost,
  UpdateBlogPostDto,
} from "../../../types/blogPost.types";
import { baseApi } from "./baseApi";

export const blogPostsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBlogPosts: builder.query<IBlogPost[], void>({
      query: () => "/blogPosts",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "BlogPost" as const,
                id: _id,
              })),
              { type: "BlogPost", id: "LIST" },
            ]
          : [{ type: "BlogPost", id: "LIST" }],
    }),

    getBlogPostById: builder.query<IBlogPost, string>({
      query: (id) => `/blogPosts/${id}`,
      providesTags: (result, error, id) => [{ type: "BlogPost", id }],
    }),

    createBlogPost: builder.mutation<IBlogPost, CreateBlogPostDto>({
      query: (data) => ({
        url: "/blogPosts",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "BlogPost", id: "LIST" }],
    }),

    updateBlogPost: builder.mutation<
      IBlogPost,
      { id: string; data: UpdateBlogPostDto }
    >({
      query: ({ id, data }) => ({
        url: `/blogPosts/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "BlogPost", id },
        { type: "BlogPost", id: "LIST" },
      ],
    }),

    deleteBlogPost: builder.mutation<void, string>({
      query: (id) => ({
        url: `/blogPosts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "BlogPost", id },
        { type: "BlogPost", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetBlogPostsQuery,
  useGetBlogPostByIdQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
  useLazyGetBlogPostsQuery,
  useLazyGetBlogPostByIdQuery,
} = blogPostsApi;
