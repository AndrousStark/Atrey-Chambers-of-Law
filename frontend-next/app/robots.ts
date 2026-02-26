import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/signin', '/profile'],
      },
    ],
    sitemap: 'https://www.atreychambers.com/sitemap.xml',
  };
}
