const { ReportDC } = require("./ReportDC");

class BoardReportDC extends ReportDC {
  subId;
  board;
  constructor(
    id,
    submissionTime,
    name,
    email,
    phone,
    reportContent,
    image,
    status,
    method,
    reportType,
    account,
    subId,
    board,
    createdAt
  ) {
    super(
      id,
      submissionTime,
      name,
      email,
      phone,
      reportContent,
      image,
      status,
      method,
      reportType,
      account,
      createdAt
    );
    
    Object.assign(this, { subId, board });
  }
}

exports.BoardReportDC = BoardReportDC;
