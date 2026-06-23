export class DndState {
  constructor() {
    this.active = false;
    this.cardId = null;
    this.sourceColumn = null;
    this.width = 0;
    this.height = 0;
    this.pointer = { x: 0, y: 0 };
    this.offset = { x: 0, y: 0 };
    this.target = null;
    this._notify = null;
  }

  reset() {
    this.active = false;
    this.cardId = null;
    this.sourceColumn = null;
    this.target = null;
    this._notify?.();
  }
}
