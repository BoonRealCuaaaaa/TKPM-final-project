class PermitRequestDC {
  id;
  content;
  image;
  start;
  end;
  status;
  board;
  company;
  account;
  createdAt;
  constructor(id, content, image, start, end, status, board, company, account, createdAt) {
    Object.assign(this, {
      id,
      content,
      image,
      start,
      end,
      status,
      board,
      company,
      account,
      createdAt
    });
  }
}

exports.PermitRequestDC=PermitRequestDC
