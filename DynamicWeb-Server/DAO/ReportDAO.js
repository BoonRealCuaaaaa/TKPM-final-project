const { AdsReportDC } = require("../DC/AdsReportDC");
const { BoardReportDC } = require("../DC/BoardReportDC");
const { ReportTypeDC } = require("../DC/ReportTypeDC");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const {
  sequelize,
  AdsPlacement,
  Area,
  Account,
  LocationType,
  AdsType,
  Report,
  ReportType,
  PermitRequest,
  BoardType,
  Board,
  LocationReport,
  BoardReport,
  AdsReport,
} = require("../models");
const { ReportDC } = require("../DC/ReportDC");
const { LocationReportDC } = require("../DC/LocationReportDC");

class SaveReportStrategy {
  async save() { }
}

class SaveLocationReportStrategy extends SaveReportStrategy {
  async save(data) {
    const newReport = await Report.create({
      submission_time: new Date(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      reportContent: data.content,
      image: data.imageUrl,
      ReportTypeId: data.typeId,
      status: "Chưa xử lý",
    });

    await newReport.save();

    const newLocationReport = await LocationReport.create({
      address: data.address,
      long: data.long,
      lat: data.lat,
      AreaId: data.areaId,
      ReportId: newReport.id,
    });

    await newLocationReport.save();

    return {
      ...newReport.dataValues,
      address: newLocationReport.address,
      long: newLocationReport.long,
      lat: newLocationReport.lat,
    };
  }
}

class SaveBoardReportStrategy extends SaveReportStrategy {
  async save(data) {
    const newReport = await Report.create({
      submission_time: new Date(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      reportContent: data.content,
      image: data.imageUrl,
      ReportTypeId: data.typeId,
      status: "Chưa xử lý",
    });

    await newReport.save();

    const newBoardReport = await BoardReport.create({
      BoardId: data.board,
      ReportId: newReport.id,
    });

    await newBoardReport.save();

    let permitRequest = await PermitRequest.findOne({
      where: { BoardId: data.board },
    });

    permitRequest.status = "Bị báo cáo";
    permitRequest.save();

    const placement = await AdsPlacement.findOne({
      where: { id: data.location },
    });

    return {
      ...newReport.dataValues,
      boardId: newBoardReport.BoardId,
      adsPlacementId: placement.id,
      lng: placement.long,
      lat: placement.lat,
    };
  }
}

class SaveAdsReportStrategy extends SaveReportStrategy {
  async save(data) {
    const newReport = await Report.create({
      submission_time: new Date(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      reportContent: data.content,
      image: data.imageUrl,
      ReportTypeId: data.typeId,
      status: "Chưa xử lý",
    });

    await newReport.save();

    const newAdsReport = await AdsReport.create({
      AdsPlacementId: data.location,
      ReportId: newReport.id,
    });

    await newAdsReport.save();

    const placement = await AdsPlacement.findOne({
      where: { id: data.location },
    });

    console.log({
      ...newReport.dataValues,
      boardId: null,
      adsPlacementId: newAdsReport.AdsPlacementId,
      lng: placement.long,
      lat: placement.lat,
    });

    return {
      ...newReport.dataValues,
      boardId: null,
      adsPlacementId: newAdsReport.AdsPlacementId,
      lng: placement.long,
      lat: placement.lat,
    };
  }
}

class GetReportStrategy {
  async findReportById(id) {};
}

class GetAdsReportStrategy extends GetReportStrategy{
  async findReportById(id) {
    const adsReport = await AdsReport.findOne({
      include: [
        {
          model: AdsPlacement,
          required: true,
          include: [
            {
              model: Area,
              required: true,
            }
          ],
        },
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, required: true }, { model: Account}],
        },
      ],
      where: {
        reportId: id,
      },
    });
    return adsReport != null ? new AdsReportDC(
      adsReport.Report.id, adsReport.Report.submissionTime, adsReport.Report.name, adsReport.Report.email,
      adsReport.Report.phone, adsReport.Report.reportContent, adsReport.Report.image, adsReport.Report.status,
      adsReport.Report.method, adsReport.Report.ReportType, adsReport.Report.Account, adsReport.subId, adsReport.AdsPlacement, adsReport.Report.createdAt
    ) : null;
  }
}

