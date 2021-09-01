import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { showPrice, PUBS, PubSub } from 'utils';
import { skusQuery } from 'graphql/query';
import { initializeApollo } from 'graphql/initialize';
import { getPlantTrait } from "./plantTools";

const TITLE_FONT_SIZE = 30;
const LIST_FONT_SIZE = 24;

const centeredText = (text, doc, y) => {
    let textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    let textOffset = (doc.internal.pageSize.width - textWidth) / 2;
    doc.text(textOffset, y, text);
}

const skusToTable = (skus, showPrice) => {
    return skus.map(sku => {
        const displayName = sku.plant?.latinName ?? getPlantTrait('commonName', sku.plant) ?? sku.sku;
        const size = isNaN(sku.size) ? sku.size : `#${sku.size}`;
        const availability = sku.availability ?? 'N/A';
        const price = showPrice(sku.price);
        if (showPrice) return [displayName, size, availability, price]
        return [displayName, size, availability];
    });
}

export const printAvailability = (session, title) => {
    let windowReference = window.open();
    const client = initializeApollo();
    client.query({
        query: skusQuery
    }).then(response => {
        const data = response.data.skus;
        const showPrice = session !== null;
        const table_data = skusToTable(data, showPrice);
        // Default export is a4 paper, portrait, using millimeters for units
        const doc = new jsPDF();
        doc.setFontSize(TITLE_FONT_SIZE);
        centeredText(title, doc, 10);
        let date = new Date();
        centeredText(`Availability: ${date.toDateString()}`, doc, 20);
        doc.setFontSize(LIST_FONT_SIZE);
        let header = showPrice ? [['Plant', 'Size', 'Availability', 'Price']] : [['Plant', 'Size', 'Availability']]
        doc.autoTable({
            margin: { top: 30 },
            head: header,
            body: table_data,
        })
        let blob = doc.output('blob', {filename:`availability_${date.getDay()}-${date.getMonth()}-${date.getFullYear()}.pdf`});
        windowReference.location = URL.createObjectURL(blob);
    }).catch(error => {
        console.log('RAN INTO ERROR', error)
        PubSub.publish(PUBS.Snack, {message: 'Failed to load inventory.', severity: 'error', data: error });
    });
}
