const { ReportDC } = require("./ReportDC");

class AdsReportDC extends ReportDC {
  subId;
  adsPlacement;
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
    adsPlacement,
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

    Object.assign(this, { subId, adsPlacement });
  }
}

exports.AdsReportDC = AdsReportDC;
