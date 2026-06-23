import { getData } from '../data.js';
import { Kanban } from '../../src/index.js';
import CardPopup from '../custom/CardPopup.jsx';

const { columns, cards } = getData();

function CardPopupDemo() {
  return <Kanban cards={cards} columns={columns} cardPopup={CardPopup} />;
}

export default CardPopupDemo;
