class ReportDC {
  id;
  submissionTime;
  name;
  email;
  phone;
  reportContent;
  image;
  status;
  method;
  reportType;
  account;
  createdAt;
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
    createdAt
  ) {
    Object.assign(this, {
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
      createdAt,
    });
  }
}

exports.ReportDC = ReportDC;
