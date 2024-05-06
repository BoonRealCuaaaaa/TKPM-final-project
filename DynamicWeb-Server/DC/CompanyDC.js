class CompanyDC {
    constructor(id, name, phone, address, email) {
      Object.assign(this, {
        id,
        name,
        phone,
        address,
        email
      });
    }
  }
  
  exports.CompanyDC = CompanyDC;