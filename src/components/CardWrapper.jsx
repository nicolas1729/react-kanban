import { useContext } from 'react';
import { context } from '@svar-ui/react-core';
import { setID } from '@svar-ui/lib-dom';
import Card from './Card.jsx';
import './CardWrapper.css';

const scope = 'wx-aaaPn59u';

function CardWrapper(props) {
  const { cardContent, card, cardShape, extraCss = '' } = props;
  const CardContent = cardContent;

  const _ = useContext(context.i18n).getGroup('kanban');

  return (
    <article
      className={`wx-card ${card.css ?? ''} ${extraCss} ${scope}`}
      data-id={card.id == null ? undefined : setID(card.id)}
      role="button"
      tabIndex="0"
      aria-label={card.label ?? `${_('Card')} ${card.id}`}
    >
      {CardContent ? (
        <CardContent card={card} cardShape={cardShape} />
      ) : (
        <Card card={card} cardShape={cardShape} />
      )}
    </article>
  );
}

export default CardWrapper;
