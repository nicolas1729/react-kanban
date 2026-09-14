import { useEffect, useState } from 'react';
import { API } from './api.js';
import './WorkOrdersList.css';

const emptyForm = {
  title: '',
  description: '',
  assignee: '',
  priority: 2,
  dueDate: '',
};

async function apiCall(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${url} a échoué (${res.status})`);
  return res.status === 204 ? null : res.json();
}

function WorkOrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let cancelled = false;
    apiCall(`${API}/work-orders`, 'GET')
      .then((data) => {
        if (!cancelled) setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled)
          setError('Impossible de charger les ordres de travail.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(ev) {
    ev.preventDefault();
    if (!form.title.trim()) return;
    try {
      const created = await apiCall(`${API}/work-orders`, 'POST', {
        title: form.title,
        description: form.description || null,
        priority: Number(form.priority) || null,
        assignee: form.assignee || null,
        dueDate: form.dueDate || null,
      });
      setOrders((prev) => [...prev, created]);
      setForm(emptyForm);
      setShowForm(false);
    } catch {
      setError("La création de l'ordre de travail a échoué.");
    }
  }

  async function handleDelete(order) {
    try {
      await apiCall(`${API}/work-orders/${order.id}`, 'DELETE');
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch {
      setError("La suppression de l'ordre de travail a échoué.");
    }
  }

  return (
    <div className="work-orders-list-page">
      <h2 className="work-orders-list-title">Ordres de travail</h2>
      {error && <div className="work-orders-list-error">{error}</div>}

      {loading ? (
        <div className="work-orders-list-empty">Chargement…</div>
      ) : orders.length === 0 ? (
        <div className="work-orders-list-empty">Aucun ordre de travail.</div>
      ) : (
        <ul className="work-orders-list-items">
          {orders.map((order) => (
            <li key={order.id} className="work-orders-list-item">
              <div className="work-orders-list-item-main">
                <strong>{order.title}</strong>
                {order.assignee && (
                  <span className="work-orders-list-assignee">
                    {order.assignee}
                  </span>
                )}
              </div>
              {order.description && (
                <p className="work-orders-list-description">
                  {order.description}
                </p>
              )}
              <div className="work-orders-list-item-meta">
                {order.priority != null && (
                  <span>Priorité : {order.priority}</span>
                )}
                {order.dueDate && <span>Échéance : {order.dueDate}</span>}
                <span>
                  {order.kanbanCardId != null
                    ? `Carte liée : #${order.kanbanCardId}`
                    : 'Non liée à une carte'}
                </span>
                <button
                  type="button"
                  className="work-orders-list-delete"
                  onClick={() => handleDelete(order)}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <form className="work-orders-list-form" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Titre"
            value={form.title}
            onChange={(ev) => setForm({ ...form, title: ev.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(ev) =>
              setForm({ ...form, description: ev.target.value })
            }
          />
          <div className="work-orders-list-form-row">
            <input
              type="text"
              placeholder="Assigné à"
              value={form.assignee}
              onChange={(ev) => setForm({ ...form, assignee: ev.target.value })}
            />
            <input
              type="date"
              value={form.dueDate}
              onChange={(ev) => setForm({ ...form, dueDate: ev.target.value })}
            />
          </div>
          <div className="work-orders-list-form-actions">
            <button type="button" onClick={() => setShowForm(false)}>
              Annuler
            </button>
            <button type="submit">Ajouter</button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="work-orders-list-add"
          onClick={() => setShowForm(true)}
        >
          + Nouvel ordre de travail
        </button>
      )}
    </div>
  );
}

export default WorkOrdersList;
