const {
    Account,
    Area
} = require("../models");

const { AccountDC } = require("../DC/AccountDC");
const { AreaDC } = require("../DC/AreaDC");

class AccountDAO {
    static instance = null;
    constructor() { }

    static getInstance() {
        if (this.instance == null) {
            this.instance = new AccountDAO();
        }

        return this.instance;
    }

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
}

module.exports.AccountDAO = AccountDAO;