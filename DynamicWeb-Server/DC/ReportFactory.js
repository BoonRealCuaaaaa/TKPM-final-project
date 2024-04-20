const { AdsReportDC } = require("./AdsReportDC");
const { BoardDC } = require("./BoardDC");
const { BoardReportDC } = require("./BoardReportDC");
const { LocationReportDC } = require("./LocationReportDC");

class ReportFactory {
  static instance = null;
  constructor() {}

  static getInstance() {
    if (this.instance == null) {
      this.instance = new ReportFactory();
    }

    return this.instance;
  }

  getReport(reportType, ...data) {
    switch (reportType) {
      case "LOCATION":
        return new LocationReportDC(...data);
      case "BOARD":
        return new BoardReportDC(...data);
      case "ADSPLACEMENT":
        return new AdsReportDC(...data);
    }

    return null;
  }
}

exports.ReportFactory = ReportFactory;
