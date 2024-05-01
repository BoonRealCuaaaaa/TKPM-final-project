const {
  Area,
  Account,
  AdsPlacement,
  AdsPlacementRequest,
  AdsType,
  LocationType,
  LocationReport,
  PermitRequest,
  Company,
  BoardType,
  Board,
  Report,
  ReportType,
  BoardRequest,
  sequelize,
} = require("../models");

const { AdsPlacementDAO } = require("../DAO/AdsPlacementDAO");
const { AreaDAO } = require("../DAO/AreaDAO");
const { BoardDAO } = require("../DAO/BoardDAO");
const { AdsTypeDAO } = require("../DAO/AdsTypeDAO");
const { LocationTypeDAO } = require("../DAO/LocationTypeDAO");
const { BoardTypeDAO } = require("../DAO/BoardTypeDAO");
const { AdsPlacementDC } = require("../DC/AdsPlacementDC");
const { AreaDC } = require("../DC/AreaDC");
const { BoardDC } = require("../DC/BoardDC");
const { AdsTypeDC } = require("../DC/AdsTypeDC");
const { LocationTypeDC } = require("../DC/LocationTypeDC");
const { BoardTypeDC } = require("../DC/BoardTypeDC");
const severPath = "http://localhost:5000/";
const checkInput = require("../util/checkInput");
const { createWardDistrictPageQueryString } = require("../util/queryString");
const bcrypt = require("bcrypt");

const controller = {};
const { Op } = require("sequelize");

const apiKey = "8c7c7c956fdd4a598e2301d88cb48135";

/*
    + req: request
    + res: response
    + rows: Tổng dữ liệu cần phải phân trang
    + rowsPerPage: Số dòng trên một trang.
    + limitPagination: Số trang tối đa có thể di chuyển về trước hoặc về sau ở trang hiện tại.
    Vd trang hiện tại là 3 thì số trang hiển thị là 1, 2, 3, 4, 5
    
    +currentPage: Trang hiện tại giúp kiểm tra việc request có hợp lệ không
    + flag: Nếu trước đó đã thao tác xóa thì truyền vào cho flag = true
*/

async function getPagination(
  req,
  res,
  rows,
  rowsPerPage,
  currentPage,
  limitPagination = 2,
  flag = false
) {
  const minPage = 1;
  const maxPage = Math.ceil((rows.length * 1.0) / rowsPerPage);
  let pagination = {};
  if (currentPage < minPage || currentPage > maxPage) {
    if (flag) {
      currentPage = maxPage <= 0 ? 1 : maxPage;
      return res.redirect(
        "/department" +
          createWardDistrictPageQueryString(req.url, "page=", currentPage)
      );
    } else {
      pagination = {
        minPage: 1,
        currentPage: currentPage,
        maxPage: 1,
        limitPage: limitPagination,
        rows: [],
      };
    }
  } else {
    pagination = {
      minPage,
      currentPage: currentPage,
      maxPage,
      limitPage: limitPagination,
      rows: rows.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
      ),
    };
  }
  return pagination;
}

class DepartmentController {
  constructor() {
    if (DepartmentController.instance) {
      return DepartmentController.instance;
    }

    DepartmentController.instance = this;
  }

  // Nhân
  async accountManagement(req, res) {
    const createErr = {
      error: {
        firstName: req.flash("firstNameCreateModalError"),
        lastName: req.flash("lastNameCreateModalError"),
        username: req.flash("usernameCreateModalError"),
        email: req.flash("emailCreateModalError"),
        password: req.flash("passwordCreateModalError"),
        confirmPassword: req.flash("confirmPasswordCreateModalError"),
        birthDay: req.flash("birthDayCreateModalError"),
        phone: req.flash("phoneCreateModalError"),
      },
      value: {
        firstName: req.flash("firstNameCreateModal")[0],
        lastName: req.flash("lastNameCreateModal")[0],
        username: req.flash("usernameCreateModal")[0],
        email: req.flash("emailCreateModal")[0],
        password: req.flash("passwordCreateModal")[0],
        confirmPassword: req.flash("confirmPasswordCreateModal")[0],
        birthDay: req.flash("birthDayCreateModal")[0],
        phone: req.flash("phoneCreateModal")[0],
      },
    };
    let message = req.flash("messageAccountManagement")[0];
    message = message == null ? null : JSON.parse(message);
    let page = isNaN(req.query.page) ? 1 : parseInt(req.query.page);
    let district = req.query.district || "";
    let ward = req.query.ward || "";
    const options = {
      attributes: ["id", "firstName", "lastName", "email", "type"],
      where: {
        id: { [Op.ne]: req.session.accountId },
      },
      include: [
        {
          model: Area,
          attributes: ["id", "district", "ward"],
          where: {},
        },
      ],
    };
    let wards = [],
      currentDistrict = "",
      currentWard = "";
    if (district.trim() !== "") {
      options.include[0].where.district = district;
      options.where = {
        [Op.or]: [{ type: "Quan" }, { type: "Phuong" }],
      };
      wards = await Area.findAll({
        where: {
          district,
        },
      });
      currentDistrict = district;
      if (ward.trim() !== "") {
        options.include[0].where.ward = ward;
        options.where = {
          type: "Phuong",
        };
        currentWard = ward;
      }
    }

    const accountTypes = ["Phuong", "Quan", "So"];
    const [districts] = await sequelize.query(
      `SELECT DISTINCT district FROM Areas`
    );
    let accounts = await Account.findAll(options);
    let flag = false;
    if (message != null && message.type === "delete") {
      flag = true;
    }
    const pagination = await getPagination(
      req,
      res,
      accounts,
      5,
      page,
      2,
      flag
    );
    const currentUrl = req.url.slice(1);

    return res.render("So/accountManagement.ejs", {
      accountTypes,
      districts,
      wards,
      pagination,
      createErr,
      message,
      currentUrl,
      currentDistrict,
      currentWard,
    });
  }

  async getWardsWithSpecificDistrict(req, res) {
    const district = req.query.district || "";

    const options = {
      attributes: ["ward"],
    };
    if (district.trim() !== "") {
      options.where = {
        district,
      };
    }
    const wards = await Area.findAll(options);

    return res.json(wards);
  }

