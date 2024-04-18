//Update map when select specified ward
const filterSelect = document.querySelector("#filterSelect");
filterSelect.addEventListener("change", (e) => {
  // e.preventDefault();
  const selectedWardsHTML = filterSelect.selectedOptions;
  let selectedWard = [];
  for (let i = 0; i < selectedWardsHTML.length; i++) {
    selectedWard.push(selectedWardsHTML[i].label);
  }

  //Refilter
  filterSipulated.features = sipulated.features
    .filter((p) => {
      return (
        p.properties.area.district == accountDistrict &&
        selectedWard.includes(p.properties.area.ward)
      );
    })
    .slice();

  filterNonSipulated.features = nonSipulated.features
    .filter((p) => {
      return (
        p.properties.area.district == accountDistrict &&
        selectedWard.includes(p.properties.area.ward)
      );
    })
    .slice();

  filterReported.features = reported.features
    .filter((p) => {
      return (
        p.properties.area.district == accountDistrict &&
        selectedWard.includes(p.properties.area.ward)
      );
    })
    .slice();

  //Change data and rerender map
  map.getSource("sipulated").setData(filterSipulated);
  map.getSource("nonSipulated").setData(filterNonSipulated);
  map.getSource("reported").setData(filterReported);
});