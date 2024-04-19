class BoardDC {
  id;
  size;
  quantity;
  boardType;
  adsPlacement;
  constructor(id, size, quantity, boardType, adsPlacement) {
    Object.assign(this, { id, size, quantity, boardType, adsPlacement });
  }
}

exports.BoardDC=BoardDC
