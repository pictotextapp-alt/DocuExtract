import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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

class BlogService {
  private blogPostsDir = path.join(process.cwd(), 'blog-posts');
  private articlesCache: BlogArticle[] | null = null;

  constructor() {
    // Ensure blog-posts directory exists
    if (!fs.existsSync(this.blogPostsDir)) {
      fs.mkdirSync(this.blogPostsDir, { recursive: true });
    }
  }

  private loadArticlesFromFiles(): BlogArticle[] {
    try {
      const files = fs.readdirSync(this.blogPostsDir)
        .filter(file => file.endsWith('.md'))
        .sort((a, b) => b.localeCompare(a)); // Sort by filename descending

      const articles: BlogArticle[] = [];

      files.forEach((file, index) => {
        try {
          const filePath = path.join(this.blogPostsDir, file);
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const { data: frontmatter, content } = matter(fileContent);

          // Generate ID from index + 1 to maintain compatibility
          const id = (index + 1).toString();

          const article: BlogArticle = {
            id,
            title: frontmatter.title || 'Untitled',
            slug: frontmatter.slug || file.replace('.md', ''),
            excerpt: frontmatter.excerpt || '',
            content: content.trim(),
            author: frontmatter.author || 'Staff Writer',
            publishedDate: frontmatter.publishedDate || new Date().toISOString().split('T')[0],
            readingTime: frontmatter.readingTime || '5 min',
            tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : []
          };

          articles.push(article);
        } catch (error) {
          console.error(`Error processing blog file ${file}:`, error);
        }
      });

      // Sort articles by published date (newest first)
      return articles.sort((a, b) => 
        new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
      );
    } catch (error) {
      console.error('Error loading blog articles from files:', error);
      return [];
    }
  }

  getAllArticles(): BlogArticle[] {
    if (!this.articlesCache) {
      this.articlesCache = this.loadArticlesFromFiles();
    }
    return this.articlesCache;
  }

  getArticleBySlug(slug: string): BlogArticle | undefined {
    const articles = this.getAllArticles();
    return articles.find(article => article.slug === slug);
  }

  getArticleById(id: string): BlogArticle | undefined {
    const articles = this.getAllArticles();
    return articles.find(article => article.id === id);
  }

  // Refresh cache - useful for development or when new files are added
  refreshCache(): void {
    this.articlesCache = null;
  }

  // Get articles with pagination
  getArticlesPaginated(page: number = 1, limit: number = 10): {
    articles: BlogArticle[];
    total: number;
    page: number;
    totalPages: number;
  } {
    const allArticles = this.getAllArticles();
    const total = allArticles.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const articles = allArticles.slice(startIndex, startIndex + limit);

    return {
      articles,
      total,
      page,
      totalPages
    };
  }

  // Get articles by tag
  getArticlesByTag(tag: string): BlogArticle[] {
    const articles = this.getAllArticles();
    return articles.filter(article => 
      article.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }

  // Get all unique tags
  getAllTags(): string[] {
    const articles = this.getAllArticles();
    const tagSet = new Set<string>();
    
    articles.forEach(article => {
      article.tags.forEach(tag => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
  }

  // Search articles by title, excerpt, or content
  searchArticles(query: string): BlogArticle[] {
    const articles = this.getAllArticles();
    const lowercaseQuery = query.toLowerCase();

    return articles.filter(article => 
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.excerpt.toLowerCase().includes(lowercaseQuery) ||
      article.content.toLowerCase().includes(lowercaseQuery) ||
      article.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
}

export const blogService = new BlogService();