  async createAccount(req, res) {
    const {
      firstNameCreateModal,
      lastNameCreateModal,
      usernameCreateModal,
      emailCreateModal,
      passwordCreateModal,
      birthDayCreateModal,
      phoneCreateModal,
      confirmPasswordCreateModal,
      accountTypeSelectCreateModal,
      districtSelectCreateModal,
      wardSelectCreateModal,
    } = req.body;

    let loginFailed = false;
    //First name
    if (checkInput.isEmpty(firstNameCreateModal)) {
      req.flash("firstNameCreateModalError", "Tên cán bộ không thể để trống!");
      loginFailed = true;
    }
    //Last name
    if (checkInput.isEmpty(lastNameCreateModal)) {
      req.flash(
        "lastNameCreateModalError",
        "Tên đệm và họ của cán bộ chưa được nhập!"
      );
      loginFailed = true;
    }
    //Username
    if (checkInput.isEmpty(usernameCreateModal)) {
      loginFailed = true;
      req.flash(
        "usernameCreateModalError",
        "Tên đăng nhập không thể để trống!"
      );
    } else if (await checkInput.usernameExists(usernameCreateModal)) {
      loginFailed = true;
      req.flash("usernameCreateModalError", "Tên đăng nhập đã tồn tại!");
    }
    //Birthday
    const birthDay = new Date(birthDayCreateModal);
    const yearToMilliseconds = 1000 * 60 * 60 * 24 * 365;
    if (birthDay == "Invalid Date") {
      loginFailed = true;
      req.flash("birthDayCreateModalError", "Ngày sinh không thể để trống!");
    } else if (birthDay > new Date()) {
      loginFailed = true;
      req.flash(
        "birthDayCreateModalError",
        "Ngày sinh lớn hơn thời gian hiện tại!"
      );
    } else if (Date.now() - birthDay.getTime() - 0 * yearToMilliseconds < 0) {
      loginFailed = true;
      req.flash("birthDayCreateModalError", "Chưa đủ tuổi thành niên");
    }
    //phone
    if (checkInput.isEmpty(phoneCreateModal)) {
      loginFailed = true;
      req.flash("phoneCreateModalError", "Số điện thoại không thể để trống!");
    } else if (phoneCreateModal.length != 10) {
      loginFailed = true;
      req.flash("phoneCreateModalError", "Số điện thoại không hợp lệ!");
    } else if (await checkInput.phoneExists(phoneCreateModal)) {
      loginFailed = true;
      req.flash("phoneCreateModalError", "Số điện thoại đã tồn tại!");
    }
    //Email
    if (checkInput.isEmpty(emailCreateModal)) {
      loginFailed = true;
      req.flash("emailCreateModalError", "Email chưa được nhập!");
    } else if (!checkInput.isEmail(emailCreateModal)) {
      loginFailed = true;
      req.flash("emailCreateModalError", "Email không hợp lệ!");
    } else if (await checkInput.emailExists(emailCreateModal)) {
      loginFailed = true;
      req.flash("emailCreateModalError", "Email này đã được sử dụng!");
    }
    //Password
    if (checkInput.isEmpty(passwordCreateModal)) {
      loginFailed = true;
      req.flash("passwordCreateModalError", "Mật khẩu không thể bỏ trống!");
    } else if (!checkInput.isValidPassword(passwordCreateModal)) {
      loginFailed = true;
      req.flash("passwordCreateModalError", "Mật khẩu này quá yếu!");
    }
    //Confirm password
    if (checkInput.isEmpty(confirmPasswordCreateModal)) {
      loginFailed = true;
      req.flash(
        "confirmPasswordCreateModalError",
        "Mật khẩu xác nhận chưa được nhập!"
      );
    } else if (
      !checkInput.isValidConfirmPassword(
        passwordCreateModal,
        confirmPasswordCreateModal
      )
    ) {
      loginFailed = true;
      req.flash(
        "confirmPasswordCreateModalError",
        "Mật khẩu xác nhận không trùng với mật khẩu!"
      );
    }

    if (loginFailed) {
      req.flash("firstNameCreateModal", firstNameCreateModal);
      req.flash("lastNameCreateModal", lastNameCreateModal);
      req.flash("usernameCreateModal", usernameCreateModal);
      req.flash("emailCreateModal", emailCreateModal);
      req.flash("passwordCreateModal", passwordCreateModal);
      req.flash("confirmPasswordCreateModal", confirmPasswordCreateModal);
      req.flash("birthDayCreateModal", birthDayCreateModal);
      req.flash("phoneCreateModal", phoneCreateModal);
      req.flash(
        "messageAccountManagement",
        JSON.stringify({
          type: "create",
          status: "danger",
          content: "Đăng ký thất bại",
        })
      );
      return res.redirect("/department/accountManagement");
    }
    console.log("Phone: ", phoneCreateModal);
    try {
      const hashPassword = await bcrypt.hash(passwordCreateModal, 12);
      let areaId = 1;
      if (accountTypeSelectCreateModal !== "So") {
        const options = {
          where: {
            district: districtSelectCreateModal,
          },
        };
        if (accountTypeSelectCreateModal === "Phuong") {
          options.where.ward = wardSelectCreateModal;
        }
      }
      const newAccount = await Account.create({
        firstName: firstNameCreateModal,
        lastName: lastNameCreateModal,
        username: usernameCreateModal,
        email: emailCreateModal,
        password: hashPassword,
        type: accountTypeSelectCreateModal,
        birth: birthDayCreateModal,
        phone: phoneCreateModal,
        AreaId: areaId,
      });
      console.log(newAccount);
      req.flash(
        "messageAccountManagement",
        JSON.stringify({
          type: "create",
          status: "success",
          content: "Đăng ký thành công",
        })
      );
    } catch (err) {
      console.log(err);
      req.flash(
        "messageAccountManagement",
        JSON.stringify({
          type: "create",
          status: "danger",
          content: "Đăng ký thất bại",
        })
      );
    }
    return res.redirect("/department/accountManagement");
  }

  async editAccount(req, res) {
    const {
      idEditModal,
      accountTypeSelectEditModal,
      districtSelectEditModal,
      wardSelectEditModal,
    } = req.body;
    try {
      let areaId = 1;
      if (accountTypeSelectEditModal !== "So") {
        const options = {
          where: {
            district: districtSelectEditModal,
          },
        };
        if (accountTypeSelectEditModal === "Phuong") {
          options.where.ward = wardSelectEditModal;
        }
        areaId = (await Area.findOne(options)).id;
      }
      await Account.update(
        { type: accountTypeSelectEditModal, AreaId: areaId },
        { where: { id: idEditModal } }
      );
      req.flash(
        "messageAccountManagement",
        JSON.stringify({
          type: "edit",
          status: "success",
          content: "Phân công khu vực thành công",
        })
      );
      return res.send("Account updated!");
    } catch (err) {
      console.error(err);
      req.flash(
        "messageAccountManagement",
        JSON.stringify({
          type: "edit",
          status: "danger",
          content: "Phân công khu vực thất bại",
        })
      );
      return res.send("Can not update account!");
    }
  }

  async deleteAccount(req, res) {
    const { accountId } = req.body;
    try {
      await Account.destroy({ where: { id: accountId } });
      req.flash(
        "messageAccountManagement",
        JSON.stringify({
          type: "delete",
          status: "success",
          content: "Xóa tài khoản thành công",
        })
      );
      return res.send("Account deleted!");
    } catch (err) {
      console.error(err);
      req.flash(
        "messageAccountManagement",
        JSON.stringify({
          type: "delete",
          status: "danger",
          content: "Xóa tài khoản thất bại",
        })
      );
      return res.send("Can not delete account!");
    }
  }

