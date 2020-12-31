import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/analytics'

Vue.config.productionTip = false

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import FirebasePlugin from './plugins/FirebasePlugin'

import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';

Sentry.init({
  dsn: 'https://9418e607dada4adba467367c22ee95e9@sentry.io/1771484',
  integrations: [new Integrations.Vue({ Vue, attachProps: true, logErrors: true })],
  beforeSend(event, hint) {
    // Check if it is an exception, and if so, show the report dialog
    if (event.exception) {
      var name = "";
      var email = ""

      if (firebase.auth().currentUser) {
        name = firebase.auth().currentUser.displayName
        email = firebase.auth().currentUser.email
      }
      Sentry.showReportDialog({
        eventId: event.event_id, user: {
          name, email
        }
      });
    }
    return event;
  }
});

firebase.initializeApp({
  apiKey: "AIzaSyDNHOidgoTpuTVv4GJA6xeNPXOSzxJ7eBw",
  authDomain: "moodboard-mvp.firebaseapp.com",
  databaseURL: "https://moodboard-mvp.firebaseio.com",
  projectId: "moodboard-mvp",
  storageBucket: "moodboard-mvp.appspot.com",
  messagingSenderId: "247714230127",
  appId: "1:247714230127:web:b8e9fb2893f2c0bbc6c29a",
  measurementId: "G-C0MC8SNSLK"
});

firebase.analytics()

const unsubscribe = firebase.auth().onAuthStateChanged((auth) => {
  unsubscribe()

  if (auth) {
    Sentry.configureScope(scope => {
      scope.setUser({
        email: auth.email,
        username: auth.displayName,
        id: auth.uid
      })
    })
  }

  Vue.use(FirebasePlugin)

  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app')
})

