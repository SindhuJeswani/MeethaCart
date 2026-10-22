import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
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
import {
  fadeUp,
  scaleIn,
  buttonTap,
  TIMING,
  EASING
} from '../../animations/motion';

const AddEditItem = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

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

    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) {
        setError(`File '${f.name}' exceeds the 5MB size limit.`);
        return;
      }
    }

    setSelectedFiles((prev) => [...prev, ...files].slice(0, 5));
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
      setUploadProgress(15);

      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('category', formData.category);
      submitData.append('price', formData.price);
      submitData.append('stock', formData.stock);
      submitData.append('preparationTimeHours', formData.preparationTimeHours);
      submitData.append('isEggless', formData.isEggless);

      selectedFiles.forEach((file) => {
        submitData.append('images', file);
      });

      if (isEditing) {
        existingImages.forEach((img) => {
          submitData.append('images', img);
        });
      }

      if (formData.imageUrl.trim()) {
        submitData.append('images', formData.imageUrl.trim());
      }

      const progressInterval = setInterval(() => {
        setUploadProgress((p) => (p < 85 ? p + 15 : p));
      }, 150);

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

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success(res.data?.message || 'Bakery item saved successfully!');
      setTimeout(() => {
        navigate('/seller/items');
      }, 700);
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: TIMING.normal, ease: EASING.out }}
      >
        <Link
          to="/seller/items"
          className="text-xs font-semibold text-amber-800 hover:text-amber-950 inline-flex items-center gap-1 mb-2 hover:-translate-x-1 transition-transform"
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
      </motion.div>

      {error && (
        <div className="alert-error">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <motion.form
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Section 1: Basic Information */}
        <div className="card-bakery p-6 space-y-4 shadow-warm">
          <h2 className="font-serif font-bold text-chocolate text-lg border-b border-bakery-200/80 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>Recipe & Basic Information</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-bakery-700 mb-1.5 uppercase tracking-wider">
              Item Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Belgian Chocolate Fudge Cake, Almond Gulab Jamun"
              required
              className="input-bakery text-sm focus:ring-2 focus:ring-caramel/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-bakery-700 mb-1.5 uppercase tracking-wider">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="input-bakery text-sm focus:ring-2 focus:ring-caramel/20"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-bakery-700 mb-1.5 uppercase tracking-wider">
                Price (PKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g. 1500"
                required
                className="input-bakery text-sm focus:ring-2 focus:ring-caramel/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-bakery-700 mb-1.5 uppercase tracking-wider">
              Description & Ingredients <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your homemade creation, key ingredients, serving size (e.g. 2 lbs), and flavor profile..."
              required
              className="input-bakery text-sm focus:ring-2 focus:ring-caramel/20"
            />
          </div>
        </div>

        {/* Section 2: Fulfillment & Diet */}
        <div className="card-bakery p-6 space-y-4 shadow-warm">
          <h2 className="font-serif font-bold text-chocolate text-lg border-b border-bakery-200/80 pb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span>Fulfillment, Stock & Dietary</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-bakery-700 mb-1.5 uppercase tracking-wider">
                Available Stock Units <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="5"
                required
                className="input-bakery text-sm focus:ring-2 focus:ring-caramel/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-bakery-700 mb-1.5 uppercase tracking-wider">
                Preparation Time (Hours Notice) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.preparationTimeHours}
                onChange={(e) => setFormData({ ...formData, preparationTimeHours: e.target.value })}
                placeholder="24"
                required
                className="input-bakery text-sm focus:ring-2 focus:ring-caramel/20"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-bakery-50/70 border border-bakery-200 cursor-pointer hover:bg-bakery-100 transition-colors">
              <input
                type="checkbox"
                checked={formData.isEggless}
                onChange={(e) => setFormData({ ...formData, isEggless: e.target.checked })}
                className="w-4 h-4 rounded text-caramel focus:ring-caramel border-bakery-300"
              />
              <div>
                <span className="block text-xs font-bold text-chocolate">Eggless Recipe <span className="text-xs text-bakery-400 font-normal lowercase">(optional)</span></span>
                <span className="text-[11px] text-bakery-600">
                  Highlight this item in the catalog for customers with egg allergies or vegetarian preferences.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 3: Photo Upload with Animated Previews */}
        <div className="card-bakery p-6 space-y-4 shadow-warm">
          <h2 className="font-serif font-bold text-chocolate text-lg border-b border-bakery-200/80 pb-3 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-amber-600" />
            <span>Bakery Item Photos <span className="text-xs text-bakery-400 font-normal lowercase">(optional)</span></span>
          </h2>

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
              placeholder="Or paste an image web URL (optional)"
              className="input-bakery text-xs py-2"
            />
          </div>

          {/* Animated Image Previews */}
          {(previewUrls.length > 0 || existingImages.length > 0) && (
            <div className="pt-2">
              <span className="text-[11px] font-bold text-bakery-600 uppercase tracking-wider block mb-2">
                Attached Images:
              </span>
              <div className="flex flex-wrap gap-3">
                <AnimatePresence>
                  {/* Existing Images */}
                  {existingImages.map((img, idx) => (
                    <motion.div
                      key={`existing-${idx}`}
                      variants={scaleIn}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-bakery-300 group shadow-xs"
                    >
                      <img
                        src={img.startsWith('/uploads') ? `http://localhost:5000${img}` : img}
                        alt="Existing Preview"
                        className="w-full h-full object-cover"
                      />
                      <motion.button
                        whileTap={buttonTap}
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    </motion.div>
                  ))}

                  {/* Newly Selected File Previews */}
                  {previewUrls.map((url, idx) => (
                    <motion.div
                      key={`new-${idx}`}
                      variants={scaleIn}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-amber-500 group shadow-xs"
                    >
                      <img src={url} alt="New Preview" className="w-full h-full object-cover" />
                      <motion.button
                        whileTap={buttonTap}
                        type="button"
                        onClick={() => removeSelectedFile(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Upload Progress Bar */}
          <AnimatePresence>
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5 pt-2"
              >
                <div className="flex justify-between text-xs font-semibold text-chocolate">
                  <span>Uploading photos & saving recipe...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-bakery-200 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ ease: 'easeOut', duration: 0.2 }}
                    className="h-full bg-gradient-to-r from-amber-500 to-caramel rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <motion.div whileTap={buttonTap}>
            <Link to="/seller/items" className="btn-secondary text-xs sm:text-sm py-2.5 px-5">
              Cancel
            </Link>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={buttonTap}
            type="submit"
            disabled={isSubmitting}
            className="btn-primary text-xs sm:text-sm py-2.5 px-6 shadow-md flex items-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Publish to Marketplace'}</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default AddEditItem;
