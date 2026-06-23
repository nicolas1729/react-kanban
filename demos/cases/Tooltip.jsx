import { getData } from '../data.js';
import { Kanban } from '../../src/index.js';
import CardTooltip from '../custom/CardTooltip.jsx';

const { columns, cards } = getData();

function Tooltip() {
  return <Kanban cards={cards} columns={columns} tooltip={CardTooltip} />;
}

export default Tooltip;
