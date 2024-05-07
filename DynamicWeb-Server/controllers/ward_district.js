const models = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Mailjet = require("node-mailjet");
const controller = {};

const { AdsTypeDAO } = require("../DAO/AdsTypeDAO");
const { ReportDAO } = require("../DAO/ReportDAO");
const { CompanyDAO } = require("../DAO/CompanyDAO");
const { BoardTypeDAO } = require("../DAO/BoardTypeDAO");
const { AccountDAO } = require("../DAO/AccountDAO");
const { AreaDAO } = require("../DAO/AreaDAO");
const { BoardDAO } = require("../DAO/BoardDAO");
const { PermitRequestDAO } = require("../DAO/PermitRequestDAO");
const { LocationTypeDAO } = require("../DAO/LocationTypeDAO");
const { AdsPlacementDAO } = require("../DAO/AdsPlacementDAO");
const { AdsPlacementRequestDAO } = require("../DAO/AdsPlacementRequestDAO");
const { BoardRequestDAO } = require("../DAO/BoardRequestDAO");

const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC || "5f453b57b69003f11cdbd0d46c363385",
  apiSecret:
    process.env.MJ_APIKEY_PRIVATE || "b7af7b365498a7f77d1270fb86fa5826",
});

class WardDistrictController {
  constructor() {
    if (WardDistrictController.instance) {
      return WardDistrictController.instance;
    }

    WardDistrictController.instance = this;
  }

  async home(req, res) {
    res.locals.adsTypes = await AdsTypeDAO.findAll();
    res.locals.companies = await CompanyDAO.findAll();
    res.locals.boardTypes = await BoardTypeDAO.findAll();

    const account = await AccountDAO.findOneById(req.session.accountId);

    res.locals.message = req.flash("Message")[0];

    const wards = await AreaDAO.findWardsByDistrict(account.area.district);
    const wardArr = wards.map((area) => {
      return area.dataValues.ward;
    });

    return res.render("PhuongQuan/home.ejs", {
      tab: "Trang chủ",
      area: account.area,
      type: account.type,
      wards: wardArr,
      path: "/home",
    });
  };

  async addPermitRequest(req, res) {
    let redirectMethod = 1;
    let { boardId } = req.body;
    if (boardId == -1) {
      let { adsPlacementId, boardTypeId, boardSize, boardQuantity } = req.body;
      //Create new board
      try {
        const boardRawData = {
          size: boardSize,
          quantity: boardQuantity,
          boardTypeId: boardTypeId,
          adsPlacementId: adsPlacementId,
        }
        let { id } = await BoardDAO.create(boardRawData);
        boardId = id;
        redirectMethod = 0;
      } catch (error) {
        console.error(error);
        req.flash("Message", {
          title: "Tạo bảng QC mới thất bại",
          message: "Có lỗi xảy ra trong quá trình. Vui lòng thử lại",
          status: "fail",
        });
        return res.json({ redirect: "back" });
      }
    }
    let { companyId } = req.body;
    if (companyId == -1) {
      let { companyName, email, phone, address } = req.body;
      const companyRawData = {
        name: companyName,
        phone: phone,
        email: email,
        address, address
      }
      // Create new company
      try {
        let { id } = await CompanyDAO.create(companyRawData);
        companyId = id;
      } catch (error) {
        req.flash("Message", {
          title: "Tạo công ty mới thất bại",
          message: "Có lỗi xảy ra trong quá trình. Vui lòng thử lại",
          status: "fail",
        });
        if (redirectMethod == 1) return res.redirect("back");
        return res.json({ redirect: "back" });
      }
    }

    //Create new permit request
    let { content, startDate, endDate } = req.body;
    try {
      const file = req.file;
      console.log("image", file);
      let imageUrl;
      const path = [];
      // path.push(file.path);
      if (file) {
        path.push(file.path);
        imageUrl = path.join(",");
        imageUrl = imageUrl.replace(/\\/g, "/");
      }

      const requestRawData = {
        content: content,
        image: imageUrl,
        start: startDate,
        end: endDate,
        status: "Chưa cấp phép",
        boardId: boardId,
        companyId: companyId,
        accountId: req.session.accountId,
      }

      let { id } = await PermitRequestDAO.create(requestRawData);

      req.flash("Message", {
        title: "Tạo yêu cầu thành công",
        message:
          "Yêu cầu cấp phép QC của bạn đã được gửi và đang chờ xét duyệt (ID: " +
          id +
          ")",
        status: "succeed",
      });
    } catch (error) {
      req.flash("Message", {
        title: "Tạo yêu cầu cấp phép QC thất bại",
        message: "Có lỗi xảy ra trong quá trình. Vui lòng thử lại",
        status: "fail",
      });
    }
    if (redirectMethod == 1) return res.redirect("back");
    return res.json({ redirect: "back" });
  };

