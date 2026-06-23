import { useState, useCallback, useRef } from 'react';
import { getID, locate } from '@svar-ui/lib-dom';

export function useCardOverlay(getCard, popupAt = 'right-start') {
  const [tooltipState, setTooltipState] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cardPopupState, setCardPopupState] = useState(null);
  const tooltipTargetRef = useRef(null);

  const handleTooltipMove = useCallback(
    (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (cardPopupState || !e.target) return;
      const el = locate(e.target) ?? null;
      if (el === tooltipTargetRef.current) return;
      tooltipTargetRef.current = el;
      if (!el) {
        setTooltipState(null);
        return;
      }
      const card = getCard(getID(el));
      setTooltipState(card ? { card } : null);
    },
    [getCard, cardPopupState],
  );

  const handleTooltipLeave = useCallback(() => {
    tooltipTargetRef.current = null;
    setTooltipState(null);
  }, []);

  const handleCardPopup = useCallback(
    (info) => {
      setTooltipState(null);
      tooltipTargetRef.current = null;
      if (!info) {
        setCardPopupState(null);
        return;
      }
      const card = getCard(info.cardId);
      if (card) {
        setCardPopupState({
          card,
          element: info.element,
          at: popupAt,
        });
      }
    },
    [getCard, popupAt],
  );

  const hideCardPopup = useCallback(() => {
    setCardPopupState(null);
  }, []);

  return {
    tooltipState,
    mousePos,
    cardPopupState,
    handleTooltipMove,
    handleTooltipLeave,
    handleCardPopup,
    hideCardPopup,
  };
}
