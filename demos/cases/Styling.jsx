import { useState } from 'react';
import { Kanban, Editor } from '../../src/index.js';
import { getStyledData } from '../data.js';
import './Styling.css';

const { columns, cards } = getStyledData();

// dynamic per-card class: tint cards by priority and flag completed ones
const cardCss = (card) => {
  const priority = card.priority === 3 ? 'card-high' : '';
  const done = (card.progress ?? 0) >= 1 ? 'card-complete' : '';
  return `${priority} ${done}`.trim();
};

// dynamic per-column class: highlight columns that hit their cardLimit
const columnCss = (cards, column) => {
  if (
    typeof column.cardLimit === 'number' &&
    cards.length >= column.cardLimit
  ) {
    return 'col-full';
  }
  return '';
};

function Styling() {
  const [api, setApi] = useState(null);

  return (
    <div className="styling-demo">
      <Kanban
        init={(obj) => setApi(obj)}
        cards={cards}
        columns={columns}
        columnCss={columnCss}
        cardCss={cardCss}
      />
      {api && <Editor api={api} />}
    </div>
  );
}

export default Styling;
