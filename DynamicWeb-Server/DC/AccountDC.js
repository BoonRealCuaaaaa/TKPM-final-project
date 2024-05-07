

class AccountDC {
    constructor(id, firstName, lastName, username, password, type, email, birth, phone, otp, expiredOtp, area = null) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.password = password;
        this.type = type;
        this.email = email; 
        this.birth = birth; 
        this.phone = phone; 
        this.otp = otp; 
        this.expiredOtp = expiredOtp; 
        this.Area = area;
    }
}

exports.AccountDC = AccountDC;