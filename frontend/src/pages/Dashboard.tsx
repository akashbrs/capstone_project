import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, ClipboardList, CheckCircle2, Flame } from 'lucide-react';
import { dashboardApi, orderApi, tableApi } from '../api/resources';
import type { DashboardSummary, Order, RestaurantTable } from '../types';
import StatusPill from '../components/StatusPill';

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);

  useEffect(() => {
    dashboardApi.summary().then(setSummary);
    orderApi.getActive().then(setActiveOrders);
    tableApi.getAll().then(setTables);
  }, []);

  const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED').length;

  const cards = [
    { label: "Today's Revenue", value: summary ? `₹${summary.todayRevenue.toFixed(2)}` : '—', icon: IndianRupee, color: 'text-amber-400' },
    { label: "Today's Orders", value: summary?.todayOrderCount ?? '—', icon: ClipboardList, color: 'text-paper-100' },
    { label: 'Active Orders', value: summary?.activeOrderCount ?? '—', icon: Flame, color: 'text-rust-400' },
    { label: 'Tables Occupied', value: `${occupiedTables}/${tables.length}`, icon: CheckCircle2, color: 'text-sage-400' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl tracking-wide text-paper-100">Dashboard</h1>
          <p className="text-ink-500 text-sm mt-1">Floor overview for today's service</p>
        </div>
        <Link
          to="/pos"
          className="bg-amber-500 hover:bg-amber-400 text-ink-950 font-semibold rounded-lg px-4 py-2.5 text-sm transition-colors"
        >
          + New Order
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-ink-900 border border-ink-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
              <Icon size={16} className={color} />
            </div>
            <p className={`font-display text-2xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-ink-900 border border-ink-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-800 flex items-center justify-between">
          <h2 className="font-display text-lg tracking-wide text-paper-100">Active Tickets</h2>
          <Link to="/orders" className="text-xs text-amber-400 hover:text-amber-300">View all →</Link>
        </div>
        {activeOrders.length === 0 ? (
          <p className="px-5 py-10 text-center text-ink-500 text-sm">No active orders right now. The floor is quiet.</p>
        ) : (
          <div className="divide-y divide-ink-800">
            {activeOrders.slice(0, 8).map((o) => (
              <Link
                key={o.id}
                to={`/orders?id=${o.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-ink-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-ink-500">{o.orderNumber}</span>
                  <span className="text-sm text-paper-100">
                    {o.table ? `Table ${o.table.tableNumber}` : o.orderType.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-paper-200">₹{o.totalAmount.toFixed(2)}</span>
                  <StatusPill status={o.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
