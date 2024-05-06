//Variable definition
const sipulatedColor = "#40eb34";
const nonSipulatedColor = "#d3eb34";
const reportedColor = "#eb3434";
const selfReportedColor = "#848991";
const unclusteredRadius = 12;
const accountType = document.querySelector("#account-type").innerText;
const accountWard = document.querySelector("#account-ward").innerText;
const accountDistrict = document.querySelector("#account-district").innerText;
let selectedLocation;
let selectedBoard;
let adsData; //Ads data from selected location
let rpData;
let isClickPoint = 0;

//Full geojson
let sipulated;
let nonSipulated;
let reported;

//filtered geojson
let filterSipulated;
let filterNonSipulated;
let filterReported;

const sipulatedPopup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false,
});
const nonSipulatedPopup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false,
});
const reportedPopup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false,
});

const serverPath = "http://localhost:5000";

//Function definition
const inspectCluster = (e, layer) => {
  const features = map.queryRenderedFeatures(e.point, {
    layers: [`${layer}-cluster`],
  });
  const clusterId = features[0].properties.cluster_id;
  map.getSource(layer).getClusterExpansionZoom(clusterId, (err, zoom) => {
    if (err) return;

    map.easeTo({
      center: features[0].geometry.coordinates,
      zoom: zoom,
    });
  });
};

const mouseEnterEventUnclustered = (e, layer) => {
  let popup;
  if (layer == "sipulated") {
    popup = sipulatedPopup;
  } else if (layer == "nonSipulated") {
    popup = nonSipulatedPopup;
  } else if (layer == "reported") {
    popup = reportedPopup;
  }

  map.getCanvas().style.cursor = "pointer";
  const coordinates = e.features[0].geometry.coordinates.slice();
  const { id, address, adsType, area, locationType, status } =
    e.features[0].properties;
  const areaObj = JSON.parse(area);
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  const popupDesc = `<b>${adsType}</b><p>${locationType}</p><p>${address}, ${areaObj.ward}, ${areaObj.district}</p><h5>${status}</h5>`;
  popup.setLngLat(coordinates).setHTML(popupDesc).addTo(map);
};

const mouseLeaveEventUnclustered = (layer) => {
  let popup;
  if (layer == "sipulated") {
    popup = sipulatedPopup;
  } else if (layer == "nonSipulated") {
    popup = nonSipulatedPopup;
  } else if (layer == "reported") {
    popup = reportedPopup;
  }

  map.getCanvas().style.cursor = "";
  popup.remove();
};