  async showListAdsplacements(req, res) {
    let areaId = req.user.AreaId;
    if (req.user.type == "Quan") {
      let selectedArea = req.query.selectedArea ? req.query.selectedArea : "";
      areaId = selectedArea;
    }

    res.locals.adsPlacements = await AdsPlacementDAO.findAllByAreaId(areaId);

    //Adding options for select forms
    res.locals.areas = await AreaDAO.findAll();
    res.locals.adsTypes = await AdsTypeDAO.findAll();
    res.locals.locationTypes = await LocationTypeDAO.findAll();
    res.locals.myArea = await AreaDAO.findAreasByDistrict(req.session.accountDistrict);

    res.locals.message = req.flash("Message")[0];

    return res.render("PhuongQuan/list-adsplacements.ejs", {
      tab: "Danh sách điểm đặt quảng cáo",
      path: "/list-adsplacements",
    });
  };

  async editAdsplacement(req, res) {
    let { adsplacementId, address, adsTypeId, locationTypeId, status, reason } =
      req.body;
    const data = {
      adsplacementId: adsplacementId,
      address: address,
      adsTypeId: adsTypeId,
      locationTypeId: locationTypeId,
      status: status,
      reason: reason,
      accountId: req.session.accountId,
      requestStatus: "Chờ phê duyệt",
    }
    try {
      let { id } = await AdsPlacementRequestDAO.create(data);
      req.flash("Message", {
        title: "Gửi yêu cầu thành công",
        message:
          "Yêu cầu thay đổi điểm đặt QC của bạn đã được gửi và đang chờ xét duyệt (ID: " +
          id +
          ")",
        status: "succeed",
      });
    } catch (error) {
      req.flash("Message", {
        title: "Gửi yêu cầu thất bại",
        message: "Có lỗi xảy ra trong quá trình. Vui lòng thử lại",
        status: "fail",
      });
    }
    res.redirect("back");
  };

  async showListBoards(req, res) {
    let id = isNaN(req.params.id) ? -1 : parseInt(req.params.id);

    let options = {
      include: [
        {
          model: models.AdsPlacement,
          attribute: ["address"],
          include: [
            {
              model: models.Area,
              where: {},
            },
          ],
          where: {},
        },
        {
          model: models.PermitRequest,
          required: true,
          include: [{ model: models.Company }]
        },
        { model: models.BoardType },
      ],
      where: {},
    };

    if (id != -1) {
      options.where.adsPlacementId = id;
      //res.locals.boards = await BoardDAO.findAllByAdsPlacementIdAndDistrict(id, req.session.accountDistrict);
    }

    options.include[0].include[0].where.district = req.session.accountDistrict;

    if (req.user.type == "Phuong") {
      options.include[0].where.areaId = req.user.AreaId;
    } else {
      let selectedArea = req.query.selectedArea ? req.query.selectedArea : "";
      if (selectedArea != "") {
        options.include[0].where.areaId = selectedArea;
      }
    }

    res.locals.permitedBoards = await models.Board.findAll(options);

    options = {
      include: [
        {
          model: models.AdsPlacement,
          attribute: ["address"],
          include: [
            {
              model: models.Area,
              where: {},
            },
          ],
          where: {},
        },
        {
          model: models.PermitRequest,
          required: false,
          where: {
            boardId: null,
          },
        },
        { model: models.BoardType },
      ],
      where: {
        [Op.and]: [
          {
            id: {
              [Op.notIn]: Sequelize.literal(
                "(SELECT boardId FROM permitRequests WHERE boardId IS NOT NULL AND end >= CURRENT_DATE)"
              ),
            },
          },
        ],
      },
    };

    if (id != -1) options.where[Op.and].push({ adsPlacementId: id });

    options.include[0].include[0].where.district = req.session.accountDistrict;

    if (req.user.type == "Phuong") {
      options.include[0].where.areaId = req.user.AreaId;
    } else {
      let selectedArea = req.query.selectedArea ? req.query.selectedArea : "";
      if (selectedArea != "") {
        options.include[0].where.areaId = selectedArea;
      }
    }

    let emptyBoards = await models.Board.findAll(options);

    //Adding options for select forms
    res.locals.boardTypes = await models.BoardType.findAll();
    res.locals.companies = await models.Company.findAll();
    res.locals.adsTypes = await models.AdsType.findAll();
    res.locals.myArea = await models.Area.findAll({
      where: { district: req.session.accountDistrict },
      order: [["ward", "ASC"]],
    });

    res.locals.message = req.flash("Message")[0];

    return res.render("PhuongQuan/list-boards", {
      tab: "Danh sách bảng quảng cáo",
      emptyBoards: emptyBoards,
      path: "/list-boards",
    });
  };

  async editBoard(req, res) {
    let { boardId, quantity, size, boardTypeId, reason } = req.body;
    try {
      const rawData = {
        boardId: boardId,
        size: size,
        quantity: quantity,
        boardTypeId: boardTypeId,
        reason: reason,
        accountId: req.session.accountId,
        requestStatus: "Chờ phê duyệt",
      }
      let {id} = await BoardRequestDAO.create(rawData);
      req.flash("Message", {
        title: "Gửi yêu cầu thành công",
        message:
          "Yêu cầu thay đổi bảng quảng cáo của bạn đã được gửi và đang chờ xét duyệt (ID: " +
          id +
          ")",
        status: "succeed",
      });
    } catch (error) {
      req.flash("Message", {
        title: "Gửi yêu cầu thất bại",
        message: "Có lỗi xảy ra trong quá trình. Vui lòng thử lại",
        status: "fail",
      });
    }
    res.redirect("back");
  };

