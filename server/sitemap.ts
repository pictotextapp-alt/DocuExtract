import { Request, Response } from 'express';
import { blogArticles } from '../client/src/data/blog-articles.js';

export function generateSitemap(req: Request, res: Response) {
  const baseUrl = `${req.protocol}://${req.get('host')}`; // Dynamic base URL
  const currentDate = new Date().toISOString().split('T')[0];

  const staticPages = [
    {
      url: '/',
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      url: '/blog',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.9'
    },
    {
      url: '/settings',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.5'
    },
    {
      url: '/premium',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      url: '/terms',
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: '0.3'
    },
    {
      url: '/privacy',
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: '0.3'
    },
    {
      url: '/refund-policy',
      lastmod: currentDate,
      changefreq: 'yearly',
      priority: '0.3'
    }
  ];

  // Generate blog post URLs
  const blogPosts = blogArticles.map(article => ({
    url: `/blog/${article.slug}`,
    lastmod: article.publishedDate,
    changefreq: 'monthly',
    priority: '0.8'
  }));

  const allPages = [...staticPages, ...blogPosts];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.send(sitemap);
}