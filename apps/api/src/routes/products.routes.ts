import { ProductModel } from "../entities/product/product.model";
import { createBaseCRUD } from "../shared/base";

const productRouter = createBaseCRUD(ProductModel);

export default productRouter;
