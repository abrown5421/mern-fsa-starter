import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  product_name: string;
  product_category: string;
  product_description: string;
  product_price: number;
  product_image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    product_name: { type: String, required: true },
    product_category: { type: String, required: true },
    product_description: { type: String, required: true },
    product_price: { type: Number, required: true },
    product_image: { type: String },
  },
  { timestamps: true },
);

export const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
