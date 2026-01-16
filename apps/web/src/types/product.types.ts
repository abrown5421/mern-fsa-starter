export interface IProduct {
  _id: string;
  product_name: string;
  product_category: string;
  product_description: string;
  product_price: number;
  product_image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  product_name: string;
  product_category: string;
  product_description: string;
  product_price: number;
  product_image?: string;
}

export interface UpdateProductDto {
  product_name?: string;
  product_category?: string;
  product_description?: string;
  product_price?: number;
  product_image?: string;
}
