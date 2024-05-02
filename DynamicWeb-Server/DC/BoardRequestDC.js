class BoardRequestDC {
    constructor(id, size, quantity, boardType, board, reason, requestStatus, account) {
      Object.assign(this, {
        id,
        size,
        quantity,
        boardType,
        board,
        reason,
        requestStatus,
        account
      });
    }
  }
  
  exports.BoardRequestDC = BoardRequestDC;
  