import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  order_user_id: mongoose.Types.ObjectId;
  order_item_count: number;
  order_items: mongoose.Types.ObjectId[];
  order_item_subtotal: number;
  order_item_tax: number;
  order_item_shipping: number;
  order_item_total: number;
  order_paid: boolean;
  order_shipped?: boolean;
  order_status: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema<IOrder> = new Schema(
  {
    order_user_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    order_item_count: { type: Number, required: true },
    order_items: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    ],
    order_item_subtotal: { type: Number, required: true },
    order_item_tax: { type: Number, required: true },
    order_item_shipping: { type: Number, required: true },
    order_item_total: { type: Number, required: true },
    order_paid: { type: Boolean, required: true },
    order_shipped: { type: Boolean },
    order_status: {
      type: String,
      required: true,
      default: "pending",
      enum: ["pending", "purchased", "completed"],
    },
  },
  { timestamps: true },
);

export const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
