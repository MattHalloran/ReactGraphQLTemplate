import { fetch_contact_info, update_contact_info } from './http_functions';

export function getContactInfo() {
    return new Promise(function (resolve, reject) {
        fetch_contact_info().then(data => {
            if (data.ok) {
                resolve(data);
            } else {
                reject(data);
            }
        })
    });
}

export function updateContactInfo(data) {
    return new Promise(function (resolve, reject) {
        update_contact_info(data).then(response => {
            if (response.ok) {
                resolve(response);
            } else {
                reject(response);
            }
        })
    });
}