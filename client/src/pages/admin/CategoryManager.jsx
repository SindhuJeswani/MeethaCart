import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useToast } from '../../context/ToastContext';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  X,
  Layers,
  Cake,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import {
  fadeUp,
  staggerContainer,
  staggerItem,
  cardHover,
  buttonTap,
  modalBackdrop,
  modalIn,
  TIMING,
  EASING
} from '../../animations/motion';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.get('/categories');
      if (res.data?.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(err.message || 'Failed to retrieve categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      isActive: cat.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingCategory) {
        const res = await api.put(`/admin/categories/${editingCategory._id}`, formData);
        if (res.data?.success) {
          toast.success('Category updated successfully.');
          setCategories((prev) =>
            prev.map((c) => (c._id === editingCategory._id ? res.data.category : c))
          );
          setIsModalOpen(false);
        }
      } else {
        const res = await api.post('/admin/categories', formData);
        if (res.data?.success) {
          toast.success('Category created successfully.');
          setCategories((prev) => [res.data.category, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (cat.itemCount > 0) {
      alert(`Category "${cat.name}" has ${cat.itemCount} listing(s) assigned to it. Please reassign or remove these listings before deleting this category.`);
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete category "${cat.name}"?`
    );
    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/admin/categories/${cat._id}`);
      if (res.data?.success) {
        toast.success(`Category "${cat.name}" deleted.`);
        setCategories((prev) => prev.filter((c) => c._id !== cat._id));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-bakery-50 min-h-[calc(100vh-64px)]">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-10 max-w-6xl space-y-6 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: TIMING.normal, ease: EASING.out }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-bakery-200/80 pb-5"
        >
          <div>
            <span className="section-eyebrow">Catalog</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate mt-0.5">
              Categories
            </h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={buttonTap}
            onClick={openAddModal}
            className="btn-primary text-xs font-semibold py-2.5 px-4 self-start sm:self-auto flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </motion.button>
        </motion.div>

        {error && (
          <div className="alert-error">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card-bakery p-5 h-44 skeleton skeleton-shimmer rounded-xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-bakery text-center py-16"
          >
            <FolderTree className="w-12 h-12 text-bakery-300 mx-auto mb-2" />
            <h3 className="font-serif font-bold text-chocolate text-lg">No Categories Found</h3>
            <p className="text-xs text-bakery-500 mt-1 max-w-sm mx-auto">
              Get started by creating your first product category.
            </p>
            <button onClick={openAddModal} className="btn-primary text-xs py-2 px-4 mt-4 inline-flex">
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Category</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer(0.06)}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <AnimatePresence>
              {categories.map((cat) => (
                <motion.div
                  key={cat._id}
                  layout
                  variants={staggerItem}
                  whileHover={cardHover}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="card-bakery p-5 flex flex-col justify-between border-bakery-200 transition-shadow"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-xs">
                          <Cake className="w-5 h-5 text-amber-700" />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-chocolate text-base leading-tight">
                            {cat.name}
                          </h3>
                          <span className="text-[11px] font-mono text-bakery-500 block">
                            /{cat.slug}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg text-bakery-500 hover:text-amber-800 hover:bg-amber-100 transition-colors"
                          title="Edit category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 rounded-lg text-bakery-500 hover:text-rose-700 hover:bg-rose-100 transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-bakery-600 line-clamp-2 mt-2 leading-relaxed">
                      {cat.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-bakery-100 mt-4 flex items-center justify-between text-xs">
                    <span className="text-bakery-500 font-medium">
                      {cat.itemCount || 0} items
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        cat.isActive !== false
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}
                    >
                      {cat.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Add / Edit Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={modalBackdrop}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              variants={modalIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-warm-lg border border-bakery-200 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-bakery-200 mb-4">
                <h3 className="font-serif font-bold text-chocolate text-lg">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-bakery-400 hover:text-chocolate rounded-lg hover:bg-bakery-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label-bakery">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Wedding Cakes, Mithai, Brownies"
                    className="input-bakery text-xs"
                  />
                </div>

                <div>
                  <label className="label-bakery">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief summary of items in this category..."
                    className="input-bakery text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-bakery-300 text-amber-600 focus:ring-caramel"
                  />
                  <label htmlFor="isActive" className="text-xs font-semibold text-chocolate cursor-pointer">
                    Active (visible in marketplace filters)
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2 border-t border-bakery-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary text-xs py-2 px-3.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary text-xs py-2 px-4 shadow-xs"
                  >
                    {isSubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryManager;
