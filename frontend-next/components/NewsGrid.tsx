'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, cardHover } from '@/lib/animations';
import { assetPath } from '@/lib/utils';

interface PublishedResource {
  id: string;
  resourceType: string;
  heading: string;
  author?: string;
  images: string[];
  videos?: string[];
  body: string;
  links: Array<{ label: string; url: string }>;
  published: boolean;
  createdAt: string;
  publishedAt?: string;
  coverImageIndex?: number;
}

// Helper function to get YouTube video ID
const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Helper function to get Vimeo video ID
const getVimeoId = (url: string): string | null => {
  const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

// Helper function to check if URL is a Facebook video and get embed URL
const getFacebookEmbedUrl = (url: string): string | null => {
  const lowerUrl = url.toLowerCase().trim();
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.watch')) {
    // Facebook embeds use the full URL, so we return the encoded URL
    return encodeURIComponent(url);
  }
  return null;
};

// Helper function to create video embed
const getVideoEmbed = (url: string): JSX.Element => {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    const videoId = getYouTubeId(url);
    if (videoId) {
      return (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      );
    }
  }
  
  if (lowerUrl.includes('vimeo.com')) {
    const videoId = getVimeoId(url);
    if (videoId) {
      return (
        <iframe
          width="100%"
          height="100%"
          src={`https://player.vimeo.com/video/${videoId}`}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      );
    }
  }
  
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.watch')) {
    const embedUrl = getFacebookEmbedUrl(url);
    if (embedUrl) {
      return (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.facebook.com/plugins/video.php?href=${embedUrl}&show_text=false&width=500`}
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      );
    }
  }
  
  return (
    <video
      src={url}
      controls
      className="absolute inset-0 w-full h-full object-cover"
    >
      Your browser does not support the video tag.
    </video>
  );
};

const categoryToSlug: Record<string, string> = {
  'Books': 'legal-books',
  'Research Article': 'research-articles',
  'Legal Post': 'legal-posts-blogs',
  'News Telecast': 'news-telecast'
};

const FALLBACK_NEWS = [
  {
    id: 'fallback-1',
    featured: true,
    title: 'Game-Changer for Indian Arbitration Law — Lancor Holdings Analysis',
    titleHtml: 'Game-Changer for Indian Arbitration Law — Lancor Holdings Analysis',
    author: 'Dr. Abhishek Atrey',
    excerpt: 'A comprehensive analysis of the landmark Lancor Holdings case and its implications for arbitration practice in India, published on SSRN.',
    date: 'December 2025',
    image: undefined,
    video: undefined,
    category: 'Research Article',
  },
  {
    id: 'fallback-2',
    featured: false,
    title: 'Supreme Court on Homebuyer Rights — GMADA v. Anupam Garg',
    titleHtml: 'Supreme Court on Homebuyer Rights — GMADA v. Anupam Garg',
    author: 'Dr. Abhishek Atrey',
    excerpt: 'Examining the Supreme Court\'s landmark ruling protecting homebuyer rights against government authorities in real estate disputes.',
    date: 'August 2025',
    image: undefined,
    video: undefined,
    category: 'Research Article',
  },
  {
    id: 'fallback-3',
    featured: false,
    title: 'A Himalayan Task — on Uniform Civil Code',
    titleHtml: 'A Himalayan Task — on Uniform Civil Code',
    author: 'Dr. Abhishek Atrey',
    excerpt: 'An in-depth exploration of the constitutional mandate, challenges, and prospects of implementing a Uniform Civil Code in India.',
    date: 'June 2023',
    image: undefined,
    video: undefined,
    category: 'Legal Post',
  },
  {
    id: 'fallback-4',
    featured: false,
    title: 'Law of Contempt Versus Independence of Judiciary',
    titleHtml: 'Law of Contempt Versus Independence of Judiciary',
    author: 'Dr. Abhishek Atrey',
    excerpt: 'Analyzing the Prashant Bhushan contempt case and the delicate balance between judicial authority and free speech in Indian democracy.',
    date: 'August 2020',
    image: undefined,
    video: undefined,
    category: 'Legal Post',
  },
];

interface NewsGridProps {
  showAll?: boolean;
}

export const NewsGrid = ({ showAll = false }: NewsGridProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [newsItems, setNewsItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchPublishedResources = async () => {
      try {
        // Add cache-busting to ensure fresh data
        const response = await fetch(`/api/resources/published?t=${Date.now()}`, {
          cache: 'no-store',
        });
        const resources: PublishedResource[] = await response.json();
        
        // Convert resources to news items format, sorted by publishedAt (latest first)
        const sortedResources = resources.sort((a, b) => {
          const dateA = a.publishedAt || a.createdAt;
          const dateB = b.publishedAt || b.createdAt;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        // Show all resources if showAll is true, otherwise take latest 4
        const resourcesToShow = showAll ? sortedResources : sortedResources.slice(0, 4);

        // Helper function to strip HTML tags for excerpts
        const stripHtml = (html: string) => {
          if (typeof window === 'undefined') {
            // Server-side: simple regex to remove tags
            return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
          }
          const tmp = document.createElement('DIV');
          tmp.innerHTML = html;
          return tmp.textContent || tmp.innerText || '';
        };

        const formattedItems = resourcesToShow.map((resource, index) => {
          const coverIndex = resource.coverImageIndex !== undefined ? resource.coverImageIndex : 0;
          const coverImage = resource.images && resource.images.length > 0 
            ? (resource.images[coverIndex] || resource.images[0])
            : undefined;
          
          return {
            id: resource.id,
            featured: index === 0,
            title: resource.heading,
            titleHtml: resource.heading, // Keep HTML version
            author: resource.author,
            excerpt: stripHtml(resource.body).substring(0, 150) + (stripHtml(resource.body).length > 150 ? '...' : ''),
            date: new Date(resource.publishedAt || resource.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            image: coverImage,
            video: resource.videos && resource.videos.length > 0 ? resource.videos[0] : undefined,
            category: resource.resourceType
          };
        });

        if (formattedItems.length > 0) {
          setNewsItems(formattedItems);
        } else if (!showAll) {
          setNewsItems(FALLBACK_NEWS);
        }
      } catch (error) {
        console.error('Failed to fetch published resources:', error);
        // Fallback to static articles instead of empty
        if (!showAll) {
          setNewsItems(FALLBACK_NEWS);
        }
      }
    };

    fetchPublishedResources();
  }, [showAll]);

  const featured = newsItems.find(item => item.featured);
  const smallItems = newsItems.filter(item => !item.featured);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-10">
      <div className="mb-12 text-center">
        <motion.h2
          className="mb-3 text-3xl md:text-4xl font-semibold text-charcoal font-display"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-deepGreen">Latest News</span> & <span className="text-deepGreen">Insights</span>
        </motion.h2>
        <motion.p
          className="text-base text-charcoal/70 mb-4"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Stay informed with expert legal analysis and industry updates
        </motion.p>
      </div>

      {showAll ? (
        /* All Resources Grid - show when showAll is true */
        <motion.div
          variants={prefersReducedMotion ? {} : staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {newsItems.length > 0 ? newsItems.map((item, index) => (
            <motion.article
              key={item.id}
              variants={prefersReducedMotion ? {} : cardHover}
              initial="rest"
              whileHover="hover"
              custom={index}
              className="group cursor-pointer overflow-hidden rounded-md bg-white shadow-md transition-shadow hover:shadow-xl"
            >
              <div className="aspect-video w-full overflow-hidden bg-deepGreen/10 relative">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : item.video ? (
                  getVideoEmbed(item.video)
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-deepGreen/20 to-cream" />
                )}
              </div>
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.author && (
                      <p className="text-xs font-semibold text-deepGreen">By {item.author}</p>
                    )}
                    <p className="text-xs uppercase tracking-wide text-charcoal/60">{item.date}</p>
                  </div>
                  {item.category && (
                    <a
                      href={assetPath(`/resources/${categoryToSlug[item.category]}`)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-full bg-deepGreen/10 px-3 py-1 text-xs font-semibold text-deepGreen hover:bg-deepGreen hover:text-white transition-colors"
                    >
                      {item.category}
                    </a>
                  )}
                </div>
                <h3 
                  className="mb-3 text-xl font-semibold text-charcoal group-hover:text-deepGreen transition-colors"
                  dangerouslySetInnerHTML={{ __html: item.titleHtml }}
                />
                <p className="text-sm text-charcoal/80 leading-relaxed">{item.excerpt}</p>
              </div>
            </motion.article>
          )) : (
            <div className="col-span-full rounded-md bg-white shadow-md p-8 text-center">
              <p className="text-charcoal/70">No published resources yet. Check back soon!</p>
            </div>
          )}
        </motion.div>
      ) : (
        /* Home page layout - Featured card + small items */
        <motion.div
          variants={prefersReducedMotion ? {} : staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-2"
        >
          {/* Featured Card */}
          {featured ? (
          <motion.article
            variants={prefersReducedMotion ? {} : cardHover}
            initial="rest"
            whileHover="hover"
            className="group cursor-pointer overflow-hidden rounded-md bg-white shadow-md transition-shadow hover:shadow-xl"
          >
            <div className="aspect-video w-full overflow-hidden bg-deepGreen/10 relative">
              {featured.image ? (
                <img 
                  src={featured.image} 
                  alt={featured.title}
                  className="w-full h-full object-cover"
                />
              ) : featured.video ? (
                getVideoEmbed(featured.video)
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-deepGreen/20 to-cream" />
              )}
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {featured.author && (
                    <p className="text-xs font-semibold text-deepGreen">By {featured.author}</p>
                  )}
                <p className="text-xs uppercase tracking-wide text-charcoal/60">{featured.date}</p>
                </div>
                {featured.category && (
                  <a
                    href={assetPath(`/resources/${categoryToSlug[featured.category]}`)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-full bg-deepGreen/10 px-3 py-1 text-xs font-semibold text-deepGreen hover:bg-deepGreen hover:text-white transition-colors"
                  >
                    {featured.category}
                  </a>
                )}
              </div>
              <h3 
                className="mb-3 text-2xl font-semibold text-charcoal group-hover:text-deepGreen transition-colors"
                dangerouslySetInnerHTML={{ __html: featured.titleHtml }}
              />
              <p className="text-sm text-charcoal/80 leading-relaxed">{featured.excerpt}</p>
            </div>
          </motion.article>
        ) : (
          <div className="rounded-md bg-white shadow-md p-8 text-center">
            <p className="text-charcoal/70">No published resources yet. Check back soon!</p>
          </div>
        )}

        {/* Small Headlines */}
        <div className="flex flex-col gap-6">
            {smallItems.length > 0 ? smallItems.map((item, index) => (
            <motion.article
              key={item.id}
              variants={prefersReducedMotion ? {} : cardHover}
              initial="rest"
              whileHover="hover"
              custom={index}
              className="group cursor-pointer rounded-md border border-charcoal/10 bg-white p-4 shadow-sm transition-shadow hover:border-deepGreen/30 hover:shadow-md"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.author && (
                    <p className="text-xs font-semibold text-deepGreen">By {item.author}</p>
                  )}
                <p className="text-xs uppercase tracking-wide text-charcoal/60">{item.date}</p>
                </div>
                {item.category && (
                  <a
                    href={assetPath(`/resources/${categoryToSlug[item.category]}`)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-full bg-deepGreen/10 px-3 py-1 text-xs font-semibold text-deepGreen hover:bg-deepGreen hover:text-white transition-colors"
                  >
                    {item.category}
                  </a>
                )}
              </div>
              <h3 
                className="text-lg font-semibold text-charcoal group-hover:text-deepGreen transition-colors"
                dangerouslySetInnerHTML={{ __html: item.titleHtml }}
              />
              <p className="mt-2 text-sm text-charcoal/70">{item.excerpt}</p>
            </motion.article>
          )) : (
            <div className="rounded-md border border-charcoal/10 bg-white p-4 text-center">
              <p className="text-charcoal/70 text-sm">More resources coming soon...</p>
            </div>
          )}
        </div>
        </motion.div>
      )}
    </div>
  );
};