const searchFunc = async (e) => {
  e.preventDefault();
  if (locationInput.value == "" || locationInput.value == undefined) {
    return;
  }
  const apiKey = "8c7c7c956fdd4a598e2301d88cb48135";
  const query = locationInput.value;
  const apiUrl = "https://api.opencagedata.com/geocode/v1/json";
  const requestUrl = `${apiUrl}?key=${apiKey}&q=${encodeURIComponent(
    query
  )}&pretty=1&no_annotations=1`;

  const respond = await fetch(
    `https://rsapi.goong.io/geocode?address=${encodeURIComponent(
      query
    )}&api_key=7iVK3dd86pgsEJggbfiky0xOrcRa9xJMNTtX22nS`
  );
  try {
    if (!respond.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await respond.json();
    const results = data.results;
    if (results.length == 0) {
      alert("Không tìm thấy địa chỉ tương ứng");
      return;
    }
    // if (data.results.length == 0) {

    // }
    // const geometry = data.results[0].geometry;
    const geometry = results[0].geometry.location;
    map.flyTo({ center: geometry });
  } catch (err) {
    console.log(err);
  }
};

const toggleEvent = (e, targetLayer) => {
  const layers = [
    `${targetLayer}-cluster`,
    `${targetLayer}-count`,
    `${targetLayer}-unclustered`,
    `${targetLayer}-label`,
  ];

  if (e.target.checked) {
    document.querySelector("#board-details-toggle").style.display = "none";
    document.querySelector("#side-section").innerHTML = `
    <span class="text-muted"
    >#ID:
    <span class="fw-semibold" id="board-id">???</span></span
  >
  <h4 class="card-title" id="board-title">
    Trụ, cụm pano
    <span class="ms-2 badge bg-success" id="board-status"
      >Đã quy hoạch</span
    >
  </h4>
  <p class="card-text" id="board-address">
    Chưa có thông tin để hiển thị
  </p>

  <p>
    Kích thước:
    <span class="details-info" id="board-size"
      >Chưa có thông tin</span
    >
    <br />
    Số lượng:
    <span class="details-info" id="board-quantity"
      >Chưa có thông tin</span
    >
    <br />
    Hình thức:
    <span class="details-info" id="board-form"
      >Chưa có thông tin</span
    >
    <br />
    Phân loại:
    <span class="details-info" id="board-classification"
      >Chưa có thông tin</span
    >
    <br />
  </p>
  <img
    class="img-thumbnail mb-3"
    src="img/BangQC1.jpg"
    id="board-thumbnail"
    alt=""
    style="width: 100%"
  />

  <div class="d-flex justify-content-between">
    <span
      id="board-contract"
      class="btn-icon fs-3"
      data-bs-toggle="popover"
      data-bs-trigger="hover focus"
      data-bs-title="Hợp đồng quảng cáo"
      data-bs-container="body"
      data-bs-placement="left"
      data-bs-content="Ngày hết hạn: 01-01-2003"
    >
      <i
        class="fa-solid fa-circle-exclamation text-primary"
      ></i>
    </span>
    <button
      type="button"
      class="btn btn-outline-success fw-semibold toBCVP"
      data-bs-toggle="modal"
      data-bs-target="#permitRequestModal"
      id="createPermissionButton-half"
      data-id="-1"
      onclick="showAddPermitRequestModal('#permitRequestForm', this)"
    >
      <i class="fa-solid fa-triangle-exclamation"></i>
      Tạo yêu cầu cấp phép
    </button>`;
    const layersReported = [
      "reported-cluster",
      "reported-count",
      "reported-unclustered",
      "reported-label",
    ];
    document.querySelector("#forthCheckboxStretched").checked = false;
    layersReported.forEach((layer) => {
      map.setLayoutProperty(layer, "visibility", "none");
    });
    layers.forEach((layer) => {
      map.setLayoutProperty(layer, "visibility", "visible");
    });
  } else {
    layers.forEach((layer) => {
      map.setLayoutProperty(layer, "visibility", "none");
    });
  }
};

const getInfoOnclickUnclustered = async (e) => {
  isClickPoint = 1;
  selectedLocation = { ...e.features[0], lngLat: e.lngLat };
  const target = e.features[0];
  const areaObjTarget = JSON.parse(target.properties.area);
  const fetchedData = await fetch(
    `${serverPath}/citizen/get-ads/${e.features[0].properties.id}`
  );
  const data = await fetchedData.json();
  adsData = JSON.parse(data);
  const HTMLaddBoardBtn = document.querySelector("#add-board-permit-btn");
  // const HTMLviewReportLocation = document.querySelector(
  //   "#view-report-location"
  // );
  HTMLaddBoardBtn.dataset.id = selectedLocation.properties.id;
  HTMLaddBoardBtn.style.display = "block";
  // HTMLviewReportLocation.style.display = "block";
  // HTMLviewReportLocation.parentElement.href = `${serverPath}/district/list-report-location/${selectedLocation.properties.id}`;

  const HTMLdetails = document.querySelector("#board-details-toggle");
  const HTMLid = document.querySelector("#board-id");
  const HTMLnumber = document.querySelector("#num-ads");
  const HTMLtitle = document.querySelector("#board-title");
  const HTMLaddr = document.querySelector("#board-address");
  const HTMLsize = document.querySelector("#board-size");
  const HTMLqty = document.querySelector("#board-quantity");
  const HTMLform = document.querySelector("#board-form");
  const HTMLclassification = document.querySelector("#board-classification");
  const HTMLthumbnail = document.querySelector("#board-thumbnail");
  const HTMLpagination = document.querySelector("#board-pagination");
  const HTMLboardContract = document.querySelector("#board-contract");
  const HTMLaddPermitRequestBtn = document.querySelector(
    "#createPermissionButton-half"
  );

  if (adsData.length == 0) {
    HTMLdetails.style.display = "none";
    HTMLid.innerHTML = "Chưa có thông tin";
    HTMLnumber.innerHTML = `<p>Địa điểm này có 0 quảng cáo</p>`;
    HTMLtitle.innerHTML = `Chưa có thông tin <span class="ms-2 badge bg-secondary" id="board-status">Chưa có thông tin</span></a>`;
    HTMLaddr.innerHTML = `${target.properties.address}, ${areaObjTarget.ward}, ${areaObjTarget.district}`;
    HTMLsize.innerHTML = "Chưa có thông tin";
    HTMLqty.innerHTML = "Chưa có thông tin";
    HTMLform.innerHTML = target.properties.adsType;
    HTMLclassification.innerHTML = target.properties.locationType;
    HTMLthumbnail.src = "";
    HTMLboardContract.setAttribute("data-bs-content", ``);
    const popover = new bootstrap.Popover(HTMLboardContract);
    popover.update();
  } else {
    HTMLdetails.style.display = "block";
    HTMLaddPermitRequestBtn.style.display =
      adsData[0].status != "" ? "none" : "block";
    HTMLid.innerHTML = adsData[0].id;

    HTMLaddPermitRequestBtn.dataset.id = adsData[0].id;

    // document.querySelector(
    //   "#view-report-board"
    // ).parentElement.href = `${serverPath}/district/list-report-board/${adsData[0].id}`;

    HTMLnumber.innerHTML = `<p>Địa điểm này có ${adsData.length} quảng cáo`;
    HTMLtitle.innerHTML = `${
      adsData[0].boardType.type
    }<span class="ms-2 badge ${
      adsData[0].status == "Đã cấp phép"
        ? "bg-success"
        : adsData[0].status == "Chưa cấp phép"
        ? "bg-warning"
        : adsData[0].status == "Bị báo cáo"
        ? "bg-danger"
        : "bg-dark"
    }" id="board-status">${
      adsData[0].status != "" ? adsData[0].status : "Chưa có quảng cáo"
    }</span></a>`;
    HTMLaddr.innerHTML = `${adsData[0].adsPlacement.address}, ${adsData[0].adsPlacement.area.ward}, ${adsData[0].adsPlacement.area.district}`;
    HTMLsize.innerHTML = adsData[0].size;
    HTMLqty.innerHTML = adsData[0].quantity;
    HTMLform.innerHTML = adsData[0].adsPlacement.adsType.type;
    HTMLclassification.innerHTML =
      adsData[0].adsPlacement.locationType.locationType;
    HTMLthumbnail.src = "/" + adsData[0].image;
    // HTMLthumbnail.src = `${serverPath}/images/permitRequests/${adsData[0].image}`;
    HTMLboardContract.setAttribute(
      "data-bs-content",
      `Ngày hết hạn: ${
        adsData[0].end != undefined
          ? adsData[0].end.split("T")[0]
          : "Chưa có thông tin"
      }`
    );
    const popover = new bootstrap.Popover(HTMLboardContract);
    popover.update();
  }

  //Update pagination
  let paginationData = "";
  paginationData += `<li class="page-item disabled">
    <a class="page-link" href="#" aria-label="Previous">
      <span aria-hidden="true">&laquo;</span></a></li>`;
  for (let i = 0; i < adsData.length; i++) {
    if (i == 0) {
      paginationData += `<li class="page-item active" aria-current="page"><a class="page-link" href="#">${
        i + 1
      }</a></li>`;
    } else {
      paginationData += `<li class="page-item" aria-current="page"><a class="page-link" href="#">${
        i + 1
      }</a></li>`;
    }
  }
  if (adsData.length <= 1) {
    paginationData += `<li class="page-item disabled">
      <a class="page-link" href="#" aria-label="Next">
        <span aria-hidden="true">&raquo;</span></a></li>`;
  } else {
    paginationData += `<li class="page-item "><a class="page-link" href="#" aria-label="Next">
      <span aria-hidden="true">&raquo;</span></a></li>`;
  }
  HTMLpagination.innerHTML = paginationData;
  //Pagination feature
  const pagePrev = document.querySelector('.page-link[aria-label="Previous"]');
  const pageNext = document.querySelector('.page-link[aria-label="Next"]');
  const pageItems = document.querySelectorAll(
    '.page-item[aria-current="page"]'
  );
  pageItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      //Deactive previous
      const activeItem = document.querySelector(".page-item.active");
      activeItem.classList.remove("active");

      const page = e.target.innerText;
      HTMLid.innerHTML = adsData[page - 1].id;
      HTMLaddPermitRequestBtn.dataset.id = adsData[page - 1].id;
      HTMLaddPermitRequestBtn.style.display =
        adsData[page - 1].status != "" ? "none" : "block";

      HTMLtitle.innerHTML = `${
        adsData[page - 1].boardType.type
      }<span class="ms-2 badge ${
        adsData[page - 1].status == "Đã cấp phép"
          ? "bg-success"
          : adsData[page - 1].status == "Chưa cấp phép"
          ? "bg-warning"
          : adsData[page - 1].status == "Bị báo cáo"
          ? "bg-danger"
          : "bg-dark"
      }" id="board-status">${
        adsData[page - 1].status != ""
          ? adsData[page - 1].status
          : "Chưa có quảng cáo"
      }</span></a>`;
      HTMLaddr.innerHTML = `${adsData[page - 1].adsPlacement.address}, ${
        adsData[page - 1].adsPlacement.area.ward
      }, ${adsData[page - 1].adsPlacement.area.district}`;
      HTMLsize.innerHTML = adsData[page - 1].size;
      HTMLqty.innerHTML = adsData[page - 1].quantity;
      HTMLform.innerHTML = adsData[page - 1].adsPlacement.adsType.type;
      HTMLclassification.innerHTML =
        adsData[page - 1].adsPlacement.locationType.locationType;
      HTMLthumbnail.src = "/" + adsData[page - 1].image;
      // HTMLthumbnail.src = `${serverPath}/images/permitRequests/${
      //   adsData[page - 1].image
      // }`;
      HTMLboardContract.setAttribute(
        "data-bs-content",
        `Ngày hết hạn: ${
          adsData[page - 1].end != ""
            ? adsData[page - 1].end.split("T")[0]
            : "Chưa có thông tin"
        }`
      );
      const popover = new bootstrap.Popover(HTMLboardContract);
      popover.update();
      //Set active
      e.target.parentNode.classList.add("active");
      //Set new link in view report button
      // document.querySelector(
      //   "#view-report-board"
      // ).parentElement.href = `${serverPath}/district/list-report-board/${
      //   adsData[page - 1].id
      // }`;
      //Set enable/disable for prev/next button
      pagePrev.parentNode.classList.remove("disabled");
      pageNext.parentNode.classList.remove("disabled");
      if (page == 1) {
        pagePrev.parentNode.classList.add("disabled");
      } else if (page == adsData.length) {
        pageNext.parentNode.classList.add("disabled");
      }
    });
  });
  pagePrev.addEventListener("click", (e) => {
    if (pagePrev.parentNode.classList.contains("disabled")) {
      return;
    }
    const activeItem = document.querySelector(".page-item.active");
    activeItem.classList.remove("active");

    const page = parseInt(activeItem.firstChild.innerText) - 1;

    HTMLid.innerHTML = adsData[page - 1].id;
    HTMLtitle.innerHTML = `${
      adsData[page - 1].boardType.type
    }<span class="ms-2 badge ${
      adsData[page - 1].status == "Đã cấp phép"
        ? "bg-success"
        : adsData[page - 1].status == "Chưa cấp phép"
        ? "bg-warning"
        : adsData[page - 1].status == "Bị báo cáo"
        ? "bg-danger"
        : "bg-dark"
    }" id="board-status">${
      adsData[page - 1].status != ""
        ? adsData[page - 1].status
        : "Chưa có quảng cáo"
    }</span></a>`;
    HTMLaddr.innerHTML = `${adsData[page - 1].adsPlacement.address}, ${
      adsData[page - 1].adsPlacement.area.ward
    }, ${adsData[page - 1].adsPlacement.area.district}`;
    HTMLsize.innerHTML = adsData[page - 1].size;
    HTMLqty.innerHTML = adsData[page - 1].quantity;
    HTMLform.innerHTML = adsData[page - 1].adsPlacement.adsType.type;
    HTMLclassification.innerHTML =
      adsData[page - 1].adsPlacement.locationType.locationType;
    HTMLthumbnail.src = "/" + adsData[page - 1].image;

    HTMLboardContract.setAttribute(
      "data-bs-content",
      `Ngày hết hạn: ${
        adsData[page - 1].end != ""
          ? adsData[page - 1].end.split("T")[0]
          : "Chưa có thông tin"
      }`
    );
    const popover = new bootstrap.Popover(HTMLboardContract);
    popover.update();
    //Set active
    activeItem.previousSibling.classList.add("active");
    //Deactive prev button if reach the first page
    pageNext.parentNode.classList.remove("disabled");
    pagePrev.parentNode.classList.remove("disabled");
    if (page == 1) {
      pagePrev.parentNode.classList.add("disabled");
    }
  });
  pageNext.addEventListener("click", (e) => {
    if (pageNext.parentNode.classList.contains("disabled")) {
      return;
    }
    const activeItem = document.querySelector(".page-item.active");
    activeItem.classList.remove("active");

    const page = parseInt(activeItem.firstChild.innerText) + 1;
    HTMLid.innerHTML = adsData[page - 1].id;

    HTMLtitle.innerHTML = `${
      adsData[page - 1].boardType.type
    }<span class="ms-2 badge ${
      adsData[page - 1].status == "Đã cấp phép"
        ? "bg-success"
        : adsData[page - 1].status == "Chưa cấp phép"
        ? "bg-warning"
        : adsData[page - 1].status == "Bị báo cáo"
        ? "bg-danger"
        : "bg-dark"
    }" id="board-status">${
      adsData[page - 1].status != ""
        ? adsData[page - 1].status
        : "Chưa có quảng cáo"
    }</span></a>`;
    HTMLaddr.innerHTML = `${adsData[page - 1].adsPlacement.address}, ${
      adsData[page - 1].adsPlacement.area.ward
    }, ${adsData[page - 1].adsPlacement.area.district}`;
    HTMLsize.innerHTML = adsData[page - 1].size;
    HTMLqty.innerHTML = adsData[page - 1].quantity;
    HTMLform.innerHTML = adsData[page - 1].adsPlacement.adsType.type;
    HTMLclassification.innerHTML =
      adsData[page - 1].adsPlacement.locationType.locationType;
    HTMLthumbnail.src = "/" + adsData[page - 1].image;
    // HTMLthumbnail.src = `${serverPath}/images/permitRequests/${
    //   adsData[page - 1].image
    // }`;
    // document.querySelector(
    //   "#view-report-board"
    // ).parentElement.href = `${serverPath}/district/list-report-board/${
    //   adsData[page - 1].id
    // }`;
    HTMLboardContract.setAttribute(
      "data-bs-content",
      `Ngày hết hạn: ${
        adsData[page - 1].end != ""
          ? adsData[page - 1].end.split("T")[0]
          : "Chưa có thông tin"
      }`
    );
    const popover = new bootstrap.Popover(HTMLboardContract);
    popover.update();
    //Set active
    activeItem.nextSibling.classList.add("active");
    //Deactive next button if reach the last page
    pageNext.parentNode.classList.remove("disabled");

    pagePrev.parentNode.classList.remove("disabled");

    if (page == adsData.length) {
      pageNext.parentNode.classList.add("disabled");
    }
  });
};

