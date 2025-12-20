import { ageColors, modificationColors, voltageColors } from "./colors.js"
import { modificationTranslations } from "./translations.js"

export const addLegend = () => {
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
}

