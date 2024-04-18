const { Account } = require("../models");
const { AdsPlacement } = require("../models");
const { AdsType } = require("../models");
const { Area } = require("../models");
const { LocationType } = require("../models");
const { BoardType } = require("../models");
const { ReportType } = require("../models");
const { Op } = require("sequelize");

function isEmpty(input) {
  if (input) {
    return input.trim().length === 0;
  }
  return true;
}

async function phoneExists(phone) {
  const account = await Account.findOne({
    where: {
      phone,
    },
  });
  if (account) {
    return true;
  }
  return false;
}

function isEmail(email) {
  const emailRegExp = new RegExp(
    "^[a-zA-z0-9!@#$%^*()&_-~]+@[a-zA-z0-9!@#$%^*()&_-~]+\\.[a-z]{2,}$"
  );
  if (email.match(emailRegExp) != null) {
    return true;
  }
  return false;
}

async function emailExists(email) {
  const account = await Account.findOne({
    where: {
      email,
    },
  });
  if (account) {
    return true;
  }
  return false;
}

async function usernameExists(username) {
  const account = await Account.findOne({
    where: {
      username,
    },
  });
  if (account) {
    return true;
  }
  return false;
}

function isValidPassword(password) {
  let count = 0;
  if (password.match(/\w+/g) != null) {
    count += 1;
  }
  if (password.length > 5) {
    if (password.match(/\d+/g) != null) {
      count += 1;
    }
    if (password.match(/[!,@,#,$,%,^,*,(,),&,_,-,~]/g) != null) {
      count += 1;
    }
  }
  if (count <= 1) {
    return false;
  }
  return true;
}

function isValidConfirmPassword(confirmPassword, password) {
  return confirmPassword === password;
}
function isNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

async function getLatLongFromAddress(address, apiKey) {
  const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  const response = await fetch(apiUrl);
  const data = await response.json();

  if (data.results && data.results.length > 0) {
    const { lat, lng: lon } = data.results[0].geometry;

    if (isNumber(lat) && isNumber(lon)) {
      return { lat, lon };
    }
  }

  return false;
}

async function getLatLongFromAdplaceId(id) {
  const adPlace = await AdsPlacement.findOne({
    where: {
      id: id,
    },
  });
  if (adPlace) {
    return { lat: adPlace.lat, lon: adPlace.long };
  }
  return false;
}

async function getFullAddressInfo(address, apiKey) {
  const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  const response = await fetch(apiUrl);
  const data = await response.json();

  if (data.results && data.results.length > 0) {
    const fullAddress = data.results[0].formatted;

    if (fullAddress) {
      return fullAddress;
    }
  }

  return false;
}

async function getDistrictFromAdress(address) {
  const districtInfo = address.match(/(Quận|Huyện)\s(.*?),/);

  if (districtInfo && districtInfo[1] && districtInfo[2]) {
    const districtType = districtInfo[1].trim();
    const districtName = districtInfo[2].trim();
    return districtType + " " + districtName;
  } else {
    return null;
  }
}

async function isDuplicateAddress(address) {
  const existingAdplace = await AdsPlacement.findOne({
    where: {
      address: address,
    },
  });
  return existingAdplace !== null; // Trả về true nếu đã tồn tại, ngược lại là false
}

async function isDuplicateLongLat(long, lat) {
  const existingAdplace = await AdsPlacement.findOne({
    where: {
      long: long,
      lat: lat,
    },
  });
  return existingAdplace !== null;
}

async function findAreaIdByWardAndDistrict(ward, district) {
  try {
    const result = await Area.findOne({
      where: {
        ward: ward,
        district: district,
      },
      attributes: ["id"],
    });

    return result ? result.id : null;
  } catch (error) {
    console.error("Error finding Area ID by Ward and District:", error);
    throw error;
  }
}

async function findLocationTypeIdByLocationType(locationType) {
  try {
    const result = await LocationType.findOne({
      where: {
        locationType: locationType,
      },
      attributes: ["id"],
    });
    return result ? result.id : null;
  } catch (error) {
    console.error("Error finding Location Type ID by Location Type:", error);
    throw error;
  }
}

async function findAdsTypeIdByAdsType(adType) {
  const result = await AdsType.findOne({
    where: {
      type: adType,
    },
    attributes: ["id"],
  });
  return result ? result.id : null;
}

async function findBoardsTyoeIdByBoardType(boardType) {
  const result = await BoardType.findOne({
    where: {
      type: boardType,
    },
    attributes: ["id"],
  });
  return result ? result.id : null;
}
function getFirstPartOfAddress(address) {
  // Use split to separate the string by commas
  var addressArray = address.split(",");

  // Get the first element and trim to remove whitespaces
  var firstPart = addressArray[0].trim();
  return firstPart;
}
async function findAdplacementByOnlyAddress(address) {
  const result = await AdsPlacement.findOne({
    where: {
      address: address,
    },
    attributes: ["id"],
  });
  return result ? result.id : null;
}

async function findAdplacementByAddress(address, areaId) {
  const result = await AdsPlacement.findOne({
    where: {
      address: address,
      areaId: areaId,
    },
    attributes: ["id"],
  });
  return result ? result.id : null;
}

async function isDuplicateAdType(name) {
  const result = await AdsType.findOne({
    where: {
      type: name,
    },
    attributes: ["id"],
  });
  return result ? true : false;
}

async function isDuplicateLocationType(name) {
  const result = await LocationType.findOne({
    where: {
      locationType: name,
    },
    attributes: ["id"],
  });
  return result ? true : false;
}

async function isDuplicateBoardType(name) {
  const result = await BoardType.findOne({
    where: {
      type: name,
    },
    attributes: ["id"],
  });
  return result ? true : false;
}

async function isDuplicateReportType(name) {
  const result = await ReportType.findOne({
    where: {
      type: name,
    },
    attributes: ["id"],
  });
  return result ? true : false;
}

async function getAddressFromLatLong(lat, lon, apiKey) {
  const apiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`;

  const response = await fetch(apiUrl);
  const data = await response.json();

  if (data.results && data.results.length > 0) {
    const addressComponents = data.results[0].components;
    const formattedAddress = Object.values(addressComponents).join(", ");

    return formattedAddress;
  }

  return false;
}

function extractDistrictAndWard(input) {
  // Split the input string into individual components
  const components = input.split(", ");

  // Find district and ward components
  let district, ward;
  let districtIndex, wardIndex;
  let type;

  // Find the indices of "District" and "Ward"
  for (let i = 0; i < components.length; i++) {
    const component = components[i];
    if (
      (component.includes("District") ||
      component.includes("Huyện") ||
      component.includes("Quận")) && districtIndex == null
    ) {
      district = component.replace("District ", ""); // Extract only digits
      district = component.replace("Huyện ", ""); // Extract only digits
      district = component.replace("Quận ", ""); // Extract only digits
      districtIndex = i;
    } else if (component.includes("Ward") || component.includes("Phường")) {
      ward = component.replace("Ward ", ""); // Extract only digits
      ward = component.replace("Phường ", ""); // Extract only digits

      wardIndex = i;
      type = 1;
    } else if (component.includes("Town") || component.includes("Thị trấn")) {
      ward = component.replace("Town ", ""); // Extract only digits
      ward = component.replace("Thị trấn ", ""); // Extract only digits
      wardIndex = i;
      type = 2;
    } else if (component.includes("Commune") || component.includes("Xã")) {
      ward = component.replace("Commune ", ""); // Extract only digits
      ward = component.replace("Xã ", ""); // Extract only digits
      wardIndex = i;
      type = 3;
    }
  }

  district = district !== null ? "Quận " + district : null;
  if (parseInt(ward) < 10) ward = "0" + ward;
  if (type === 1) ward = ward !== null ? "Phường " + ward : null;
  if (type === 2) ward = ward !== null ? "Thị trấn " + ward : null;
  if (type === 3) ward = ward !== null ? "Xã " + ward : null;

  return { district, ward };
}

module.exports = {
  isEmpty,
  isEmail,
  emailExists,
  usernameExists,
  isValidPassword,
  isValidConfirmPassword,
  isNumber,
  getLatLongFromAddress,
  isDuplicateAddress,
  findAreaIdByWardAndDistrict,
  findLocationTypeIdByLocationType,
  findAdsTypeIdByAdsType,
  findBoardsTyoeIdByBoardType,
  findAdplacementByAddress,
  findAdplacementByOnlyAddress,
  getFullAddressInfo,
  getDistrictFromAdress,
  isDuplicateAdType,
  isDuplicateLocationType,
  isDuplicateBoardType,
  getFirstPartOfAddress,
  isDuplicateLongLat,
  phoneExists,
  isDuplicateReportType,
  getLatLongFromAdplaceId,
  getAddressFromLatLong,
  extractDistrictAndWard,
};
