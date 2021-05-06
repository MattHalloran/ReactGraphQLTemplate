import Bull from 'bull';
import uploadAvailabilityProcess from './process';
import xlsx from 'node-xlsx';

const uploadAvailabilityQueue = new Bull('uploadAvailability');
uploadAvailabilityQueue.process(uploadAvailabilityProcess);

export function uploadAvailability(data_buffer) {
    const parsed = xlsx.parse(data_buffer);
    const rows = parsed[0].data;
    uploadAvailabilityQueue.add({
        rows: rows
    });
}