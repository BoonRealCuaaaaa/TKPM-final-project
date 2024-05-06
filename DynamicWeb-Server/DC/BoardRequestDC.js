class BoardRequestDC {
    constructor(id, size, quantity, boardType, board, reason, requestStatus, account, createdAt) {
      Object.assign(this, {
        id,
        size,
        quantity,
        boardType,
        board,
        reason,
        requestStatus,
        account,
        createdAt
      });
    }
  }
  
  exports.BoardRequestDC = BoardRequestDC;
  