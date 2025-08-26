import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Calendar, ArrowLeft, ArrowRight, Home } from "lucide-react";
import { blogArticles } from "@/data/blog-articles";
import { AdContainer } from "@/components/ad-container";
import { ArticleContent } from "@/components/article-content";
import { SchemaMarkup } from "@/components/schema-markup";

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  
  const article = blogArticles.find(a => a.slug === slug);
  
  if (!article) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-4xl text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Article Not Found</h1>
        <p className="text-xl text-slate-600 mb-8">
          The article you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/blog">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  // Find related articles (same tags, excluding current)
  const relatedArticles = blogArticles
    .filter(a => a.id !== article.id && a.tags.some(tag => article.tags.includes(tag)))
    .slice(0, 3);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <SchemaMarkup 
        type="blog-article" 
        articleData={{
          title: article.title,
          description: article.excerpt,
          author: article.author,
          publishedDate: article.publishedDate,
          slug: article.slug,
          content: article.content,
          readingTime: article.readingTime,
          tags: article.tags
        }}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link href="/" className="hover:text-slate-700 transition-colors">
          <Home className="w-4 h-4" />
        </Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-slate-700 transition-colors">
          Blog
        </Link>
        <span>/</span>
        <span className="text-slate-700 truncate">{article.title}</span>
      </nav>

      {/* Article Header */}
      <header className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        
        <h1 className="text-4xl font-bold text-slate-800 mb-6 leading-tight">
          {article.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-6">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span className="font-medium">{article.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>{new Date(article.publishedDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{article.readingTime} read</span>
          </div>
        </div>
        
        <p className="text-xl text-slate-600 leading-relaxed">
          {article.excerpt}
        </p>
      </header>

      {/* Top Article Ad Space */}
      <div className="mb-8">
        <AdContainer 
          size="banner" 
          label="Sponsored Content"
          className="hidden md:block"
        />
        <AdContainer 
          size="mobile-banner" 
          label="Sponsored Content"
          className="block md:hidden"
        />
      </div>

      {/* Article Content */}
      <Card className="mb-12">
        <CardContent className="p-8">
          <ArticleContent content={article.content} />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center mb-12">
        <Link href="/blog">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
        
        <Link href="/">
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Try PictoText OCR
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Related Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedArticles.map((relatedArticle) => (
              <Card key={relatedArticle.id} className="hover:shadow-lg transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {relatedArticle.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    <Link href={`/blog/${relatedArticle.slug}`}>
                      {relatedArticle.title}
                    </Link>
                  </h3>
                  
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {relatedArticle.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{relatedArticle.author}</span>
                    <span>{relatedArticle.readingTime}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}