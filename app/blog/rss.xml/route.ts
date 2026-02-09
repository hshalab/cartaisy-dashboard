import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { BlogPost } from '@/models/BlogPost';
import { siteConfig } from '@/lib/seo';

export async function GET() {
  try {
    await connectToDatabase();

    const posts = await BlogPost.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean();

    const items = posts
      .map((post) => {
        const pubDate = new Date(post.publishedAt || post.createdAt).toUTCString();
        const link = `${siteConfig.url}/blog/${post.slug}`;

        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>${post.author}</author>
      ${post.category ? `<category>${post.category}</category>` : ''}
      ${post.tags?.map((tag: string) => `<category>${tag}</category>`).join('\n      ') || ''}
    </item>`;
      })
      .join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.name} Blog</title>
    <link>${siteConfig.url}/blog</link>
    <description>Mobile commerce insights, Shopify tips, and product updates from Cartaisy.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteConfig.url}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteConfig.url}/logo.png</url>
      <title>${siteConfig.name} Blog</title>
      <link>${siteConfig.url}/blog</link>
    </image>
${items}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Failed to generate RSS feed:', error);
    return new NextResponse('Failed to generate RSS feed', { status: 500 });
  }
}
