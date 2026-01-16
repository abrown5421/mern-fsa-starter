import { motion } from "framer-motion";
import {
  useDeleteProductMutation,
  useGetProductsQuery,
} from "../../app/store/api/productsApi";
import Loader from "../../features/loader/Loader";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "../../app/store/hooks";
import { IProduct } from "../../types/product.types";
import { openModal } from "../../features/modal/modalSlice";
import CollectionEditor from "../../features/collection/CollectionEditor";
import CollectionViewer from "../../features/collection/CollectionViewer";

const AdminProduct = () => {
  const dispatch = useAppDispatch();
  const { data: products = [], isLoading } = useGetProductsQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const { id } = useParams();
  const isNew = location.pathname.endsWith("/new");

  if (isLoading) return <Loader />;

  const handleDelete = (item: IProduct) => {
    dispatch(
      openModal({
        modalContent: "confirm",
        title: "Delete Product",
        message: "This action is permanent and cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        confirmAction: async () => {
          try {
            await deleteProduct(item._id).unwrap();
          } catch (err) {
            console.error("Delete failed", err);
          }
        },
      }),
    );
  };

  if (isNew) {
    return <CollectionEditor mode="create" featureType="product" />;
  }

  if (id) {
    return <CollectionEditor mode="edit" id={id} featureType="product" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-neutral relative z-0 p-4 flex flex-8 sup-min-nav "
    >
      <CollectionViewer
        featureName="product"
        data={products}
        searchKeys={["product_name", "product_category", "product_description"]}
        columns={[
          { key: "product_name", label: "Product_name", hideOnSmall: false },
          {
            key: "product_category",
            label: "Product_category",
            hideOnSmall: false,
          },
          {
            key: "product_description",
            label: "Product_description",
            hideOnSmall: true,
          },
          { key: "product_price", label: "Product_price", hideOnSmall: true },
          { key: "product_image", label: "Product_image", hideOnSmall: true },
          {
            key: "createdAt",
            label: "Created",
            render: (item) => new Date(item.createdAt).toLocaleDateString(),
            hideOnSmall: true,
          },
        ]}
        onEdit={(product) => console.log("Edit", product)}
        onDelete={(product) => handleDelete(product)}
      />
    </motion.div>
  );
};

export default AdminProduct;
