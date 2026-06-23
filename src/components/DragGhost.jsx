import { useContext } from 'react';
import CardWrapper from './CardWrapper.jsx';
import { DndContext, KanbanApiContext } from '../context.js';
import './DragGhost.css';

function DragGhost(props) {
  const { root, cardContent, cardShape } = props;

  const dnd = useContext(DndContext);
  const store = useContext(KanbanApiContext);

  // DndState is a mutable instance updated in place; it re-renders this
  // component via _notify(). Compute derived values inline so they reflect
  // the latest mutations — useMemo keyed on the stable `dnd` reference would
  // never recompute and freeze the ghost at its initial position.
  const draggedCard =
    dnd?.active && dnd.cardId != null
      ? (store.getState().cards.getById(dnd.cardId) ?? null)
      : null;

  let position = { x: 0, y: 0 };
  if (dnd) {
    let x = dnd.pointer.x - dnd.offset.x;
    let y = dnd.pointer.y - dnd.offset.y;
    if (root && dnd.active) {
      const rect = root.getBoundingClientRect();
      x = Math.max(rect.left, Math.min(x, rect.right - dnd.width));
      y = Math.max(rect.top, Math.min(y, rect.bottom - dnd.height));
    }
    position = { x, y };
  }

  if (!dnd?.active || !draggedCard) return null;

  return (
    <div
      className="wx-ghost wx-aabpM8ZK"
      style={{
        width: `${dnd.width}px`,
        height: `${dnd.height}px`,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <CardWrapper
        card={draggedCard}
        cardContent={cardContent}
        cardShape={cardShape}
      />
    </div>
  );
}

export default DragGhost;
