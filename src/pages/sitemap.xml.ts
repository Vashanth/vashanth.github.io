import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

// XML escaping utility function to safely handle special characters
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Interface for Image metadata
interface SitemapImage {
  loc: string;     // Must be an absolute URL or path relative to the site root
  title?: string;
  caption?: string;
}

// Interface for Page metadata
interface SitemapPage {
  url: string;     // Should be the path (e.g., '/', '/about', '/photos')
  lastmod?: string; // Format: YYYY-MM-DD
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: SitemapImage[];
}

export const GET: APIRoute = ({ site }) => {
  // Use the site URL defined in astro.config.mjs, or fallback to the provided GitHub Pages URL
  const baseUrl = site ? site.toString().replace(/\/$/, '') : 'https://vashanth.github.io';

  // Dynamically load all portfolio photos from public directory
  const publicDir = path.join(process.cwd(), 'public');
  const files = fs.readdirSync(publicDir);
  const photoFiles = files.filter(file => file.startsWith('vashanth_') && /\.(jpeg|jpg|png|gif|webp)$/i.test(file));
  
  // Sort them to be in order
  photoFiles.sort();

  const photoImages: SitemapImage[] = photoFiles.map(filename => {
    const photoNumber = filename.match(/\d+/) ? filename.match(/\d+/)?.[0] : filename;
    return {
      loc: `/${filename}`,
      title: `Vashanth Saravanan - Portfolio Photo ${photoNumber}`,
      caption: `Portfolio picture of Vashanth`
    };
  });

  // ==========================================
  // ADD NEW PAGES AND CUSTOM IMAGE METADATA HERE
  // ==========================================
  const pages: SitemapPage[] = [
    {
      url: '/',
      changefreq: 'weekly',
      priority: 1.0,
      images: [
        {
          // Example referencing an image in the public folder
          loc: '/vashanth.jpg',
          title: 'Vashanth Saravanan',
          caption: 'Vashanth Saravanan, Software Engineer III at Docusign'
        }
      ]
    },
    {
      url: '/about',
      changefreq: 'monthly',
      priority: 0.8
    },
    {
      url: '/experience',
      changefreq: 'monthly',
      priority: 0.8
    },
    {
      url: '/projects',
      changefreq: 'monthly',
      priority: 0.9
    },
    {
      url: '/photos',
      changefreq: 'weekly',
      priority: 0.7,
      images: photoImages
    }
  ];

  // Helper function to build full absolute URLs
  const getFullUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // Construct the XML
  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemapXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" \n`;
  sitemapXml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  pages.forEach(page => {
    sitemapXml += `  <url>\n`;
    sitemapXml += `    <loc>${escapeXml(getFullUrl(page.url))}</loc>\n`;
    
    if (page.lastmod) sitemapXml += `    <lastmod>${page.lastmod}</lastmod>\n`;
    if (page.changefreq) sitemapXml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    if (page.priority) sitemapXml += `    <priority>${page.priority.toFixed(1)}</priority>\n`;
    
    if (page.images && page.images.length > 0) {
      page.images.forEach(img => {
        sitemapXml += `    <image:image>\n`;
        sitemapXml += `      <image:loc>${escapeXml(getFullUrl(img.loc))}</image:loc>\n`;
        if (img.title) sitemapXml += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
        if (img.caption) sitemapXml += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`;
        sitemapXml += `    </image:image>\n`;
      });
    }
    sitemapXml += `  </url>\n`;
  });

  sitemapXml += `</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
