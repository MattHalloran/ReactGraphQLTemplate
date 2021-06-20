import Bull from 'bull';
import { smsProcess } from './process';

const smsQueue = new Bull('sms');
smsQueue.process(smsProcess);

export function sendSms(to=[], body) {
    smsQueue.add({
        to: to,
        body: body
    });
}