maplibregl.addProtocol("pmtiles", new pmtiles.Protocol().tile)

const map = new maplibregl.Map({
    style: 'https://raw.githubusercontent.com/gtitov/basemaps/refs/heads/master/positron-nolabels.json',
    center: [90, 50],
    zoom: 2.5,
    maxZoom: 11,
    container: 'map',
    hash: true
})

map.getCanvas().style.cursor = "crosshair"

// Смещение за открытый sidebar
map.setPadding({ left: 400 })

// disable map rotation using right click + drag
map.dragRotate.disable();

// disable map rotation using touch rotation gesture
map.touchZoomRotate.disableRotation();

map.addControl(new maplibregl.NavigationControl());
map.addControl(new maplibregl.ScaleControl(), 'bottom-right')

// Легенда
const voltageColors = {
    220: "#C7C700",
    330: "#008C00",
    400: "#EF951E",
    500: "#C70000",
    750: "#0000C7",
    800: "#0000C7"
}

const ageColors = {
    0: "#FDE725",
    2: "#C2E023",
    5: "#86d549",
    10: "#52c569",
    15: "#2ab07f",
    20: "#1e9b8a",
    30: "#25858e",
    40: "#2d708e",
    50: "#38588c",
    60: "#433e85",
    70: "#482173",
    80: "#440154",
}

const modificationColors = {
    "Branch construction": "#24e5d8",
    "Branch dismantling": "#e27d64",
    "Cut construction": "#10e829",
    "Cut dismantling": "#e327da",
    "Line dismantling": "#e31a1c",
    "New line construction": "#1d8c3b",
    "Re-routing construction": "#52ced2",
    "Re-routing dismantling": "#f0d730",
    "Voltage modification": "#ad4323",
    "No modifications": "#aaa"
}

const modificationTranslations = {
    "Branch construction": "Строительство отпайки",
    "Branch dismantling": "Демонтаж отпайки",
    "Cut construction": "Строительство заходов разрезки",
    "Cut dismantling": "Демонтаж линии при разрезке",
    "Line dismantling": "Демонтаж линии",
    "New line construction": "Строительство новой линии",
    "Re-routing construction": "Переустройство линии",
    "Re-routing dismantling": "Демонтаж при переустройстве",
    "Voltage modification": "Изменение напряжения",
    "No modifications": "Неизменные сегменты"
}

const voltageLegendElements = Object.entries(voltageColors).map(([voltage, color]) => {
    return `<div style="display: flex; gap: 10px; align-items: center; padding: 10px;">
            <div style="background-color: ${color}; height: 5px; width: 25px;"></div>
            <span>${voltage}</span>
        </div>`
})
const voltageLegend = `<div id="legend-voltage"><h4>Напряжение, кВ</h4>${voltageLegendElements.join("")}</div>`

const ageColorsArray = Object.entries(ageColors)
const ageLegendElements = ageColorsArray.map(([age, color], index) => {
    if (age == "0") {
        return `<div style="display: flex; gap: 10px; align-items: center; padding: 10px;">
            <div style="background-color: ${color}; height: 5px; width: 25px;"></div>
            <span>менее 2</span>
            </div>`
    }
    if (age == "80") {
        return `<div style="display: flex; gap: 10px; align-items: center; padding: 10px;">
            <div style="background-color: ${color}; height: 5px; width: 25px;"></div>
            <span>более 80</span>
            </div>`
    }
    return `<div style="display: flex; gap: 10px; align-items: center; padding: 10px;">
            <div style="background-color: ${color}; height: 5px; width: 25px;"></div>
            <span>${ageColorsArray[index][0]} - ${ageColorsArray[index + 1][0]}</span>
        </div>`

})
const ageLegend = `<div id="legend-age" style="display: none"><h4>Возраст, лет</h4>${ageLegendElements.join("")}</div>`

const modificationsLegendElements = Object.entries(modificationColors).map(([modification, color]) => {
    return `<div style="display: flex; gap: 10px; align-items: center; padding: 10px;">
            <div style="background-color: ${color}; height: 5px; width: 25px;"></div>
            <span>${modificationTranslations[modification]}</span>
        </div>`
})
const modificationsLegend = `<div id="legend-modifications" style="display: none"><h4>Модификации</h4>${modificationsLegendElements.join("")}</div>`

