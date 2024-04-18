const sipulatedColor = "#40eb34";
const nonSipulatedColor = "#d3eb34";
const reportedColor = "#eb3434";
const selfReportedColor = "#848991";
const unclusteredRadius = 12;
let adsData;
let prevReportTableState = 0;
let selectedLocation = undefined;
let selectedBoard = undefined;

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
const selfReportedPopup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false,
});
const serverPath = "http://localhost:5000";

const myModalEl = document.getElementById("createModal");
//Resize map in the modal
myModalEl.addEventListener("shown.bs.modal", (event) => {
  const mapDiv = document.getElementById("mapbox");
  map.resize(); // Importance
});

// Mapbox generation
mapboxgl.accessToken =
  "pk.eyJ1IjoicGpsZW9uYXJkMzciLCJhIjoic2YyV2luUSJ9.lPoix24JhyR8sljAwjHg9A";

const map = new mapboxgl.Map({
  container: "mapbox", // container ID
  style: "mapbox://styles/mapbox/streets-v12", // style URL
  center: [106.707748, 10.780571], // starting position [lng, lat]
  zoom: 17, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.FullscreenControl());
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    // When active the map will receive updates to the device's location as it changes.
    trackUserLocation: true,
    // Draw an arrow next to the location dot to indicate which direction the device is heading.
    showUserHeading: true,
  })
);

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
  } else if (layer == "selfReported") {
    popup = selfReportedPopup;
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
  } else if (layer == "selfReported") {
    popup = selfReportedPopup;
  }

  map.getCanvas().style.cursor = "";
  popup.remove();
};

const handleClickEvent = (e) => {
  //Use this to view all properties of a placement
  // console.log(e.features[0].properties)

  //Change the address of the address input field (the disabled field)
  const addrInput = document.querySelector("#addressCreateModal");
  const addrInput_send = document.querySelector("#addressCreateSend");
  const address = `${e.features[0].properties.address}, ${
    JSON.parse(e.features[0].properties.area).ward
  }, ${JSON.parse(e.features[0].properties.area).district}`;
  addrInput.value = address;
  addrInput_send.value = address;
  //Alert the ID of selected placement
};

