import { useState } from 'react';
import { card, getData } from '../data.js';
import { ExcelImport } from '@svar-ui/react-excel-import';
import { Kanban, Editor } from '../../src/index.js';
import { Layout } from '@svar-ui/react-layout';
import { Button } from '@svar-ui/react-core';
import { downloadBlob, writeWorkbook } from 'xlsx-writer-lite';

import './Excel.css';

const { columns, cards } = getData();

function Excel() {
  const [api, setApi] = useState(null);
  const [importVisible, setImportVisible] = useState(false);

  async function toExcel() {
    const columns = [
      { label: 'Title', id: 'label', width: 30 },
      { label: 'Deadline', id: 'deadline' },
      { label: 'Description', id: 'description', width: 50 },
    ];

    const blob = await writeWorkbook(api.getCards(), columns, { header: true });
    downloadBlob(blob, 'cards.xlsx');
  }

  function fromExcelStart() {
    setImportVisible(true);
  }

  function fromExcelEnd(cards) {
    cards.forEach((v) => (v.column = v.column || 'todo'));
    api.exec('provide-data', { cards });
    setImportVisible(false);
  }

  return (
    <>
      <Layout>
        <div className="toolbar">
          <Button onClick={toExcel}>Export to Excel</Button>
          <Button onClick={fromExcelStart}>Import from Excel</Button>
        </div>
        <Kanban
          init={(obj) => setApi(obj)}
          cards={cards}
          columns={columns}
          card={card}
        />
        {api && <Editor api={api} />}
      </Layout>

      {importVisible && (
        <ExcelImport
          fields={[
            { label: 'Title', id: 'label' },
            { label: 'Deadline', id: 'deadline' },
            { label: 'Description', id: 'description' },
          ]}
          generateIds={true}
          onImport={fromExcelEnd}
          onClose={() => setImportVisible(false)}
        />
      )}
    </>
  );
}

export default Excel;
