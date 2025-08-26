import { Helmet } from 'react-helmet-async';

interface SchemaMarkupProps {
  type: 'homepage' | 'blog' | 'blog-article';
  articleData?: {
    title: string;
    description: string;
    author: string;
    publishedDate: string;
    slug: string;
    content: string;
    readingTime: string;
    tags: string[];
  };
}

export function SchemaMarkup({ type, articleData }: SchemaMarkupProps) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pictotext.com';

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PictoText",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "description": "Professional OCR and text extraction from images with enterprise-grade accuracy",
    "sameAs": [
      // Add social media URLs when available
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English"
    }
  };

  // WebApplication Schema for OCR tool
  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "PictoText OCR Tool",
    "url": baseUrl,
    "description": "Extract text from images with professional OCR technology. Supports documents, screenshots, and handwritten notes.",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free tier with 3 daily extractions"
    },
    "featureList": [
      "Text extraction from images",
      "OCR processing",
      "Document digitization",
      "Screenshot text extraction",
      "Multi-language support"
    ],
    "provider": {
      "@type": "Organization",
      "name": "PictoText"
    }
  };

  // BreadcrumbList Schema
  const getBreadcrumbSchema = () => {
    const items = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      }
    ];

    if (type === 'blog') {
      items.push({
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${baseUrl}/blog`
      });
    } else if (type === 'blog-article' && articleData) {
      items.push(
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": `${baseUrl}/blog`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": articleData.title,
          "item": `${baseUrl}/blog/${articleData.slug}`
        }
      );
    }

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items
    };
  };

  // BlogPosting Schema for individual articles
  const getBlogPostingSchema = () => {
    if (!articleData) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": articleData.title,
      "description": articleData.description,
      "author": {
        "@type": "Person",
        "name": articleData.author
      },
      "publisher": {
        "@type": "Organization",
        "name": "PictoText",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        }
      },
      "datePublished": articleData.publishedDate,
      "dateModified": articleData.publishedDate,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${baseUrl}/blog/${articleData.slug}`
      },
      "url": `${baseUrl}/blog/${articleData.slug}`,
      "keywords": articleData.tags.join(", "),
      "wordCount": articleData.content.split(' ').length,
      "timeRequired": `PT${articleData.readingTime.replace(' min', 'M')}`,
      "inLanguage": "en-US",
      "isPartOf": {
        "@type": "Blog",
        "@id": `${baseUrl}/blog`
      }
    };
  };

  const schemas: any[] = [organizationSchema];

  if (type === 'homepage') {
    schemas.push(webApplicationSchema);
  }

  if (type === 'blog-article') {
    const blogSchema = getBlogPostingSchema();
    if (blogSchema) schemas.push(blogSchema);
  }

  schemas.push(getBreadcrumbSchema());

  return (
    <Helmet>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      ))}
    </Helmet>
  );
}