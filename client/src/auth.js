// import { initializeApp } from 'firebase/app';
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY,
//   authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.FIREBASE_PROJ_ID,
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.FIREBASE_MESSAGING_ID,
//   appId: process.env.FIREBASE_APP_ID,
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

export let createUserWithEmailAndPassword = async (email, password) => {
  return fetch("/register", {
      method: "POST",
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: email,
        password,
        email
      })
    }).then((resp) => {
      if (resp.status >= 400) {
        throw new Error();
      }
    });
}

export let signInWithEmailAndPassword = async (email, password) => {
  return fetch("/login", {
      method: "POST",
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: email,
        password,
        email
      })
    }).then((resp) => {
      // console.log(resp.status);
      if (resp.status >= 400) {
        throw new Error();
      } else if (resp.status === 200) {
        resp.json().then((obj) => {auth.currentUser = obj.user;});
        // auth.currentUser = body.user;
      }
    });
}

export let auth = {};