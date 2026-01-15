export const blogTemplate = (pageName: string) => `import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/store/hooks";
import { useGetBlogPostsQuery } from "../../app/store/api/blogPostsApi";
import Loader from "../../features/loader/Loader";
import Pagination from '../../features/pagination/Pagination';
import { useEffect, useMemo, useState } from 'react';

const POSTS_PER_PAGE = 20;

const ${pageName} = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data: posts, isLoading, error } = useGetBlogPostsQuery();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    if (!posts) return ['All'];
    const unique = Array.from(new Set(posts.map((p: any) => p.post_category)));
    return ['All', ...unique];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (selectedCategory === 'All') return posts;
    return posts.filter((p: any) => p.post_category === selectedCategory);
  }, [posts, selectedCategory]);

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  useEffect(() => setCurrentPage(1), [selectedCategory]);

  if (isLoading) return <Loader />;
  if (error || !posts) return <div className="text-center text-red-500 mt-10 font-primary">
    <h2 className="text-2xl font-semibold mb-2">Blog posts Not Found</h2>
    <p className="text-neutral-500">Sorry, we couldn't find the blog post you were looking for.</p>
  </div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-neutral sup-min-nav relative z-0 p-4 flex flex-col items-center"
    >
      <div className="w-full mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-semibold">Blog</h1>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded p-2"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="w-full grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {paginatedPosts.map((post: any) => (
          <div
            key={post._id}
            onClick={() => navigate(\`/blog/\${post._id}\`)}
            className="cursor-pointer relative bg-white shadow rounded overflow-hidden flex flex-col transition-transform transform hover:scale-101"
          >
            <div className='absolute top-5 right-5 text-xs bg-neutral text-neutral-contrast px-3 py-1 rounded-lg'>
              {post.post_category}
            </div>
            <img
              src={post.post_image || || "/assets/images/header_placeholder.jpg"}
              alt={post.post_title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4 flex flex-col flex-1">
              <h2 className="font-semibold text-lg mb-2">{post.post_title}</h2>
              <p className="text-sm text-gray-600 flex-1 line-clamp-4">
                {post.post_body}
              </p>
              <div className="my-4 h-px w-full bg-neutral-contrast/15" />
              <div className="mt-2 text-xs text-gray-400 flex flex-row justify-between">
                <span className='text-primary'>{post.post_author}</span>
                <span>{new Date(post.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </motion.div>
  );
};

export default ${pageName};
`;
