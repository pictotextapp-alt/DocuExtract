import ReactMarkdown from "react-markdown";
import { AdContainer } from "./ad-container";

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  // Split content into sections to insert middle ad
  const contentLines = content.split('\n');
  const midPoint = Math.floor(contentLines.length / 2);
  
  // Find a good break point (prefer after a heading or paragraph)
  let insertPoint = midPoint;
  for (let i = midPoint; i < Math.min(midPoint + 10, contentLines.length); i++) {
    if (contentLines[i].startsWith('## ') || contentLines[i].trim() === '') {
      insertPoint = i;
      break;
    }
  }
  
  const beforeAd = contentLines.slice(0, insertPoint).join('\n');
  const afterAd = contentLines.slice(insertPoint).join('\n');

  return (
    <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-slate-800 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
      <ReactMarkdown>{beforeAd}</ReactMarkdown>
      
      {/* Middle Article Ad */}
      <div className="not-prose my-8">
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
      
      <ReactMarkdown>{afterAd}</ReactMarkdown>
    </div>
  );
}