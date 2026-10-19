import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
  Clock,
  Layers,
  Sparkles,
  Save,
  Image as ImageIcon
} from 'lucide-react';

const AddEditItem = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    stock: '5',
    preparationTimeHours: '24',
    isEggless: false,
    imageUrl: ''
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Fetch categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data?.success) {
          setCategories(res.data.categories);
          if (!isEditing && res.data.categories.length > 0) {
            setFormData((prev) => ({ ...prev, category: res.data.categories[0]._id }));
          }
        }
      } catch (err) {
        console.warn('Error loading categories:', err);
      }
    };
    fetchCats();
  }, [isEditing]);

  // 2. Fetch existing item if editing
  useEffect(() => {
    if (isEditing) {
      const fetchItem = async () => {
        try {
          setIsLoading(true);
          const res = await api.get(`/items/${id}`);
          if (res.data?.success) {
            const it = res.data.item;
            setFormData({
              title: it.title,
              description: it.description,
              category: it.category?._id || it.category,
              price: it.price?.toString() || '',
              stock: it.stock?.toString() || '0',
              preparationTimeHours: it.preparationTimeHours?.toString() || '24',
              isEggless: Boolean(it.isEggless),
              imageUrl: ''
            });
            setExistingImages(it.images || []);
          }
        } catch (err) {
          setError(err.message || 'Failed to load item.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchItem();
    }
  }, [id, isEditing]);

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate size limit (5MB)
    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) {
        setError(`File '${f.name}' exceeds the 5MB size limit.`);
        return;
      }
    }

    setSelectedFiles((prev) => [...prev, ...files].slice(0, 5));

    // Generate local preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews].slice(0, 5));
    setError('');
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.category || !formData.price) {
      setError('Please fill in all required fields.');
      return;
    }

    if (Number(formData.price) < 1) {
      setError('Price must be at least 1 PKR.');
      return;
    }

    try {
      setIsSubmitting(true);

      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('category', formData.category);
      submitData.append('price', formData.price);
      submitData.append('stock', formData.stock);
      submitData.append('preparationTimeHours', formData.preparationTimeHours);
      submitData.append('isEggless', formData.isEggless);

      // Append uploaded files
      selectedFiles.forEach((file) => {
        submitData.append('images', file);
      });

      // Append existing images if editing
      if (isEditing) {
        existingImages.forEach((img) => {
          submitData.append('images', img);
        });
      }

      // If an external image URL was typed in
      if (formData.imageUrl.trim()) {
        submitData.append('images', formData.imageUrl.trim());
      }

      let res;
      if (isEditing) {
        res = await api.put(`/items/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/items', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSuccess(res.data?.message || 'Bakery item saved successfully!');
      setTimeout(() => {
        navigate('/seller/items');
      }, 900);
    } catch (err) {
      setError(err.message || 'Failed to save bakery item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-bakery-700">Loading recipe details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <Link
          to="/seller/items"
          className="text-xs font-semibold text-amber-800 hover:text-amber-950 inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Bakery Catalog</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate">
          {isEditing ? 'Edit Bakery Item' : 'Publish New Bakery Creation'}
        </h1>
        <p className="text-xs sm:text-sm text-bakery-600 mt-1">
          {isEditing
            ? 'Update recipe details, pricing, stock, and preparation time.'
            : 'Fill out the details below to list your delicious treat in the MeethaCart marketplace.'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="card-bakery p-6 sm:p-8 space-y-6">
        
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-bakery-700 mb-1.5">
            Bakery Item Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Belgian Dark Chocolate Fudge Cake (2 Lbs)"
            required
            className="input-bakery text-sm font-medium"
          />
        </div>

        {/* Category & Price in Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bakery-700 mb-1.5">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="input-bakery text-sm font-medium appearance-none bg-white"
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bakery-700 mb-1.5">
              Price in PKR *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs font-bold text-bakery-500">
                PKR
              </span>
              <input
                type="number"
                min="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="2500"
                required
                className="input-bakery pl-14 text-sm font-bold text-chocolate"
              />
            </div>
          </div>
        </div>

        {/* Stock & Preparation Time in Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bakery-700 mb-1.5">
              Available Stock (Units)
            </label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="5"
              className="input-bakery text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-bakery-700 mb-1.5">
              Preparation Time (Hours)
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-bakery-400 absolute left-3.5 top-3.5" />
              <input
                type="number"
                min="1"
                value={formData.preparationTimeHours}
                onChange={(e) => setFormData({ ...formData, preparationTimeHours: e.target.value })}
                placeholder="12 or 24"
                className="input-bakery pl-10 text-sm"
              />
            </div>
            <span className="text-[11px] text-bakery-500 mt-1 block">
              How many hours in advance does a customer need to place an order?
            </span>
          </div>
        </div>

        {/* Eggless Checkbox */}
        <div className="p-4 rounded-xl bg-bakery-50 border border-bakery-200/80">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isEggless}
              onChange={(e) => setFormData({ ...formData, isEggless: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-bakery-300"
            />
            <div>
              <span className="text-xs font-bold text-bakery-900 block">
                Eggless / Vegetarian Recipe 🍃
              </span>
              <span className="text-[11px] text-bakery-500">
                Check this if your sweet is prepared without eggs (e.g. Traditional Mithai, eggless cakes).
              </span>
            </div>
          </label>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-bakery-700 mb-1.5">
            Detailed Recipe & Description *
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the layers, ingredients (e.g. Belgian Callebaut chocolate, organic flour, pure desi ghee), taste notes, serving recommendations..."
            required
            className="input-bakery text-sm leading-relaxed"
          />
        </div>

        {/* Image Upload Section */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-bakery-700">
            Bakery Item Photos (Up to 5 images, max 5MB each)
          </label>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-bakery-300 hover:border-amber-500 rounded-2xl p-6 text-center transition-colors bg-bakery-50/50">
            <UploadCloud className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-chocolate">
              Click to browse or drag photos here
            </p>
            <p className="text-[11px] text-bakery-500 mt-0.5">
              Supports JPEG, JPG, PNG, and WebP (up to 5MB)
            </p>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileChange}
              className="mt-3 text-xs text-bakery-700 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer"
            />
          </div>

          {/* Image URL fallback */}
          <div className="flex items-center gap-2 pt-1">
            <ImageIcon className="w-4 h-4 text-bakery-400 shrink-0" />
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="Or paste an image web URL (https://...)"
              className="input-bakery text-xs py-2"
            />
          </div>

          {/* Image Previews */}
          {(previewUrls.length > 0 || existingImages.length > 0) && (
            <div className="pt-2">
              <span className="text-[11px] font-bold text-bakery-600 uppercase tracking-wider block mb-2">
                Attached Images:
              </span>
              <div className="flex flex-wrap gap-3">
                {/* Existing Images */}
                {existingImages.map((img, idx) => (
                  <div key={`existing-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border border-bakery-300 group">
                    <img
                      src={img.startsWith('/uploads') ? `http://localhost:5000${img}` : img}
                      alt="Existing Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Newly Selected File Previews */}
                {previewUrls.map((url, idx) => (
                  <div key={`new-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-amber-500 group">
                    <img src={url} alt="New Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-bakery-200">
          <Link to="/seller/items" className="btn-secondary text-xs sm:text-sm py-2.5 px-5">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary text-xs sm:text-sm py-2.5 px-6 shadow-warm"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Bakery Item' : 'Publish Item'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

export default AddEditItem;
