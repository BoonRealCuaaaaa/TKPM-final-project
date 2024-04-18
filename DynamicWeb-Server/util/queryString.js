const createWardDistrictPageQueryString = (url, key, value) => {
  function getObjectFromUrl(url, key) {
    let startIndex = 0,
      endIndex = 0;
    startIndex = url.indexOf(key);
    if (startIndex === -1) {
      return { key: "", value: "" };
    }
    endIndex = url.slice(startIndex).indexOf("&");
    endIndex = endIndex === -1 ? url.length : endIndex + startIndex;
    return {
      key,
      value: url.slice(startIndex + key.length, endIndex),
    };
  }
  let district = getObjectFromUrl(url, "district=");
  let ward = key === "ward=" ? { key, value } : getObjectFromUrl(url, "ward=");
  let page = key === "page=" ? { key, value } : { key: "", value: "" };
  if (key === "district=") {
    district = { key, value };
    ward = { key: "", value: "" };
  }
  let newUrl = "";
  let flag = url.indexOf("?") === -1;
  if (flag) {
    return url + "?" + key + value;
  }
  newUrl = url.slice(0, url.indexOf("?") + 1);

  let temp = newUrl.length;
  newUrl =
    newUrl +
    page.key +
    page.value +
    (ward.key !== "" ? "&" : "") +
    ward.key +
    ward.value +
    (district.key !== "" ? "&" : "") +
    district.key +
    district.value;
  if (newUrl.charAt(temp) === "&") {
    newUrl = newUrl.slice(0, temp) + newUrl.slice(temp + 1);
  }
  if (page.value !== "") {
  }
  return newUrl;
};

module.exports = {
  createWardDistrictPageQueryString,
};
