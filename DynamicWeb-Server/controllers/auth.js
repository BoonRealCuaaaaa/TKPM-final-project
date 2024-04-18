const bcrypt = require("bcrypt");
const { Account, Area } = require("../models");
const Mailjet = require("node-mailjet");
const Sequelize = require("sequelize");
const checkInput = require("../util/checkInput");

const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC || "5f453b57b69003f11cdbd0d46c363385",
  apiSecret:
    process.env.MJ_APIKEY_PRIVATE || "b7af7b365498a7f77d1270fb86fa5826",
});

const getForgetPassword = (req, res, next) => {
  console.log("getForgetPwd");
  res.render("auth/forgetPassword.ejs", {
    errorMessage: req.flash("forgetPwError"),
  });
};

const postForgetPassword = async (req, res, next) => {
  console.log("post forget pwd");
  const usernameOrEmail = req.body.email;
  const account = await Account.findOne({
    where: {
      [Sequelize.Op.or]: {
        username: usernameOrEmail,
        email: usernameOrEmail,
      },
    },
  });
  if (!account) {
    req.flash("forgetPwError", "Không tồn tại tài khoản, vui lòng nhập lại");
    // return res.redirect("/forget-password");
    return res.json({ redirect: "/forget-password" });
  }

  const email = account.email;
  let otp = "";
  for (let i = 0; i < 6; i++) {
    const randomDigit = Math.floor(Math.random() * 10);
    otp += randomDigit.toString();
  }

  let currentTime = new Date();

  account.otp = otp;
  account.expiredOtp = currentTime.setMinutes(currentTime.getMinutes() + 30);

  await account.save();

  const request = await mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: "hiiback0608@gmail.com",
          Name: "Sở văn hóa và du lịch",
        },
        To: [
          {
            Email: email,
            Name: email,
          },
        ],
        TemplateID: 5332254,
        Subject: "Password reset",
        TemplateLanguage: true,
        Variables: {
          otp_code: otp,
        },
      },
    ],
  });
  const id = account.id;
  return res.json({ redirect: `/otp-waiting?account=${id}` });
  // res.redirect(`/otp-waiting?account=${id}`);
};

const getOtpWaiting = (req, res, next) => {
  const accountId = req.query.account;

  res.render("auth/otpWaiting.ejs", {
    accountId: accountId,
    errorMessage: req.flash("otpError"),
  });
};

const postOtpWaiting = async (req, res, next) => {
  console.log(req.body);
  const accountId = req.body.account;
  const inputOtp = req.body.otp;
  console.log(accountId);

  const account = await Account.findOne({ where: { id: accountId } });
  console.log(account);
  if (!account) return res.status(400).json({ message: "Account not found!" });
  // check OTP
  if (new Date() > account.expiredOtp) {
    req.flash("forgetPwError", "OTP đã hết hạn");
    returnres.json({ redirect: "/forget-password" });
  }
  if (inputOtp != account.otp) {
    req.flash("otpError", "OTP không đúng, vui lòng thử lại");
    return res.json({ redirect: `/otp-waiting?account=${accountId}` });
  } else {
    return res.json({
      redirect: `/reset-password?account=${accountId}&otp=${inputOtp}`,
    });
  }
};

const getResetPassword = (req, res, next) => {
  const accountId = req.query.account;
  const otp = req.query.otp;
  const errorMessage=req.flash('resetPasswordMsg')
  res.render("auth/resetPassword.ejs", { accountId: accountId, otp: otp,errorMessage:errorMessage });
};

const postResetPassword = async (req, res, next) => {
  const accountId = req.body.account;
  const newPassword = req.body.password;
  const otp = req.body.otp;

  const account = await Account.findOne({ where: { id: accountId } });
  if (!account) return res.status(400);
  if (account.otp == otp) {
    const hashedPassword=await bcrypt.hash(newPassword,12)
    account.password = hashedPassword;
    await account.save();
    req.flash("resetPasswordMsg","Đặt lại mật khẩu thành công")
    res.redirect("/");
  } else{
    req.flash("resetPasswordMsg","Sai mã OTP")
    res.redirect('/reset-password')
  }

};

