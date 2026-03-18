// firebaseConfig.js
import { apiKey, appId, authDomain, measurementId, messagingSenderId, projectId, storageBucket } from "@/utils/config";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: apiKey,
    authDomain: authDomain,
    projectId: projectId,
    storageBucket: storageBucket,
    messagingSenderId: messagingSenderId,
    appId: appId,
    measurementId: measurementId
  };
  
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  export const auth = getAuth(app);
  export const storage = getStorage(app);
