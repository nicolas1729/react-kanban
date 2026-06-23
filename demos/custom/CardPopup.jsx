import { useMemo } from 'react';
import { getPriorityOptions } from '../../src/index.js';
import { users } from '../data.js';
import { resolveLabel, resolveLabels } from './resolve.js';
import './CardPopup.css';

function CardPopup({ card, close }) {
  const priorityLabel = useMemo(
    () =>
      card.priority != null
        ? resolveLabel(card.priority, getPriorityOptions())
        : null,
    [card.priority],
  );
  const userLabelList = useMemo(
    () => resolveLabels(card.users, users.data),
    [card.users],
  );
  const tagLabelList = useMemo(() => resolveLabels(card.tags), [card.tags]);

  function handleAction(action) {
    alert(`Action: ${action} for "${card.label ?? card.id}"`);
    close();
  }

  return (
    <div className="card-popup">
      <div className="popup-header">
        <div className="popup-title">{card.label ?? `Card ${card.id}`}</div>
        <button
          type="button"
          className="popup-close"
          aria-label="Close"
          onClick={close}
        >
          &times;
        </button>
      </div>
      <div className="popup-body">
        {card.description && (
          <div className="popup-row">
            <span className="popup-label">Description</span>
            <span className="popup-value">{card.description}</span>
          </div>
        )}
        {priorityLabel && (
          <div className="popup-row">
            <span className="popup-label">Priority</span>
            <span className="popup-value">{priorityLabel}</span>
          </div>
        )}
        {typeof card.progress === 'number' && (
          <div className="popup-row">
            <span className="popup-label">Progress</span>
            <span className="popup-value">
              {Math.round(card.progress * 100)}%
            </span>
          </div>
        )}
        {userLabelList.length > 0 && (
          <div className="popup-row">
            <span className="popup-label">Users</span>
            <span className="popup-value">{userLabelList.join(', ')}</span>
          </div>
        )}
        {tagLabelList.length > 0 && (
          <div className="popup-row">
            <span className="popup-label">Tags</span>
            <span className="popup-value">{tagLabelList.join(', ')}</span>
          </div>
        )}
      </div>
      <div className="popup-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleAction('open')}
        >
          Open
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => handleAction('share')}
        >
          Share
        </button>
      </div>
    </div>
  );
}

export default CardPopup;
