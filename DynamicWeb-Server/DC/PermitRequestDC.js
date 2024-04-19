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
  constructor(id, content, image, start, end, status, board, company, account) {
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
    });
  }
}

exports.PermitRequestDC=PermitRequestDC
