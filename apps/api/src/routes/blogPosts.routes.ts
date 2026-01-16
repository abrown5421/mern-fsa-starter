import { BlogPostModel } from "../entities/blogPost/blogPost.model";
import { createBaseCRUD } from "../shared/base";

const blogPostRouter = createBaseCRUD(BlogPostModel);

export default blogPostRouter;
