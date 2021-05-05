import Bull from 'bull';
import uploadAvailabilityProcess from './process';

const uploadAvailabilityQueue = new Bull('uploadAvailability');
uploadAvailabilityQueue.process(uploadAvailabilityProcess);

export function uploadAvailability(to=[], body) {
    uploadAvailabilityQueue.add({
        to: to,
        body: body
    });
}