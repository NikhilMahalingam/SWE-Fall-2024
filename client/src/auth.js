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

export let createUserWithEmailAndPassword = async (name, email, password) => {
  let serverUrl = 'http://localhost:8000'
  return fetch(serverUrl + "/register", {
      method: "POST",
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name ,
        password,
        email
      })
    }).then((resp) => {
      if (resp.status >= 400) {
        throw new Error(resp.json().error);
      }
    });
    //console.log('Password: ', password);
}

export let signInWithEmailAndPassword = async (email, password) => {
  let serverUrl = 'http://localhost:8000'
  return fetch(serverUrl + "/login", {
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
       console.log(resp.status);
      if (resp.status >= 400) {
        throw new Error(resp.json().error);
      } else if (resp.status === 200) {
        return resp.json().then((obj) => obj.user);
        // auth.currentUser = body.user;
      } else {
        throw new Error("WHAT THE FUCK");
      }
    });
}

export let auth = {};