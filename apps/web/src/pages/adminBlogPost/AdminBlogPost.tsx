import { motion } from "framer-motion";
import {
  useDeleteBlogPostMutation,
  useGetBlogPostsQuery,
} from "../../app/store/api/blogPostsApi";
import Loader from "../../features/loader/Loader";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "../../app/store/hooks";
import { IBlogPost } from "../../types/blogPost.types";
import { openModal } from "../../features/modal/modalSlice";
import CollectionEditor from "../../features/collection/CollectionEditor";
import CollectionViewer from "../../features/collection/CollectionViewer";

const AdminBlogPost = () => {
  const dispatch = useAppDispatch();
  const { data: blogPosts = [], isLoading } = useGetBlogPostsQuery();
  const [deleteBlogPost] = useDeleteBlogPostMutation();
  const { id } = useParams();
  const isNew = location.pathname.endsWith("/new");

  if (isLoading) return <Loader />;

  const handleDelete = (item: IBlogPost) => {
    dispatch(
      openModal({
        modalContent: "confirm",
        title: "Delete BlogPost",
        message: "This action is permanent and cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        confirmAction: async () => {
          try {
            await deleteBlogPost(item._id).unwrap();
          } catch (err) {
            console.error("Delete failed", err);
          }
        },
      }),
    );
  };

  if (isNew) {
    return <CollectionEditor mode="create" featureType="blogPost" />;
  }

  if (id) {
    return <CollectionEditor mode="edit" id={id} featureType="blogPost" />;
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
        featureName="blogPost"
        data={blogPosts}
        searchKeys={["post_title", "post_body", "post_author"]}
        columns={[ 
          { key: "post_title", label: "Post_title", hideOnSmall: false, maxLength: 60 },
          { key: "post_body", label: "Post_body", hideOnSmall: false, maxLength: 120 },
          { key: "post_author", label: "Post_author", hideOnSmall: true },
          { key: "post_category", label: "Post_category", hideOnSmall: true },
          { key: "post_image", label: "Post_image", hideOnSmall: true },
          {
            key: "createdAt",
            label: "Created",
            render: (item) => new Date(item.createdAt).toLocaleDateString(),
            hideOnSmall: true,
          },
        ]}
        onEdit={(blogPost) => console.log("Edit", blogPost)}
        onDelete={(blogPost) => handleDelete(blogPost)}
      />
    </motion.div>
  );
};

export default AdminBlogPost;