  async viewAdsRequests(req, res) {
    let page = isNaN(req.query.page) ? 1 : parseInt(req.query.page);
    let district = req.query.district || "";
    let ward = req.query.ward || "";

    let whereCondition = {};
    let wards = [],
      currentDistrict = "",
      currentWard = "";
    if (district.trim() !== "") {
      wards = await Area.findAll({
        where: {
          district,
        },
      });
      whereCondition.district = district;
      currentDistrict = district;
      if (ward.trim() !== "") {
        currentWard = ward;
        whereCondition.ward = ward;
      }
    }

    const [districts] = await sequelize.query(
      `SELECT DISTINCT district FROM Areas`
    );
    let permitRequests = await PermitRequest.findAll({
      include: [
        Company,
        {
          model: Board,
          include: [
            BoardType,
            {
              model: AdsPlacement,
              include: [
                {
                  model: Area,
                  where: whereCondition,
                  required: true,
                },
              ],
              required: true,
            },
          ],
          required: true,
        },
        {
          model: Account,
          attributes: ["firstName", "lastName", "type", "email"],
        },
      ],
    });
    const permitRequestsPerPage = 5;
    let pagination = await getPagination(
      req,
      res,
      permitRequests,
      permitRequestsPerPage,
      page
    );
    const currentUrl = req.url.slice(1);

    return res.render("So/viewAdsRequest.ejs", {
      formatDate: (date) => {
        return date.toLocaleDateString({
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      },
      pagination,
      currentUrl,
      districts,
      wards,
      currentDistrict,
      currentWard,
    });
  }

  async detailRequest(req, res) {
    const previousUrl = req.query.previousUrl || "";
    const id = isNaN(req.params.id) ? -1 : parseInt(req.params.id);
    let permitRequest = await PermitRequest.findOne({
      include: [
        Company,
        {
          model: Board,
          include: [
            BoardType,
            {
              model: AdsPlacement,
              include: [Area],
            },
          ],
        },
        {
          model: Account,
          attributes: ["firstName", "lastName", "type", "email"],
        },
      ],
      where: {
        id,
      },
    });
    return res.render("So/acceptOrDenyAdsRequest.ejs", {
      permitRequest,
      previousUrl,
    });
  }

  async acceptOrDenyAdsRequest(req, res) {
    const { status, id, previousUrl } = req.body;
    try {
      await PermitRequest.update(
        {
          status,
        },
        { where: { id } }
      );
      return res.json({
        status: "success",
        redirect: `${req.baseUrl}/${previousUrl}`,
      });
    } catch (err) {
      return res.json({
        status: "fail",
        redirect: `${req.baseUrl}/${previousUrl}`,
      });
    }
  }

  async viewReports(req, res) {
    let page = isNaN(req.query.page) ? 1 : parseInt(req.query.page);
    let district = req.query.district || "";
    let ward = req.query.ward || "";
    let type = req.query.type || "";

    let wards = [],
      currentDistrict = "",
      currentWard = "";
    let whereCondition = {};
    if (district.trim() !== "") {
      wards = await Area.findAll({
        where: {
          district,
        },
      });
      whereCondition.district = district;
      currentDistrict = district;
      if (ward.trim() !== "") {
        currentWard = ward;
        whereCondition.ward = ward;
      }
    }

    const [districts] = await sequelize.query(
      `SELECT DISTINCT district FROM Areas`
    );

    let reports;
    if (type.trim() === "reports") {
      reports = await Report.findAll({
        include: [
          ReportType,
          {
            model: AdsPlacement,
            include: [
              {
                model: Area,
                where: whereCondition,
                required: true,
              },
            ],
            required: true,
          },
        ],
        required: true,
      });
    } else if (type.trim() === "locationReports") {
      reports = await LocationReport.findAll({
        include: [
          ReportType,
          {
            model: Area,
            where: whereCondition,
            required: true,
          },
        ],
        required: true,
      });
      console.log(reports);
    } else {
      reports = await Report.findAll({
        include: [
          ReportType,
          {
            model: AdsPlacement,
            include: [
              {
                model: Area,
                where: whereCondition,
                required: true,
              },
            ],
            required: true,
          },
        ],
        required: true,
      });
      let locationReports = await LocationReport.findAll({
        include: [
          ReportType,
          {
            model: Area,
            where: whereCondition,
            required: true,
          },
        ],
        required: true,
      });
      reports = reports.concat(locationReports);
    }

    const reportsPerPage = 4;
    const pagination = await getPagination(
      req,
      res,
      reports,
      reportsPerPage,
      page
    );
    const createWardDistrictPageTypeQueryString = (key, value) => {
      let newType =
        key === "type="
          ? { key: value === "" ? value : key, value }
          : { key: type === "" ? "" : "type=", value: type };
      let newWard =
        key === "ward="
          ? { key, value }
          : { key: ward === "" ? "" : "ward=", value: ward };
      let newPage = key === "page=" ? { key, value } : { key: "", value: "" };
      let newDistrict;
      if (key === "district=") {
        newDistrict = { key, value };
        newWard = { key: "", value: "" };
      } else {
        newDistrict = {
          key: district === "" ? "" : "district=",
          value: district,
        };
      }
      let newUrl = req.originalUrl;
      let index = newUrl.indexOf("?");
      if (index === -1) {
        return newUrl + "?" + key + value;
      }

      newUrl = newUrl.slice(0, index + 1);
      console.log(">>> req: ", newUrl);
      console.log(">>> index: ", index);

      let temp = newUrl.length;
      newUrl =
        newUrl +
        newPage.key +
        newPage.value +
        (newWard.key !== "" ? "&" : "") +
        newWard.key +
        newWard.value +
        (newDistrict.key !== "" ? "&" : "") +
        newDistrict.key +
        newDistrict.value +
        (newType.key !== "" ? "&" : "") +
        newType.key +
        newType.value;
      if (newUrl.charAt(temp) === "&") {
        newUrl = newUrl.slice(0, temp) + newUrl.slice(temp + 1);
      }
      return newUrl;
    };
    res.locals.createWardDistrictPageTypeQueryString =
      createWardDistrictPageTypeQueryString;
    // console.log(pagination.rows);
    const currentUrl = req.url.slice(1);
    return res.render("So/viewReports.ejs", {
      formatDate: (date) => {
        return date.toLocaleDateString({
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      },
      pagination,
      currentUrl,
      districts,
      wards,
      currentDistrict,
      currentWard,
      currentType: type,
    });
  }

  async detailReport(req, res) {
    const type = req.query.type || "";
    const id = isNaN(req.params.id) ? -1 : parseInt(req.params.id);
    let report;
    if (type.trim() === "") {
      report = await Report.findOne({
        include: [
          ReportType,
          {
            model: AdsPlacement,
            include: [Area],
          },
          {
            model: Account,
            attributes: ["firstName", "lastName", "type", "email"],
          },
        ],
        where: {
          id,
        },
      });
    } else {
      report = await LocationReport.findOne({
        include: [
          ReportType,
          {
            model: Area,
            required: true,
          },
          {
            model: Account,
            attributes: ["firstName", "lastName", "type", "email"],
          },
        ],
        where: {
          id,
        },
      });
    }

    report.image = report.image.split(", ");
    return res.render("So/detailReport.ejs", {
      report,
      type,
    });
  }

  async statisticReport(req, res) {
    let { type, size } = req.body;
    try {
      let reports = await Report.findAll({
        where: {
          updatedAt: {
            [Op.lt]: new Date(),
            [Op.gt]: new Date(
              new Date() -
                size * (type === "month" ? 31 : 1) * 24 * 60 * 60 * 1000
            ),
          },
          status: "Chưa xử lý",
        },
      });
      let locationReports = await LocationReport.findAll({
        where: {
          updatedAt: {
            [Op.lt]: new Date(),
            [Op.gt]: new Date(
              new Date() -
                size * (type === "month" ? 31 : 1) * 24 * 60 * 60 * 1000
            ),
          },
          status: "Chưa xử lý",
        },
      });
      reports = reports.concat(locationReports);

      let labels = [],
        numberOfReportsList = [],
        waiting = 0,
        processed = 0;
      if (type === "day") {
        for (let i = size - 1; i >= 0; i--) {
          let date = new Date(new Date() - i * 24 * 60 * 60 * 1000);
          labels.push(
            `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
          );
          numberOfReportsList.push(0);
        }
      } else if (type === "month") {
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();
        while (size > 0) {
          labels.unshift(`${currentMonth + 1}/${currentYear}`);
          numberOfReportsList.unshift(0);
          currentMonth -= 1;
          if (currentMonth < 0) {
            currentMonth = 11;
            currentYear -= 1;
          }
          size -= 1;
        }
      }

      for (let i = 0; i < reports.length; i++) {
        let date = new Date(reports[i].createdAt);
        let dateStr =
          (type === "day" ? `${date.getDate()}/` : "") +
          `${date.getMonth() + 1}/${date.getFullYear()}`;
        let index = labels.indexOf(dateStr);
        if (index > -1) {
          numberOfReportsList[index] += 1;
          if (reports[i].method == null) {
            waiting += 1;
          } else {
            processed += 1;
          }
        }
      }
      return res.json({
        status: "success",
        labels,
        numberOfReportsList,
      });
    } catch (err) {
      console.error(err);
      return res.json({
        status: "fail",
      });
    }
  }

  async getWaitingAndProcessedReport(req, res) {
    try {
      let reports = await Report.findAll();
      let locationReports = await LocationReport.findAll();
      reports = reports.concat(locationReports);
      let waitingReports = reports.filter((report) => report.method == null);

      return res.json({
        status: "success",
        waiting: waitingReports.length,
        processed: reports.length - waitingReports.length,
      });
    } catch (err) {
      console.error(err);
      return res.json({
        status: "fail",
        waiting: 0,
        processed: 0,
      });
    }
  }

  async viewEditRequest(req, res) {
    let page = isNaN(req.query.page) ? 1 : parseInt(req.query.page);
    let district = req.query.district || "";
    let ward = req.query.ward || "";
    const currentStatus = req.query.status || "";
    const status = ["Chờ phê duyệt", "Đã được duyệt", "Bị từ chối"];
    console.log(currentStatus);
    let whereCondition = {};
    let wards = [],
      currentDistrict = "",
      currentWard = "";
    if (district.trim() !== "") {
      wards = await Area.findAll({
        where: {
          district,
        },
      });
      whereCondition.district = district;
      currentDistrict = district;
      if (ward.trim() !== "") {
        currentWard = ward;
        whereCondition.ward = ward;
      }
    }

    const [districts] = await sequelize.query(
      `SELECT DISTINCT district FROM Areas`
    );
    let boardRequest;
    if (currentStatus !== "") {
      boardRequest = await BoardRequest.findAll({
        include: [
          BoardType,
          {
            model: Board,
            include: [
              BoardType,
              {
                model: AdsPlacement,
                include: [
                  {
                    model: Area,
                    where: whereCondition,
                    required: true,
                  },
                ],
                required: true,
              },
            ],
            required: true,
          },
          {
            model: Account,
            attributes: ["firstName", "lastName", "type", "email"],
          },
        ],
        where: {
          requestStatus: currentStatus,
        },
      });
    } else {
      boardRequest = await BoardRequest.findAll({
        include: [
          BoardType,
          {
            model: Board,
            include: [
              BoardType,
              {
                model: AdsPlacement,
                include: [
                  {
                    model: Area,
                    where: whereCondition,
                    required: true,
                  },
                ],
                required: true,
              },
            ],
            required: true,
          },
          {
            model: Account,
            attributes: ["firstName", "lastName", "type", "email"],
          },
        ],
      });
    }
    const editRequestsPerPage = 5;
    let pagination = await getPagination(
      req,
      res,
      boardRequest,
      editRequestsPerPage,
      page
    );
    const currentUrl = req.url.slice(1);

    return res.render("So/acceptOrDenyEditRequest.ejs", {
      formatDate: (date) => {
        return date.toLocaleDateString({
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      },
      pagination,
      currentUrl,
      districts,
      wards,
      currentDistrict,
      currentWard,
      status,
      currentStatus,
    });
  }

  async acceptOrDenyEditRequest(req, res) {
    const { boardRequestId, size, quantity, boardTypeId, boardId, status } =
      req.body;
    try {
      await BoardRequest.update(
        {
          size,
          quantity,
          requestStatus: status,
        },
        { where: { id: boardRequestId } }
      );
      await Board.update(
        {
          BoardTypeId: boardTypeId,
        },
        { where: { id: boardId } }
      );
      return res.json({ status: "Success" });
    } catch (err) {
      return res.json({ status: "Fail" });
    }
  }
  // Khiêm hoàn thành
  async adplaceManagement(req, res) {
    const createErr = {
      error: {
        address: req.flash("addressCreateModalError"),
        numBoard: req.flash("numBoardCreateModalError"),
        district: req.flash("districtSelectCreateModalError"),
        ward: req.flash("wardSelectCreateModalError"),
      },
      value: {
        address: req.flash("addressCreateModal")[0],
        numBoard: req.flash("numBoardCreateModal")[0],
        district: req.flash("districtSelectCreateModal")[0],
        ward: req.flash("wardSelectCreateModal")[0],
      },
    };

    let message = req.flash("message")[0];
    message = message == null ? null : JSON.parse(message);

    const editMsg = {
      status: req.flash("editMsgStatus"),
      content: req.flash("editMsgContent"),
    };

    const deleteMsg = {
      status: req.flash("deleteMsgStatus"),
      content: req.flash("deleteMsgContent"),
    };

    let district = req.query.district || "";
    let ward = req.query.ward || "";
    let search = req.query.search || "";
    let wards = [],
      currentDistrict = "",
      currentWard = "";

    if (district.trim() !== "") {
      wards = await Area.findAll({
        where: {
          district,
        },
      });
      currentDistrict = district;
      if (ward.trim() !== "") {
        currentWard = ward;
      }
    }

    const [districts] = await sequelize.query(
      `SELECT DISTINCT district FROM Areas ORDER BY district`
    );
    let page = isNaN(req.query.page) ? 1 : parseInt(req.query.page);
    let flag = false;

    if (message !== null && message.type === "delete") {
      flag = true;
    }
    const adsPlacements =
      await AdsPlacementDAO.getInstance().getAdsPlacementByOptions(
        district,
        ward,
        search
      );
    const adsTypes = await AdsType.findAll();
    const locationsType = await LocationType.findAll();
    const currentUrl = req.url.slice(1);
    const pagination = await getPagination(
      req,
      res,
      adsPlacements,
      4,
      page,
      2,
      flag
    );

    const status = ["Đã quy hoạch", "Chưa quy hoạch"];
    res.render("So/adplaceManagement.ejs", {
      pagination,
      adsPlacements,
      districts,
      wards,
      currentUrl,
      currentDistrict,
      currentWard,
      createErr,
      adsTypes,
      locationsType,
      editMsg,
      deleteMsg,
      message,
      status,
      search,
    });
  }
  // Khiêm hoàn thành
  async createAdplace(req, res) {
    let {
      districtSelectCreateModal,
      wardSelectCreateModal,
      addressCreateModal,
      locationTypeSelectCreateModal,
      adTypeSelectCreateModal,
      lngCreateModal,
      latCreateModal,
    } = req.body;

    let createFailed = false;
    const { district, ward } = await checkInput.extractDistrictAndWard(
      await checkInput.getAddressFromLatLong(
        latCreateModal,
        lngCreateModal,
        apiKey
      )
    );

    if (districtSelectCreateModal != district) {
      req.flash("wardSelectCreateModalError", "Khác với bản đồ.");
      req.flash("districtSelectCreateModalError", "Khác với bản đồ.");
      createFailed = true;
    }
    addressCreateModal = checkInput.getFirstPartOfAddress(addressCreateModal);

    let fullAddress = await checkInput.getFullAddressInfo(
      addressCreateModal,
      apiKey
    );
    if (checkInput.isEmpty(addressCreateModal)) {
      req.flash("addressCreateModalError", "Địa điểm không hợp lệ.");
      createFailed = true;
    }

    if (await checkInput.isDuplicateAddress(addressCreateModal)) {
      req.flash("addressCreateModalError", "Địa điểm đặt được tạo.");
      createFailed = true;
    }

    if (await checkInput.isDuplicateLongLat(lngCreateModal, latCreateModal)) {
      req.flash("addressCreateModalError", "Địa điểm đặt được tạo.");
      createFailed = true;
    }

    if (lngCreateModal == "" && latCreateModal == "") {
      const address = await checkInput.getLatLongFromAddress(
        fullAddress,
        apiKey
      );
      lngCreateModal = address.lon;
      latCreateModal = address.lat;
    }

    if (createFailed) {
      req.flash("addressCreateModal", addressCreateModal);
      req.flash(
        "message",
        JSON.stringify({
          type: "create",
          status: "danger",
          content: "Tạo điểm quảng cáo thất bại",
        })
      );
      return res.redirect("/department/adplaceManagement");
    }

    let areaId = await checkInput.findAreaIdByWardAndDistrict(
      wardSelectCreateModal,
      districtSelectCreateModal
    );

    let locationTypeId = await checkInput.findLocationTypeIdByLocationType(
      locationTypeSelectCreateModal
    );
    let adTypeId = await checkInput.findAdsTypeIdByAdsType(
      adTypeSelectCreateModal
    );

    try {
      let adPlacementDC = new AdsPlacementDC(
        undefined,
        addressCreateModal,
        undefined,
        lngCreateModal,
        latCreateModal,
        areaId,
        locationTypeId,
        adTypeId,
        undefined
      );
      await AdsPlacementDAO.getInstance().createAdPlacement(adPlacementDC);
      console.log("Kết thúc khởi tạo AdsPlacement");
      req.flash(
        "message",
        JSON.stringify({
          type: "create",
          status: "success",
          content: "Tạo điểm quảng cáo thành công",
        })
      );
      return res.redirect("/department/adplaceManagement");
    } catch (err) {
      console.error(err);
      req.flash(
        "message",
        JSON.stringify({
          type: "create",
          status: "danger",
          content: "Tạo điểm quảng cáo thất bại",
        })
      );
      return res.redirect("/department/adplaceManagement");
    }
  }
  // Khiêm hoàn thành
  async editAdplace(req, res) {
    let editFailed = false;
    let {
      idEditModal,
      districtSelectEditModal,
      wardSelectEditModal,
      addressEditModal,
      locationTypeSelectEditModal,
      adTypeSelectEditModal,
      statusEditModal,
      lngEditModal,
      latEditModal,
    } = req.body;
    console.log(req.body);
    let locationTypeId = await checkInput.findLocationTypeIdByLocationType(
      locationTypeSelectEditModal
    );
    if (editFailed) {
      req.flash("addressCreateModal", addressEditModal);

      req.flash(
        "message",
        JSON.stringify({
          type: "create",
          status: "danger",
          content: "Chỉnh sửa điểm quảng cáo thất bại",
        })
      );
      return res.send("Update Fail");
    }
    let adTypeId = await checkInput.findAdsTypeIdByAdsType(
      adTypeSelectEditModal
    );
    let areaId = await checkInput.findAreaIdByWardAndDistrict(
      wardSelectEditModal,
      districtSelectEditModal
    );
    try {
      let adPlacementDC = new AdsPlacementDC(
        idEditModal,
        addressEditModal,
        statusEditModal,
        lngEditModal,
        latEditModal,
        areaId,
        locationTypeId,
        adTypeId,
        undefined
      );
      await AdsPlacementDAO.getInstance().updateAdPlacement(adPlacementDC);
      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "success",
          content: "Cập nhật điểm quảng cáo thành công",
        })
      );
      return res.send("AdsPlacement updated");
    } catch (err) {
      console.error(err);
      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "danger",
          content: "Cập nhật thất bại",
        })
      );
      return res.send("Can not update AdsPlacement");
    }
  }
  // Khiêm hoàn thành
  async deleteAdplace(req, res) {
    const { adsPlacementId } = req.body;
    console.log("adsPlacementId: ", adsPlacementId);
    try {
      let adsPlacement =
        await AdsPlacementDAO.getInstance().getAdsPlacementById(adsPlacementId);
      AdsPlacementDAO.getInstance().deleteAdPlacement(adsPlacement);
      req.flash(
        "message",
        JSON.stringify({
          type: "delete",
          status: "success",
          content: "Xóa thành công",
        })
      );
      return res.send("Adplacement deleted!");
    } catch (err) {
      console.error(err);
      req.flash(
        "message",
        JSON.stringify({
          type: "delete",
          status: "danger",
          content: "Xóa thất bại",
        })
      );
      return res.send("Can not delete adplacement!");
    }
  }
  // Khiêm hoàn thành
  async getAreas(req, res) {
    let district = req.query.district || "";

    const amount = await Area.count({
      where: district == "" ? {} : { district: district },
    });

    let page = isNaN(req.query.page) ? 1 : parseInt(req.query.page);
    const perPage = 5;

    let areas = await AreaDAO.getInstance().getAllAreas(
      district,
      page,
      perPage
    );
    const [districts] = await sequelize.query(
      `SELECT DISTINCT district FROM Areas`
    );
    const message = req.flash("manageAreaMsg");

    res.render("So/areaManagement.ejs", {
      areas: areas,
      total: amount,
      hasNextPage: perPage * page < amount,
      hasNextNextPage: perPage * (page + 1) < amount,
      hasPreviousPage: page > 1,
      hasPreviousPreviousPage: page - 1 > 1,
      nextPage: page + 1,
      currentPage: page,
      previousPage: page - 1,
      lastPage: Math.ceil((amount * 1.0) / perPage),
      districts,
      currentDistrict: district,
      serverPath: severPath,
      message: message.length == 0 ? null : message[0],
    });
  }
  // Khiêm hoàn thành
  async postEditArea(req, res) {
    try {
      const { id, district, ward, path } = req.body;

      if (!id || !district || !ward) {
        req.flash("manageAreaMsg", "Các trường nhập bị sai hoặc thiếu");
        return res.redirect(path);
      }

      let areaDC = await AreaDAO.getInstance().getAreaById(id);

      const updatedArea = await AreaDAO.getInstance().editArea(areaDC);

      if (updatedArea[0] === 0) {
        req.flash("manageAreaMsg", "Không có trong cơ sở dữ liệu");
        return res.redirect(path);
      }
      req.flash("manageAreaMsg", "Thay đổi thành công");
      res.redirect(path);
    } catch (error) {
      req.flash("manageAreaMsg", "Internal server error.");
      return res.redirect(path);
    }
  }
  // Khiêm hoàn thành
  async postAddArea(req, res) {
    try {
      const { district, ward } = req.body;
      if (!district || !ward) {
        req.flash("manageAreaMsg", "Các trường nhập bị sai hoặc thiếu");
        return res.redirect("/department/areaManagement");
      }

      const existingArea =
        await AreaDAO.getInstance().findAreaByWardAndDistrict(ward, district);
      if (existingArea) {
        req.flash("manageAreaMsg", "Đã tồn tại khu vực");
        return res.redirect("/department/areaManagement");
      }

      await AreaDAO.getInstance().createArea(existingArea);

      req.flash("manageAreaMsg", "Tạo thành công");
      return res.redirect("/department/areaManagement");
    } catch (error) {
      req.flash("manageAreaMsg", "Internal server error.");
      return res.redirect("/department/areaManagement");
    }
  }
  // Khiêm hoàn thành
  async boardManagement(req, res) {
    let message = req.flash("message")[0];
    message = message == null ? null : JSON.parse(message);
    const createErr = {
      error: {
        address: req.flash("addressCreateModalError"),
        height: req.flash("heightCreateModalError"),
        weight: req.flash("weightCreateModalError"),
      },
      value: {
        address: req.flash("addressCreateModal")[0],
        height: req.flash("heightCreateModal")[0],
        weight: req.flash("weightCreateModal")[0],
      },
    };

    let district = req.query.district || "";
    let ward = req.query.ward || "";
    let wards = [],
      currentDistrict = "",
      currentWard = "";
    let search = req.query.search || "";

    if (district.trim() !== "") {
      wards = await Area.findAll({
        where: {
          district,
        },
      });
      currentDistrict = district;
      if (ward.trim() !== "") {
        currentWard = ward;
      }
    }

    const [districts] = await sequelize.query(
      `SELECT DISTINCT district FROM Areas ORDER BY district`
    );

    let page = isNaN(req.query.page) ? 1 : parseInt(req.query.page);
    let flag = false;

    if (message !== null && message.type === "delete") {
      flag = true;
    }

    const boards = await BoardDAO.getInstance().getBoardByOption(
      district,
      ward,
      search
    );

    const currentUrl = req.url.slice(1);
    const boardTypes = await BoardType.findAll();
    const pagination = await getPagination(req, res, boards, 5, page, 2, flag);
    res.render("So/boardManagement.ejs", {
      pagination,
      boards,
      districts,
      wards,
      currentUrl,
      currentDistrict,
      currentWard,
      message,
      createErr,
      boardTypes,
      search,
    });
  }
  // Khiêm hoàn thành
  async createBoard(req, res) {
    const {
      boardTypeSelectCreateModal,
      heightCreateModal,
      weightCreateModal,
      addressCreateSend,
      quantityCreateModal,
    } = req.body;

    let createFailed = false;
    if (
      !checkInput.isNumber(heightCreateModal) ||
      checkInput.isEmpty(heightCreateModal) ||
      parseInt(heightCreateModal) == 0 ||
      parseFloat(heightCreateModal) - parseInt(heightCreateModal) !== 0
    ) {
      req.flash("heightCreateModalError", "Chiều dài không hợp lệ");
      createFailed = true;
    }
    if (
      !checkInput.isNumber(weightCreateModal) ||
      checkInput.isEmpty(weightCreateModal) ||
      parseInt(weightCreateModal) == 0 ||
      parseFloat(weightCreateModal) - parseInt(weightCreateModal) !== 0
    ) {
      req.flash("weightCreateModalError", "Chiều rộng không hợp lệ");
      createFailed = true;
    }
    if (
      !checkInput.isNumber(quantityCreateModal) ||
      checkInput.isEmpty(quantityCreateModal) ||
      parseInt(quantityCreateModal) == 0
    ) {
      req.flash("quantityCreateModalError", "Số lượng trụ không hợp lệ");
      createFailed = true;
    }
    let boardTypeid = await checkInput.findBoardsTyoeIdByBoardType(
      boardTypeSelectCreateModal
    );

    let adPlacementId = await checkInput.findAdplacementByOnlyAddress(
      await checkInput.getFirstPartOfAddress(addressCreateSend)
    );

    if (boardTypeid == null || adPlacementId == null) {
      createFailed = true;
    }

    if (createFailed) {
      req.flash("addressCreateModal", "Địa chỉ không hợp lệ");

      req.flash(
        "message",
        JSON.stringify({
          type: "create",
          status: "danger",
          content: "Tạo bảng quảng cáo thất bại",
        })
      );
      return res.redirect("/department/boardManagement");
    }
    try {
      let boardDC = new BoardDC(
        undefined,
        heightCreateModal + "m x " + weightCreateModal + "m",
        quantityCreateModal,
        boardTypeid,
        adPlacementId
      );
      await BoardDAO.getInstance().createBoard(boardDC);
      req.flash(
        "message",
        JSON.stringify({
          type: "create",
          status: "success",
          content: "Tạo bảng quảng cáo thành công",
        })
      );
    } catch (error) {
      console.log(error);
      req.flash(
        "message",
        JSON.stringify({
          type: "create",
          status: "danger",
          content: "Tạo bảng quảng cáo thất bại",
        })
      );
    }
    return res.redirect("/department/boardManagement");
  }
  // Khiêm hoàn thành
  async editBoard(req, res) {
    const {
      districtSelectEditModal,
      boardTypeSelectEditModal,
      wardSelectEditModal,
      heightEditModal,
      weightEditModal,
      quantityEditModal,
      addressEditSend,
      idEditModal,
    } = req.body;
    let updateFailed = false;
    if (
      !checkInput.isNumber(heightEditModal) ||
      checkInput.isEmpty(heightEditModal) ||
      parseInt(heightEditModal) == 0 ||
      parseFloat(heightEditModal) - parseInt(heightEditModal) !== 0
    ) {
      req.flash("heightEditModalError", "Chiều dài không hợp lệ");
      updateFailed = true;
    }
    if (
      !checkInput.isNumber(weightEditModal) ||
      checkInput.isEmpty(weightEditModal) ||
      parseInt(weightEditModal) == 0 ||
      parseFloat(weightEditModal) - parseInt(weightEditModal) !== 0
    ) {
      req.flash("weightEditModalError", "Chiều rộng không hợp lệ");
      updateFailed = true;
    }

    if (
      !checkInput.isNumber(quantityEditModal) ||
      checkInput.isEmpty(quantityEditModal)
    ) {
      req.flash("quantityEditModalError", "Số lần trụ không hợp lệ");
      updateFailed = true;
    }
    if (checkInput.isEmpty(addressEditSend)) {
      req.flash("addressEditModal_sendError", "Địa điểm không hợp lệ.");
      updateFailed = true;
    }

    let fullAddress = await checkInput.getFullAddressInfo(
      addressEditSend,
      apiKey
    );

    if (checkInput.isEmpty(addressEditSend)) {
      req.flash("addressEditModalError", "Địa điểm không hợp lệ.");
      updateFailed = true;
    }

    const adPlacementId = await checkInput.findAdplacementByOnlyAddress(
      await checkInput.getFirstPartOfAddress(addressEditSend)
    );
    let boardTypeId = await checkInput.findBoardsTyoeIdByBoardType(
      boardTypeSelectEditModal
    );
    if (updateFailed) {
      req.flash("addressEditModal_send", addressEditSend);
      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "danger",
          content: "Cập nhật bảng quảng cáo thất bại",
        })
      );
      return res.send("Update Fail");
    }
    try {
      let boardDC = new BoardDC(
        idEditModal,
        heightEditModal + "m x " + weightEditModal + "m",
        quantityEditModal + " trụ/bảng",
        parseInt(boardTypeId),
        adPlacementId
      );
      await BoardDAO.getInstance().updateBoard(boardDC);
      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "success",
          content: "Cập nhật bảng quảng cáo thành công",
        })
      );
      return res.send("Board updated");
    } catch (err) {
      console.error(err);
      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "danger",
          content: "Cập nhật bảng quảng không thành công",
        })
      );
      return res.send("Can not update board");
    }
  }
  // Khiêm hoàn thành
  async deleteBoard(req, res) {
    const { boardId } = req.body;

    try {
      let boardDC = await BoardDAO.getInstance().getBoardById(boardId);
      await BoardDAO.getInstance().deleteBoard(boardDC);
      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "success",
          content: "Xóa thành công",
        })
      );
      return res.send("Board deleted!");
    } catch (err) {
      console.error(err);
      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "danger",
          content: "Xóa thất bại",
        })
      );
      return res.send("Can not delete board!");
    }
  }
  // Khiêm hoàn thành
  async adTypeManagement(req, res) {
    let message = req.flash("message")[0];
    message = message == null ? null : JSON.parse(message);
    const createErr = {
      error: {
        Name: req.flash("nameCreateModalError"),
      },
      value: {
        Name: req.flash("nameCreateModal")[0],
      },
    };
    const optionAdTypes = {
      attributes: ["id", "type"],
      include: [
        {
          model: AdsPlacement,
          attributes: ["id", "address"],
        },
      ],
    };

    let page = isNaN(req.query.page) ? 1 : parseInt(req.query.page);
    let flag = false;

    if (message !== null && message.type === "delete") {
      flag = true;
    }
    const AdTypes = await AdsTypeDAO.getInstance().getAdTypeByOptions(
      optionAdTypes
    );

    const currentUrl = req.url.slice(1);
    const pagination = await getPagination(req, res, AdTypes, 5, page, 2, flag);
    res.render("So/adTypeManagement.ejs", {
      pagination,
      AdTypes,
      currentUrl,
      createErr,
      message,
    });
  }
  // Khiêm hoàn thành
  async createAdType(req, res) {
    const { nameCreateModal } = req.body;

    let createFailed = false;
    if (checkInput.isEmpty(nameCreateModal)) {
      createFailed = true;
      req.flash("nameCreateModalError", "Tên bị bỏ trống!");
    }
    if (await checkInput.isDuplicateAdType(nameCreateModal)) {
      createFailed = true;
      req.flash("nameCreateModalError", "Loại quảng cáo đã tồn tại!");
    }
    if (createFailed) {
      req.flash("nameCreateModal", nameCreateModal);
      return res.redirect("/department/adTypeManagement");
    }
    try {
      let adTypeDC = new AdsTypeDC(undefined, nameCreateModal);
      await AdsTypeDAO.getInstance().createAdType(adTypeDC);
      req.flash(
        "message",
        JSON.stringify({
          type: "create",
          status: "success",
          content: "Tạo thành công!",
        })
      );
    } catch (err) {
      console.error(err);
      req.flash(
        "message",
        JSON.stringify({
          type: "create",
          status: "danger",
          content: "Tạo thất bại",
        })
      );
    }
    return res.redirect("/department/adTypeManagement");
  }
  // Khiêm hoàn thành
  async editAdType(req, res) {
    const { idEditModal, nameEditModal } = req.body;

    if (await checkInput.isDuplicateAdType(nameEditModal)) {
      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "danger",
          content: "Cập nhật loại điểm quảng cáo thất bại",
        })
      );
      return res.send("Update Fail");
    }
    try {
      let adTypeDC = new AdsTypeDC(idEditModal, nameEditModal);
      await AdsTypeDAO.getInstance().updateAdType(adTypeDC);
      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "success",
          content: "Cập nhật loại điểm quảng cáo thành công",
        })
      );
      return res.send("AdsType updated");
    } catch (err) {
      console.error(err);
      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "danger",
          content: "Cập nhật thất bại",
        })
      );
      return res.send("Can not update AdsType");
    }
  }
  // Khiêm hoàn thành
  async deleteAdType(req, res) {
    const { adTypeId } = req.body;
    try {
      let adTypeDC = await AdsTypeDAO.getInstance().getAdTypeById(adTypeId);
      await AdsTypeDAO.getInstance().deleteAdType(adTypeDC);

      req.flash(
        "message",
        JSON.stringify({
          type: "delete",
          status: "success",
          content: "Xóa loại quảng cáo thành công",
        })
      );

      return res.send("AdType deleted");
    } catch (err) {
      console.error(err);

      req.flash(
        "message",
        JSON.stringify({
          type: "delete",
          status: "danger",
          content: "Xóa loại quảng cáo thất bại",
        })
      );

      return res.send("Can not delete AdType");
    }
  }
  // Khiêm hoàn thành
  async locationTypeManagement(req, res) {
    let message = req.flash("message")[0];
    message = message == null ? null : JSON.parse(message);
    const createErr = {
      error: {
        Name: req.flash("nameCreateModalError"),
      },
      value: {
        Name: req.flash("nameCreateModal")[0],
      },
    };
    const optionLocationTypes = {
      attributes: ["id", "locationType"],
      include: [
        {
          model: AdsPlacement,
          attributes: ["id", "address"],
        },
      ],
    };

    let page = isNaN(req.query.page) ? 1 : parseInt(req.query.page);
    let flag = false;

    if (message !== null && message.type === "delete") {
      flag = true;
    }
    const LocationTypes =
      await LocationTypeDAO.getInstance().getLocationTypeByOptions(
        optionLocationTypes
      );

    const currentUrl = req.url.slice(1);
    const pagination = await getPagination(
      req,
      res,
      LocationTypes,
      5,
      page,
      2,
      flag
    );
    res.render("So/locationTypeManagement.ejs", {
      pagination,
      LocationTypes,
      currentUrl,
      createErr,
      message,
    });
  }
  // Khiêm hoàn thành
  async createLocationType(req, res) {
    const { nameCreateModal } = req.body;
    let createFailed = false;
    if (checkInput.isEmpty(nameCreateModal)) {
      createFailed = true;
      req.flash("nameCreateModalError", "Tên bị bỏ trống!");
    }
    if (await checkInput.isDuplicateLocationType(nameCreateModal)) {
      createFailed = true;
      req.flash("nameCreateModalError", "Loại địa điểm đã tồn tại!");
    }
    if (createFailed) {
      req.flash("nameCreateModal", nameCreateModal);
      return res.redirect("/department/locationTypeManagement");
    }
    try {
      let locationTypeDC = new LocationTypeDC(undefined, nameCreateModal);
      await LocationTypeDAO.getInstance().createLocationType(locationTypeDC);
      req.flash(
        "message",
        JSON.stringify({
          type: "create",
          status: "success",
          content: "Tạo thành công!",
        })
      );
    } catch (err) {
      console.error(err);
      req.flash(
        "message",
        JSON.stringify({
          type: "create",
          status: "danger",
          content: "Tạo thất bại",
        })
      );
    }
    return res.redirect("/department/locationTypeManagement");
  }
  // Khiêm hoàn thành
  async editLocationType(req, res) {
    const { idEditModal, nameEditModal } = req.body;

    if (await checkInput.isDuplicateLocationType(nameEditModal)) {
      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "danger",
          content: "Cập nhật loại địa điểm thất bại",
        })
      );
      return res.send("Update Fail");
    }

    try {
      let locationTypeDC = new LocationTypeDC(idEditModal, nameEditModal);
      await LocationTypeDAO.getInstance().updateLocationType(locationTypeDC);
      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "success",
          content: "Cập nhật loại địa điểm thành công",
        })
      );

      return res.send("LocationType updated");
    } catch (err) {
      console.error(err);
      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "danger",
          content: "Cập nhật thất bại",
        })
      );

      return res.send("Can not update LocationType");
    }
  }
  // Khiêm hoàn thành
  async deleteLocationType(req, res) {
    const { locationTypeId } = req.body;

    try {
      let locationTypeDC =
        await LocationTypeDAO.getInstance().getLocationTypeById(locationTypeId);
      const adPlacements = await AdsPlacement.findAll({
        where: {
          LocationTypeId: locationTypeId,
        },
      });
      await LocationTypeDAO.getInstance().deleteLocationType(locationTypeDC);

      req.flash(
        "message",
        JSON.stringify({
          type: "delete",
          status: "success",
          content: "Xóa loại địa điểm thành công",
        })
      );

      return res.send("LocationType deleted");
    } catch (err) {
      console.error(err);

      req.flash(
        "message",
        JSON.stringify({
          type: "delete",
          status: "danger",
          content: "Xóa loại địa điểm thất bại",
        })
      );

      return res.send("Can not delete LocationType");
    }
  }
  // Khiêm hoàn thành
  async boardTypeManagement(req, res) {
    let message = req.flash("message")[0];
    message = message == null ? null : JSON.parse(message);
    const createErr = {
      error: {
        Name: req.flash("nameCreateModalError"),
      },
      value: {
        Name: req.flash("nameCreateModal")[0],
      },
    };
    const optionBoardTypes = {
      attributes: ["id", "type"],
      include: [
        {
          model: Board,
          attributes: ["id", "size"],
        },
      ],
    };

    let page = isNaN(req.query.page) ? 1 : parseInt(req.query.page);
    let flag = false;

    if (message !== null && message.type === "delete") {
      flag = true;
    }
    const BoardTypes = await BoardTypeDAO.getInstance().getBoardTypeByOptions(
      optionBoardTypes
    );

    const currentUrl = req.url.slice(1);
    const pagination = await getPagination(
      req,
      res,
      BoardTypes,
      5,
      page,
      2,
      flag
    );
    res.render("So/boardTypeManagement.ejs", {
      pagination,
      BoardTypes,
      currentUrl,
      createErr,
      message,
    });
  }
  // Khiêm hoàn thành
  async createBoardType(req, res) {
    const { nameCreateModal } = req.body;

    let createFailed = false;
    if (checkInput.isEmpty(nameCreateModal)) {
      createFailed = true;
      req.flash("nameCreateModalError", "Tên bị bỏ trống!");
    }
    if (await checkInput.isDuplicateBoardType(nameCreateModal)) {
      createFailed = true;
      req.flash("nameCreateModalError", "Loại biển quảng cáo đã tồn tại!");
    }
    if (createFailed) {
      req.flash("nameCreateModal", nameCreateModal);
      return res.redirect("/department/boardTypeManagement");
    }
    try {
      let boardTypeDC = new BoardTypeDC(undefined, nameCreateModal);
      await BoardTypeDAO.getInstance().createBoardType(boardTypeDC);
      req.flash(
        "message",
        JSON.stringify({
          type: "create",
          status: "success",
          content: "Tạo thành công!",
        })
      );
    } catch (err) {
      console.error(err);
      req.flash(
        "message",
        JSON.stringify({
          type: "create",
          status: "danger",
          content: "Tạo thất bại",
        })
      );
    }
    return res.redirect("/department/boardTypeManagement");
  }
  // Khiêm hoàn thành
  async editBoardType(req, res) {
    const { idEditModal, nameEditModal } = req.body;

    if (await checkInput.isDuplicateBoardType(nameEditModal)) {
      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "danger",
          content: "Cập nhật loại bảng quảng cáo thất bại",
        })
      );
      return res.send("Update Fail");
    }

    try {
      let boardTypeDC = new BoardTypeDC(idEditModal, nameEditModal);
      await BoardTypeDAO.getInstance().updateBoardType(boardTypeDC);
      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "success",
          content: "Cập nhật loại bảng quảng cáo thành công",
        })
      );

      return res.send("BoardType updated");
    } catch (err) {
      console.error(err);
      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "danger",
          content: "Cập nhật thất bại",
        })
      );

      return res.send("Can not update BoardType");
    }
  }
  // Khiêm hoàn thành
  async deleteBoardType(req, res) {
    const { boardTypeId } = req.body;

    try {
      let boardTypeDC = await BoardTypeDAO.getInstance().getBoardTypeById(
        boardTypeId
      );
      await BoardTypeDAO.getInstance().deleteBoardType(boardTypeDC);
      req.flash(
        "message",
        JSON.stringify({
          type: "delete",
          status: "success",
          content: "Xóa loại bảng quảng cáo thành công",
        })
      );

      return res.send("BoardType deleted");
    } catch (err) {
      console.error(err);

      req.flash(
        "message",
        JSON.stringify({
          type: "delete",
          status: "danger",
          content: "Xóa loại bảng quảng cáo thất bại",
        })
      );

      return res.send("Can not delete BoardType");
    }
  }

  // Nhân
  async reportTypeManagement(req, res) {
    let message = req.flash("message")[0];
    message = message == null ? null : JSON.parse(message);
    const createErr = {
      error: {
        Name: req.flash("nameCreateModalError"),
      },
      value: {
        Name: req.flash("nameCreateModal")[0],
      },
    };
    const optionReportTypes = {
      attributes: ["id", "type"],
      include: [
        {
          model: Report,
          attributes: ["id"], // Thay thế bằng các thuộc tính của Report mà bạn muốn hiển thị
        },
      ],
    };
    let search = req.query.search || "";

    let page = isNaN(req.query.page) ? 1 : parseInt(req.query.page);
    let flag = false;

    if (message !== null && message.type === "delete") {
      flag = true;
    }
    const ReportTypes = await ReportType.findAll(optionReportTypes);
    // Khởi tạo mảng để lưu trữ reportsCount
    const reportsCounts = [];

    for (const reportType of ReportTypes) {
      const reportsCount = await Report.count({
        where: {
          ReportTypeId: reportType.id,
        },
      });

      reportType.setDataValue("reportsCount", reportsCount);

      // Lưu giá trị reportsCount vào mảng
      reportsCounts.push(reportsCount);
    }

    // Gán mảng reportsCounts vào mỗi phần tử của ReportTypes
    ReportTypes.forEach((reportType, index) => {
      reportType.setDataValue("reportsCounts", reportsCounts[index]);
    });

    const currentUrl = req.url.slice(1);
    const pagination = await getPagination(
      req,
      res,
      ReportTypes,
      5,
      page,
      2,
      flag
    );

    res.render("So/reportTypeManagement.ejs", {
      pagination,
      ReportTypes,
      currentUrl,
      createErr,
      message,
    });
  }

  async createReportType(req, res) {
    const { nameCreateModal } = req.body;

    let createFailed = false;
    if (checkInput.isEmpty(nameCreateModal)) {
      createFailed = true;
      req.flash("nameCreateModalError", "Tên bị bỏ trống!");
    }
    if (await checkInput.isDuplicateReportType(nameCreateModal)) {
      createFailed = true;
      req.flash("nameCreateModalError", "Loại báo cáo đã tồn tại!");
    }
    if (createFailed) {
      req.flash("nameCreateModal", nameCreateModal);
      return res.redirect("/department/reportTypeManagement");
    }
    try {
      await ReportType.create({
        type: nameCreateModal,
      });
      req.flash(
        "message",
        JSON.stringify({
          type: "create",
          status: "success",
          content: "Tạo thành công!",
        })
      );
    } catch (err) {
      console.error(err);
      req.flash(
        "message",
        JSON.stringify({
          type: "create",
          status: "danger",
          content: "Tạo thất bại",
        })
      );
    }
    return res.redirect("/department/reportTypeManagement");
  }

  async editReportType(req, res) {
    const { idEditModal, nameEditModal } = req.body;

    if (await checkInput.isDuplicateReportType(nameEditModal)) {
      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "danger",
          content: "Cập nhật loại báo cáo thất bại",
        })
      );
      return res.send("Update Fail");
    }

    try {
      await ReportType.update(
        {
          type: nameEditModal,
        },
        {
          where: {
            id: idEditModal,
          },
        }
      );

      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "success",
          content: "Cập nhật loại báo cáo thành công",
        })
      );

      return res.send("ReportType updated");
    } catch (err) {
      console.error(err);

      req.flash(
        "message",
        JSON.stringify({
          type: "edit",
          status: "danger",
          content: "Cập nhật thất bại",
        })
      );

      return res.send("Can not update ReportType");
    }
  }

  async deleteReportType(req, res) {
    const { reportTypeId } = req.body;

    try {
      // Delete Reports associated with the ReportType
      await Report.destroy({
        where: {
          ReportTypeId: reportTypeId,
        },
      });

      // Finally, delete the ReportType itself
      await ReportType.destroy({
        where: {
          id: reportTypeId,
        },
      });

      req.flash(
        "message",
        JSON.stringify({
          type: "delete",
          status: "success",
          content: "Xóa loại báo cáo thành công",
        })
      );

      return res.send("ReportType deleted");
    } catch (err) {
      console.error(err);

      req.flash(
        "message",
        JSON.stringify({
          type: "delete",
          status: "danger",
          content: "Xóa loại báo cáo thất bại",
        })
      );

      return res.send("Can not delete ReportType");
    }
  }

  async viewEditAdplaceRequest(req, res) {
    const page = isNaN(req.query.page) ? 1 : parseInt(req.query.page);
    const district = req.query.district || "";
    const ward = req.query.ward || "";
    const currentStatus = req.query.status || "";
    let whereCondition = {};

    let wards = [],
      currentDistrict = "",
      currentWard = "";
    if (district.trim() !== "") {
      wards = await Area.findAll({
        where: {
          district,
        },
      });
      whereCondition.district = district;
      currentDistrict = district;
      if (ward.trim() !== "") {
        currentWard = ward;
        whereCondition.ward = ward;
      }
    }
    const status = ["Chờ phê duyệt", "Đã được duyệt", "Bị từ chối"];

    const [districts] = await sequelize.query(
      `SELECT DISTINCT district FROM Areas`
    );

    let adsPlacementRequests;

    if (currentStatus !== "") {
      adsPlacementRequests = await AdsPlacementRequest.findAll({
        include: [
          {
            model: Account,
            attributes: ["firstName", "lastName", "type", "email"],
          },
          {
            model: AdsPlacement,
            include: [
              {
                model: Area,
                where: whereCondition,
                attributes: ["ward", "district"],
                required: true,
              },
            ],
            required: true,
          },
          LocationType,
          AdsType,
        ],
        where: {
          requestStatus: currentStatus,
        },
      });
    } else {
      adsPlacementRequests = await AdsPlacementRequest.findAll({
        include: [
          {
            model: Account,
            attributes: ["firstName", "lastName", "type", "email"],
          },
          {
            model: AdsPlacement,
            include: [
              {
                model: Area,
                where: whereCondition,
                attributes: ["ward", "district"],
                required: true,
              },
            ],
            required: true,
          },
          LocationType,
          AdsType,
        ],
      });
    }

    const adsPlacementRequestsPerPage = 5;
    let pagination = await getPagination(
      req,
      res,
      adsPlacementRequests,
      adsPlacementRequestsPerPage,
      page
    );
    const currentUrl = req.url.slice(1);

    return res.render("So/acceptOrDenyEditAdsPlacementRequest.ejs", {
      formatDate: (date) => {
        return date.toLocaleDateString({
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      },
      pagination,
      currentUrl,
      districts,
      wards,
      currentDistrict,
      currentWard,
      status,
      currentStatus,
    });
  }

  async acceptOrDenyEditAdplaceRequest(req, res) {
    console.log(req.body);

    const {
      adsplacementId,
      adPlacecRequestId,
      result,
      address,
      area,
      adsType,
      locationType,
      status,
      reason,
      areaId,
      locationTypeId,
      adTypeId,
    } = req.body;
    if (result == "Chấp nhận") {
      await AdsPlacement.update(
        {
          AreaId: areaId,
          address: address,
          LocationTypeId: locationTypeId,
          AdsTypeId: adTypeId,
          status: status,
        },
        {
          where: {
            id: adsplacementId,
          },
        }
      );
      await AdsPlacementRequest.update(
        {
          requestStatus: "Đã được duyệt",
        },
        {
          where: {
            id: adPlacecRequestId,
          },
        }
      );
      return res.json({ status: "Success" });
    } else {
      await AdsPlacementRequest.update(
        {
          requestStatus: "Bị từ chối",
        },
        {
          where: {
            id: adPlacecRequestId,
          },
        }
      );
      return res.json({ status: "Fail" });
    }
  }
}
module.exports = DepartmentController;
