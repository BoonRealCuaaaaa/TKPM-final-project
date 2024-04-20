const { ReportDC } = require("./ReportDC");

class LocationReportDC extends ReportDC {
  subId;
  address;
  long;
  lat;
  area;
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
    address,
    long,
    lat,
    area,
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

    Object.assign(this, { subId, address, long, lat, area });
  }
}

exports.LocationReportDC = LocationReportDC;
