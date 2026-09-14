import { useEffect, useState } from 'react';
import { API } from './api.js';
import './Ticket.css';

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleString('fr-FR');
}

function Ticket({ cardId }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof cardId !== 'number') return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${API}/cards`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (cancelled) return;
        const found = Array.isArray(data)
          ? data.find((c) => c.id === cardId)
          : null;
        setCard(found ?? null);
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de charger le ticket.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cardId]);

  if (loading) return <div className="ticket-ref-empty">Chargement…</div>;
  if (error) return <div className="ticket-ref-error">{error}</div>;
  if (!card) return <div className="ticket-ref-empty">Ticket introuvable.</div>;

  return (
    <div className="ticket-ref">
      <div className="ticket-ref-id">Ticket #{card.id}</div>
      <div className="ticket-ref-meta">Colonne : {card.column}</div>
      {card.createdAt && (
        <div className="ticket-ref-meta">
          Créé le {formatDate(card.createdAt)}
        </div>
      )}
      {card.updatedAt && (
        <div className="ticket-ref-meta">
          Mis à jour le {formatDate(card.updatedAt)}
        </div>
      )}
    </div>
  );
}

export default Ticket;