const initLngLat = async () => {
  const apiKey = "8c7c7c956fdd4a598e2301d88cb48135";
  const query = `${accountDistrict} ${accountWard} Hồ Chí Minh`;
  const apiUrl = "https://api.opencagedata.com/geocode/v1/json";
  const requestUrl = `${apiUrl}?key=${apiKey}&q=${encodeURIComponent(
    query
  )}&pretty=1&no_annotations=1`;

  const respond = await fetch(requestUrl);
  try {
    if (!respond.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await respond.json();
    const geometry = data.results[0].geometry;
    map.flyTo({ center: geometry });
  } catch (err) {
    console.log(err);
  }
};
//Map generation
mapboxgl.accessToken =
  "pk.eyJ1IjoiYm9vbnJlYWwiLCJhIjoiY2xvOWZ0eXQ2MDljNzJybXRvaW1oaXR3NyJ9.iu4mRTZ3mUFb7ggRtyPcWw";
const map = new mapboxgl.Map({
  container: "mapbox",

  style: "mapbox://styles/mapbox/streets-v12",
  center: [106.569958, 10.722345],
  zoom: 17,
});

// Map navigation control
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.FullscreenControl());

map.on("load", async () => {
  //Set default lnglat
  await initLngLat();
  //Fetched section
  const fetchedsipulatedData = await fetch(
    `${serverPath}/citizen/get-sipulated`
  );
  const fetchedNonSipulatedData = await fetch(
    `${serverPath}/citizen/get-nonsipulated`
  );
  const fetchedReportData = await fetch(`${serverPath}/citizen/get-report`);
  sipulated = await fetchedsipulatedData.json();
  nonSipulated = await fetchedNonSipulatedData.json();
  reported = await fetchedReportData.json();

  sipulated = JSON.parse(sipulated);
  nonSipulated = JSON.parse(nonSipulated);
  reported = JSON.parse(reported);

  filterSipulated = Object.assign({}, sipulated);
  filterNonSipulated = Object.assign({}, nonSipulated);
  filterReported = Object.assign({}, reported);

  // Sort for placement that belongs to specified area
  if (accountType == "Quan") {
    filterSipulated.features = sipulated.features
      .filter((p) => {
        return p.properties.area.district == accountDistrict;
      })
      .slice();

    filterNonSipulated.features = nonSipulated.features
      .filter((p) => {
        return p.properties.area.district == accountDistrict;
      })
      .slice();

    filterReported.features = reported.features
      .filter((p) => {
        return p.properties.area.district == accountDistrict;
      })
      .slice();
  } else if (accountType == "Phuong") {
    filterSipulated.features = sipulated.features.filter((p) => {
      return (
        p.properties.area.district == accountDistrict &&
        p.properties.area.ward == accountWard
      );
    });

    filterNonSipulated.features = nonSipulated.features.filter((p) => {
      return (
        p.properties.area.district == accountDistrict &&
        p.properties.area.ward == accountWard
      );
    });

    filterReported.features = reported.features.filter((p) => {
      return (
        p.properties.area.district == accountDistrict &&
        p.properties.area.ward == accountWard
      );
    });
  }

  // Sipulated source data
  map.addSource("sipulated", {
    type: "geojson",
    data: filterSipulated,
    cluster: true,
    clusterMaxZoom: 17,
    clusterRadius: 20,
  });
  //Sipulated cluster
  map.addLayer({
    id: "sipulated-cluster",
    type: "circle",
    source: "sipulated",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": sipulatedColor,
      "circle-radius": ["step", ["get", "point_count"], 30, 4, 60, 8, 90],
    },
    layout: { visibility: "visible" },
  });
  //Sipulated count
  map.addLayer({
    id: "sipulated-count",
    type: "symbol",
    source: "sipulated",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
      "text-allow-overlap": true,
      visibility: "visible",
    },
  });
  //Sipulated uncluster
  map.addLayer({
    id: "sipulated-unclustered",
    type: "circle",
    source: "sipulated",
    filter: ["!", ["has", "point_count"]],
    layout: { visibility: "visible" },
    paint: {
      "circle-color": sipulatedColor,
      "circle-radius": unclusteredRadius,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });
  //Sipulated label
  map.addLayer({
    id: "sipulated-label",
    type: "symbol",
    source: "sipulated",
    filter: ["!", ["has", "point_count"]],
    layout: {
      "text-field": ["get", "numBoard"],
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
      "text-allow-overlap": true,
      visibility: "visible",
    },
    paint: {
      "text-color": [
        "case",
        [">", ["to-number", ["get", "numBoard"]], 0],
        "#f2f7f4",
        "#9c8198",
      ],
    },
  });
  //Inspect a cluster on click
  map.on("click", "sipulated-cluster", (e) => {
    inspectCluster(e, "sipulated");
  });
  //Get info when user moves their mouse over the unclustered layer

  map.on("mouseenter", "sipulated-unclustered", (e) => {
    mouseEnterEventUnclustered(e, "sipulated");
  });
  map.on("mouseleave", "sipulated-unclustered", (e) => {
    mouseLeaveEventUnclustered("sipulated");
  });
  //Get unclustered info on click
  map.on("click", "sipulated-unclustered", async (e) => {
    await getInfoOnclickUnclustered(e);
  });
  map.on("mouseenter", "sipulated-cluster", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "sipulated-cluster", () => {
    map.getCanvas().style.cursor = "";
  });

  //Non sipulated section
  map.addSource("nonSipulated", {
    type: "geojson",
    data: filterNonSipulated,
    cluster: true,
    clusterMaxZoom: 17,
    clusterRadius: 15,
  });
  //Non sipulated cluster
  map.addLayer({
    id: "nonSipulated-cluster",
    type: "circle",
    source: "nonSipulated",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": nonSipulatedColor,
      "circle-radius": ["step", ["get", "point_count"], 25, 4, 50, 8, 75],
    },
    layout: { visibility: "visible" },
  });
  //Non sipulated count
  map.addLayer({
    id: "nonSipulated-count",
    type: "symbol",
    source: "nonSipulated",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
      "text-allow-overlap": true,
      visibility: "visible",
    },
  });
  //Non sipulated uncluster
  map.addLayer({
    id: "nonSipulated-unclustered",
    type: "circle",
    source: "nonSipulated",
    filter: ["!", ["has", "point_count"]],
    layout: { visibility: "visible" },
    paint: {
      "circle-color": nonSipulatedColor,
      "circle-radius": unclusteredRadius,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });
  //Non sipulated label
  map.addLayer({
    id: "nonSipulated-label",
    type: "symbol",
    source: "nonSipulated",
    filter: ["!", ["has", "point_count"]],
    layout: {
      "text-field": ["get", "numBoard"],
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
      "text-allow-overlap": true,
      visibility: "visible",
    },
    paint: {
      "text-color": [
        "case",
        [">", ["to-number", ["get", "numBoard"]], 0],
        "#f2f7f4",
        "#9c8198",
      ],
    },
  });
  //Inspect a cluster on click
  map.on("click", "nonSipulated-cluster", (e) => {
    inspectCluster(e, "nonSipulated");
  });
  //Get info when user moves their mouse over the unclustered layer

  map.on("mouseenter", "nonSipulated-unclustered", (e) => {
    mouseEnterEventUnclustered(e, "nonSipulated");
  });
  map.on("mouseleave", "nonSipulated-unclustered", () => {
    mouseLeaveEventUnclustered("nonSipulated");
  });
  //Get infor onclick
  map.on("click", "nonSipulated-unclustered", async (e) => {
    await getInfoOnclickUnclustered(e);
  });
  map.on("mouseenter", "nonSipulated-cluster", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "nonSipulated-cluster", () => {
    map.getCanvas().style.cursor = "";
  });
  //Reported section
  map.addSource("reported", {
    type: "geojson",
    data: filterReported,
    cluster: true,
    clusterMaxZoom: 17,
    clusterRadius: 15,
  });
  //Reported cluster
  map.addLayer({
    id: "reported-cluster",
    type: "circle",
    source: "reported",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": reportedColor,
      "circle-radius": ["step", ["get", "point_count"], 15, 4, 30, 8, 45],
    },
    layout: { visibility: "none" },
  });
  //Reported count
  map.addLayer({
    id: "reported-count",
    type: "symbol",
    source: "reported",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
      "text-allow-overlap": true,
      visibility: "none",
    },
  });
  //Reported uncluster
  map.addLayer({
    id: "reported-unclustered",
    type: "circle",
    source: "reported",
    filter: ["!", ["has", "point_count"]],
    layout: { visibility: "none" },
    paint: {
      "circle-color": reportedColor,
      "circle-radius": unclusteredRadius,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });
  //Reported label
  map.addLayer({
    id: "reported-label",
    type: "symbol",
    source: "reported",
    filter: ["!", ["has", "point_count"]],
    layout: {
      "text-field": "VP",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
      "text-allow-overlap": true,
      visibility: "none",
    },
    paint: {
      "text-color": "#f2f7f4",
    },
  });
  //Inspect a cluster on click
  map.on("click", "reported-cluster", (e) => {
    inspectCluster(e, "reported");
  });

  map.on("mouseenter", "reported-unclustered", (e) => {
    map.getCanvas().style.cursor = "pointer";
    const coordinates = e.features[0].geometry.coordinates.slice();
    const { address, area } = e.features[0].properties;
    const areaObj = JSON.parse(area);

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    const popupDesc = `<b>${address}</b> <p>${areaObj.ward}, ${areaObj.district}</p>`;
    reportedPopup.setLngLat(coordinates).setHTML(popupDesc).addTo(map);
  });
  map.on("mouseleave", "reported-unclustered", () => {
    map.getCanvas().style.cursor = "";
    reportedPopup.remove();
  });
  // Get info on click
  map.on("click", "reported-unclustered", async (e) => {
    isClickPoint = 1;
    const tempData = e.features[0];
    document.querySelector("#board-details-toggle").style.display = "block";
    document.querySelector("#report-view-detail").style.display = "block";
    const target = e.features[0].properties;
    const fetchData = await fetch(
      `${serverPath}/citizen/get-report-lnglat?lng=${target.lng}&lat=${target.lat}`
    );
    const returnData = await fetchData.json();
    rpData = JSON.parse(returnData);
    console.log(returnData)
    console.log(rpData)

    const HTMLReportType = document.querySelector("#report-type");
    const HTMLReportName = document.querySelector("#reporter-name");
    const HTMLReportDate = document.querySelector("#report-date");
    const HTMLReportStatus = document.querySelector("#report-status");
    const HTMLReportLocation = document.querySelector("#report-location");

    if (rpData.length == 0) {
      HTMLReportType.innerHTML = "Chưa có thông tin";
      HTMLReportName.innerHTML = "Chưa có thông tin";
      HTMLReportDate.innerHTML = "Chưa có thông tin";
      HTMLReportStatus.innerHTML = "Chưa có thông tin";
      HTMLReportLocation.innerHTML = "Chưa có thông tin";
    } else {
      console.log(rpData[0])
      HTMLReportType.innerHTML = rpData[0].reportType.type;
      HTMLReportName.innerHTML = rpData[0].name;
      HTMLReportDate.innerHTML = rpData[0].createdAt.split("T")[0];
      HTMLReportStatus.innerHTML = rpData[0].status;
      HTMLReportLocation.innerHTML = tempData.properties.address;
    }

    let paginationData = "";
    paginationData += `<li class="page-item disabled">
    <a class="page-link" href="#" aria-label="Previous">
      <span aria-hidden="true">&laquo;</span></a></li>`;
    for (let i = 0; i < rpData.length; i++) {
      if (i == 0) {
        paginationData += `<li class="page-item active" aria-current="page"><a class="page-link" href="#">${
          i + 1
        }</a></li>`;
      } else {
        paginationData += `<li class="page-item" aria-current="page"><a class="page-link" href="#">${
          i + 1
        }</a></li>`;
      }
    }

    if (rpData.length <= 1) {
      paginationData += `<li class="page-item disabled">
        <a class="page-link" href="#" aria-label="Next">
          <span aria-hidden="true">&raquo;</span></a></li>`;
    } else {
      paginationData += `<li class="page-item "><a class="page-link" href="#" aria-label="Next">
        <span aria-hidden="true">&raquo;</span></a></li>`;
    }
    document.querySelector("#board-pagination").innerHTML = paginationData;

    const pagePrev = document.querySelector(
      '.page-link[aria-label="Previous"]'
    );
    const pageNext = document.querySelector('.page-link[aria-label="Next"]');
    const pageItems = document.querySelectorAll(
      '.page-item[aria-current="page"]'
    );

    pageItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        //Deactive previous
        const activeItem = document.querySelector(".page-item.active");
        activeItem.classList.remove("active");

        const page = e.target.innerText;
        HTMLReportType.innerHTML = rpData[page - 1].reportType.type;
        HTMLReportName.innerHTML = rpData[page - 1].name;
        HTMLReportDate.innerHTML =
          rpData[page - 1].createdAt.split("T")[page - 1];
        HTMLReportStatus.innerHTML = rpData[page - 1].status;
        HTMLReportLocation.innerHTML = tempData.properties.address;
        //Set active
        e.target.parentNode.classList.add("active");
        //Set enable/disable for prev/next button
        pagePrev.parentNode.classList.remove("disabled");
        pageNext.parentNode.classList.remove("disabled");
        if (page == 1) {
          pagePrev.parentNode.classList.add("disabled");
        } else if (page == rpData.length) {
          pageNext.parentNode.classList.add("disabled");
        }
      });
    });
    pagePrev.addEventListener("click", (e) => {
      if (pagePrev.parentNode.classList.contains("disabled")) {
        return;
      }
      const activeItem = document.querySelector(".page-item.active");
      activeItem.classList.remove("active");

      const page = parseInt(activeItem.firstChild.innerText) - 1;

      HTMLReportType.innerHTML = rpData[page - 1].reportType.type;
      HTMLReportName.innerHTML = rpData[page - 1].name;
      HTMLReportDate.innerHTML =
        rpData[page - 1].createdAt.split("T")[page - 1];
      HTMLReportStatus.innerHTML = rpData[page - 1].status;
      HTMLReportLocation.innerHTML = tempData.properties.address;

      //Set active
      activeItem.previousSibling.classList.add("active");
      //Deactive prev button if reach the first page
      pageNext.parentNode.classList.remove("disabled");
      pagePrev.parentNode.classList.remove("disabled");
      if (page == 1) {
        pagePrev.parentNode.classList.add("disabled");
      }
    });
    pageNext.addEventListener("click", (e) => {
      if (pageNext.parentNode.classList.contains("disabled")) {
        return;
      }
      const activeItem = document.querySelector(".page-item.active");
      activeItem.classList.remove("active");

      const page = parseInt(activeItem.firstChild.innerText) + 1;
      HTMLReportType.innerHTML = rpData[page - 1].reportType.type;
      HTMLReportName.innerHTML = rpData[page - 1].name;
      HTMLReportDate.innerHTML =
        rpData[page - 1].createdAt.split("T")[page - 1];
      HTMLReportStatus.innerHTML = rpData[page - 1].status;
      HTMLReportLocation.innerHTML = tempData.properties.address;

      //Set active
      activeItem.nextSibling.classList.add("active");
      //Deactive next button if reach the last page
      pageNext.parentNode.classList.remove("disabled");

      pagePrev.parentNode.classList.remove("disabled");

      if (page == rpData.length) {
        pageNext.parentNode.classList.add("disabled");
      }
    });
  });
  map.on("mouseenter", "reported-cluster", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "reported-cluster", () => {
    map.getCanvas().style.cursor = "";
  });
});
const fowardMaker = new mapboxgl.Marker({ color: "red" });
map.on("click", async (e) => {
  const { lat, lng } = e.lngLat;
  fowardMaker.setLngLat([lng, lat]).addTo(map);
  // const query = `${lat}+${lng}`;
  // const apiUrl = "https://api.opencagedata.com/geocode/v1/json";
  // const apiKey = "8c7c7c956fdd4a598e2301d88cb48135";
  const requestUrl = `https://rsapi.goong.io/Geocode?latlng=${lat},%20${lng}&api_key=7iVK3dd86pgsEJggbfiky0xOrcRa9xJMNTtX22nS`;
  const respond = await fetch(requestUrl);
  try {
    if (!respond.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await respond.json();
    const result = data.results;
    const { name, address } = result[0];
    const fullAddr = `${name}, ${address}`;

    const HTMLlocationName = document.querySelector("#location-name");
    const HTMLlocationAddr = document.querySelector("#location-address");
    HTMLlocationName.innerHTML = name;
    HTMLlocationAddr.innerHTML = address;
  } catch (err) {
    console.log(err);
  }

  //Reset
  if (isClickPoint == 1) {
    isClickPoint = 0;
  } else {
    document.querySelector("#num-ads").innerText =
      "Vui lòng chọn điểm trên bản đồ để xem";
    // document.querySelector("#view-report-location").style.display = "none";
    document.querySelector("#add-board-permit-btn").style.display = "none";
    document.querySelector("#board-details-toggle").style.display = "none";
  }
});
//Toggle layer
const sipulatedToggle = document.querySelector("#firstCheckboxStretched");
const nonSipulatedToggle = document.querySelector("#secondCheckboxStretched");
const reportedToggle = document.querySelector("#forthCheckboxStretched");

sipulatedToggle.addEventListener("change", (e) => {
  toggleEvent(e, "sipulated");
});
nonSipulatedToggle.addEventListener("change", (e) => {
  toggleEvent(e, "nonSipulated");
});
reportedToggle.addEventListener("change", (e) => {
  const layers = [
    "reported-cluster",
    "reported-count",
    "reported-unclustered",
    "reported-label",
  ];
  if (reportedToggle.checked) {
    //Hide create new request
    document.querySelector("#add-board-permit-btn").style.display = "none";
    //Change side section
    document.querySelector("#side-section").innerHTML = `
  <h4 class="card-title" id="report-type">
    Loại hình báo cáo
    <span class="ms-2 badge bg-success" id="board-status"></span>
  </h4>
  <p>
    Người gửi: <span class="details-info" id="reporter-name">Chưa có thông tin</span> <br>
    Ngày gửi: <span class="details-info" id="report-date">Chưa có thông tin</span> <br>
    Trạng thái xử lý: <span class="details-info" id="report-status">Chưa có thông tin</span> <br>
    Địa chỉ: <span class="details-info" id="report-location">Chưa có thông tin</span> <br>
  </p>
  <button type="button" class="btn btn-outline-success fw-semibold " id="report-view-detail" style="display: none;" onclick="handleViewReportButton(event)">
    <i class="fa-solid fa-triangle-exclamation"></i>
    XEM CHI TIẾT
  </button>
    `;
    document.querySelector("#board-pagination").innerHTML = "";
    sipulatedToggle.checked = false;
    nonSipulatedToggle.checked = false;
    layers.forEach((layer) => {
      map.setLayoutProperty(layer, "visibility", "visible");
    });
  } else {
    sipulatedToggle.checked = true;
    nonSipulatedToggle.checked = true;
    layers.forEach((layer) => {
      map.setLayoutProperty(layer, "visibility", "none");
    });
  }
  sipulatedToggle.dispatchEvent(new Event("change"));
  nonSipulatedToggle.dispatchEvent(new Event("change"));
});

// Reverse geo-location
const locationInput = document.querySelector("#location-input");
const searchBtn = document.querySelector("#search-button");

searchBtn.addEventListener("click", searchFunc);
locationInput.addEventListener("keypress", (e) => {
  if (e.key == "Enter") {
    searchFunc(e);
  }
});

//Get board ID example
const createPermissionButtonHalf = document.querySelector(
  "#createPermissionButton-half"
);

createPermissionButtonHalf.addEventListener("click", (e) => {
  let page =
    document.querySelector(".page-item.active") != null
      ? document.querySelector(".page-item.active").innerText
      : undefined;

  if (page == undefined) {
    return;
  }
  selectedBoard = adsData[page - 1];
});


// view report detail button
const handleViewReportButton = async (e) => {
  console.log("HEHE")
  const selectedPage = parseInt(
    document.querySelector(".page-item.active .page-link").innerText
  );
  const selectedReport = rpData[selectedPage - 1];
  console.log(selectedReport)
  let path
  if(accountType=="Quan") {
    path="district"
  } else {
    path="ward"
  }

  //Fix
  window.location.href = `${serverPath}/${path}/list-reports/${selectedReport.id}`;
};
