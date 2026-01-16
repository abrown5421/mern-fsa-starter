import mongoose, { Schema, Document } from "mongoose";

export interface IBlogPost extends Document {
  post_title: string;
  post_body: string;
  post_author: string;
  post_category: string;
  post_image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema: Schema<IBlogPost> = new Schema(
  {
    post_title: { type: String, required: true },
    post_body: { type: String, required: true },
    post_author: { type: String, required: true },
    post_category: { type: String, required: true },
    post_image: { type: String },
  },
  { timestamps: true },
);

export const BlogPostModel = mongoose.model<IBlogPost>(
  "BlogPost",
  BlogPostSchema,
);
