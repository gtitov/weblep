const yearRange = document.getElementById("yearrange")
const yearLabel = document.getElementById("yearlabel")
yearLabel.innerText = yearRange.value
const isoYear = yearRange.value + "-01-01"

const map = L.map('mapid').setView([56.5, 37.09], 7);
const OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
OSM.addTo(map)
const getWMSLayer = function (layerId, time) {
    return (
        L.tileLayer.wms('http://powerlines.one/wms?', {
            layers: layerId,
            transparent: true,
            format: 'image/png',
            time: time
        })
    )
}
const pl = getWMSLayer("PL", isoYear).addTo(map)
const substations = getWMSLayer("substations", isoYear).addTo(map)
const generation = getWMSLayer("generation", isoYear).addTo(map)
const other = getWMSLayer("other", isoYear).addTo(map)

const layersControls = {
    "ЛЭП": pl,
    "Подстанции": substations,
    "Станции": generation,
    "Прочее": other,
}

L.control.layers({ OSM }, layersControls).addTo(map);


const updateYearLabel = function () {
    yearLabel.innerText = this.value
}

const updateYearValue = function () {
    const yearValue = this.value
    this.setAttribute("value", yearValue)
    const yearIso = yearValue + "-01-01"
    pl.setParams({time: yearIso})
    substations.setParams({time: yearIso})
    generation.setParams({time: yearIso})
    other.setParams({time: yearIso})
}


yearRange.oninput = updateYearLabel
yearRange.onchange = updateYearValue






