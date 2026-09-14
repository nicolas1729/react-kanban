import { useEffect, useState } from 'react';
import { API } from './api.js';
import './WorkOrders.css';

const STATUS_LABELS = {
  BACKLOG: 'À faire',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminé',
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
  const [showLinker, setShowLinker] = useState(false);
  const [query, setQuery] = useState('');
  const [allOrders, setAllOrders] = useState(null);
  const [linkingId, setLinkingId] = useState(null);

  useEffect(() => {
    if (typeof cardId !== 'number') return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${API}/work-orders?kanbanCardId=${cardId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
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
  }, [cardId]);

  async function openLinker() {
    setShowLinker(true);
    setQuery('');
    if (allOrders != null) return;
    try {
      const data = await apiCall(`${API}/work-orders`, 'GET');
      setAllOrders(Array.isArray(data) ? data : []);
    } catch {
      setError('Impossible de charger les ordres de travail disponibles.');
      setAllOrders([]);
    }
  }

  async function handleLink(order) {
    setLinkingId(order.id);
    try {
      const updated = await apiCall(
        `${API}/work-orders/${order.id}/link`,
        'PATCH',
        { kanbanCardId: cardId },
      );
      setOrders((prev) => [
        ...prev.filter((o) => o.id !== updated.id),
        updated,
      ]);
      setAllOrders((prev) =>
        prev ? prev.map((o) => (o.id === updated.id ? updated : o)) : prev,
      );
      setShowLinker(false);
    } catch {
      setError("La liaison de l'ordre de travail a échoué.");
    } finally {
      setLinkingId(null);
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

  const searchResults = (allOrders ?? [])
    .filter((o) => o.kanbanCardId !== cardId)
    .filter((o) => o.title.toLowerCase().includes(query.trim().toLowerCase()));

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

      {showLinker ? (
        <div className="work-orders-linker">
          <input
            type="text"
            placeholder="Rechercher un ordre de travail par titre…"
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            autoFocus
          />
          <ul className="work-orders-linker-results">
            {allOrders == null ? (
              <li className="work-orders-empty">Chargement…</li>
            ) : searchResults.length === 0 ? (
              <li className="work-orders-empty">Aucun résultat.</li>
            ) : (
              searchResults.map((order) => (
                <li key={order.id} className="work-orders-linker-result">
                  <span>{order.title}</span>
                  <button
                    type="button"
                    disabled={linkingId === order.id}
                    onClick={() => handleLink(order)}
                  >
                    {linkingId === order.id ? 'Liaison…' : 'Lier'}
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className="work-orders-form-actions">
            <button type="button" onClick={() => setShowLinker(false)}>
              Fermer
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="work-orders-add" onClick={openLinker}>
          Lier à un ordre de travail
        </button>
      )}
    </div>
  );
}

export default WorkOrders;
