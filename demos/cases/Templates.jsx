import { useState, useMemo } from 'react';
import { Kanban, Editor } from '../../src/index.js';
import CustomCard from '../custom/CustomCard.jsx';
import { Layout } from '@svar-ui/react-layout';
import { Segmented } from '@svar-ui/react-core';
import { getData, users } from '../data.js';

const { columns, cards } = getData();

const zoomLevels = [
  { id: 1, label: 'XS' },
  { id: 2, label: 'S' },
  { id: 3, label: 'M' },
  { id: 4, label: 'L' },
  { id: 5, label: 'XL' },
  { id: 6, label: 'Custom' },
];

function Templates() {
  const [api, setApi] = useState(null);
  const [zoom, setZoom] = useState(3);
  const customCards = useMemo(() => zoom === 6, [zoom]);

  const card = useMemo(() => {
    switch (zoom) {
      case 1:
        return {};
      case 2:
        return {
          priority: true,
          users,
        };
      case 3:
        return {
          priority: true,
          users,
          progress: true,
          deadline: true,
        };
      case 4:
        return {
          priority: true,
          users,
          progress: { showLabel: true },
          tags: true,
          attachments: true,
          comments: true,
          deadline: true,
        };
      case 5:
        return {
          priority: true,
          progress: { showLabel: true },
          description: true,
          tasks: true,
          users,
          tags: true,
          attachments: true,
          comments: true,
          deadline: true,
        };
    }
  }, [zoom]);

  return (
    <Layout>
      <Segmented
        options={zoomLevels}
        value={zoom}
        onChange={({ value }) => setZoom(value)}
      />
      <Kanban
        init={(obj) => setApi(obj)}
        cards={cards}
        columns={columns}
        card={customCards ? undefined : card}
        cardContent={customCards ? CustomCard : undefined}
      />
      {api && <Editor api={api} />}
    </Layout>
  );
}

export default Templates;
