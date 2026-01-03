export interface IProduct {
  _id: string;
  productName: string;
  productPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  productName: string;
  productPrice: number;
}

export interface UpdateProductDto {
  productName?: string;
  productPrice?: number;
}
