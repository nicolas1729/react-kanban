import { useState, useMemo } from 'react';
import { Kanban } from '../../src/index.js';
import { Field, Select } from '@svar-ui/react-core';
import { Layout, Cell } from '@svar-ui/react-layout';
import { getGroupByData, users } from '../data.js';

import './GroupBy.css';

const {
  columns: groupColumns,
  cards: sourceCards,
  priorities,
} = getGroupByData();

const options = [
  { id: 'stage', label: 'By stage' },
  { id: 'priority', label: 'By priority' },
  { id: 'user', label: 'By person' },
];

const card = {
  priority: { data: priorities },
  progress: { showLabel: true },
  description: true,
  users,
  tags: true,
  attachments: true,
  comments: true,
};

const userAccessor = {
  get: (card) => card.user,
  set: (card, value) => ({
    ...card,
    user: value,
    users: [value],
  }),
};

function cloneCards(items) {
  return items.map((card) => ({
    ...card,
    tags: Array.isArray(card.tags) ? [...card.tags] : card.tags,
    users: Array.isArray(card.users) ? [...card.users] : card.users,
  }));
}

function GroupBy() {
  const [api, setApi] = useState(null);
  const [groupBy, setGroupBy] = useState('stage');
  const [cards, setCards] = useState(() => cloneCards(sourceCards));

  const columns = useMemo(() => groupColumns[groupBy], [groupBy]);
  const columnAccessor = useMemo(
    () => (groupBy === 'user' ? userAccessor : groupBy),
    [groupBy],
  );

  function changeGroup({ value }) {
    if (value !== 'stage' && value !== 'priority' && value !== 'user') return;

    setCards(cloneCards(api?.getCards() ?? cards));
    setGroupBy(value);
  }

  return (
    <Layout>
      <div className="group-toolbar">
        <Field label="Group cards" position="left">
          <Select value={groupBy} options={options} onChange={changeGroup} />
        </Field>
      </div>
      <Cell>
        <Kanban
          init={(obj) => setApi(obj)}
          cards={cards}
          columns={columns}
          columnAccessor={columnAccessor}
          card={card}
        />
      </Cell>
    </Layout>
  );
}

export default GroupBy;
