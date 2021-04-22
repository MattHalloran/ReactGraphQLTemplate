// Handles storing and retrieving data from local storage
// TODO invalidate items after a while

import PubSub from './pubsub';
import { COOKIE } from 'utils/consts';
import Cookies from 'js-cookie';

export const clearStorage = () => {
    Object.values(COOKIE).forEach(entry => {
        Cookies.set(entry, null);
        PubSub.publish(entry, null);
    })
}