const getLogin = async (req, res) => {
  const nextUrl = req.query.nextUrl || "";
  if (req.user) {
    if (nextUrl.trim() !== "") {
      return res.redirect(nextUrl);
    } else if (req.user.type.toUpperCase() === "SO") {
      return res.redirect("/department/accountManagement");
    } else if (req.user.type.toUpperCase() === "QUAN") {
      return res.redirect("/district/home");
    } else if (req.user.type.toUpperCase() === "PHUONG") {
      return res.redirect("/ward/home");
    }
  }


  const error = req.flash("error")[0];
  console.log("Error: ", error);
  const message = (error != null || typeof error === 'object') ? JSON.parse(error) : null;
  const resetPwMessage=req.flash("resetPasswordMsg");
  res.render("index", {
    message,
    resetPwMessage,
    nextUrl
  });
};

const postLogin = async (req, res) => {
  req.session.accountId = req.user.id;
  const nextUrl = req.session.nextUrl || "";
  if (req.user.type === 'So') {
    req.session.accountType = 'department';
  } else if (req.user.type === 'Quan') {
    req.session.accountDistrict = req.user.Area.district;
    req.session.accountType = 'district';
  } else if (req.user.type === 'Phuong') {
    req.session.accountWard = req.user.Area.ward;
    req.session.accountDistrict = req.user.Area.district;
    req.session.accountType = 'ward'; 
  }

  if (nextUrl.trim() !== '') {
    res.redirect(nextUrl);
  }
  else if (req.user.type === 'So') {
      res.redirect("/department/accountManagement");
  }
  else if (req.user.type === 'Quan') {
      res.redirect("/district/home");
  }
  else if (req.user.type === 'Phuong') {
      res.redirect("/ward/home");
  }
};

const getLogout = (req, res) => {
  req.session.destroy((err) => {
    console.error(err);
    res.redirect("/");
  });
};

const getChangePassword = (req, res) => {
  // return res.render("switchToLogin.ejs");
  let errorChangePassword = req.flash("errorChangePassword")[0];
  errorChangePassword = errorChangePassword != null ? JSON.parse(errorChangePassword) : null;
  return res.render("changePassword.ejs", {
    accountType : req.user.type,
    selectedId: req.session.selectedAdsplacementId,
    errorChangePassword
  });
}

const postChangePassword = async (req, res) => {
  const {currentPassword, newPassword, confirmNewPassword} = req.body;
  try {
    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      req.flash("errorChangePassword", JSON.stringify({ flag: "currentPassword", content: "Mật khẩu hiện tại không đúng "}));
      return res.redirect("/changePassword");
    }

    if (!checkInput.isValidPassword(newPassword)) {
      req.flash("errorChangePassword", JSON.stringify({ flag: "newPassword", content: "Mật khẩu hiện tại quá yếu "}));
      return res.redirect("/changePassword");
    }

    if (newPassword !== confirmNewPassword) {
      req.flash("errorChangePassword", JSON.stringify({ flag: "confirmNewPassword", content: "Mật khẩu xác nhận không trùng với mật khẩu mới"}));
      return res.redirect("/changePassword");
    }
    
    const newHashPassword = await bcrypt.hash(newPassword, 12);
    await Account.update(
      {password: newHashPassword},
      {where: {id: req.user.id}}
    )

    req.session.destroy((err) => {
      console.error(err);
    });
    return res.render("switchToLogin.ejs", {
      switchToLoginMessage: "Đổi mật khẩu thành công",
    });


  } catch(err) {
    console.error(err);
    req.flash("errorChangePassword", JSON.stringify({ flag: "serverError", content: "Đổi mật khẩu thất bại"}))
    return res.redirect("/changePassword");
  }
}

const changeInfor = (req, res) => {
  return res.render("changeInfor.ejs", {
    tab: "Chỉnh sửa thông tin",
  });
}

const updateInfor = async (req, res) => {
  let {name, birth, email, phone} = req.body;
  let listName = name.split(" ");
  try {
    await Account.update({
      firstName: listName.pop(),
      lastName: listName.join(" "),
      birth: birth,
      email: email,
      phone: phone
    }, {where: {id: req.user.id}});
    res.redirect('back');
  } catch (error) {
    res.send("Cập nhật thông tin tài khoản thất bại");
    console.error(error);
  }
}

module.exports = {
  getForgetPassword,
  getLogin,
  postLogin,
  getLogout,
  getChangePassword,
  postChangePassword,
  changeInfor,
  getOtpWaiting,
  postForgetPassword,
  getResetPassword,
  postOtpWaiting,
  postResetPassword,
  updateInfor,
};