class GetBoardReportStrategy extends GetReportStrategy {
  async findReportById(id) {
    const boardReport = await BoardReport.findOne({
      include: [
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, required: true }, { model: Account }],
        },
        {
          model: Board,
          required: true,
          include: [
            {
              model: AdsPlacement,
              required: true,
              include: [
                {
                  model: Area,
                  required: true,
                }
              ],
            },
          ],
        },
      ],
      where: {
        reportId: id,
      },
    });
    return boardReport != null ? new BoardReportDC(
      boardReport.Report.id, boardReport.Report.submissionTime, boardReport.Report.name, boardReport.Report.email,
      boardReport.Report.phone, boardReport.Report.reportContent, boardReport.Report.image, boardReport.Report.status,
      boardReport.Report.method, boardReport.Report.ReportType, boardReport.Report.Account, boardReport.subId, boardReport.Board, boardReport.Report.createdAt
    ) : null;
  }
}

class GetLocationReportStrategy extends GetReportStrategy {
  async findReportById(id) {
    const locationReport = await LocationReport.findOne({
      include: [
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, required: true }, { model: Account}],
        },
        {
          model: Area,
          required: true,
        }
      ],
      where: {
        reportId: id,
      },
    });
    return locationReport != null ? new LocationReportDC(
      locationReport.Report.id, locationReport.Report.submissionTime, locationReport.Report.name, locationReport.Report.email,
      locationReport.Report.phone, locationReport.Report.reportContent, locationReport.Report.image, locationReport.Report.status,
      locationReport.Report.method, locationReport.Report.ReportType, locationReport.Report.Account, locationReport.subId, locationReport.address,
      locationReport.long, locationReport.lat, locationReport.Area, locationReport.Report.createdAt
    ) : null;
  }
}



class ReportDAO {
  static instance = null;
  saveStrategy = null;
  getStrategy = null;
  constructor() {}

  static getInstance() {
    if (this.instance == null) {
      this.instance = new ReportDAO();
    }

    return this.instance;
  }

  async findReportTypeByType(type) {
    const dbquery = await ReportType.findOne({ where: { type: type } });

    if (dbquery != null) {
      return new ReportTypeDC(dbquery.id, dbquery.type);
    }

    return null;
  }

  async saveReport({ ...data }) {
    return await this.saveStrategy.save(data);
  }

  async findOneReportById(id) {
    return await this.getStrategy.findReportById(id);
  }

  setGetStrategy(getStrategy) {
    this.getStrategy = getStrategy;
  }

