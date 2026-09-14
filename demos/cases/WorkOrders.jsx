import { useEffect, useMemo, useState } from 'react';
import {
  Kanban,
  Editor,
  RestDataProvider,
  getEditorItems,
  registerEditorItem,
} from '../../src/index.js';
import WorkOrdersPanel from '../custom/WorkOrders.jsx';
import TicketPanel from '../custom/Ticket.jsx';
import { API } from '../custom/api.js';

registerEditorItem('work-orders', WorkOrdersPanel);
registerEditorItem('ticket', TicketPanel);

const provider = new RestDataProvider(API);

function getDefaultEditorItem(key) {
  return getEditorItems().find((item) => item.key === key);
}

const priorityItem = getDefaultEditorItem('priority');
const progressItem = getDefaultEditorItem('progress');

function normalizeCard(card) {
  return { ...card, description: card.description ?? '' };
}

function buildItems(selectedCardId) {
  return [
    {
      key: 'ticketRef',
      comp: 'ticket',
      label: 'Ticket',
      cardId: selectedCardId,
    },
    {
      comp: 'text',
      key: 'label',
      label: 'Titre',
      required: true,
    },
    {
      comp: 'textarea',
      key: 'description',
      label: 'Description',
    },
    {
      key: 'id',
      comp: 'work-orders',
      label: 'Ticket',
    },
    priorityItem,
    progressItem,
  ];
}

function WorkOrdersDemo() {
  const [api, setApi] = useState(null);
  const [cards, setCards] = useState([]);
  const [columns, setColumns] = useState([]);
  const [ready, setReady] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);

  useEffect(() => {
    Promise.all([
      provider.getData(),
      fetch(`${API}/columns`).then((res) => res.json()),
    ])
      .then(([cardsData, columnsData]) => {
        setCards(cardsData.map(normalizeCard));
        setColumns(columnsData);
      })
      .finally(() => setReady(true));
  }, []);

  function init(obj) {
    setApi(obj);
    obj.setNext(provider);
    obj.intercept('add-card', (ev) => {
      if (!ev.card.label) ev.card.label = 'Nouvelle carte';
      if (ev.card.description == null) ev.card.description = '';
    });
    const { editorData } = obj.getReactiveState();
    setSelectedCardId(editorData.get?.()?.id ?? null);
    obj.getReactiveState().editorData.subscribe((data) => {
      setSelectedCardId(data?.id ?? null);
    });
  }

  const items = useMemo(() => buildItems(selectedCardId), [selectedCardId]);

  if (!ready) return null;

  return (
    <>
      <Kanban init={init} cards={cards} columns={columns} />
      {api && <Editor api={api} items={items} />}
    </>
  );
}

export default WorkOrdersDemo;
