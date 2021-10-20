import { showPrice, PUBS } from 'utils';
import PubSub from 'pubsub-js';
import { skusQuery } from 'graphql/query';
import { initializeApollo } from 'graphql/utils/initialize';
import { SKU_SORT_OPTIONS } from '@local/shared';
import { skus_skus } from 'graphql/generated/skus';

// Convert sku data to a PDF
const dataToPdf = async (data: any, priceVisible: boolean, title: string): Promise<any> => {
    // Dynamic import for code-splitting
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const TITLE_FONT_SIZE = 30;

    // Helper method for creating titles, subtitles, and other centered text
    const centeredText = (text: string, doc: any, y: number) => {
        const pageWidth = doc.internal.pageSize.width;
        const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const textOffset = (pageWidth - textWidth) / 2;
        doc.text(textOffset, y, text);
    }

    const table_data = data.map((sku: skus_skus) => {
        const displayName = sku.product?.name ?? sku.sku;
        const size = isNaN(Number(sku.size)) ? sku.size : `#${sku.size}`;
        const availability = sku.availability ?? 'N/A';
        const price = showPrice(sku.price ?? '');
        if (priceVisible) return [displayName, size, availability, price]
        return [displayName, size, availability];
    });

    // Default export is a4 paper, portrait, using millimeters for units
    const doc = new jsPDF();
    const date = new Date();
    // Create title and subtitle
    doc.setFontSize(TITLE_FONT_SIZE);
    centeredText(title, doc, 10);
    centeredText(`Availability: ${date.toDateString()}`, doc, 20);
    // Create table
    // @ts-ignore
    doc.autoTable({
        margin: { top: 30 },
        head: priceVisible ? [['Product', 'Size', 'Availability', 'Price']] : [['Product', 'Size', 'Availability']],
        body: table_data
    })
    // Open in new tab if possible, or prompt to download
    const filename = `availability_${date.getDay()}-${date.getMonth()}-${date.getFullYear()}.pdf`;
    let windowReference = window.open();
    // @ts-ignore
    if (windowReference) windowReference.location = URL.createObjectURL(doc.output('blob', { filename }));
    else doc.save(filename);
}

export const printAvailability = (priceVisible: boolean, title: string) => {
    const client = initializeApollo();
    client.query({
        query: skusQuery,
        sortBy: SKU_SORT_OPTIONS.AZ
    }).then(response => {
        dataToPdf(response.data.skus, priceVisible, title);
    }).catch(error => {
        PubSub.publish(PUBS.Snack, { message: 'Failed to load inventory.', severity: 'error', data: error });
    });
}
