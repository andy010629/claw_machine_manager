/** @format */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection } from 'firebase/firestore'
// ... other firebase imports

export const firebaseApp = initializeApp({
    apiKey: "AIzaSyCVJXsHcTFm3Qgz17Tcd09rtg74DUOtCLs",
    authDomain: "claw-data.firebaseapp.com",
    projectId: "claw-data",
    storageBucket: "claw-data.appspot.com",
    messagingSenderId: "401687177257",
    appId: "1:401687177257:web:e625dd0b0e105d4d339438",
    measurementId: "G-PG17FZ5LZF"

})

// used for the firestore refs
const db = getFirestore(firebaseApp)

// here we can export reusable database references
export const todosRef = collection(db, 'todos')