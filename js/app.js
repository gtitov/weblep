import { addLayers } from "./addLayers.js"
import { addLegend } from "./addLegend.js"
import { addSources } from "./addSources.js"
import { ageColors } from "./colors.js"
import { getFilters } from "./filters.js"
import map from "./initMap.js"

map.on("load", () => {

    /* ---
    Года 
    --- */
    const yearsRange = document.getElementById("years-range")
    const yearsRangeMin = parseInt(yearsRange.getAttribute("min"))
    const yearsRangeMax = parseInt(yearsRange.getAttribute("max"))

    let yearValue = parseInt(yearsRange.value)
    const filters = getFilters(yearValue)

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
        const filters = getFilters(yearValue)

        map.setFilter("pl-layer-interactions", [
            "all",
            ...filters.yearNameFilter,
            filters.moscowFilter
        ])

        map.setFilter("pl-layer-voltage", [
            "all",
            ...filters.yearNameFilter,
            filters.moscowFilter
        ])

        map.setFilter("pl-layer-age", [
            "all",
            ...filters.yearFilter,
            filters.moscowFilter
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
            ...filters.yearFilter,
            filters.moscowFilter
        ])
        map.setFilter("modifications-layer", ["==", ["get", "Year"], yearValue])

        map.setFilter("stations-layer", [
            "all",
            ["==", ["get", "Type"], "ЭС"],
            ...filters.yearFilter,
            filters.moscowFilter
        ])
        map.setFilter("substations-layer", [
            "all",
            ["==", ["get", "Type"], "ПС"],
            ...filters.yearFilter,
            filters.moscowFilter
        ])
    })


    /* ---
    Карта 
    --- */
    addSources(map)
    addLayers(map, yearValue)
    addLegend()

    map.on("mousemove", "pl-layer-interactions", (e) => {
        if (map.getZoom() < 5) return
        map.setFilter(
            "pl-layer-hover", // mousemove on interactions layer changes hover layer
            [
                'all',
                ["==", ["get", "Name"], e.features[0].properties.Name],
                ...filters.yearNameFilter,
                filters.moscowFilter
            ]
        )
    })

    map.on("mouseleave", "pl-layer-interactions", () => {
        map.setFilter("pl-layer-hover", ["literal", false])
    })

    map.on("click", () => {
        map.setFilter("pl-layer-click", ["literal", false])
    })

    map.on("click", "pl-layer-interactions", (e) => {
        const clickedNames = e.features.map(f => f.properties.Name)
        map.setFilter(
            "pl-layer-click",
            [
                'all',
                ["in", ["get", "Name"], ["literal", clickedNames]],
                ...filters.yearNameFilter,
                filters.moscowFilter
            ]

        )
        map.easeTo({ center: e.lngLat })
        const popupContent = e.features.map(f => `<p>${f.properties.Name}</p>`).join('')
        new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map)
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