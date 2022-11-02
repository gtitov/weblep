document.addEventListener("DOMContentLoaded", function() {
    const vector_layers = {  // according to lep.json
        "PL_voltage": "Voltage of power lines",
        "PL_modifications": "Modifications of power lines",
        "PL_age": "Age of power lines",
        "Endpoints": "Plants & substations",
        "El_centrality": "Centrality",
        "PL_BC": "PL BC",
        "EP_CC": "EP CC"

    }
    const satellite_legend = "Satellite"
    const osm_legend = "OSM"
    const pl_voltage_legend = "Voltage of power lines"
    const pl_modifications_legend = "Modifications of power lines"
    const pl_age_legend = "Age of power lines"
    const endpoints_legend = "Plants & substations"
    const el_centrality_legend = "el_centrality"
    const pl_bc_legend = "pl_bc"
    const ep_cc_legend = "ep_cc"
    const wms_attribution = "&copy A. M. Karpachevskiy, G. S. Titov"

    const yearRange = document.getElementById("yearrange")
    const yearLabel = document.getElementById("yearlabel")
    yearLabel.innerText = yearRange.value

    const map = new maplibregl.Map({
        container: 'mapid', // container id
        // DOCS: https://maplibre.org/maplibre-gl-js-docs/style-spec/
        style: "lep.json",
        center: [37.625, 55.751], // starting position [lng, lat]
        zoom: 5, // starting zoom,
        minZoom: 4,
        maxZoom: 10
    });

    map.on("load", function() {
        document.getElementById("zoom-in").addEventListener("click", () => map.zoomIn())
        document.getElementById("zoom-out").addEventListener("click", () => map.zoomOut())

        // const a = () => {console.log(this.value)}
        // yearRange.oninput = a

        const updateYearFilter = (year) => {
            Object.keys(vector_layers).forEach(layer_name => {
                map.setFilter(layer_name, ["==", ["get", "year"], year])
            })
        }

        updateYearFilter(parseInt(yearRange.value))

        yearRange.addEventListener("input", () => {
            const yearValue = parseInt(yearRange.value)
            yearLabel.innerText = yearValue
            updateYearFilter(yearValue)
        })
    })




})









// const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
// const satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaW93cTc1MCIsImEiOiJja3QwYzJpazMwN2ltMnVwOW0zbnJrOWh4In0.bBbrEq6D4MkMvX--IxJVUw")

// // osm.addTo(map)
// satellite.addTo(map)



// const pl_voltage = getWMSLayer("pl_voltage", isoYear).addTo(map)
// const pl_modifications = getWMSLayer("pl_modifications", isoYear)
// const pl_age = getWMSLayer("pl_age", isoYear)
// const endpoints = getWMSLayer("endpoints", isoYear).addTo(map)
// const el_centrality = getWMSLayer("el_centrality", isoYear)
// const pl_bc = getWMSLayer("pl_bc", isoYear)
// const ep_cc = getWMSLayer("ep_cc", isoYear)


// const basemapControls = {
//     [satellite_legend]: satellite,
//     [osm_legend]: osm
// }

// const layersControls = {
//     [pl_voltage_legend]: pl_voltage,
//     [pl_modifications_legend]: pl_modifications,
//     [pl_age_legend]: pl_age,
//     [endpoints_legend]: endpoints,
//     [el_centrality_legend]: el_centrality,
//     [pl_bc_legend]: pl_bc,
//     [ep_cc_legend]: ep_cc
// }

// L.control.layers(basemapControls, layersControls).addTo(map);










const legendToggle = document.getElementById("legend-toggle")
const legend = document.getElementById("legend")
legendToggle.addEventListener("click", () => legend.clientWidth ? legend.style.display = "none" : legend.style.display = "block")





