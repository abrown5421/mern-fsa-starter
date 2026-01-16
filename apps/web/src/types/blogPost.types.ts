export interface IBlogPost {
  _id: string;
  post_title: string;
  post_body: string;
  post_author: string;
  post_category: string;
  post_image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBlogPostDto {
  post_title: string;
  post_body: string;
  post_author: string;
  post_category: string;
  post_image?: string;
}

export interface UpdateBlogPostDto {
  post_title?: string;
  post_body?: string;
  post_author?: string;
  post_category?: string;
  post_image?: string;
}
