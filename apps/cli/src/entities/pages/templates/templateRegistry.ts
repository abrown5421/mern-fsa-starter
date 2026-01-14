import { pageTemplate } from './pageTemplate.js';
import { blogTemplate } from './blogTemplate.js';
import { blogPostTemplate } from './blogPostTemplate.js';

export const templates: Record<string, (pageName: string) => string> = {
  default: pageTemplate,
  blog: blogTemplate,
  blogPost: blogPostTemplate,
};
