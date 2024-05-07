class PermitRequestDC {
    id;
    size;
    quantity;
    reason;
    requestStatus;
    boardType;
    board;
    account;
    constructor(id, size, quantity, reason, requestStatus, boardType, board, account) {
      Object.assign(this, {
        id,
        size,
        quantity,
        reason,
        requestStatus,
        boardType,
        board,
        account,
      });
    }
  }
  
  exports.PermitRequestDC=PermitRequestDC
  