  async findReportByBoardId(boardId) {
    const reports = await BoardReport.findAll({
      where: { BoardId: boardId },
      include: [
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, required: true }],
        },
      ],
    });

    const results = [];
    for (let i = 0; i < reports.length; i++) {
      const report = reports[i];
      results.push(
        new BoardReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.id,
          null,
          report.createdAt
        )
      );
    }

    return results;
  }

  async findReportByAdsPlacementId(adsPlacementId) {
    const reports = await AdsReport.findAll({
      where: {
        AdsPlacementId: adsPlacementId,
      },
      include: [
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, required: true }],
        },
      ],
    });

    const results = [];

    console.log(reports[0]);
    for (let i = 0; i < reports.length; i++) {
      const report = reports[i];

      results.push(
        new AdsReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.id,
          null,
          report.Report.createdAt
        )
      );
    }

    return results;
  }

  async findReportsByListId(list) {
    const reportsInBoardReport = await BoardReport.findAll({
      where: { ReportId: { [Sequelize.Op.in]: list } },
      include: [
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, required: true }],
        },
      ],
    });

    const reportsInAdsReport = await AdsReport.findAll({
      where: { ReportId: { [Sequelize.Op.in]: list } },
      include: [
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, required: true }],
        },
      ],
    });

    const reportsInLocationReport = await LocationReport.findAll({
      where: { ReportId: { [Sequelize.Op.in]: list } },
      include: [
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, required: true }],
        },
      ],
    });

    const combined = reportsInBoardReport
      .concat(reportsInAdsReport)
      .concat(reportsInLocationReport);

    const results = [];
    for (let i = 0; i < combined.length; i++) {
      const report = combined[i];

      results.push(
        new ReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.Report.createdAt
        )
      );
    }

    return results;
  }

  async findSelfReportByLngLat(lng, lat, reportIds) {
    const results = [];

    const reportsInBoardReport = await BoardReport.findAll({
      include: [
        {
          model: Report,
          required: true,
          where: { id: { [Sequelize.Op.in]: reportIds } },
          include: [{ model: ReportType, required: true }],
        },
        {
          model: Board,
          required: true,
          include: [
            {
              model: AdsPlacement,
              required: true,
              where: {
                long: lng,
                lat: lat,
              },
            },
          ],
        },
      ],
    });

    const reportsInAdsReport = await AdsReport.findAll({
      include: [
        {
          model: AdsPlacement,
          required: true,
          where: {
            long: lng,
            lat: lat,
          },
        },
        {
          model: Report,
          where: { id: { [Sequelize.Op.in]: reportIds } },
          required: true,
          include: [{ model: ReportType, required: true }],
        },
      ],
    });

    const reportsInLocationReport = await LocationReport.findAll({
      where: {
        long: lng,
        lat: lat,
      },
      include: [
        {
          model: Report,
          where: { id: { [Sequelize.Op.in]: reportIds } },
          required: true,
          include: [{ model: ReportType, required: true }],
        },
      ],
    });

    // console.log(JSON.stringify(reportsInLocationReport))
    for (let i = 0; i < reportsInBoardReport.length; i++) {
      const report = reportsInBoardReport[i];
      results.push(
        new ReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.Report.createdAt
        )
      );
    }

    for (let i = 0; i < reportsInAdsReport.length; i++) {
      const report = reportsInAdsReport[i];
      results.push(
        new ReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.Report.createdAt
        )
      );
    }

    for (let i = 0; i < reportsInLocationReport.length; i++) {
      const report = reportsInLocationReport[i];
      results.push(
        new ReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.Report.createdAt
        )
      );
    }

    return results;
  }

  async findReportByLngLat(lng, lat) {
    const results = [];

    const reportsInBoardReport = await BoardReport.findAll({
      include: [
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, required: true }],
        },
        {
          model: Board,
          required: true,
          include: [
            {
              model: AdsPlacement,
              required: true,
              where: {
                long: lng,
                lat: lat,
              },
            },
          ],
        },
      ],
    });

    const reportsInAdsReport = await AdsReport.findAll({
      include: [
        {
          model: AdsPlacement,
          required: true,
          where: {
            long: lng,
            lat: lat,
          },
        },
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, required: true }],
        },
      ],
    });

    const reportsInLocationReport = await LocationReport.findAll({
      where: {
        long: lng,
        lat: lat,
      },
      include: [
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, required: true }],
        },
      ],
    });

    for (let i = 0; i < reportsInBoardReport.length; i++) {
      const report = reportsInBoardReport[i];
      results.push(
        new ReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.Report.createdAt
        )
      );
    }

    for (let i = 0; i < reportsInAdsReport.length; i++) {
      const report = reportsInAdsReport[i];
      results.push(
        new ReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.Report.createdAt
        )
      );
    }

    for (let i = 0; i < reportsInLocationReport.length; i++) {
      const report = reportsInLocationReport[i];
      results.push(
        new ReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.Report.createdAt
        )
      );
    }

    return results;
  }

  async getAllReportsByDistrictWardAndType(district, ward, type) {
    const results = [];

    let areaCondition = {};
    if (district.trim() !== "") {
      areaCondition.district = district;
      if (ward.trim() !== "") {
        areaCondition.ward = ward;
      }
    }

    const reportsInBoardReport = await BoardReport.findAll({
      include: [
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, required: true }],
        },
        {
          model: Board,
          required: true,
          include: [
            {
              model: AdsPlacement,
              required: true,
              include: [
                {
                  model: Area,
                  required: true,
                  where: areaCondition
                }
              ],
            },
          ],
        },
      ],
    });

    const reportsInAdsReport = await AdsReport.findAll({
      include: [
        {
          model: AdsPlacement,
          required: true,
          include: [
            {
              model: Area,
              required: true,
              where: areaCondition
            }
          ],
        },
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, required: true }],
        },
      ],
    });

    const reportsInLocationReport = await LocationReport.findAll({
      include: [
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, required: true }],
        },
        {
          model: Area,
          required: true,
          where: areaCondition
        }
      ],
    });

    if (type != null && (type === "BOARD" || type === "")) {
      for (let i = 0; i < reportsInBoardReport.length; i++) {
        const report = reportsInBoardReport[i];
        const newReport = new ReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.Report.createdAt
        );
        newReport.address = report.Board.AdsPlacement.address + ", " + report.Board.AdsPlacement.Area.ward + ", " + report.Board.AdsPlacement.Area.district;
        newReport.reportTarget = "BOARD";
        results.push(
          newReport
        );
      }
    }

    
    if (type != null && (type === "LOCATION" || type === "")) {
      for (let i = 0; i < reportsInLocationReport.length; i++) {
        const report = reportsInLocationReport[i];
        const newReport = new ReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.Report.createdAt
        )
        newReport.address = report.address + ", " + report.Area.ward + ", " + report.Area.district;
        newReport.reportTarget = "LOCATION";
        results.push(newReport);
      }
    }

    if (type != null && (type === "ADSPLACEMENT" || type === "")) {
      for (let i = 0; i < reportsInAdsReport.length; i++) {
        const report = reportsInAdsReport[i];
        const newReport = new ReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.Report.createdAt
        )
        newReport.address = report.AdsPlacement.address + ", " + report.AdsPlacement.Area.ward + ", " + report.AdsPlacement.Area.district;
        newReport.reportTarget = "ADSPLACEMENT";
        results.push(newReport);
      }
    }
    return results;
  }

  async getAllReportsWithStatusInTimeFrame(status, startTime, endTime) {
    const results = [];
    const where = {
      createdAt: {
        [Op.lte]: endTime,
        [Op.gte]: startTime,
      },
      status,
    };
    const option = {
      include: [
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, required: true }],
          where
        }
      ],
    }

    const reportsInBoardReport = await BoardReport.findAll(option);
    const reportsInAdsReport = await AdsReport.findAll(option);
    const reportsInLocationReport = await LocationReport.findAll(option);

    for (let i = 0; i < reportsInBoardReport.length; i++) {
      const report = reportsInBoardReport[i];
      results.push(
        new ReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.Report.createdAt
        )
      );
    }

    for (let i = 0; i < reportsInAdsReport.length; i++) {
      const report = reportsInAdsReport[i];
      results.push(
        new ReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.Report.createdAt
        )
      );
    }

    for (let i = 0; i < reportsInLocationReport.length; i++) {
      const report = reportsInLocationReport[i];
      results.push(
        new ReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.Report.createdAt
        )
      );
    }

    return results;
  }

  async getAlldReportWithStatus(status) {
    const results = [];
    const where = {
      status,
    };
    const option = {
      include: [
        {
          model: Report,
          required: true,
          include: [{ model: ReportType, required: true }],
          where
        }
      ],
    }

    const reportsInBoardReport = await BoardReport.findAll(option);
    const reportsInAdsReport = await AdsReport.findAll(option);
    const reportsInLocationReport = await LocationReport.findAll(option);

    for (let i = 0; i < reportsInBoardReport.length; i++) {
      const report = reportsInBoardReport[i];
      results.push(
        new ReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.Report.createdAt
        )
      );
    }

    for (let i = 0; i < reportsInAdsReport.length; i++) {
      const report = reportsInAdsReport[i];
      results.push(
        new ReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.Report.createdAt
        )
      );
    }

    for (let i = 0; i < reportsInLocationReport.length; i++) {
      const report = reportsInLocationReport[i];
      results.push(
        new ReportDC(
          report.Report.id,
          report.Report.submission_time,
          report.Report.name,
          report.Report.email,
          report.Report.phone,
          report.Report.reportContent,
          report.Report.image,
          report.Report.status,
          report.Report.method,
          new ReportTypeDC(
            report.Report.ReportType.id,
            report.Report.ReportType.type
          ),
          null,
          report.Report.createdAt
        )
      );
    }

    return results;
  }

  async countReportsWithSpecificReportType(reportTypeId) {
    const reportsCount = await Report.count({
      where: {
        ReportTypeId: reportTypeId,
      },
    });
    return reportsCount;
  }

  async deleteReportById(id) {
    await BoardReport.destroy({
      where: {
        reportId: id,
      },
    })

    await LocationReport.destroy({
      where: {
        reportId: id,
      },
    })

    await AdsReport.destroy({
      where: {
        reportId: id,
      },
    })

    await AdsReport.destroy({
      where: {
        id,
      },
    })
  } 

  async deleteReportByReportTypeId(reportTypeId) {
    const reports = await Report.findAll({
      where: {
        ReportTypeId: reportTypeId,
      },
    });
    reports.map(async (report) => {
      await this.deleteReportById(report.id);
    })
  }

  setSaveStrategy(strategy) {
    this.saveStrategy = strategy;
  }

  static async findAllByAreaId(areaId) {
    const results = [];

    const boardReports = await BoardReport.findAll({
      include: [
        {
          model: Board,
          required: true,
          include: [
            {
              model: AdsPlacement,
              required: true,
              where: { areaId: areaId }
            }
          ]
        },
        {
          model: Report,
          required: true,
          include: [
            { model: ReportType }
          ]
        }
      ],
    });

    boardReports.forEach((row) => {
      results.push(
        new ReportDC(
          row.Report.id,
          row.Report.submissionTime,
          row.Report.name,
          row.Report.email,
          row.Report.phone,
          row.Report.reportContent,
          row.Report.image,
          row.Report.status,
          row.Report.method,
          new ReportTypeDC(
            row.Report.ReportType.id,
            row.Report.ReportType.type
          ),
          null,
          row.Report.createdAt,
        )
      );
    });

    const adsPlacementReports = await AdsReport.findAll({
      include: [
        {
          model: AdsPlacement,
          required: true,
          where: { areaId: areaId }
        },
        {
          model: Report,
          required: true,
          include: [
            { model: ReportType }
          ]
        }
      ],
    });

    adsPlacementReports.forEach((row) => {
      results.push(
        new ReportDC(
          row.Report.id,
          row.Report.submissionTime,
          row.Report.name,
          row.Report.email,
          row.Report.phone,
          row.Report.reportContent,
          row.Report.image,
          row.Report.status,
          row.Report.method,
          new ReportTypeDC(
            row.Report.ReportType.id,
            row.Report.ReportType.type
          ),
          null,
          row.Report.createdAt,
        )
      );
    });

    const locationReports = await LocationReport.findAll({
      include: [
        {
          model: Report,
          required: true,
          include: [
            { model: ReportType }
          ]
        }
      ],
      where: { areaId: areaId }
    });

    locationReports.forEach((row) => {
      results.push(
        new ReportDC(
          row.Report.id,
          row.Report.submissionTime,
          row.Report.name,
          row.Report.email,
          row.Report.phone,
          row.Report.reportContent,
          row.Report.image,
          row.Report.status,
          row.Report.method,
          new ReportTypeDC(
            row.Report.ReportType.id,
            row.Report.ReportType.type
          ),
          null,
          row.Report.createdAt,
        )
      );
    });

    return results;
  }

  static async findReportById(id) {
    const report = await Report.findOne({
      include: [{model: ReportType}],
      where: { id: id } 
    });

    let result = {
      report: null,
      subReport: null,
      class: null,
    }

    if (report != null) {
      result.report = new ReportDC(
        report.id,
        report.submissionTime,
        report.name,
        report.email,
        report.phone,
        report.reportContent,
        report.image,
        report.status,
        report.method,
        new ReportTypeDC(
          report.ReportType.id,
          report.ReportType.type
        ),
        null,
        report.createdAt,
      );

      const boardReport = await BoardReport.findOne({
        include: [
          {
            model: Board,
            required: true,
            include: [
              {model: AdsPlacement}
            ]
          },
        ],
        where: {reportId: id}
      });

      if (boardReport != null) {
        result.class = "Board";

        return result;
      }

      const adsPlacementReport = await AdsReport.findOne({
        include: [
          {model: AdsPlacement},
        ],
        where: {reportId: id}
      });

      if (adsPlacementReport != null) {
        result.class = "AdsPlacement";

        return result;
      }

      const locationReport = await LocationReport.findOne({
        where: { reportId: id }
      });

      if (locationReport != null) {
        result.class = "Location";

        return result;
      }
    }
  }

  static async updateReport(id, method, status, accountId) {
    try {
        await Report.update(
            {
                method: method,
                status: status,
                AccountId: accountId,
            },
            { where: { id: id } }
        );
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
}

exports.ReportDAO = ReportDAO;
exports.SaveBoardReportStrategy = SaveBoardReportStrategy;
exports.SaveAdsReportStrategy = SaveAdsReportStrategy;
exports.SaveLocationReportStrategy = SaveLocationReportStrategy;

exports.GetBoardReportStrategy = GetBoardReportStrategy;
exports.GetAdsReportStrategy = GetAdsReportStrategy;
exports.GetLocationReportStrategy = GetLocationReportStrategy;
