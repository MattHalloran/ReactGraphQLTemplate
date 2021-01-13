import { fetch_profile_info } from './http_functions';

export function getProfileInfo(session) {
    return new Promise(function (resolve, reject) {
        fetch_profile_info(session).then(data => {
            if (data.ok) {
                resolve(data);
            } else {
                reject(data);
            }
        })
    });
}