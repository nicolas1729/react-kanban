import { useMemo } from 'react';
import { getPriorityOptions } from '../../src/index.js';
import { users } from '../data.js';
import { resolveLabel, resolveLabels } from './resolve.js';
import './CardTooltip.css';

function CardTooltip({ card }) {
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

  return (
    <div className="card-tooltip">
      <div className="tooltip-title">{card.label ?? `Card ${card.id}`}</div>
      {card.description && (
        <div className="tooltip-desc">{card.description}</div>
      )}
      <div className="tooltip-meta">
        {priorityLabel && <span className="tooltip-chip">{priorityLabel}</span>}
        {typeof card.progress === 'number' && (
          <span className="tooltip-chip">
            {Math.round(card.progress * 100)}%
          </span>
        )}
        {userLabelList.length > 0 && (
          <span className="tooltip-chip">
            &#128100; {userLabelList.join(', ')}
          </span>
        )}
      </div>
      <div className="tooltip-id">ID: {card.id}</div>
    </div>
  );
}

export default CardTooltip;
