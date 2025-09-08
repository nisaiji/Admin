// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// export const generateToken = async () => {
//   const permission = await Notification.requestPermission();
//   // console.log(permission);
//   if (permission === "granted") {
//     const registration = await navigator.serviceWorker.register(
//       "/firebase-messaging-sw.js"
//     );
//     console.log({registration});
    
//     const token = await getToken(messaging, {
//       vapidKey: import.meta.env.VITE_VAPID_KEY,
//       serviceWorkerRegistration: registration,
//     });
//     // console.log(token);
//     return token;
//   }
// };

export const generateToken = async () => {
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    // register SW
    await navigator.serviceWorker.register("/firebase-messaging-sw.js");

    // wait until it's active
    const registration = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    return token;
  }
};
