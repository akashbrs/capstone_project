import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import { tableApi } from '../api/resources';
import type { RestaurantTable, TableStatus } from '../types';

const statusStyles: Record<TableStatus, string> = {
  AVAILABLE: 'border-sage-500/40 bg-sage-500/5 hover:border-sage-400',
  OCCUPIED: 'border-rust-500/40 bg-rust-500/5 hover:border-rust-400',
  RESERVED: 'border-amber-500/40 bg-amber-500/5 hover:border-amber-400',
  NEEDS_CLEANING: 'border-ink-600 bg-ink-800 hover:border-ink-500',
};

export default function Tables() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');
  const [newCapacity, setNewCapacity] = useState('4');
  const navigate = useNavigate();

  function load() {
    tableApi.getAll().then(setTables);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  async function cycleStatus(t: RestaurantTable) {
    if (t.status === 'OCCUPIED') return; // occupied tables change status via checkout
    const next: Record<TableStatus, TableStatus> = {
      AVAILABLE: 'RESERVED',
      RESERVED: 'AVAILABLE',
      NEEDS_CLEANING: 'AVAILABLE',
      OCCUPIED: 'OCCUPIED',
    };
    await tableApi.updateStatus(t.id, next[t.status]);
    load();
  }

  function handleTableClick(t: RestaurantTable) {
    if (t.status === 'AVAILABLE' || t.status === 'RESERVED') {
      navigate(`/pos?tableId=${t.id}`);
    } else {
      cycleStatus(t);
    }
  }

  async function addTable(e: React.FormEvent) {
    e.preventDefault();
    if (!newTableNum) return;
    await tableApi.create({ tableNumber: Number(newTableNum), capacity: Number(newCapacity) });
    setNewTableNum('');
    setNewCapacity('4');
    setShowAdd(false);
    load();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-paper-100">Tables</h1>
          <p className="text-ink-500 text-sm mt-1">Tap an open table to start a ticket &middot; tap a reserved/cleaning table to reset it</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-ink-800 hover:bg-ink-700 border border-ink-700 text-paper-100 rounded-lg px-4 py-2.5 text-sm transition-colors"
        >
          <Plus size={16} /> Add table
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addTable} className="mb-6 flex items-end gap-3 bg-ink-900 border border-ink-800 rounded-xl p-4 max-w-md">
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink-500 mb-1.5">Table #</label>
            <input value={newTableNum} onChange={(e) => setNewTableNum(e.target.value)} type="number" min="1"
              className="w-24 bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-paper-100 outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink-500 mb-1.5">Seats</label>
            <input value={newCapacity} onChange={(e) => setNewCapacity(e.target.value)} type="number" min="1"
              className="w-24 bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-paper-100 outline-none focus:border-amber-500" />
          </div>
          <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-ink-950 font-semibold rounded-lg px-4 py-2 text-sm">Add</button>
          <button type="button" onClick={() => setShowAdd(false)} className="text-ink-500 hover:text-paper-100 text-sm px-2 py-2">Cancel</button>
        </form>
      )}

      <div className="grid grid-cols-5 gap-4">
        {tables.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTableClick(t)}
            className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-colors ${statusStyles[t.status]}`}
          >
            <span className="font-display text-3xl text-paper-100">{t.tableNumber}</span>
            <span className="flex items-center gap-1 text-xs text-ink-500">
              <Users size={12} /> {t.capacity}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wide text-ink-500">{t.status.replace('_', ' ')}</span>
          </button>
        ))}
      </div>

      {tables.length === 0 && (
        <p className="text-center text-ink-500 text-sm py-16">No tables yet. Add your first one above.</p>
      )}
    </div>
  );
}
