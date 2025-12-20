import { ageColors, modificationColors, voltageColors } from "./colors.js"

export const addLayers = (map, yearValue) => {
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
            [">", ["coalesce", ["get", "Year_end_name"], 3000], yearValue] // нет Year_end = линия не снесена
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
            [">", ["coalesce", ["get", "Year_end"], 3000], yearValue]
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
            [">", ["coalesce", ["get", "Year_end"], 3000], yearValue]
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

    const squareImage = new Image();
    squareImage.src = "../icons/white-square.png";
    squareImage.onload = () => {
        map.addImage("white-square", squareImage)
        map.addLayer({
            id: "stations-layer",
            type: "symbol",
            source: "points",
            "source-layer": "points",
            layout: {
                "icon-image": "white-square",
                "icon-overlap": "always",
                "icon-size": 0.5
            },
            filter: [
                "all",
                ["==", ["get", "Type"], "ЭС"],
                ["<=", ["get", "Year_start"], yearValue],
                [">", ["coalesce", ["get", "Year_end"], 3000], yearValue]
            ],
            minzoom: 5
        })
    }

    map.addLayer({
        id: "substations-layer",
        type: "circle",
        source: "points",
        "source-layer": "points",
        paint: {
            "circle-radius": 4,
            "circle-color": [
                "match",
                ["get", "Voltage"],
                110, "#00B4C8",
                220, "#C7C700",
                330, "#008C00",
                400, "#EF951E",
                500, "#C70000",
                750, "#0000C7",
                800, "#0000C7",
                "#FFFFFF"
            ],
            "circle-stroke-color": "#FFF",
            "circle-stroke-width": 1
        },
        filter: [
            "all",
            ["==", ["get", "Type"], "ПС"],
            ["<=", ["get", "Year_start"], yearValue],
            [">", ["coalesce", ["get", "Year_end"], 3000], yearValue]
        ],
        minzoom: 5
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
            [">", ["coalesce", ["get", "Year_end_name"], 3000], yearValue] // нет Year_end = линия не снесена
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
            [">", ["coalesce", ["get", "Year_end_name"], 3000], yearValue]
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
            [">", ["coalesce", ["get", "Year_end_name"], 3000], yearValue]
        ]
    })
}