document.getElementById("legend").innerHTML = voltageLegend + ageLegend + modificationsLegend

map.on("load", () => {

    /* ---
    Года 
    --- */
    const yearsRange = document.getElementById("years-range")
    const yearsRangeMin = parseInt(yearsRange.getAttribute("min"))
    const yearsRangeMax = parseInt(yearsRange.getAttribute("max"))
    let yearValue = parseInt(yearsRange.value)
    yearsRange.addEventListener("input", (e) => {
        yearValue = parseInt(e.target.value)
        document.getElementById("year-label-sidebar").innerText = yearValue
        document.getElementById("year-label-nosidebar").innerText = yearValue
        if (playInProgress) return
        if (yearValue == yearsRangeMin) {
            document.getElementById("year-minus").disabled = true
            document.getElementById("year-plus").disabled = false
            document.getElementById("year-play").disabled = false
        } else if (yearValue == yearsRangeMax) {
            document.getElementById("year-minus").disabled = false
            document.getElementById("year-plus").disabled = true
            document.getElementById("year-play").disabled = true
        } else {
            document.getElementById("year-minus").disabled = false
            document.getElementById("year-plus").disabled = false
            document.getElementById("year-play").disabled = false
        }
    })

    document.getElementById("year-minus").addEventListener("click", () => {
        yearsRange.value = parseInt(yearsRange.value) - 1
        yearsRange.dispatchEvent(new Event('input'))
        yearsRange.dispatchEvent(new Event('change'))
    })
    document.getElementById("year-plus").addEventListener("click", () => {
        yearsRange.value = parseInt(yearsRange.value) + 1
        yearsRange.dispatchEvent(new Event('input'))
        yearsRange.dispatchEvent(new Event('change'))
    })
    let playInProgress = false
    document.getElementById("year-play").addEventListener("click", async () => {
        playInProgress = true
        yearsRange.disabled = true
        document.getElementById("year-minus").disabled = true
        document.getElementById("year-plus").disabled = true
        document.getElementById("year-play").disabled = true
        document.getElementById("year-stop").disabled = false
        for (let i = yearValue; i <= yearsRangeMax; i++) {
            if (playInProgress != true) {
                break
            }
            yearsRange.value = i
            yearsRange.dispatchEvent(new Event('input'))
            yearsRange.dispatchEvent(new Event('change'))
            await new Promise(resolve => setTimeout(resolve, 500))
        }
        playInProgress = false
        yearsRange.disabled = false
        document.getElementById("year-minus").disabled = false
        document.getElementById("year-plus").disabled = false
        document.getElementById("year-play").disabled = false
        document.getElementById("year-stop").disabled = true
    })
    document.getElementById("year-stop").addEventListener("click", () => {
        playInProgress = false
    })

    yearsRange.addEventListener("change", () => {
        map.setFilter("pl-layer-interactions", [
            "all",
            ["<=", ["get", "Year_start_name"], yearValue],
            [">", ["coalesce", ["get", "Year_end_name"], 3000], yearValue]
        ])

        map.setFilter("pl-layer-voltage", [
            "all",
            ["<=", ["get", "Year_start_name"], yearValue],
            [">", ["coalesce", ["get", "Year_end_name"], 3000], yearValue]
        ])

        map.setFilter("pl-layer-age", [
            "all",
            ["<=", ["get", "Year_start"], yearValue],
            [">", ["coalesce", ["get", "Year_end"], 3000], yearValue]
        ])
        map.setPaintProperty("pl-layer-age", "line-color", [
            "step",
            ["-", yearValue, ["get", "Year_start"]],
            ageColors["0"],
            2, ageColors["2"],
            5, ageColors["5"],
            10, ageColors["10"],
            15, ageColors["15"],
            20, ageColors["20"],
            30, ageColors["30"],
            40, ageColors["40"],
            50, ageColors["50"],
            60, ageColors["60"],
            70, ageColors["70"],
            80, ageColors["80"]
        ])


        map.setFilter("pl-grey-layer", [
            "all",
            ["<=", ["get", "Year_start"], yearValue],
            [">", ["coalesce", ["get", "Year_end"], 3000], yearValue]
        ])
        map.setFilter("modifications-layer", ["==", ["get", "Year"], yearValue])
    })


    /* ---
    Карта 
    --- */

    map.addSource("pl", {
        type: "vector",
        url: "pmtiles://https://resources.powerlines.one/pl7.pmtiles",
        attribution: "Карпачевский А. М., Титов Г. С."
    })
    map.addSource("modifications", {
        type: "vector",
        url: "pmtiles://https://resources.powerlines.one/modifications7.pmtiles"
    })


    map.addLayer({
        // напряжение
        id: "pl-layer-voltage",
        type: "line",
        source: "pl",
        "source-layer": "PL",
        paint: {
            "line-color": [
                "match",
                ["get", "Voltage"],
                220, voltageColors["220"],
                330, voltageColors["330"],
                400, voltageColors["400"],
                500, voltageColors["500"],
                750, voltageColors["750"],
                800, voltageColors["800"],
                "#999999"
            ],
            "line-width": 2
        },
        filter: [
            "all",
            ["<=", ["get", "Year_start_name"], yearValue],
            [">=", ["coalesce", ["get", "Year_end_name"], 3000], yearValue] // нет Year_end = линия не снесена
        ]
    })
    map.addLayer({
        // возраст
        id: "pl-layer-age",
        type: "line",
        source: "pl",
        "source-layer": "PL",
        paint: {
            "line-color": [
                "step",
                ["-", yearValue, ["get", "Year_start"]],
                ageColors["0"],
                2, ageColors["2"],
                5, ageColors["5"],
                10, ageColors["10"],
                15, ageColors["15"],
                20, ageColors["20"],
                30, ageColors["30"],
                40, ageColors["40"],
                50, ageColors["50"],
                60, ageColors["60"],
                70, ageColors["70"],
                80, ageColors["80"]
            ],
            "line-width": 2
        },
        layout: { visibility: "none" },
        filter: [
            "all",
            ["<=", ["get", "Year_start"], yearValue],
            [">=", ["coalesce", ["get", "Year_end"], 3000], yearValue]
        ]
    })

    map.addLayer({
        id: "pl-grey-layer",
        type: "line",
        source: "pl",
        "source-layer": "PL",
        paint: {
            "line-color": "grey",
            "line-width": 1
        },
        layout: { visibility: "none" },
        filter: [
            "all",
            ["<=", ["get", "Year_start"], yearValue],
            [">=", ["coalesce", ["get", "Year_end"], 3000], yearValue]
        ]
    })
    map.addLayer({
        id: "modifications-layer",
        type: "line",
        source: "modifications",
        "source-layer": "modifications",
        paint: {
            "line-color": [
                "match",
                ["get", "Segment_Type"],
                "Branch construction", modificationColors["Branch construction"],
                "Branch dismantling", modificationColors["Branch dismantling"],
                "Cut construction", modificationColors["Cut construction"],
                "Cut dismantling", modificationColors["Cut dismantling"],
                "Line dismantling", modificationColors["Line dismantling"],
                "New line construction", modificationColors["New line construction"],
                "Re-routing construction", modificationColors["Re-routing construction"],
                "Re-routing dismantling", modificationColors["Re-routing dismantling"],
                modificationColors["No modifications"]
            ],
            "line-width": 2
        },
        layout: { visibility: "none" },
        filter: ["==", ["get", "Year"], yearValue]
    })

    map.addLayer({
        // отслеживание ховера и кликов
        id: "pl-layer-interactions",
        type: "line",
        source: "pl",
        "source-layer": "PL",
        paint: {
            "line-color": "transparent",
            "line-width": 4
        },
        filter: [
            "all",
            ["<=", ["get", "Year_start_name"], yearValue],
            [">=", ["coalesce", ["get", "Year_end_name"], 3000], yearValue] // нет Year_end = линия не снесена
        ]
    })
    map.addLayer({
        // подсветка ховера
        id: "pl-layer-hover",
        type: "line",
        source: "pl",
        "source-layer": "PL",
        paint: {
            "line-color": "cyan",
            "line-opacity": 0.7,
            "line-width": 4
        },
        filter: [
            'all',
            ["==", ["get", "Name"], ''],
            ["<=", ["get", "Year_start_name"], yearValue],
            [">=", ["coalesce", ["get", "Year_end_name"], 3000], yearValue]
        ]
    })
    map.addLayer({
        // подсветка клика
        id: "pl-layer-click",
        type: "line",
        source: "pl",
        "source-layer": "PL",
        paint: {
            "line-color": "cyan",
            "line-width": 4
        },
        filter: [
            'all',
            ["==", ["get", "Name"], ''],
            ["<=", ["get", "Year_start_name"], yearValue],
            [">=", ["coalesce", ["get", "Year_end_name"], 3000], yearValue]
        ]
    })

    map.on("mousemove", "pl-layer-interactions", (e) => {
        if (map.getZoom() < 5) return
        map.setFilter(
            "pl-layer-hover",
            [
                'all',
                ["==", ["get", "Name"], e.features[0].properties.Name],
                ["<=", ["get", "Year_start_name"], yearValue],
                [">=", ["coalesce", ["get", "Year_end_name"], 3000], yearValue]
            ]
        )
    })

    map.on("click", () => {
        map.setFilter("pl-layer-click", ["==", ["get", "Name"], ''])
    })

    map.on("click", "pl-layer-interactions", (e) => {
        const clickedNames = e.features.map(f => f.properties.Name)
        map.setFilter(
            "pl-layer-click",
            [
                'all',
                ["in", ["get", "Name"], ["literal", clickedNames]],
                ["<=", ["get", "Year_start_name"], yearValue],
                [">=", ["coalesce", ["get", "Year_end_name"], 3000], yearValue]
            ]

        )
        map.easeTo({ center: e.lngLat })
        const popupContent = e.features.map(f => `<p>${f.properties.Name}</p>`).join('')
        new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map)
    })

    map.on("mouseenter", "pl-layer-interactions", () => {
        // map.getCanvas().style.cursor = "pointer"
    })
    map.on("mouseleave", "pl-layer-interactions", () => {
        // map.getCanvas().style.cursor = ""
        map.setFilter("pl-layer-hover", ["==", ["get", "Name"], ''])
    })


    document.getElementById("voltage-tab").addEventListener("click", () => {
        map.setLayoutProperty("pl-layer-voltage", "visibility", "visible")
        map.setLayoutProperty("pl-layer-age", "visibility", "none")
        map.setLayoutProperty("modifications-layer", "visibility", "none")
        map.setLayoutProperty("pl-grey-layer", "visibility", "none")


        document.getElementById("legend-voltage").style.display = "block"
        document.getElementById("legend-age").style.display = "none"
        document.getElementById("legend-modifications").style.display = "none"


        document.getElementById("voltage-tab").classList.add("selected")
        document.getElementById("age-tab").classList.remove("selected")
        document.getElementById("modifications-tab").classList.remove("selected")
    })
    document.getElementById("age-tab").addEventListener("click", () => {
        map.setLayoutProperty("pl-layer-voltage", "visibility", "none")
        map.setLayoutProperty("pl-layer-age", "visibility", "visible")
        map.setLayoutProperty("modifications-layer", "visibility", "none")
        map.setLayoutProperty("pl-grey-layer", "visibility", "none")

        document.getElementById("legend-voltage").style.display = "none"
        document.getElementById("legend-age").style.display = "block"
        document.getElementById("legend-modifications").style.display = "none"

        document.getElementById("voltage-tab").classList.remove("selected")
        document.getElementById("age-tab").classList.add("selected")
        document.getElementById("modifications-tab").classList.remove("selected")

    })
    document.getElementById("modifications-tab").addEventListener("click", () => {
        map.setLayoutProperty("pl-layer-voltage", "visibility", "none")
        map.setLayoutProperty("pl-layer-age", "visibility", "none")
        map.setLayoutProperty("modifications-layer", "visibility", "visible")
        map.setLayoutProperty("pl-grey-layer", "visibility", "visible")

        document.getElementById("legend-voltage").style.display = "none"
        document.getElementById("legend-age").style.display = "none"
        document.getElementById("legend-modifications").style.display = "block"

        document.getElementById("voltage-tab").classList.remove("selected")
        document.getElementById("age-tab").classList.remove("selected")
        document.getElementById("modifications-tab").classList.add("selected")
    })

    document.getElementById("close-sidebar").addEventListener("click", () => {
        map.easeTo({
            padding: {
                left: 0
            },
            duration: 500
        })
        document.getElementById("sidebar").classList.add("collapsed")

    })

    document.getElementById("open-sidebar").addEventListener("click", () => {
        map.easeTo({
            padding: {
                left: 400
            },
            duration: 500
        })
        document.getElementById("sidebar").classList.remove("collapsed")
    })
})