  async showMyRequests(req, res) {
    res.locals.adsplacementRequests = await AdsPlacementRequestDAO.findAllByAccountId(req.session.accountId);

    res.locals.boardRequests = await BoardRequestDAO.findAllByAccountId(req.session.accountId);

    res.locals.permitRequests = await PermitRequestDAO.findAllByAccountId(req.session.accountId);

    res.locals.message = req.flash("Message")[0];

    return res.render("PhuongQuan/my-requests.ejs", {
      tab: "Yêu cầu của tôi",
      selectedId: req.session.selectedAdsplacementId,
      path: "/my-requests",
    });
  };

  async deleteRequest(req, res) {
    let { tableName, requestId } = req.body;
    console.log(req.body);
    try {
      if (tableName == "BoardRequest") {
        await BoardRequestDAO.destroy(requestId);
        req.flash("Message", {
          title: "Xoá yêu cầu thành công",
          message: "Đã xoá yêu cầu thay đổi bảng QC (ID: " + requestId + ")",
          status: "succeed",
        });
      }
      if (tableName == "AdsPlacementRequest") {
        await AdsPlacementRequestDAO.destroy(requestId);
        req.flash("Message", {
          title: "Xoá yêu cầu thành công",
          message: "Đã xoá yêu cầu thay đổi điểm đặt QC (ID: " + requestId + ")",
          status: "succeed",
        });
      }
      if (tableName == "PermitRequest") {
        await PermitRequestDAO.destroy(requestId);
        req.flash("Message", {
          title: "Xoá yêu cầu thành công",
          message: "Đã xoá yêu cầu cấp phép bảng QC (ID: " + requestId + ")",
          status: "succeed",
        });
      }
    } catch (error) {
      req.flash("Message", {
        title: "Xoá yêu cầu thất bại",
        message: "Có lỗi xảy ra trong quá trình. Vui lòng thử lại",
        status: "fail",
      });
    }
    res.redirect("back");
  };

  async showListReports(req, res) {
    let areaId = req.user.AreaId;
    if (req.user.type == "Quan") {
      let selectedArea = req.query.selectedArea ? req.query.selectedArea : "";
      areaId = selectedArea;
    }

    res.locals.reports = await ReportDAO.findAllByAreaId(areaId);

    res.locals.myArea = await AreaDAO.findAreasByDistrict(req.session.accountDistrict);

    return res.render("PhuongQuan/list-reports.ejs", {
      tab: "Danh sách báo cáo",
      path: "/list-reports",
    });
  };

  async showReportDetails(req, res) {
    let id = isNaN(req.params.id) ? -1 : parseInt(req.params.id);

    const result = await ReportDAO.findReportById(id);

    if (!result.report) {
      return res.send("Báo cáo không tồn tại hoặc bạn không có quyền truy cập!");
    }

    res.locals.report = result.report;
    
    if (result.class == "Board") {
      res.locals.className = "Báo cáo bảng QC";
    }
    else if (result.class == "AdsPlacement") {
      res.locals.className = "Báo cáo điểm đặt QC";
    }
    else if (result.class == "Location") {
      res.locals.className = "Báo cáo địa điểm";
    }

    res.locals.message = req.flash("Message")[0];

    return res.render("PhuongQuan/view-report-details.ejs", {
      tab: "Chi tiết báo cáo",
      path: "/list-reports",
    });
  };

  async updateReportDetails(req, res) {
    let { reportId, method, status } = req.body;
    try {
      await ReportDAO.updateReport(reportId, method, status, req.session.accountId);
      const result = await ReportDAO.findReportById(reportId);
      const report = result.report
      const account = await AccountDAO.findOneById(req.session.accountId);

      // Send email
      const request = await mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: "hiiback0608@gmail.com",
              Name: "Sở văn hóa và du lịch",
            },
            To: [
              {
                Email: report.email,
                Name: report.email,
              },
            ],
            TemplateID: 5485692,
            Subject: "Phản hồi về báo cáo",
            TemplateLanguage: true,
            Variables: {
              citizenName: report.name,
              content: method,
              officerName: `${account.lastName} ${account.firstName}`,
              officerType:
                account.type == "Quan"
                  ? `Cán bộ  ${account.area.district.toLowerCase()}`
                  : ` Cán bộ ${account.area.ward.toLowerCase()}`,
              email: account.email,
            },
          },
        ],
      });
      req.flash("Message", {
        title: "Cập nhật báo cáo thành công",
        message: "Xử lý báo cáo của bạn đã được cập nhật trên hệ thống",
        status: "succeed",
      });
    } catch (error) {
      console.log(error);
      req.flash("Message", {
        title: "Cập nhật báo cáo thất bại",
        message: "Có lỗi xảy ra trong quá trình. Vui lòng thử lại",
        status: "fail",
      });
    }
    res.redirect("back");
  };
}

module.exports = WardDistrictController;