map.on("load", async () => {
  const fetchedsipulatedData = await fetch(
    `${serverPath}/citizen/get-sipulated`
  );
  const fetchedNonSipulatedData = await fetch(
    `${serverPath}/citizen/get-nonsipulated`
  );
  const fetchedReportData = await fetch(`${serverPath}/citizen/get-report`);
  const sipulated = await fetchedsipulatedData.json();
  const nonSipulated = await fetchedNonSipulatedData.json();
  const reported = await fetchedReportData.json();

  map.addSource("sipulated", {
    type: "geojson",
    data: JSON.parse(sipulated),
    cluster: true,
    clusterMaxZoom: 15,
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
      "text-field": "QC",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
      "text-allow-overlap": true,
      visibility: "visible",
    },
    paint: {
      "text-color": "#f2f7f4",
    },
  });
  //Inspect a cluster on click
  map.on("click", "sipulated-cluster", (e) => {
    inspectCluster(e, "sipulated");
  });
  map.on("mouseenter", "sipulated-unclustered", (e) => {
    mouseEnterEventUnclustered(e, "sipulated");
  });
  map.on("mouseleave", "sipulated-unclustered", (e) => {
    mouseLeaveEventUnclustered("sipulated");
  });
  //Get unclustered info on click
  map.on("click", "sipulated-unclustered", async (e) => {
    await handleClickEvent(e);
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
    data: JSON.parse(nonSipulated),
    cluster: true,
    clusterMaxZoom: 15,
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
      "text-field": "QC",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
      "text-allow-overlap": true,
      visibility: "visible",
    },
    paint: {
      "text-color": "#f2f7f4",
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
    await handleClickEvent(e);
  });
  map.on("mouseenter", "nonSipulated-cluster", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "nonSipulated-cluster", () => {
    map.getCanvas().style.cursor = "";
  });

  //Reported section
  // map.addSource("reported", {
  //   type: "geojson",
  //   data: JSON.parse(reported),
  //   cluster: true,
  //   clusterMaxZoom: 15,
  //   clusterRadius: 15,
  // });
  // //Reported cluster
  // map.addLayer({
  //   id: "reported-cluster",
  //   type: "circle",
  //   source: "reported",
  //   filter: ["has", "point_count"],
  //   paint: {
  //     "circle-color": reportedColor,
  //     "circle-radius": ["step", ["get", "point_count"], 15, 4, 30, 8, 45],
  //   },
  //   layout: { visibility: "visible" },
  // });
  // //Reported count
  // map.addLayer({
  //   id: "reported-count",
  //   type: "symbol",
  //   source: "reported",
  //   filter: ["has", "point_count"],
  //   layout: {
  //     "text-field": "{point_count_abbreviated}",
  //     "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
  //     "text-size": 12,
  //     "text-allow-overlap": true,
  //     visibility: "visible",
  //   },
  // });
  // //Reported uncluster
  // map.addLayer({
  //   id: "reported-unclustered",
  //   type: "circle",
  //   source: "reported",
  //   filter: ["!", ["has", "point_count"]],
  //   layout: { visibility: "visible" },
  //   paint: {
  //     "circle-color": reportedColor,
  //     "circle-radius": unclusteredRadius,
  //     "circle-stroke-width": 1,
  //     "circle-stroke-color": "#fff",
  //   },
  // });
  // //Reported label
  // map.addLayer({
  //   id: "reported-label",
  //   type: "symbol",
  //   source: "reported",
  //   filter: ["!", ["has", "point_count"]],
  //   layout: {
  //     "text-field": "QC",
  //     "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
  //     "text-size": 12,
  //     "text-allow-overlap": true,
  //     visibility: "visible",
  //   },
  //   paint: {
  //     "text-color": "#f2f7f4",
  //   },
  // });
  // //Inspect a cluster on click
  // map.on("click", "reported-cluster", (e) => {
  //   inspectCluster(e, "reported");
  // });

  // map.on("mouseenter", "reported-unclustered", (e) => {
  //   mouseEnterEventUnclustered(e, "reported");
  // });
  // map.on("mouseleave", "reported-unclustered", () => {
  //   mouseLeaveEventUnclustered("reported");
  // });
  // // Get info on click
  // map.on("click", "reported-unclustered", async (e) => {
  //   await handleClickEvent(e);
  // });
  // map.on("mouseenter", "reported-cluster", () => {
  //   map.getCanvas().style.cursor = "pointer";
  // });
  // map.on("mouseleave", "reported-cluster", () => {
  //   map.getCanvas().style.cursor = "";
  // });
});

function navigateToLocation(long, lat) {
  map.flyTo({
    center: [parseFloat(long), parseFloat(lat)],
    zoom: 15,
  });
}

const myModalEl_Edit = document.getElementById("editModal");
//Resize map in the modal
myModalEl_Edit.addEventListener("shown.bs.modal", (event) => {
  const mapDiv_edit = document.getElementById("mapbox_edit");
  map_edit.resize(); // Importance
});

// Mapbox generation
mapboxgl.accessToken =
  "pk.eyJ1IjoicGpsZW9uYXJkMzciLCJhIjoic2YyV2luUSJ9.lPoix24JhyR8sljAwjHg9A";

const map_edit = new mapboxgl.Map({
  container: "mapbox_edit", // container ID
  style: "mapbox://styles/mapbox/streets-v12", // style URL
  center: [106.707748, 10.780571], // starting position [lng, lat]
  zoom: 17, // starting zoom
});

map_edit.addControl(new mapboxgl.NavigationControl());
map_edit.addControl(new mapboxgl.FullscreenControl());
map_edit.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    // When active the map will receive updates to the device's location as it changes.
    trackUserLocation: true,
    // Draw an arrow next to the location dot to indicate which direction the device is heading.
    showUserHeading: true,
  })
);

const inspectCluster_edit = (e, layer) => {
  const features = map_edit.queryRenderedFeatures(e.point, {
    layers: [`${layer}-cluster`],
  });
  const clusterId = features[0].properties.cluster_id;
  map_edit.getSource(layer).getClusterExpansionZoom(clusterId, (err, zoom) => {
    if (err) return;

    map_edit.easeTo({
      center: features[0].geometry.coordinates,
      zoom: zoom,
    });
  });
};

