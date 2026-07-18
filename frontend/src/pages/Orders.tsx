import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, Printer } from 'lucide-react';
import { orderApi } from '../api/resources';
import type { Order, OrderStatus, PaymentMethod } from '../types';
import StatusPill from '../components/StatusPill';
import { apiErrorMessage } from '../api/client';

const STATUS_FLOW: OrderStatus[] = ['OPEN', 'IN_KITCHEN', 'READY', 'SERVED'];

export default function Orders() {
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'active' | 'today' | 'all'>('active');
  const [selected, setSelected] = useState<Order | null>(null);
  const [activePayment, setActivePayment] = useState<{order: Order, method: PaymentMethod} | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState('');

  function load() {
    const call = filter === 'active' ? orderApi.getActive() : orderApi.getAll(filter === 'today' ? 'today' : undefined);
    call.then(setOrders);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    const id = params.get('id');
    if (id) {
      orderApi.getOne(Number(id)).then(setSelected).catch(() => {});
    }
  }, [params]);

  function openOrder(o: Order) {
    setSelected(o);
    setParams({ id: String(o.id) });
  }

  function closeDetail() {
    setSelected(null);
    setParams({});
  }

  async function refreshSelected(id: number) {
    const fresh = await orderApi.getOne(id);
    setSelected(fresh);
    load();
  }

  async function advanceStatus(order: Order) {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx === -1 || idx === STATUS_FLOW.length - 1) return;
    await orderApi.updateStatus(order.id, STATUS_FLOW[idx + 1]);
    refreshSelected(order.id);
  }

  async function handleCheckout(order: Order, method: PaymentMethod) {
    setError('');
    try {
      await orderApi.checkout(order.id, method);
      refreshSelected(order.id);
      if (activePayment) {
        setPaymentSuccess(true);
        setTimeout(() => {
          setActivePayment(null);
          setPaymentSuccess(false);
        }, 1500);
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function handleCancel(order: Order) {
    if (!confirm(`Cancel order ${order.orderNumber}?`)) return;
    await orderApi.cancel(order.id);
    refreshSelected(order.id);
  }

  return (
    <div className="flex h-full">
      <div className={`flex-1 p-8 overflow-y-auto scrollbar-thin ${selected ? 'max-w-[calc(100%-24rem)]' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl tracking-wide text-paper-100">Orders</h1>
          <div className="flex gap-1.5">
            {(['active', 'today', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium border capitalize transition-colors ${
                  filter === f ? 'bg-amber-500 text-ink-950 border-amber-500' : 'bg-ink-900 text-ink-500 border-ink-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-ink-900 border border-ink-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-800 text-left text-ink-500 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Ticket</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800">
              {orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => openOrder(o)}
                  className="cursor-pointer hover:bg-ink-800/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <p className="font-mono text-paper-100">{o.orderNumber}</p>
                    <p className="text-xs text-ink-500">{o.table ? `Table ${o.table.tableNumber}` : '—'}</p>
                  </td>
                  <td className="px-5 py-3.5 text-ink-500">{o.orderType.replace('_', ' ')}</td>
                  <td className="px-5 py-3.5 text-ink-500">{o.items.length}</td>
                  <td className="px-5 py-3.5 font-mono text-paper-200">₹{o.totalAmount.toFixed(2)}</td>
                  <td className="px-5 py-3.5"><StatusPill status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center text-ink-500 text-sm py-12">No orders here.</p>}
        </div>
      </div>

      {selected && (
        <div className="w-96 shrink-0 bg-ink-900 border-l border-ink-800 flex flex-col">
          <div className="px-5 py-4 border-b border-ink-800 flex items-center justify-between">
            <div>
              <p className="font-mono text-paper-100">{selected.orderNumber}</p>
              <p className="text-xs text-ink-500 mt-0.5">
                {selected.table ? `Table ${selected.table.tableNumber}` : selected.orderType.replace('_', ' ')}
                {selected.customerName ? ` · ${selected.customerName}` : ''}
              </p>
            </div>
            <button onClick={closeDetail} className="text-ink-500 hover:text-paper-100">
              <X size={18} />
            </button>
          </div>

          <div className="px-5 py-3 border-b border-ink-800">
            <StatusPill status={selected.status} />
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-3 divide-y divide-ink-800">
            {selected.items.map((li) => (
              <div key={li.id} className="py-2.5 flex justify-between text-sm">
                <div>
                  <p className="text-paper-100">{li.quantity}× {li.menuItem.name}</p>
                  {li.notes && <p className="text-xs text-ink-500">{li.notes}</p>}
                </div>
                <span className="font-mono text-ink-500">₹{(li.unitPrice * li.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 border-t border-ink-800 space-y-1.5">
            <div className="flex justify-between text-sm text-ink-500">
              <span>Subtotal</span><span className="font-mono">₹{selected.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-ink-500">
              <span>Tax</span><span className="font-mono">₹{selected.taxAmount.toFixed(2)}</span>
            </div>
            {selected.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-sage-400">
                <span>Discount</span><span className="font-mono">−₹{selected.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold text-paper-100 pt-1.5 border-t border-ink-800 mt-1.5">
              <span>Total</span><span className="font-mono text-amber-400">₹{selected.totalAmount.toFixed(2)}</span>
            </div>

            {error && <p className="text-rust-400 text-xs">{error}</p>}

            {selected.status !== 'PAID' && selected.status !== 'CANCELLED' && (
              <div className="space-y-2 pt-2">
                {STATUS_FLOW.indexOf(selected.status) < STATUS_FLOW.length - 1 && (
                  <button
                    onClick={() => advanceStatus(selected)}
                    className="w-full bg-ink-800 hover:bg-ink-700 border border-ink-700 text-paper-100 rounded-lg py-2 text-sm font-medium"
                  >
                    Mark as {STATUS_FLOW[STATUS_FLOW.indexOf(selected.status) + 1].replace('_', ' ')}
                  </button>
                )}

                <div className="grid grid-cols-3 gap-2">
                  {(['CASH', 'CARD', 'UPI'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        if (m === 'CASH') handleCheckout(selected, m);
                        else setActivePayment({ order: selected, method: m });
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-ink-950 font-semibold rounded-lg py-2 text-xs"
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleCancel(selected)}
                  className="w-full text-rust-400 hover:text-rust-300 text-xs py-1"
                >
                  Cancel order
                </button>
              </div>
            )}

            {selected.status === 'PAID' && (
              <div className="flex items-center gap-2 text-sage-400 text-sm pt-2">
                <Printer size={14} /> Paid via {selected.paymentMethod}
              </div>
            )}
          </div>
        </div>
      )}

      {activePayment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-ink-900 border border-ink-800 rounded-xl p-6 w-full max-w-sm">
            {paymentSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-sage-400/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-display text-xl text-paper-100">Payment done successfully</h3>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg text-paper-100">
                    {activePayment.method === 'CARD' ? 'Card Payment' : 'UPI Payment'}
                  </h3>
                  <button onClick={() => { setActivePayment(null); setPaymentSuccess(false); }} className="text-ink-500 hover:text-paper-100">
                    <X size={18} />
                  </button>
                </div>

                {activePayment.method === 'CARD' ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleCheckout(activePayment.order, 'CARD'); }} className="space-y-3">
                    <input required type="text" placeholder="Card Number" pattern="[0-9]{16}" maxLength={16} title="16 digit card number" className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-sm text-paper-100 outline-none focus:border-amber-500" />
                    <div className="grid grid-cols-2 gap-3">
                      <input required type="text" placeholder="MM/YY" pattern="(0[1-9]|1[0-2])\/([0-9]{2})" maxLength={5} title="MM/YY format" className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-sm text-paper-100 outline-none focus:border-amber-500" />
                      <input required type="password" placeholder="CVV" pattern="[0-9]{3,4}" maxLength={4} title="3 or 4 digit CVV" className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-sm text-paper-100 outline-none focus:border-amber-500" />
                    </div>
                    <button type="submit" className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-ink-950 font-semibold rounded-lg py-2.5 text-sm transition-colors">
                      Pay ₹{activePayment.order.totalAmount.toFixed(2)}
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-white p-2 rounded-xl">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=restaurant@upi&pn=Restaurant&am=${activePayment.order.totalAmount.toFixed(2)}`} alt="UPI QR Code" className="w-44 h-44" />
                    </div>
                    <p className="text-paper-100 font-mono text-lg mb-2">₹{activePayment.order.totalAmount.toFixed(2)}</p>
                    <div className="flex gap-2 w-full">
                      <button onClick={() => { setActivePayment(null); setPaymentSuccess(false); }} className="flex-1 border border-ink-700 text-paper-100 rounded-lg py-2 text-sm hover:bg-ink-800 transition-colors">
                        Not Paid
                      </button>
                      <button onClick={() => handleCheckout(activePayment.order, 'UPI')} className="flex-1 bg-amber-500 hover:bg-amber-400 text-ink-950 font-semibold rounded-lg py-2 text-sm transition-colors">
                        Paid the amount
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
