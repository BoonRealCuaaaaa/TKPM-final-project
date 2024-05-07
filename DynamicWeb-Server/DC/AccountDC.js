
class AccountDC {
    constructor(id, firstName, lastName, userName, type, email, birth, phone, otp, expiredOtp, area) {
        Object.assign(this, {
            id, 
            firstName, 
            lastName, 
            userName, 
            type, 
            email, 
            birth, 
            phone, 
            otp, 
            expiredOtp,
            area
        });
    }
}

exports.AccountDC = AccountDC;