const mouseEnterEventUnclustered_edit = (e, layer) => {
  let popup;
  if (layer == "sipulated") {
    popup = sipulatedPopup;
  } else if (layer == "nonSipulated") {
    popup = nonSipulatedPopup;
  } else if (layer == "reported") {
    popup = reportedPopup;
  } else if (layer == "selfReported") {
    popup = selfReportedPopup;
  }

  map_edit.getCanvas().style.cursor = "pointer";
  const coordinates = e.features[0].geometry.coordinates.slice();
  const { id, address, adsType, area, locationType, status } =
    e.features[0].properties;

  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  const popupDesc = `<b>${adsType}</b><p>${locationType}</p><p>${address}</p><h5>${status}</h5>`;
  popup.setLngLat(coordinates).setHTML(popupDesc).addTo(map_edit);
};

const mouseLeaveEventUnclustered_edit = (layer) => {
  let popup;
  if (layer == "sipulated") {
    popup = sipulatedPopup;
  } else if (layer == "nonSipulated") {
    popup = nonSipulatedPopup;
  } else if (layer == "reported") {
    popup = reportedPopup;
  } else if (layer == "selfReported") {
    popup = selfReportedPopup;
  }

  map_edit.getCanvas().style.cursor = "";
  popup.remove();
};

const handleClickEvent_edit = (e) => {
  //Use this to view all properties of a placement
  console.log(e.features[0].properties);
  const coordinates = e.features[0].geometry.coordinates.slice();
  dragMarker.setLngLat(coordinates).addTo(map_edit);

  //Change the address of the address input field (the disabled field)
  const addrInput = document.querySelector("#addressEditModal");
  const addrInput_send = document.querySelector("#addressEditSend");
  const address = `${e.features[0].properties.address}, ${
    JSON.parse(e.features[0].properties.area).ward
  }, ${JSON.parse(e.features[0].properties.area).district}`;
  addrInput.value = address;
  addrInput_send.value = address;

  //Alert the ID of selected placement
};

