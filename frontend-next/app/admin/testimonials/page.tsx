'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TechBackground } from '@/components/TechBackground';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image: string;
  published: boolean;
  createdAt: string;
}

export default function AdminTestimonialsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    content: '',
    image: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const admin = localStorage.getItem('isAdmin');
    if (!admin) {
      router.push('/signin');
    } else {
      setIsAuthenticated(true);
      fetchTestimonials();
    }
  }, [router]);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials');
      const data = await response.json();
      setTestimonials(data.testimonials || []);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      handleInputChange('image', result.url);
      alert('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (publish: boolean = false) => {
    if (!formData.name || !formData.role || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const testimonialData = {
        ...formData,
        published: publish
      };

      if (editingTestimonial) {
        // Update existing testimonial
        const response = await fetch('/api/testimonials', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingTestimonial.id, ...testimonialData })
        });

        if (response.ok) {
          alert('Testimonial updated successfully!');
          resetForm();
          fetchTestimonials();
        }
      } else {
        // Create new testimonial
        const response = await fetch('/api/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testimonialData)
        });

        if (response.ok) {
          alert('Testimonial created successfully!');
          resetForm();
          fetchTestimonials();
        }
      }
    } catch (error) {
      console.error('Failed to save testimonial:', error);
      alert('Failed to save testimonial');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      content: testimonial.content,
      image: testimonial.image
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const response = await fetch(`/api/testimonials?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Testimonial deleted successfully!');
        fetchTestimonials();
      }
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      alert('Failed to delete testimonial');
    }
  };

  const handlePublish = async (id: string, currentStatus: boolean) => {
    try {
      const testimonial = testimonials.find(t => t.id === id);
      if (!testimonial) return;

      const response = await fetch('/api/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, published: !currentStatus })
      });

      if (response.ok) {
        alert(`Testimonial ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
        fetchTestimonials();
      }
    } catch (error) {
      console.error('Failed to update publish status:', error);
      alert('Failed to update publish status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      content: '',
      image: ''
    });
    setEditingTestimonial(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    window.dispatchEvent(new Event('authChange'));
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
              Manage Testimonials
            </h1>
            <div className="flex gap-4">
              <a
                href="/profile"
                className="px-4 py-2 bg-charcoal/80 text-cream rounded hover:bg-charcoal transition-colors"
              >
                Back to Profile
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
              {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            </h2>
            
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full rounded border border-charcoal/30 bg-cream/50 px-4 py-3 text-charcoal focus:border-deepGreen focus:outline-none focus:ring-2 focus:ring-deepGreen/50"
                  placeholder="Enter client name"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-charcoal mb-2">
                  Role/Title *
                </label>
                <input
                  type="text"
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full rounded border border-charcoal/30 bg-cream/50 px-4 py-3 text-charcoal focus:border-deepGreen focus:outline-none focus:ring-2 focus:ring-deepGreen/50"
                  placeholder="e.g., Chief Executive Officer, Webieez Pte Ltd"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-charcoal mb-2">
                  Testimonial Content *
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  className="w-full rounded border border-charcoal/30 bg-cream/50 px-4 py-3 text-charcoal focus:border-deepGreen focus:outline-none focus:ring-2 focus:ring-deepGreen/50"
                  placeholder="Enter testimonial content"
                  rows={6}
                  required
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Image (Upload or Enter URL)
                </label>
                <div className="p-4 border border-charcoal/20 rounded-lg bg-cream/30">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => handleInputChange('image', e.target.value)}
                      className="flex-1 rounded border border-charcoal/30 bg-white px-4 py-2 text-charcoal focus:border-deepGreen focus:outline-none focus:ring-2 focus:ring-deepGreen/50"
                      placeholder="Or enter image URL"
                    />
                    <label className="px-4 py-2 bg-deepGreen text-white rounded hover:bg-deepGreen/90 transition-colors cursor-pointer">
                      {uploading ? 'Uploading...' : 'Upload File'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="max-w-xs max-h-32 object-contain rounded border border-charcoal/20"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  className="flex-1 rounded bg-charcoal/80 text-cream px-6 py-3 font-semibold hover:bg-charcoal transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingTestimonial ? 'Update Draft' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  className="flex-1 rounded bg-deepGreen text-cream px-6 py-3 font-semibold hover:bg-deepGreen/90 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Publishing...' : 'Publish'}
                </button>
                {editingTestimonial && (
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

          {/* Testimonials List */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-deepGreen mb-6">All Testimonials</h2>
            
            {testimonials.length === 0 ? (
              <p className="text-charcoal/70 text-center py-8">No testimonials yet. Create your first testimonial above!</p>
            ) : (
              <div className="space-y-4">
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="border border-charcoal/20 rounded-lg p-6 bg-cream/30 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            testimonial.published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {testimonial.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-charcoal mb-1">{testimonial.name}</h3>
                        <p className="text-sm text-deepGreen mb-2">{testimonial.role}</p>
                        <p className="text-sm text-charcoal/70 mb-2 line-clamp-2">
                          "{testimonial.content}"
                        </p>
                        <p className="text-xs text-charcoal/60">
                          Created: {new Date(testimonial.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(testimonial)}
                          className="px-4 py-2 bg-deepGreen/20 text-deepGreen rounded hover:bg-deepGreen/30 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handlePublish(testimonial.id, testimonial.published)}
                          className={`px-4 py-2 rounded transition-colors ${
                            testimonial.published
                              ? 'bg-orange-500 text-white hover:bg-orange-600'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {testimonial.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleDelete(testimonial.id)}
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

