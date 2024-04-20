const sipulatedColor = "#40eb34";
const nonSipulatedColor = "#d3eb34";
const reportedColor = "#eb3434";
const selfReportedColor = "#848991";
const unclusteredRadius = 12;

let selectedLocation;
let selectedBoard;
let adsData; //Ads data from selected location

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

const searchFunc = async (e) => {
  e.preventDefault();

  const apiKey = "8c7c7c956fdd4a598e2301d88cb48135";
  const query = locationInput.value;
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
    console.log(data);
    const geometry = data.results[0].geometry;
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
    layers.forEach((layer) => {
      map.setLayoutProperty(layer, "visibility", "visible");
    });
  } else {
    layers.forEach((layer) => {
      map.setLayoutProperty(layer, "visibility", "none");
    });
  }
};

const initLngLat = async (district, ward) => {
  const apiKey = "8c7c7c956fdd4a598e2301d88cb48135";
  const query = `${district} ${ward} Hồ Chí Minh`;
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

  const ward =
    document.querySelector("#ward-filter").innerText == "Phường"
      ? ""
      : document.querySelector("#ward-filter").innerText.trim();
  const district =
    document.querySelector("#district-filter").innerText == "Quận"
      ? ""
      : document.querySelector("#district-filter").innerText.trim();

  //Init location
  if (ward != "" || district != "") {
    initLngLat(district, ward);
  }

  filterSipulated.features = sipulated.features.filter((p) => {
    return (
      p.properties.area.district.includes(district) &&
      p.properties.area.ward.includes(ward)
    );
  });
  filterNonSipulated.features = nonSipulated.features.filter((p) => {
    return (
      p.properties.area.district.includes(district) &&
      p.properties.area.ward.includes(ward)
    );
  });
  filterReported.features = reported.features.filter((p) => {
    return (
      p.properties.area.district.includes(district) &&
      p.properties.area.ward.includes(ward)
    );
  });
  // Sipulated source data
  map.addSource("sipulated", {
    type: "geojson",
    data: filterSipulated,
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
  //Get info when user moves their mouse over the unclustered layer

  map.on("mouseenter", "sipulated-unclustered", (e) => {
    mouseEnterEventUnclustered(e, "sipulated");
  });
  map.on("mouseleave", "sipulated-unclustered", (e) => {
    mouseLeaveEventUnclustered("sipulated");
  });
  //Get unclustered info on click
  // map.on("click", "sipulated-unclustered", async (e) => {
  //   await getInfoOnclickUnclustered(e);
  // });
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
  // map.on("click", "nonSipulated-unclustered", async (e) => {
  //   await getInfoOnclickUnclustered(e);
  // });
  map.on("mouseenter", "nonSipulated-cluster", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "nonSipulated-cluster", () => {
    map.getCanvas().style.cursor = "";
  });

});

const locationMarker = new mapboxgl.Marker({});

function navigateToLocation(long, lat) {
  console.log(long, lat);
  long = parseFloat(long);
  lat = parseFloat(lat);
  map.flyTo({
    center: [parseFloat(long), parseFloat(lat)],
    zoom: 20,
  });
  locationMarker.setLngLat([long, lat]).addTo(map);
}
