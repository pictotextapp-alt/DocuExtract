export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedDate: string;
  readingTime: string;
  tags: string[];
}

// This will be populated by the API
export const blogArticles: BlogArticle[] = [];