map_edit.on("load", async () => {
  const fetchedsipulatedData = await fetch(
    `${serverPath}/citizen/get-sipulated`
  );
  const fetchedNonSipulatedData = await fetch(
    `${serverPath}/citizen/get-nonsipulated`
  );
  const fetchedReportData = await fetch(`${serverPath}/citizen/get-report`);
  const sipulated = await fetchedsipulatedData.json();
  const nonSipulated = await fetchedNonSipulatedData.json();
  const reported = await fetchedReportData.json();

  map_edit.addSource("sipulated", {
    type: "geojson",
    data: JSON.parse(sipulated),
    cluster: true,
    clusterMaxZoom: 15,
    clusterRadius: 20,
  });
  //Sipulated cluster
  map_edit.addLayer({
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
  map_edit.addLayer({
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
  map_edit.addLayer({
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
  map_edit.addLayer({
    id: "sipulated-label",
    type: "symbol",
    source: "sipulated",
    filter: ["!", ["has", "point_count"]],
    layout: {
      "text-field": "QC",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
      "text-allow-overlap": true,
      visibility: "visible",
    },
    paint: {
      "text-color": "#f2f7f4",
    },
  });
  //Inspect a cluster on click
  map_edit.on("click", "sipulated-cluster", (e) => {
    inspectCluster_edit(e, "sipulated");
  });
  map_edit.on("mouseenter", "sipulated-unclustered", (e) => {
    mouseEnterEventUnclustered_edit(e, "sipulated");
  });
  map_edit.on("mouseleave", "sipulated-unclustered", (e) => {
    mouseLeaveEventUnclustered_edit("sipulated");
  });
  //Get unclustered info on click
  map_edit.on("click", "sipulated-unclustered", async (e) => {
    await handleClickEvent_edit(e);
  });
  map_edit.on("mouseenter", "sipulated-cluster", () => {
    map_edit.getCanvas().style.cursor = "pointer";
  });
  map_edit.on("mouseleave", "sipulated-cluster", () => {
    map_edit.getCanvas().style.cursor = "";
  });

  //Non sipulated section
  map_edit.addSource("nonSipulated", {
    type: "geojson",
    data: JSON.parse(nonSipulated),
    cluster: true,
    clusterMaxZoom: 15,
    clusterRadius: 15,
  });
  //Non sipulated cluster
  map_edit.addLayer({
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
  map_edit.addLayer({
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
  map_edit.addLayer({
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
  map_edit.addLayer({
    id: "nonSipulated-label",
    type: "symbol",
    source: "nonSipulated",
    filter: ["!", ["has", "point_count"]],
    layout: {
      "text-field": "QC",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
      "text-allow-overlap": true,
      visibility: "visible",
    },
    paint: {
      "text-color": "#f2f7f4",
    },
  });
  //Inspect a cluster on click
  map_edit.on("click", "nonSipulated-cluster", (e) => {
    inspectCluster(e, "nonSipulated");
  });
  //Get info when user moves their mouse over the unclustered layer
  map_edit.on("mouseenter", "nonSipulated-unclustered", (e) => {
    mouseEnterEventUnclustered(e, "nonSipulated");
  });
  map_edit.on("mouseleave", "nonSipulated-unclustered", () => {
    mouseLeaveEventUnclustered("nonSipulated");
  });
  //Get infor onclick
  map_edit.on("click", "nonSipulated-unclustered", async (e) => {
    await handleClickEvent_edit(e);
  });
  map_edit.on("mouseenter", "nonSipulated-cluster", () => {
    map_edit.getCanvas().style.cursor = "pointer";
  });
  map_edit.on("mouseleave", "nonSipulated-cluster", () => {
    map_edit.getCanvas().style.cursor = "";
  });

  // //Reported section
  // map_edit.addSource("reported", {
  //   type: "geojson",
  //   data: JSON.parse(reported),
  //   cluster: true,
  //   clusterMaxZoom: 15,
  //   clusterRadius: 15,
  // });
  // //Reported cluster
  // map_edit.addLayer({
  //   id: "reported-cluster",
  //   type: "circle",
  //   source: "reported",
  //   filter: ["has", "point_count"],
  //   paint: {
  //     "circle-color": reportedColor,
  //     "circle-radius": ["step", ["get", "point_count"], 15, 4, 30, 8, 45],
  //   },
  //   layout: { visibility: "visible" },
  // });
  // //Reported count
  // map_edit.addLayer({
  //   id: "reported-count",
  //   type: "symbol",
  //   source: "reported",
  //   filter: ["has", "point_count"],
  //   layout: {
  //     "text-field": "{point_count_abbreviated}",
  //     "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
  //     "text-size": 12,
  //     "text-allow-overlap": true,
  //     visibility: "visible",
  //   },
  // });
  // //Reported uncluster
  // map_edit.addLayer({
  //   id: "reported-unclustered",
  //   type: "circle",
  //   source: "reported",
  //   filter: ["!", ["has", "point_count"]],
  //   layout: { visibility: "visible" },
  //   paint: {
  //     "circle-color": reportedColor,
  //     "circle-radius": unclusteredRadius,
  //     "circle-stroke-width": 1,
  //     "circle-stroke-color": "#fff",
  //   },
  // });
  // //Reported label
  // map_edit.addLayer({
  //   id: "reported-label",
  //   type: "symbol",
  //   source: "reported",
  //   filter: ["!", ["has", "point_count"]],
  //   layout: {
  //     "text-field": "QC",
  //     "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
  //     "text-size": 12,
  //     "text-allow-overlap": true,
  //     visibility: "visible",
  //   },
  //   paint: {
  //     "text-color": "#f2f7f4",
  //   },
  // });
  // //Inspect a cluster on click
  // map_edit.on("click", "reported-cluster", (e) => {
  //   inspectCluster(e, "reported");
  // });

  // map_edit.on("mouseenter", "reported-unclustered", (e) => {
  //   mouseEnterEventUnclustered_edit(e, "reported");
  // });
  // map_edit.on("mouseleave", "reported-unclustered", () => {
  //   mouseLeaveEventUnclustered_edit("reported");
  // });
  // // Get info on click
  // map_edit.on("click", "reported-unclustered", async (e) => {
  //   await handleClickEvent_edit(e);
  // });
  // map_edit.on("mouseenter", "reported-cluster", () => {
  //   map_edit.getCanvas().style.cursor = "pointer";
  // });
  // map_edit.on("mouseleave", "reported-cluster", () => {
  //   map_edit.getCanvas().style.cursor = "";
  // });
});

function navigateToLocation_edit(long, lat) {
  map_edit.flyTo({
    center: [parseFloat(long), parseFloat(lat)],
    zoom: 15,
  });
}
