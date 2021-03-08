import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { BUSINESS_NAME, SORT_OPTIONS } from 'utils/consts';
import { displayPrice } from 'utils/displayPrice';
import { getInventory } from "query/http_promises";
import { getSession } from "./storage";

const TITLE_FONT_SIZE = 30;
const LIST_FONT_SIZE = 24;

const centeredText = (text, doc, y) => {
    let textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    let textOffset = (doc.internal.pageSize.width - textWidth) / 2;
    doc.text(textOffset, y, text);
}

const data_to_table = (data, showPrice) => {
    let result = [];
    for (let i = 0; i < data.length; i++) {
        let plant = data[i];
        let plant_name = plant.latin_name ?? plant.common_name;
        if (!plant.skus || plant.skus.length === 0) continue;
        for (let j = 0; j < plant.skus.length; j++) {
            let sku = plant.skus[j];
            let display_name = plant_name ?? sku.sku;
            let size = isNaN(sku.size) ? sku.size : `#${sku.size}`;
            let availability = sku.availability ?? 'N/A';
            if (showPrice) {
                let price = displayPrice(sku.price);
                result.push([display_name, size, availability, price]);
            } else {
                result.push([display_name, size, availability]);
            }
        }
    }
    return result;
}

export const printAvailability = () => {
    getInventory(SORT_OPTIONS[0].value, 0, false)
        .then(response => {
            let showPrice = getSession() !== null;
            let table_data = data_to_table(response.page_results, showPrice);
            // Default export is a4 paper, portrait, using millimeters for units
            const doc = new jsPDF();
            doc.setFontSize(TITLE_FONT_SIZE);
            centeredText(BUSINESS_NAME, doc, 10);
            let date = new Date();
            centeredText(`Availability: ${date.toDateString()}`, doc, 20);
            doc.setFontSize(LIST_FONT_SIZE);
            let header = showPrice ? [['Plant', 'Size', 'Availability', 'Price']] : [['Plant', 'Size', 'Availability']]
            doc.autoTable({
                margin: { top: 30 },
                head: header,
                body: table_data,
            })
            doc.output('dataurlnewwindow', {filename:`availability_${date.getDay()}-${date.getMonth()}-${date.getFullYear()}.pdf`});
        })
        .catch(err => {
            console.error(err);
            alert('Error: Could not load inventory');
        });
}
