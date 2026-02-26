'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full rounded"
                    />
                </div>
            );
        }
    }
    
    if (lowerUrl.includes('vimeo.com')) {
        const videoId = getVimeoId(url);
        if (videoId) {
            return (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://player.vimeo.com/video/${videoId}`}
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full rounded"
                    />
                </div>
            );
        }
    }
    
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.watch')) {
        const embedUrl = getFacebookEmbedUrl(url);
        if (embedUrl) {
            return (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.facebook.com/plugins/video.php?href=${embedUrl}&show_text=false&width=500`}
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full rounded"
                    />
                </div>
            );
        }
    }
    
    return (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <video
                src={url}
                controls
                className="absolute top-0 left-0 w-full h-full rounded object-contain"
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

interface PublishedResourcesListProps {
    resourceType: string;
}

// Helper function to strip HTML tags for search and preview
const stripHtml = (html: string) => {
    if (typeof window === 'undefined') {
        // Server-side: simple regex to remove tags
        return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    }
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

export const PublishedResourcesList = ({ resourceType }: PublishedResourcesListProps) => {
    const [resources, setResources] = useState<PublishedResource[]>([]);
    const [filteredResources, setFilteredResources] = useState<PublishedResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedResource, setSelectedResource] = useState<PublishedResource | null>(null);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                // Add cache-busting to ensure fresh data
                const response = await fetch(`/api/resources/published?t=${Date.now()}`, {
                    cache: 'no-store',
                });
                const data: PublishedResource[] = await response.json();
                
                // Filter by resource type and sort by publishedAt (latest first)
                const filtered = data
                    .filter((r) => r.resourceType === resourceType)
                    .sort((a, b) => {
                        const dateA = a.publishedAt || a.createdAt;
                        const dateB = b.publishedAt || b.createdAt;
                        return new Date(dateB).getTime() - new Date(dateA).getTime();
                    });
                
                setResources(filtered);
                setFilteredResources(filtered);
            } catch (error) {
                console.error('Failed to fetch resources:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, [resourceType]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredResources(resources);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = resources.filter((resource) => 
                stripHtml(resource.heading).toLowerCase().includes(query) ||
                stripHtml(resource.body).toLowerCase().includes(query)
            );
            setFilteredResources(filtered);
        }
    }, [searchQuery, resources]);

    if (loading) {
        return (
            <div className="text-center py-12">
                <p className="text-charcoal/70">Loading resources...</p>
            </div>
        );
    }

    return (
        <>
            {/* Search Bar */}
            <div className="mb-8">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search resources..."
                    className="w-full max-w-md mx-auto block rounded-lg border border-charcoal/30 bg-white px-6 py-3 text-charcoal focus:border-deepGreen focus:outline-none focus:ring-2 focus:ring-deepGreen/50"
                />
                {searchQuery && (
                    <p className="text-sm text-charcoal/60 mt-2 text-center">
                        Found {filteredResources.length} result{filteredResources.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            {filteredResources.length === 0 ? (
                <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                    <p className="text-charcoal/90 leading-relaxed">
                        {searchQuery ? 'No resources found matching your search.' : 'No published resources yet. Check back soon!'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource, index) => (
                        <motion.div
                            key={resource.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            onClick={() => setSelectedResource(resource)}
                            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
                        >
                            {resource.images && resource.images.length > 0 && (
                                <div className="h-48 w-full overflow-hidden">
                                    <img 
                                        src={resource.images[0]} 
                                        alt={resource.heading}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            )}
                            {(!resource.images || resource.images.length === 0) && resource.videos && resource.videos.length > 0 && (
                                <div className="h-48 w-full overflow-hidden bg-black">
                                    {getVideoEmbed(resource.videos[0])}
                                </div>
                            )}
                            
                            <div className="p-6">
                                <h3 
                                    className="text-xl font-bold text-deepGreen mb-2 line-clamp-2"
                                    dangerouslySetInnerHTML={{ __html: resource.heading }}
                                />
                                
                                <div className="flex items-center gap-3 mb-3">
                                    {resource.author && (
                                        <p className="text-xs font-semibold text-deepGreen">
                                            By {resource.author}
                                        </p>
                                    )}
                                    <p className="text-xs text-charcoal/60">
                                        {new Date(resource.publishedAt || resource.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                
                                <p className="text-charcoal/80 leading-relaxed line-clamp-3 text-sm">
                                    {stripHtml(resource.body).substring(0, 150)}...
                                </p>
                                
                                <button className="mt-4 text-deepGreen font-semibold hover:underline text-sm">
                                    Read More →
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Full Text Modal */}
            <AnimatePresence>
                {selectedResource && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelectedResource(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="sticky top-0 bg-white border-b border-charcoal/20 px-6 py-4 flex justify-between items-center">
                                <h2 
                                    className="text-2xl font-bold text-deepGreen"
                                    dangerouslySetInnerHTML={{ __html: selectedResource.heading }}
                                />
                                <button
                                    onClick={() => setSelectedResource(null)}
                                    className="text-charcoal/60 hover:text-charcoal text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="p-6">
                                {selectedResource.images && selectedResource.images.length > 0 && (() => {
                                    const coverIndex = (selectedResource as any).coverImageIndex !== undefined 
                                        ? (selectedResource as any).coverImageIndex 
                                        : 0;
                                    const coverImage = selectedResource.images[coverIndex] || selectedResource.images[0];
                                    return (
                                        <div className="mb-6 rounded-lg overflow-hidden">
                                            <img 
                                                src={coverImage} 
                                                alt={selectedResource.heading}
                                                className="w-full h-auto max-h-96 object-contain"
                                            />
                                        </div>
                                    );
                                })()}
                                {(!selectedResource.images || selectedResource.images.length === 0) && selectedResource.videos && selectedResource.videos.length > 0 && (
                                    <div className="mb-6 rounded-lg overflow-hidden bg-black max-w-5xl mx-auto">
                                        {getVideoEmbed(selectedResource.videos[0])}
                                    </div>
                                )}
                                {selectedResource.videos && selectedResource.videos.length > 0 && selectedResource.images && selectedResource.images.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-deepGreen mb-3">Videos</h4>
                                        <div className="space-y-4 max-w-5xl mx-auto">
                                            {selectedResource.videos.map((video, idx) => (
                                                <div key={idx} className="rounded-lg overflow-hidden bg-black">
                                                    {getVideoEmbed(video)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-4 mb-6 text-sm text-charcoal/60">
                                    {selectedResource.author && (
                                        <p className="font-semibold text-deepGreen">
                                            Author: {selectedResource.author}
                                        </p>
                                    )}
                                    <p>
                                        Published: {new Date(selectedResource.publishedAt || selectedResource.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                
                                <div 
                                    className="text-charcoal/90 leading-relaxed mb-6 prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: selectedResource.body }}
                                />
                                
                                {selectedResource.links && selectedResource.links.length > 0 && (
                                    <div className="flex flex-wrap gap-3 pt-4 border-t border-charcoal/20">
                                        {selectedResource.links.map((link, linkIndex) => (
                                            <a
                                                key={linkIndex}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-deepGreen text-white rounded-lg hover:bg-deepGreen/90 transition-colors"
                                            >
                                                {link.label}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

