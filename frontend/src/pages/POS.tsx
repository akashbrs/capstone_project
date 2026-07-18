import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Minus, Plus, Trash2, Leaf, Beef } from 'lucide-react';
import { categoryApi, menuApi, orderApi, tableApi } from '../api/resources';
import type { Category, MenuItem, RestaurantTable, OrderType, CartLine } from '../types';
import { apiErrorMessage } from '../api/client';

const TAX_RATE = 0.05;

export default function POS() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const [cart, setCart] = useState<CartLine[]>([]);
  const [orderType, setOrderType] = useState<OrderType>(params.get('tableId') ? 'DINE_IN' : 'TAKEAWAY');
  const [tableId, setTableId] = useState<number | ''>(params.get('tableId') ? Number(params.get('tableId')) : '');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryApi.getAll().then((cats) => {
      setCategories(cats);
      if (cats.length) setActiveCategory(cats[0].id);
    });
    menuApi.getAll().then(setItems);
    tableApi.getAll().then(setTables);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((i) => {
      const matchesCategory = activeCategory ? i.categoryId === activeCategory : true;
      const matchesSearch = search ? i.name.toLowerCase().includes(search.toLowerCase()) : true;
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, search]);

  function addToCart(item: MenuItem) {
    if (!item.isAvailable) return;
    setCart((prev) => {
      const existing = prev.find((l) => l.menuItem.id === item.id);
      if (existing) {
        return prev.map((l) => (l.menuItem.id === item.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }

  function changeQty(itemId: number, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.menuItem.id === itemId ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0)
    );
  }

  function removeLine(itemId: number) {
    setCart((prev) => prev.filter((l) => l.menuItem.id !== itemId));
  }

  const subtotal = cart.reduce((sum, l) => sum + l.menuItem.price * l.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  async function submitOrder() {
    setError('');
    if (cart.length === 0) {
      setError('Add at least one item to the ticket');
      return;
    }
    if (orderType === 'DINE_IN' && !tableId) {
      setError('Select a table for a dine-in order');
      return;
    }
    setSubmitting(true);
    try {
      const order = await orderApi.create({
        tableId: orderType === 'DINE_IN' ? Number(tableId) : undefined,
        orderType,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        items: cart.map((l) => ({ menuItemId: l.menuItem.id, quantity: l.quantity, notes: l.notes })),
      });
      navigate(`/orders?id=${order.id}`);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full">
      {/* Menu grid */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the menu…"
            className="flex-1 bg-ink-900 border border-ink-800 rounded-lg px-4 py-2.5 text-sm text-paper-100 outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-thin pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                activeCategory === c.id
                  ? 'bg-amber-500 text-ink-950 border-amber-500'
                  : 'bg-ink-900 text-ink-500 border-ink-800 hover:text-paper-100'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin grid grid-cols-3 gap-3 content-start pb-4">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              disabled={!item.isAvailable}
              className={`text-left bg-ink-900 border border-ink-800 rounded-xl p-4 transition-colors ${
                item.isAvailable ? 'hover:border-amber-500/50 cursor-pointer' : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-paper-100 leading-snug pr-2">{item.name}</span>
                {item.isVeg ? (
                  <Leaf size={14} className="text-sage-400 shrink-0 mt-0.5" />
                ) : (
                  <Beef size={14} className="text-rust-400 shrink-0 mt-0.5" />
                )}
              </div>
              <p className="font-mono text-amber-400 text-sm">₹{item.price.toFixed(2)}</p>
              {!item.isAvailable && <p className="text-[10px] text-ink-500 mt-1 uppercase tracking-wide">86'd</p>}
            </button>
          ))}
          {filteredItems.length === 0 && (
            <p className="col-span-3 text-center text-ink-500 text-sm py-16">No items match here.</p>
          )}
        </div>
      </div>

      {/* Cart / ticket panel */}
      <div className="w-96 shrink-0 bg-ink-900 border-l border-ink-800 flex flex-col">
        <div className="px-5 py-4 border-b border-ink-800">
          <h2 className="font-display text-lg tracking-wide text-paper-100">New Ticket</h2>

          <div className="flex gap-1.5 mt-3">
            {(['DINE_IN', 'TAKEAWAY', 'DELIVERY'] as OrderType[]).map((t) => (
              <button
                key={t}
                onClick={() => setOrderType(t)}
                className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  orderType === t
                    ? 'bg-amber-500 text-ink-950 border-amber-500'
                    : 'bg-ink-800 text-ink-500 border-ink-700'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>

          {orderType === 'DINE_IN' ? (
            <select
              value={tableId}
              onChange={(e) => setTableId(e.target.value ? Number(e.target.value) : '')}
              className="w-full mt-3 bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-sm text-paper-100 outline-none focus:border-amber-500"
            >
              <option value="">Select table…</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id} disabled={t.status === 'OCCUPIED'}>
                  Table {t.tableNumber} {t.status === 'OCCUPIED' ? '(occupied)' : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name"
                className="bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-sm text-paper-100 outline-none focus:border-amber-500"
              />
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone"
                className="bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-sm text-paper-100 outline-none focus:border-amber-500"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-3 divide-y divide-ink-800">
          {cart.length === 0 && (
            <p className="text-center text-ink-500 text-sm py-12">Tap menu items to add them to the ticket.</p>
          )}
          {cart.map((line) => (
            <div key={line.menuItem.id} className="py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-paper-100 truncate">{line.menuItem.name}</p>
                <p className="font-mono text-xs text-ink-500">₹{line.menuItem.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => changeQty(line.menuItem.id, -1)} className="h-6 w-6 flex items-center justify-center rounded bg-ink-800 text-paper-100 hover:bg-ink-700">
                  <Minus size={12} />
                </button>
                <span className="w-5 text-center font-mono text-sm text-paper-100">{line.quantity}</span>
                <button onClick={() => changeQty(line.menuItem.id, 1)} className="h-6 w-6 flex items-center justify-center rounded bg-ink-800 text-paper-100 hover:bg-ink-700">
                  <Plus size={12} />
                </button>
              </div>
              <button onClick={() => removeLine(line.menuItem.id)} className="text-ink-500 hover:text-rust-400">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-ink-800 space-y-1.5">
          <div className="flex justify-between text-sm text-ink-500">
            <span>Subtotal</span>
            <span className="font-mono">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-500">
            <span>Tax (5%)</span>
            <span className="font-mono">₹{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-paper-100 pt-1.5 border-t border-ink-800 mt-1.5">
            <span>Total</span>
            <span className="font-mono text-amber-400">₹{total.toFixed(2)}</span>
          </div>

          {error && <p className="text-rust-400 text-xs pt-1">{error}</p>}

          <button
            onClick={submitOrder}
            disabled={submitting}
            className="w-full mt-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-ink-950 font-semibold rounded-lg py-2.5 text-sm transition-colors"
          >
            {submitting ? 'Firing ticket…' : 'Send to Kitchen'}
          </button>
        </div>
      </div>
    </div>
  );
}
