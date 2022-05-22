/**
 * Handles the registration of service workers. A service worker allow an app to load faster on 
 * subsequent visits, and gives it offline capabilities.
 * To learn more about the benefits of this model and instructions on 
 * how to opt-in, read https://cra.link/PWA
 */
import { SERVER_URL } from "@local/shared";
import { AlertDialogData } from "components";
import { PUBS } from "utils";

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

/**
 * URL location of the service worker
 */
const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i += 1) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

/**
 * If the build is running in a mode that supports service workers.
 */
const supportsServiceWorkers: boolean = process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator;

export function register(config) {
    if (!supportsServiceWorkers) return;
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
        // Our service worker won't work if PUBLIC_URL is on a different origin
        // from what our page is served on. This might happen if a CDN is used to
        // serve assets; see https://github.com/facebook/create-react-app/issues/2374
        console.error('Service worker registration failed: public URL must be on same origin as website.');
        return;
    }
    window.addEventListener('load', () => {
        if (isLocalhost) {
            console.log('goint to check valid serviceworker', swUrl);
            // This is running on localhost. Let's check if a service worker still exists or not.
            checkValidServiceWorker(swUrl, config);
            console.log('checked valid serviceworker', config);
            // Add some additional logging to localhost, pointing developers to the
            // service worker/PWA documentation.
            navigator.serviceWorker.ready.then(() => {
                console.log(
                    'This web app is being served cache-first by a service ' +
                    'worker. To learn more, visit https://cra.link/PWA'
                );
            });
        } else {
            // Is not localhost. Just register service worker
            registerValidSW(swUrl, config);
        }
    });
}

/**
 * Registers a service worker with the navigator
 * @param swUrl URL of the service worker
 * @param config Configuration for the service worker
 */
function registerValidSW(swUrl: string, config) {
    navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
            registration.onupdatefound = () => {
                const installingWorker = registration.installing;
                if (installingWorker == null) {
                    return;
                }
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // At this point, the updated precached content has been fetched,
                            // but the previous service worker will still serve the older
                            // content until all client tabs are closed.
                            console.log(
                                'New content is available and will be used when all ' +
                                'tabs for this page are closed. See https://cra.link/PWA.'
                            );

                            // Execute callback
                            if (config && config.onUpdate) {
                                config.onUpdate(registration);
                            }
                        } else {
                            // At this point, everything has been precached.
                            // It's the perfect time to display a
                            // "Content is cached for offline use." message.
                            console.log('Content is cached for offline use.');

                            // Execute callback
                            if (config && config.onSuccess) {
                                config.onSuccess(registration);
                            }
                        }
                    }
                };
            };
        })
        .catch((error) => {
            console.error('Error during service worker registration:', error);
        });
}

/**
 * Checks if a valid service worker exists. Invalid service workers will be removed, and 
 * a new service worker will be registered if one does not exist.
 * @param swUrl URL of the service worker
 * @param config Configuration for the service worker
 */
function checkValidServiceWorker(swUrl: string, config): void {
    // Check if the service worker can be found. If it can't reload the page.
    fetch(swUrl, {
        headers: { 'Service-Worker': 'script' },
    })
        .then((response) => {
            // Ensure service worker exists, and that we really are getting a JS file.
            const contentType = response.headers.get('content-type');
            if (
                response.status === 404 ||
                (contentType != null && contentType.indexOf('javascript') === -1)
            ) {
                // No service worker found. Probably a different app. Reload the page.
                navigator.serviceWorker.ready.then((registration) => {
                    registration.unregister().then(() => {
                        window.location.reload();
                    });
                });
            } else {
                // Service worker found. Proceed as normal.
                registerValidSW(swUrl, config);
            }
        })
        .catch(() => {
            console.log('No internet connection found. App is running in offline mode.');
        });
}

enum NotificationPermissions {
    default = 'default',
    denied = 'denied',
    granted = 'granted',
}

/**
 * Subscribes a registration to push notifications, and sets up the backend to receive them.
 * @param registration Registration to subscribe to push notifications
 * @param failedAlertData Custom data for rendering the alert when this function fails. 
 * @returns True if the subscription was successful, false otherwise
 */
export async function subscribeToPushNotifications(registration: ServiceWorkerRegistration, failedAlertData: AlertDialogData): Promise<boolean> {
    let success = false;
    try {
        const subscription: PushSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY ?? ''),
        });
        // Register the subscription on the server
        await fetch(`${SERVER_URL}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscription)
        }).then(function (response) {
            console.log('subscription registered with server', response);
            success = true;
        }).catch(function (error) {
            PubSub.publish(PUBS.Snack, { message: 'Unknown error occurred', severity: 'error', data: error });
        });
        success = true;
    } 
    // Typically errors here mean that the browser does not support the Push API. 
    // If this is the case, the best thing we can do is display an alert.
    catch (error) {
        PubSub.publish(PUBS.AlertDialog, {
            title: 'Error',
            message: 'Notifications not supported on this browser. Please try again with Firefox or Chrome. If you are using Brave, please enable push notifications at brave://settings/privacy. We will try to support all other browsers in the future😊',
        })
        PubSub.publish(PUBS.Snack, { message: 'Unknown error occurred', severity: 'error', data: error })
    } finally {
        return success;
    }
}

/**
 * Checks if push notifications are enabled on this browser. 
 * Requests push notifications permission from the user if not already granted. 
 * Push notifications are supported on the following: https://caniuse.com/?search=web-push
 * @param forceCheck If true, the user will be prompted even if they've already denied push notifications.
 * @param failedAlertData Custom data for rendering the alert when this function fails. 
 */
export async function checkPushNotifications(forceCheck: boolean = false, failedAlertData: AlertDialogData = {}): Promise<boolean> {
    if (!supportsServiceWorkers) return false;
    let success = false;
    try {
        // Check if the user has previously denied push notifications.
        if (!forceCheck && localStorage.getItem('pushNotifications') === 'false') {
            console.info('Push notifications have been denied by the user.');
            return false;
        }
        console.log('registering push notifications...')
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            console.log('already subbeddd', subscription)
            success = true;
        } else {
            const permissionResult = await Notification.requestPermission();
            // If the user accepts, let's create a new subscription
            if (permissionResult === NotificationPermissions.granted) {
                success = await subscribeToPushNotifications(registration, failedAlertData);
                // Store decision in local storage 
                localStorage.setItem('pushNotifications', 'true');
            }
            // If the user denies (either by closing dialog or selecting not to), we'll just disable push notifications
            else {
                console.info('Push notifications permission denied by user');
                // Store decision in local storage
                localStorage.setItem('pushNotifications', 'false');
            }
        }
    }
    catch (error) {
        PubSub.publish(PUBS.Snack, { message: 'Unknown error occurred', severity: 'error', data: error })
    } finally {
        return success;
    }
}

/**
 * Unregisters the service worker
 */
export function unregister(): void {
    if (!supportsServiceWorkers) return;
    navigator.serviceWorker.ready
        .then((registration) => {
            registration.unregister();
        })
        .catch((error) => {
            console.error(error.message);
        });
}
