import { useEffect, useState } from 'react';
import {
  Kanban,
  Editor,
  RestDataProvider,
  getEditorItems,
  registerEditorItem,
} from '../../src/index.js';
import WorkOrdersPanel from '../custom/WorkOrders.jsx';

registerEditorItem('work-orders', WorkOrdersPanel);

const API = 'http://localhost:8080/api';
const provider = new RestDataProvider(API);

function getDefaultEditorItem(key) {
  return getEditorItems().find((item) => item.key === key);
}

const priorityItem = getDefaultEditorItem('priority');
const progressItem = getDefaultEditorItem('progress');

const items = [
  {
    comp: 'text',
    key: 'label',
    label: 'Titre',
    column: 'left',
    required: true,
  },
  {
    comp: 'textarea',
    key: 'description',
    label: 'Description',
    column: 'left',
  },
  {
    key: 'id',
    comp: 'work-orders',
    label: 'Ordres de travail',
    column: 'left',
  },
  { ...priorityItem, column: 'right' },
  { ...progressItem, column: 'right' },
];

function WorkOrdersDemo() {
  const [api, setApi] = useState(null);
  const [cards, setCards] = useState([]);
  const [columns, setColumns] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      provider.getData(),
      fetch(`${API}/columns`).then((res) => res.json()),
    ])
      .then(([cardsData, columnsData]) => {
        setCards(cardsData);
        setColumns(columnsData);
      })
      .finally(() => setReady(true));
  }, []);

  function init(obj) {
    setApi(obj);
    obj.setNext(provider);
  }

  if (!ready) return null;

  return (
    <>
      <Kanban init={init} cards={cards} columns={columns} />
      {api && <Editor api={api} items={items} layout="columns" />}
    </>
  );
}

export default WorkOrdersDemo;
