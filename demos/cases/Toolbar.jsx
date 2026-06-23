import { useState } from 'react';
import { getData, getStyledData } from '../data.js';
import { Kanban, Toolbar, Editor } from '../../src/index.js';
import { Layout } from '@svar-ui/react-layout';

const { cards } = getStyledData();
const { columns } = getData();

function ToolbarDemo() {
  const [api, setApi] = useState(null);

  return (
    <Layout>
      <Toolbar api={api} sort={true} />
      <Kanban
        init={(obj) => setApi(obj)}
        cards={cards}
        columns={columns}
        history={true}
      />
      {api && <Editor api={api} />}
    </Layout>
  );
}

export default ToolbarDemo;
