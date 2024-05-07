"use strict"

const { AccountDC } = require("../DC/AccountDC");
const { AreaDC } = require("../DC/AreaDC");
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
const { Op } = require("sequelize");


class AccountDAO {
    static instance = null;
    static getInstance() {
        if (AccountDAO.instance == null) {
            AccountDAO.instance = new AccountDAO(); 
        }
        return AccountDAO.instance;
    }

    constructor() {}

    
    static async findOneById(id) {
      const account = await Account.findOne({
          where: { id: id },
          include: [
              {
                  model: Area,
                  required: true
              }
          ]
      })

      return new AccountDC(
          account.id,
          account.firstName,
          account.lastName,
          account.userName,
          account.type,
          account.email,
          account.birth,
          account.phone,
          account.otp,
          account.expiredOtp,
          new AreaDC(account.Area.id, account.Area.ward, account.Area.district),
      );
  }

    async findAccountsByDistrictAndWard(accountId, district = "", ward = "") {
        const options = {
            attributes: ["id", "firstName", "lastName", "email", "type"],
            where: {
              id: { [Op.ne]: accountId },
            },
            include: [
              {
                model: Area,
                attributes: ["id", "district", "ward"],
                where: {},
              },
            ],
          };
          if (district.trim() !== "") {
            options.include[0].where.district = district;
            options.where = {
              [Op.or]: [{ type: "Quan" }, { type: "Phuong" }],
            };
      
            if (ward.trim() !== "") {
              options.include[0].where.ward = ward;
              options.where = {
                type: "Phuong",
              };
            }
          }
        let accounts = await Account.findAll(options);
        return accounts.map((account) => {
            return new AccountDC(account.id, account.firstName, account.lastName, account.username, account.type, account.email, account.birth, account.phone, account.otp, account.expiredOtp, account.Area);
        })
    }

    async createAccount({firstName, lastName, username, email, password, type,
      birth, phone, areaId}) {
        await Account.create({ firstName, lastName, username, email, password, type,
            birth, phone, AreaId: areaId,});
    }

    async assignAreaForAccountById({accountId, accountType, areaId}) {
      await Account.update(
        { type: accountType, AreaId: areaId },
        { where: { id: accountId } }
      );
    }

    async deleteAccountById({accountId}) {
      await Account.destroy({ where: { id: accountId } });
    }

}
exports.AccountDAO = AccountDAO;