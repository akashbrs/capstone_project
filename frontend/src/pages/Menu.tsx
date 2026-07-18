import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Leaf, Beef, EyeOff, Eye } from 'lucide-react';
import { categoryApi, menuApi } from '../api/resources';
import type { Category, MenuItem } from '../types';
import { apiErrorMessage } from '../api/client';

const emptyItemForm = { id: 0, name: '', description: '', price: '', categoryId: '', isVeg: true };

export default function Menu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState(emptyItemForm);

  function load() {
    categoryApi.getAll().then(setCategories);
    menuApi.getAll().then(setItems);
  }

  useEffect(load, []);

  async function addCategory(e: FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await categoryApi.create({ name: newCategoryName, displayOrder: categories.length + 1 });
      setNewCategoryName('');
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function deleteCategory(id: number) {
    if (!confirm('Delete this category? Items inside it will need to be reassigned.')) return;
    try {
      await categoryApi.remove(id);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  function openNewItem() {
    setItemForm({ ...emptyItemForm, categoryId: activeCategory ? String(activeCategory) : String(categories[0]?.id ?? '') });
    setShowItemForm(true);
  }

  function openEditItem(item: MenuItem) {
    setItemForm({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      categoryId: String(item.categoryId),
      isVeg: item.isVeg,
    });
    setShowItemForm(true);
  }

  async function saveItem(e: FormEvent) {
    e.preventDefault();
    setError('');
    const payload = {
      name: itemForm.name,
      description: itemForm.description,
      price: Number(itemForm.price),
      categoryId: Number(itemForm.categoryId),
      isVeg: itemForm.isVeg,
    };
    try {
      if (itemForm.id) {
        await menuApi.update(itemForm.id, payload);
      } else {
        await menuApi.create(payload);
      }
      setShowItemForm(false);
      load();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function deleteItem(id: number) {
    if (!confirm('Remove this item from the menu?')) return;
    await menuApi.remove(id);
    load();
  }

  async function toggleAvailability(id: number) {
    await menuApi.toggleAvailability(id);
    load();
  }

  const visibleItems = activeCategory ? items.filter((i) => i.categoryId === activeCategory) : items;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-paper-100">Menu</h1>
          <p className="text-ink-500 text-sm mt-1">Manage categories, dishes and availability</p>
        </div>
        <button
          onClick={openNewItem}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-ink-950 font-semibold rounded-lg px-4 py-2.5 text-sm"
        >
          <Plus size={16} /> Add dish
        </button>
      </div>

      {error && <p className="text-rust-400 text-sm bg-rust-500/10 border border-rust-500/30 rounded-lg px-3 py-2 mb-4">{error}</p>}

      <div className="flex gap-6">
        <div className="w-56 shrink-0">
          <div className="space-y-1 mb-4">
            <button
              onClick={() => setActiveCategory(null)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeCategory === null ? 'bg-amber-500/10 text-amber-400' : 'text-ink-500 hover:text-paper-100'}`}
            >
              All items
            </button>
            {categories.map((c) => (
              <div key={c.id} className="flex items-center group">
                <button
                  onClick={() => setActiveCategory(c.id)}
                  className={`flex-1 text-left px-3 py-2 rounded-md text-sm truncate ${activeCategory === c.id ? 'bg-amber-500/10 text-amber-400' : 'text-ink-500 hover:text-paper-100'}`}
                >
                  {c.name}
                </button>
                <button onClick={() => deleteCategory(c.id)} className="opacity-0 group-hover:opacity-100 text-ink-500 hover:text-rust-400 px-1.5">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={addCategory} className="flex gap-1.5">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category"
              className="flex-1 min-w-0 bg-ink-900 border border-ink-800 rounded-lg px-3 py-2 text-xs text-paper-100 outline-none focus:border-amber-500"
            />
            <button type="submit" className="shrink-0 bg-ink-800 hover:bg-ink-700 border border-ink-700 rounded-lg px-2.5 text-paper-100">
              <Plus size={14} />
            </button>
          </form>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3">
          {visibleItems.map((item) => (
            <div key={item.id} className="bg-ink-900 border border-ink-800 rounded-xl p-4 flex flex-col">
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  {item.isVeg ? <Leaf size={13} className="text-sage-400" /> : <Beef size={13} className="text-rust-400" />}
                  <span className="text-sm font-medium text-paper-100">{item.name}</span>
                </div>
                <span className="font-mono text-amber-400 text-sm">₹{item.price.toFixed(2)}</span>
              </div>
              {item.description && <p className="text-xs text-ink-500 mb-3 line-clamp-2">{item.description}</p>}
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-[10px] text-ink-500 uppercase tracking-wide">{item.categoryName}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleAvailability(item.id)} className="text-ink-500 hover:text-paper-100" title="Toggle availability">
                    {item.isAvailable ? <Eye size={14} /> : <EyeOff size={14} className="text-rust-400" />}
                  </button>
                  <button onClick={() => openEditItem(item)} className="text-ink-500 hover:text-paper-100">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="text-ink-500 hover:text-rust-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {visibleItems.length === 0 && <p className="col-span-2 text-center text-ink-500 text-sm py-16">No dishes here yet.</p>}
        </div>
      </div>

      {showItemForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <form onSubmit={saveItem} className="bg-ink-900 border border-ink-800 rounded-xl p-6 w-full max-w-sm space-y-3">
            <h3 className="font-display text-lg text-paper-100 mb-1">{itemForm.id ? 'Edit dish' : 'Add dish'}</h3>
            <input
              required
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              placeholder="Dish name"
              className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-sm text-paper-100 outline-none focus:border-amber-500"
            />
            <textarea
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              placeholder="Description (optional)"
              rows={2}
              className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-sm text-paper-100 outline-none focus:border-amber-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={itemForm.price}
                onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                placeholder="Price"
                className="bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-sm text-paper-100 outline-none focus:border-amber-500"
              />
              <select
                required
                value={itemForm.categoryId}
                onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                className="bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-sm text-paper-100 outline-none focus:border-amber-500"
              >
                <option value="">Category…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-500">
              <input type="checkbox" checked={itemForm.isVeg} onChange={(e) => setItemForm({ ...itemForm, isVeg: e.target.checked })} />
              Vegetarian
            </label>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowItemForm(false)} className="flex-1 border border-ink-700 text-paper-100 rounded-lg py-2 text-sm">Cancel</button>
              <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-400 text-ink-950 font-semibold rounded-lg py-2 text-sm">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
