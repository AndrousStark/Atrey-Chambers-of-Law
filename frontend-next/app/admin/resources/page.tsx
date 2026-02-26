'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TechBackground } from '@/components/TechBackground';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-24 bg-cream/50 rounded border border-charcoal/30 animate-pulse" />
});

// Import Quill styles
if (typeof window !== 'undefined') {
  require('react-quill/dist/quill.snow.css');
}

interface Resource {
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

// Helper function to check if URL is a video URL
const isVideoUrl = (url: string): boolean => {
  if (!url || !url.trim()) return false;
  const lowerUrl = url.toLowerCase().trim();
  return lowerUrl.includes('youtube.com') || 
         lowerUrl.includes('youtu.be') || 
         lowerUrl.includes('vimeo.com') ||
         lowerUrl.includes('facebook.com') ||
         lowerUrl.includes('fb.watch') ||
         lowerUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i) !== null ||
         lowerUrl.startsWith('http') && (lowerUrl.includes('video') || lowerUrl.includes('stream'));
};

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
            className="absolute top-0 left-0 w-full h-full rounded border border-charcoal/20 shadow-sm"
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
            className="absolute top-0 left-0 w-full h-full rounded border border-charcoal/20 shadow-sm"
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
            className="absolute top-0 left-0 w-full h-full rounded border border-charcoal/20 shadow-sm"
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
        className="absolute top-0 left-0 w-full h-full rounded border border-charcoal/20 shadow-sm object-contain"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default function AdminResourcesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    resourceType: 'Books',
    heading: '',
    author: '',
    images: [''],
    videos: [''],
    body: '',
    links: [{ label: '', url: '' }],
    coverImageIndex: 0
  });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadingVideoIndex, setUploadingVideoIndex] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const admin = localStorage.getItem('isAdmin');
    if (!admin) {
      router.push('/signin');
    } else {
      setIsAuthenticated(true);
      fetchResources();
    }
  }, [router]);

  const fetchResources = async () => {
    try {
      // Add cache-busting to ensure fresh data
      const cacheBuster = `?t=${Date.now()}`;
      const response = await fetch(`/api/resources${cacheBuster}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      });
      const data = await response.json();
      setResources(data.resources || []);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleFileUpload = async (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingIndex(index);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } else {
            const text = await response.text();
            errorMessage = text || errorMessage;
          }
        } catch (parseError) {
          errorMessage = `Upload failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.url) {
        handleImageChange(index, result.url);
        alert('Image uploaded successfully!');
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload image');
    } finally {
      setUploadingIndex(null);
    }
  };

  const addImageField = () => {
    if (formData.images.length >= 20) {
      alert('Maximum 20 images allowed');
      return;
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const handleBulkImageUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Please select image files');
      return;
    }

    const totalImages = formData.images.filter(img => img.trim() !== '').length;
    if (totalImages + imageFiles.length > 20) {
      alert(`You can only upload up to 20 images total. Currently have ${totalImages}, trying to add ${imageFiles.length}`);
      return;
    }

    // Find first empty slot or add new ones
    let currentIndex = formData.images.findIndex(img => img.trim() === '');
    if (currentIndex === -1) {
      currentIndex = formData.images.length;
    }

    // Upload files sequentially
    let uploadedCount = 0;
    let firstUploadedIndex = -1;
    
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const targetIndex = currentIndex + i;
      
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 5MB limit. Skipping.`);
        continue;
      }

      setUploadingIndex(targetIndex);
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        });

        if (!response.ok) {
          let errorMessage = 'Upload failed';
          try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const error = await response.json();
              errorMessage = error.error || errorMessage;
            } else {
              const text = await response.text();
              errorMessage = text || errorMessage;
            }
          } catch (parseError) {
            errorMessage = `Upload failed with status ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        if (result.url) {
          setFormData(prev => {
            // Ensure we have enough slots
            const newImages = [...prev.images];
            while (newImages.length <= targetIndex) {
              newImages.push('');
            }
            newImages[targetIndex] = result.url;
            
            const updated = { ...prev, images: newImages };
            
            // Auto-set first uploaded image as cover if no cover is set or current cover is invalid
            if (uploadedCount === 0) {
              if (prev.coverImageIndex === undefined || prev.coverImageIndex < 0 || !prev.images[prev.coverImageIndex] || prev.images[prev.coverImageIndex].trim() === '') {
                updated.coverImageIndex = targetIndex;
                firstUploadedIndex = targetIndex;
              }
            }
            
            return updated;
          });
          
          uploadedCount++;
          if (firstUploadedIndex === -1) {
            firstUploadedIndex = targetIndex;
          }
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        alert(`Failed to upload "${file.name}": ${error.message || 'Upload failed'}`);
      } finally {
        setUploadingIndex(null);
      }
    }
    
    alert(`Successfully uploaded ${imageFiles.length} image(s)!`);
  };

  const setCoverImage = (index: number) => {
    if (formData.images[index] && formData.images[index].trim() !== '') {
      setFormData(prev => ({ ...prev, coverImageIndex: index }));
    }
  };

  const removeImageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleVideoChange = (index: number, value: string) => {
    const newVideos = [...formData.videos];
    newVideos[index] = value;
    setFormData(prev => ({ ...prev, videos: newVideos }));
  };

  const handleVideoUpload = async (index: number, file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      alert('File size must be less than 100MB');
      return;
    }

    setUploadingVideoIndex(index);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } else {
            const text = await response.text();
            errorMessage = text || errorMessage;
          }
        } catch (parseError) {
          errorMessage = `Upload failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.url) {
        handleVideoChange(index, result.url);
        alert('Video uploaded successfully!');
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload video');
    } finally {
      setUploadingVideoIndex(null);
    }
  };

  const addVideoField = () => {
    setFormData(prev => ({ ...prev, videos: [...prev.videos, ''] }));
  };

  const removeVideoField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const handleLinkChange = (index: number, field: 'label' | 'url', value: string) => {
    const newLinks = [...formData.links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFormData(prev => ({ ...prev, links: newLinks }));
  };

  const addLinkField = () => {
    setFormData(prev => ({ ...prev, links: [...prev.links, { label: '', url: '' }] }));
  };

  const removeLinkField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (publish: boolean = false) => {
    setIsSaving(true);
    try {
      const resourceData = {
        ...formData,
        images: formData.images.filter(img => img.trim() !== ''),
        videos: formData.videos.filter(video => video.trim() !== ''),
        links: formData.links.filter(link => link.label.trim() !== '' && link.url.trim() !== ''),
        published: publish
      };

      if (editingResource) {
        // Update existing resource
        const response = await fetch('/api/resources', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingResource.id, ...resourceData })
        });

        if (response.ok) {
          if (publish) {
            await fetch('/api/resources/publish', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: editingResource.id, publish: true })
            });
          }
          alert('Resource updated successfully!');
          resetForm();
          // Small delay to ensure blob write has propagated
          setTimeout(() => {
            fetchResources();
          }, 500);
        }
      } else {
        // Create new resource
        const response = await fetch('/api/resources', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resourceData)
        });

        if (response.ok) {
          const result = await response.json();
          if (publish) {
            await fetch('/api/resources/publish', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: result.resource.id, publish: true })
            });
          }
          alert('Resource created successfully!');
          resetForm();
          // Small delay to ensure blob write has propagated
          setTimeout(() => {
            fetchResources();
          }, 500);
        }
      }
    } catch (error) {
      console.error('Failed to save resource:', error);
      alert('Failed to save resource');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      resourceType: resource.resourceType,
      heading: resource.heading,
      author: resource.author || '',
      images: resource.images.length > 0 ? resource.images : [''],
      videos: resource.videos && resource.videos.length > 0 ? resource.videos : [''],
      body: resource.body,
      links: resource.links.length > 0 ? resource.links : [{ label: '', url: '' }],
      coverImageIndex: resource.coverImageIndex !== undefined ? resource.coverImageIndex : 0
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(`/api/resources?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Resource deleted successfully!');
        // Small delay to ensure blob write has propagated
        setTimeout(() => {
          fetchResources();
        }, 500);
      }
    } catch (error) {
      console.error('Failed to delete resource:', error);
      alert('Failed to delete resource');
    }
  };

  const handlePublish = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/resources/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, publish: !currentStatus })
      });

      if (response.ok) {
        alert(`Resource ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
        // Small delay to ensure blob write has propagated
        setTimeout(() => {
          fetchResources();
        }, 500);
      }
    } catch (error) {
      console.error('Failed to update publish status:', error);
      alert('Failed to update publish status');
    }
  };

  const resetForm = () => {
    setFormData({
      resourceType: 'Books',
      heading: '',
      author: '',
      images: [''],
      videos: [''],
      body: '',
      links: [{ label: '', url: '' }],
      coverImageIndex: 0
    });
    setEditingResource(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    router.push('/');
  };

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-cream relative overflow-hidden">
      <div className="grain-overlay absolute inset-0 z-0 pointer-events-none" />
      <TechBackground />
      <Header />
      
      <div className="relative z-10 pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-deepGreen font-display">
              Manage Resources
            </h1>
            <div className="flex gap-4">
              <a
                href="/admin"
                className="px-4 py-2 bg-charcoal/80 text-cream rounded hover:bg-charcoal transition-colors"
              >
                Back to Dashboard
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-charcoal text-cream rounded hover:bg-charcoal/80 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-semibold text-deepGreen mb-6">
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </h2>
            
            <div className="space-y-6">
              {/* Resource Type */}
              <div>
                <label htmlFor="resourceType" className="block text-sm font-medium text-charcoal mb-2">
                  Resource Type *
                </label>
                <select
                  id="resourceType"
                  value={formData.resourceType}
                  onChange={(e) => handleInputChange('resourceType', e.target.value)}
                  className="w-full rounded border border-charcoal/30 bg-cream/50 px-4 py-3 text-charcoal focus:border-deepGreen focus:outline-none focus:ring-2 focus:ring-deepGreen/50"
                >
                  <option value="Books">Books</option>
                  <option value="Research Article">Research Article</option>
                  <option value="Legal Post">Legal Post</option>
                  <option value="News Telecast">News Telecast</option>
                </select>
              </div>

              {/* Heading */}
              <div>
                <label htmlFor="heading" className="block text-sm font-medium text-charcoal mb-2">
                  Heading *
                </label>
                {typeof window !== 'undefined' && (
                  <ReactQuill
                    theme="snow"
                    value={formData.heading}
                    onChange={(value) => handleInputChange('heading', value)}
                    placeholder="Enter resource heading"
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'align': [] }],
                        ['clean']
                      ]
                    }}
                    formats={[
                      'header',
                      'bold', 'italic', 'underline', 'strike',
                      'color', 'background',
                      'align'
                    ]}
                    className="bg-white rounded"
                    style={{ minHeight: '100px' }}
                  />
                )}
              </div>

              {/* Author */}
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-charcoal mb-2">
                  Author Name
                </label>
                <input
                  type="text"
                  id="author"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  placeholder="Enter author name (optional)"
                  className="w-full rounded border border-charcoal/30 bg-cream/50 px-4 py-3 text-charcoal focus:border-deepGreen focus:outline-none focus:ring-2 focus:ring-deepGreen/50"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Images (Upload or Enter URL) - Max 20 images
                </label>
                <div className="mb-4">
                  <label className="px-4 py-2 bg-deepGreen text-white rounded hover:bg-deepGreen/90 transition-colors cursor-pointer inline-block">
                    📁 Bulk Upload Images (up to {20 - formData.images.filter(img => img.trim() !== '').length} remaining)
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          handleBulkImageUpload(files);
                        }
                      }}
                      disabled={formData.images.filter(img => img.trim() !== '').length >= 20}
                    />
                  </label>
                  <p className="text-xs text-charcoal/60 mt-2">
                    Select multiple images at once (up to 20 total)
                  </p>
                </div>
                {formData.images.map((image, index) => (
                  <div key={index} className="mb-4 p-4 border border-charcoal/20 rounded-lg bg-cream/30">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                        className="flex-1 rounded border border-charcoal/30 bg-white px-4 py-2 text-charcoal focus:border-deepGreen focus:outline-none focus:ring-2 focus:ring-deepGreen/50"
                        placeholder="Or enter image URL"
                      />
                      <label className="px-4 py-2 bg-deepGreen text-white rounded hover:bg-deepGreen/90 transition-colors cursor-pointer">
                        {uploadingIndex === index ? 'Uploading...' : 'Upload File'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(index, file);
                          }}
                          disabled={uploadingIndex === index}
                        />
                      </label>
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(index)}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {image && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-charcoal/20">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-charcoal/60 font-semibold">Image Preview:</p>
                          {formData.coverImageIndex === index ? (
                            <span className="px-3 py-1 bg-deepGreen text-white text-xs font-semibold rounded-full">
                              ✓ Cover Image
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCoverImage(index)}
                              className="px-3 py-1 bg-deepGreen/20 text-deepGreen text-xs font-semibold rounded hover:bg-deepGreen/30 transition-colors"
                            >
                              Set as Cover
                            </button>
                          )}
                        </div>
                        <div className="flex justify-center">
                          <img
                            src={image}
                            alt="Preview"
                            className={`max-w-full max-h-64 object-contain rounded border-2 shadow-sm ${
                              formData.coverImageIndex === index 
                                ? 'border-deepGreen ring-2 ring-deepGreen/50' 
                                : 'border-charcoal/20'
                            }`}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<p class="text-red-500 text-sm">Failed to load image. Please check the URL.</p>';
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImageField}
                  disabled={formData.images.length >= 20}
                  className="mt-2 px-4 py-2 bg-deepGreen/20 text-deepGreen rounded hover:bg-deepGreen/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Add Image Field ({formData.images.length}/20)
                </button>
              </div>

              {/* Videos */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Videos (Upload, Enter URL, or YouTube/Vimeo Embed URL)
                </label>
                <p className="text-xs text-charcoal/60 mb-3">
                  Supports direct video URLs, YouTube links (youtube.com/watch?v=... or youtu.be/...), Vimeo links (vimeo.com/...), and Facebook video links (facebook.com/... or fb.watch/...)
                </p>
                {formData.videos.map((video, index) => (
                  <div key={index} className="mb-4 p-4 border border-charcoal/20 rounded-lg bg-cream/30">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={video}
                        onChange={(e) => handleVideoChange(index, e.target.value)}
                        className="flex-1 rounded border border-charcoal/30 bg-white px-4 py-2 text-charcoal focus:border-deepGreen focus:outline-none focus:ring-2 focus:ring-deepGreen/50"
                        placeholder="Enter video URL or YouTube/Vimeo embed URL"
                      />
                      <label className="px-4 py-2 bg-deepGreen text-white rounded hover:bg-deepGreen/90 transition-colors cursor-pointer">
                        {uploadingVideoIndex === index ? 'Uploading...' : 'Upload Video'}
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleVideoUpload(index, file);
                          }}
                          disabled={uploadingVideoIndex === index}
                        />
                      </label>
                      {formData.videos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVideoField(index)}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {video && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-charcoal/20">
                        <p className="text-xs text-charcoal/60 mb-2 font-semibold">Video Preview:</p>
                        <div className="flex justify-center">
                          {isVideoUrl(video) ? (
                            <div className="w-full max-w-4xl">
                              {getVideoEmbed(video)}
                            </div>
                          ) : (
                            <div className="w-full max-w-4xl">
                              <video
                                src={video}
                                controls
                                className="w-full rounded border border-charcoal/20 shadow-sm"
                                style={{ maxHeight: '600px' }}
                                onError={(e) => {
                                  const target = e.target as HTMLVideoElement;
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<p class="text-red-500 text-sm">Failed to load video. Please check the URL or try uploading the file directly.</p>';
                                  }
                                }}
                              >
                                Your browser does not support the video tag.
                              </video>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addVideoField}
                  className="mt-2 px-4 py-2 bg-deepGreen/20 text-deepGreen rounded hover:bg-deepGreen/30 transition-colors"
                >
                  + Add Video
                </button>
              </div>

              {/* Body */}
              <div>
                <label htmlFor="body" className="block text-sm font-medium text-charcoal mb-2">
                  Body Content *
                </label>
                {typeof window !== 'undefined' && (
                  <ReactQuill
                    theme="snow"
                    value={formData.body}
                    onChange={(value) => handleInputChange('body', value)}
                    placeholder="Enter resource content"
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        [{ 'font': [] }],
                        [{ 'size': ['small', false, 'large', 'huge'] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
                        [{ 'script': 'sub'}, { 'script': 'super' }],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'align': [] }],
                        ['link', 'image', 'video'],
                        ['clean']
                      ]
                    }}
                    formats={[
                      'header', 'font', 'size',
                      'bold', 'italic', 'underline', 'strike', 'blockquote',
                      'list', 'bullet', 'indent',
                      'script',
                      'color', 'background',
                      'align',
                      'link', 'image', 'video'
                    ]}
                    className="bg-white rounded"
                    style={{ minHeight: '400px' }}
                  />
                )}
                <p className="mt-2 text-xs text-charcoal/60">
                  Use the toolbar above to format your content with bold, colors, italics, underline, highlight, and more
                </p>
              </div>

              {/* Links */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Links
                </label>
                {formData.links.map((link, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => handleLinkChange(index, 'label', e.target.value)}
                      className="flex-1 rounded border border-charcoal/30 bg-cream/50 px-4 py-2 text-charcoal focus:border-deepGreen focus:outline-none focus:ring-2 focus:ring-deepGreen/50"
                      placeholder="Link label"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                      className="flex-1 rounded border border-charcoal/30 bg-cream/50 px-4 py-2 text-charcoal focus:border-deepGreen focus:outline-none focus:ring-2 focus:ring-deepGreen/50"
                      placeholder="Link URL"
                    />
                    {formData.links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLinkField(index)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLinkField}
                  className="mt-2 px-4 py-2 bg-deepGreen/20 text-deepGreen rounded hover:bg-deepGreen/30 transition-colors"
                >
                  + Add Link
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  className="flex-1 rounded bg-charcoal/80 text-cream px-6 py-3 font-semibold hover:bg-charcoal transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingResource ? 'Update Draft' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  className="flex-1 rounded bg-deepGreen text-cream px-6 py-3 font-semibold hover:bg-deepGreen/90 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Publishing...' : 'Publish'}
                </button>
                {editingResource && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 rounded border border-charcoal/30 text-charcoal hover:bg-charcoal/10 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Resources List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-deepGreen mb-6">All Resources</h2>
            
            {resources.length === 0 ? (
              <p className="text-charcoal/70 text-center py-8">No resources yet. Create your first resource above!</p>
            ) : (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="border border-charcoal/20 rounded-lg p-6 bg-cream/30 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            resource.published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {resource.published ? 'Published' : 'Draft'}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-deepGreen/10 text-deepGreen text-xs font-semibold">
                            {resource.resourceType}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-charcoal mb-2">{resource.heading}</h3>
                        {resource.author && (
                          <p className="text-sm font-medium text-deepGreen mb-2">
                            Author: {resource.author}
                          </p>
                        )}
                        <p className="text-sm text-charcoal/70 mb-2">
                          Created: {new Date(resource.createdAt).toLocaleDateString()}
                        </p>
                        {resource.publishedAt && (
                          <p className="text-sm text-charcoal/70">
                            Published: {new Date(resource.publishedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(resource)}
                          className="px-4 py-2 bg-deepGreen/20 text-deepGreen rounded hover:bg-deepGreen/30 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handlePublish(resource.id, resource.published)}
                          className={`px-4 py-2 rounded transition-colors ${
                            resource.published
                              ? 'bg-orange-500 text-white hover:bg-orange-600'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {resource.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleDelete(resource.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}

