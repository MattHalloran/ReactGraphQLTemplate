import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { showPrice, PUBS } from 'utils';
import PubSub from 'pubsub-js';
import { skusQuery } from 'graphql/query';
import { initializeApollo } from 'graphql/utils/initialize';
import { SKU_SORT_OPTIONS } from '@local/shared';

const TITLE_FONT_SIZE = 30;
const LIST_FONT_SIZE = 24;

const centeredText = (text: string, doc, y: number) => {
    let textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    let textOffset = (doc.internal.pageSize.width - textWidth) / 2;
    doc.text(textOffset, y, text);
}

const skusToTable = (skus, priceVisible: boolean) => {
    return skus.map(sku => {
        const displayName = sku.product?.name ?? sku.sku;
        const size = isNaN(sku.size) ? sku.size : `#${sku.size}`;
        const availability = sku.availability ?? 'N/A';
        const price = showPrice(sku.price);
        if (priceVisible) return [displayName, size, availability, price]
        return [displayName, size, availability];
    });
}

export const printAvailability = (priceVisible: boolean, title: string) => {
    const client = initializeApollo();
    client.query({
        query: skusQuery,
        sortBy: SKU_SORT_OPTIONS.AZ
    }).then(response => {
        const data = response.data.skus;
        const table_data = skusToTable(data, priceVisible);
        // Default export is a4 paper, portrait, using millimeters for units
        const doc = new jsPDF();
        // Create title and subtitle
        doc.setFontSize(TITLE_FONT_SIZE);
        centeredText(title, doc, 10);
        let date = new Date();
        centeredText(`Availability: ${date.toDateString()}`, doc, 20);
        // Setup list
        doc.table(
            0, 
            0, 
            // Data
            table_data, 
            // Headers
            priceVisible ? ['Product', 'Size', 'Availability', 'Price'] : ['Product', 'Size', 'Availability'], 
            // Table config
            {
                printHeaders: true,
                autoSize: true,
                margins: 30,
                fontSize: LIST_FONT_SIZE,
                padding: 10,
                headerBackgroundColor: '#3D49B0',
                headerTextColor: '#FFFFFF'
            }
        )
        let windowReference = window.open();
        let blob = doc.output('pdfobjectnewwindow', {filename:`availability_${date.getDay()}-${date.getMonth()}-${date.getFullYear()}.pdf`});
        if(windowReference) windowReference.location = URL.createObjectURL(blob);
        else throw Error('Could not open new window.')
    }).catch(error => {
        PubSub.publish(PUBS.Snack, {message: 'Failed to load inventory.', severity: 'error', data: error });
    });
}
