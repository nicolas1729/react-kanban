import { useEffect, useState } from 'react';
import './WorkOrders.css';

const API = 'http://localhost:8080/api';

const STATUS_LABELS = {
  BACKLOG: 'À faire',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminé',
};

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

function WorkOrders({ value: cardId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (cardId == null) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${API}/work-orders?kanbanCardId=${cardId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setOrders(data);
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
  }, [cardId]);

  async function handleCreate(ev) {
    ev.preventDefault();
    if (!form.title.trim()) return;
    try {
      const created = await apiCall(`${API}/work-orders`, 'POST', {
        title: form.title,
        description: form.description || null,
        status: 'BACKLOG',
        priority: Number(form.priority) || null,
        assignee: form.assignee || null,
        dueDate: form.dueDate || null,
        kanbanCardId: cardId,
      });
      setOrders((prev) => [...prev, created]);
      setForm(emptyForm);
      setShowForm(false);
    } catch {
      setError("La création de l'ordre de travail a échoué.");
    }
  }

  async function handleStatusChange(order, status) {
    try {
      const updated = await apiCall(`${API}/work-orders/${order.id}`, 'PUT', {
        ...order,
        status,
      });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    } catch {
      setError("La mise à jour de l'ordre de travail a échoué.");
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
    <div className="work-orders">
      {error && <div className="work-orders-error">{error}</div>}

      {loading ? (
        <div className="work-orders-empty">Chargement…</div>
      ) : orders.length === 0 ? (
        <div className="work-orders-empty">Aucun ordre de travail lié.</div>
      ) : (
        <ul className="work-orders-list">
          {orders.map((order) => (
            <li key={order.id} className="work-orders-item">
              <div className="work-orders-item-main">
                <strong>{order.title}</strong>
                {order.assignee && (
                  <span className="work-orders-assignee">{order.assignee}</span>
                )}
              </div>
              {order.description && (
                <p className="work-orders-description">{order.description}</p>
              )}
              <div className="work-orders-item-meta">
                <select
                  value={order.status}
                  onChange={(ev) => handleStatusChange(order, ev.target.value)}
                >
                  {Object.entries(STATUS_LABELS).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
                {order.dueDate && (
                  <span className="work-orders-due">
                    Échéance : {order.dueDate}
                  </span>
                )}
                <button
                  type="button"
                  className="work-orders-delete"
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
        <form className="work-orders-form" onSubmit={handleCreate}>
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
          <div className="work-orders-form-row">
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
          <div className="work-orders-form-actions">
            <button type="button" onClick={() => setShowForm(false)}>
              Annuler
            </button>
            <button type="submit">Ajouter</button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          className="work-orders-add"
          onClick={() => setShowForm(true)}
        >
          + Nouvel ordre de travail
        </button>
      )}
    </div>
  );
}

export default WorkOrders;
