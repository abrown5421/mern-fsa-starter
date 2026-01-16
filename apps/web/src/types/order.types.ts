export interface IOrder {
  _id: string;
  order_user_id: string;
  order_item_count: number;
  order_items: any[];
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

export interface CreateOrderDto {
  order_user_id: string;
  order_item_count: number;
  order_items: any[];
  order_item_subtotal: number;
  order_item_tax: number;
  order_item_shipping: number;
  order_item_total: number;
  order_paid: boolean;
  order_shipped?: boolean;
  order_status: string;
}

export interface UpdateOrderDto {
  order_user_id?: string;
  order_item_count?: number;
  order_items?: any[];
  order_item_subtotal?: number;
  order_item_tax?: number;
  order_item_shipping?: number;
  order_item_total?: number;
  order_paid?: boolean;
  order_shipped?: boolean;
  order_status?: string;
}
