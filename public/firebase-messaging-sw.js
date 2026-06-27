/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyDWccid8enhakSdQMxhyHs61WTyAy_Uulg',
  authDomain: 'new-areas-kpi.firebaseapp.com',
  projectId: 'new-areas-kpi',
  storageBucket: 'new-areas-kpi.firebasestorage.app',
  messagingSenderId: '794105949759',
  appId: '1:794105949759:web:3b77a0badbbbb3cd54528a',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'New Areas KPI'
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/favicon.svg',
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
