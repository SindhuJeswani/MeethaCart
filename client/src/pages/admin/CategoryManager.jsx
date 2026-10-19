import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminSidebar from '../../components/admin/AdminSidebar';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Cake,
  Layers,
  Sparkles
} from 'lucide-react';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/categories/admin/all');
      if (res.data?.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      setError(err.message || 'Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      isActive: true
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      isActive: cat.isActive !== undefined ? cat.isActive : true
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');

      if (editingCategory) {
        // Update
        const res = await api.put(`/categories/${editingCategory._id}`, formData);
        setSuccess(res.data?.message || 'Category updated successfully.');
      } else {
        // Create
        const res = await api.post('/categories', formData);
        setSuccess(res.data?.message || 'Category created successfully.');
      }

      setIsModalOpen(false);
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category '${cat.name}'?`)) {
      return;
    }

    try {
      setError('');
      const res = await api.delete(`/categories/${cat._id}`);
      setSuccess(res.data?.message || 'Category deleted.');
      fetchCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 bg-bakery-50/50">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-chocolate flex items-center gap-2.5">
              <FolderTree className="w-7 h-7 text-amber-600" />
              <span>Category Management</span>
            </h1>
            <p className="text-xs sm:text-sm text-bakery-600 mt-1">
              Organize bakery items into categories (Custom Cakes, Mithai, Artisanal Breads).
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="btn-primary text-xs sm:text-sm py-2.5 px-4 shadow-warm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>

        {success && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Categories Grid */}
        {isLoading ? (
          <div className="p-16 text-center text-sm text-bakery-600">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="card-bakery text-center py-16">
            <FolderTree className="w-12 h-12 text-bakery-300 mx-auto mb-2" />
            <h3 className="font-serif font-bold text-chocolate text-lg">No Categories Yet</h3>
            <p className="text-xs text-bakery-500 mt-1 max-w-sm mx-auto">
              Create your first bakery category or run the seed script to populate sample categories.
            </p>
            <button onClick={openAddModal} className="btn-primary text-xs py-2 px-4 mt-4 inline-flex">
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Category</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="card-bakery p-5 flex flex-col justify-between hover:shadow-warm-lg transition-all border-bakery-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
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

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cat.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>

                  <p className="text-xs text-bakery-600 line-clamp-2 mt-2 leading-relaxed">
                    {cat.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-bakery-200/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-bakery-600 font-medium">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    <span>{cat.itemCount || 0} bakery items attached</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 text-bakery-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 text-bakery-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add / Edit Category */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="card-bakery w-full max-w-md p-6 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between pb-4 border-b border-bakery-200 mb-4">
                <h3 className="font-serif font-bold text-chocolate text-lg">
                  {editingCategory ? 'Edit Bakery Category' : 'Create New Category'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-bakery-400 hover:text-bakery-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Custom Cakes, Traditional Mithai"
                    required
                    className="input-bakery text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-bakery-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short summary of this bakery category..."
                    className="input-bakery text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-bakery-300"
                  />
                  <label htmlFor="isActiveToggle" className="text-xs font-medium text-bakery-800">
                    Visible in public bakery catalog
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-bakery-200 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary text-xs py-2 px-5"
                  >
                    {isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default CategoryManager;
