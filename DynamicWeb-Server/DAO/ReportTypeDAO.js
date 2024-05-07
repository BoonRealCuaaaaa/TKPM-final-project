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
const {ReportTypeDC} = require("../DC/ReportTypeDC");

class ReportTypeDAO {
    constructor() {}
    static instance = null;
    static getInstance() {
        if (ReportTypeDAO.instance == null) {
          ReportTypeDAO.instance = new ReportTypeDAO();
        }
        return ReportTypeDAO.instance;
    }

    async getReportTypesJoinReport(reportTypeAttr, reportAttr) {
        const optionReportTypes = {
            attributes: reportTypeAttr,
            include: [
              {
                model: Report,
                attributes: reportAttr, // Thay thế bằng các thuộc tính của Report mà bạn muốn hiển thị
              },
            ],
        };
        const reportTypes = await ReportType.findAll(optionReportTypes);
        return reportTypes.map(reportType => {
          return new ReportTypeDC(reportType.id, reportType.type)
        });
    }

    async createReportType(type) {
      await ReportType.create({
        type: type,
      });
    }

    async updateReportTypeById(id, updateObject) {
      await ReportType.update(
        updateObject,
        {
          where: {
            id,
          },
        }
      );
    }

    async deleteReportTypeById(id) {
      await ReportType.destroy({
        where: {
          id,
        },
      });
    }
}

exports.ReportTypeDAO = ReportTypeDAO;