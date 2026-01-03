import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  productName: string;
  productPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    productName: { type: String, required: true, unique: true },
    productPrice: { type: Number, required: true },
  },
  { timestamps: true },
);

export const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
