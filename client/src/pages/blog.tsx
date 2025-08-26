import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar, ArrowRight } from "lucide-react";
import { blogArticles } from "@/data/blog-articles";
import { SchemaMarkup } from "@/components/schema-markup";

export default function Blog() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <SchemaMarkup type="blog" />
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          OCR & Document Processing Blog
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Insights, best practices, and industry trends in optical character recognition, 
          document digitization, and automated text extraction.
        </p>
      </div>

      {/* Featured Article */}
      <div className="mb-12">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
          <Badge className="bg-blue-100 text-blue-800 mb-4">Featured Article</Badge>
          <Link href={`/blog/${blogArticles[0].slug}`}>
            <div className="cursor-pointer group">
              <h2 className="text-3xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors">
                {blogArticles[0].title}
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                {blogArticles[0].excerpt}
              </p>
              <div className="flex items-center gap-6 text-sm text-slate-500 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{blogArticles[0].author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(blogArticles[0].publishedDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{blogArticles[0].readingTime} read</span>
                </div>
              </div>
              <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                Read Article
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogArticles.slice(1).map((article) => (
          <Card key={article.id} className="h-full hover:shadow-lg transition-shadow group">
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-3">
                {article.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-xl line-clamp-2 group-hover:text-blue-600 transition-colors">
                <Link href={`/blog/${article.slug}`}>
                  {article.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                {article.excerpt}
              </p>
              
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>{article.readingTime}</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 mb-4">
                {new Date(article.publishedDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>

              <Link href={`/blog/${article.slug}`}>
                <div className="flex items-center text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors group-hover:translate-x-1 transform transition-transform">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 text-center">
        <div className="bg-slate-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Stay Updated with OCR Innovations
          </h3>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Get the latest insights on document processing, OCR technology, and automation trends 
            delivered to your inbox.
          </p>
          <Link href="/">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors">
              Try PictoText OCR
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}