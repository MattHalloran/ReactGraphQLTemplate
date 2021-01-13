import { fetch_contact_info, update_contact_info } from './http_functions';
import { StatusCodes } from './status';

export function getContactInfo() {
    return new Promise(function (resolve, reject) {
        try {
            fetch_contact_info()
                .then(response => {
                    response.json().then(data => {
                        console.log(data);
                        if(data.status === StatusCodes.SUCCESS) {
                            resolve(data);
                        } else {
                            reject(data);
                        }
                    })
                })
        } catch (error) {
            console.error(error);
            reject({ status: StatusCodes.ERROR_UNKNOWN });
        }
    });
}

export function updateContactInfo(data) {
    return new Promise(function (resolve, reject) {
        try {
            update_contact_info(data)
                .then(response => {
                    response.json().then(data => {
                        if(data.status === StatusCodes.SUCCESS) {
                            resolve(data);
                        } else {
                            reject(data);
                        }
                    })
                })
        } catch (error) {
            console.error(error);
            reject({ status: StatusCodes.ERROR_UNKNOWN });
        }
    });
}