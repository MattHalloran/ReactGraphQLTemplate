import Bull from 'bull';
import { uploadAvailabilityProcess } from './process';
import XLSX from 'xlsx';
import { HOST, PORT } from 'worker/connection';

const uploadAvailabilityQueue = new Bull('email', { redis: { port: PORT, host: HOST } });
uploadAvailabilityQueue.process(uploadAvailabilityProcess);

export async function uploadAvailability(filename: string) {
    // Wait to make sure file has been fully downloaded and is ready to read
    await new Promise(r => setTimeout(r, 1000));
    // Parse file
    const workbook = XLSX.readFile(`${process.env.PROJECT_DIR}/assets/${filename}`);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // Send to queue, with array of row data (array of arrays)
    uploadAvailabilityQueue.add({
        rows: XLSX.utils.sheet_to_json(sheet, { header: 1 })
    });
}