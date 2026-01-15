import { pageTemplate } from './pageTemplate.js';
import { blogTemplate } from './blogTemplate.js';
import { blogPostTemplate } from './blogPostTemplate.js';
import { staffTemplate } from './staffPageTemplate.js';

export const templates: Record<string, (pageName: string) => string> = {
  default: pageTemplate,
  blog: blogTemplate,
  blogPost: blogPostTemplate,
  staff: staffTemplate
};
