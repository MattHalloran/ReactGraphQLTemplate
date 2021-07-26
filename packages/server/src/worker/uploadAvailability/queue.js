import Bull from 'bull';
import { uploadAvailabilityProcess } from './process';
import xlsx from 'node-xlsx';

const uploadAvailabilityQueue = new Bull('uploadAvailability', { redis: process.env.REDIS_CONN });
uploadAvailabilityQueue.process(uploadAvailabilityProcess);

export async function uploadAvailability(filename) {
    const parsed = xlsx.parse(`${process.env.PROJECT_DIR}/assets/${filename}`);
    const rows = parsed[0].data;
    uploadAvailabilityQueue.add({
        rows: rows
    });
}