self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const patient=windows.find(client=>new URL(client.url).pathname==='/patient');
    if(patient){await patient.focus();patient.postMessage(event.notification.data);}
    else await self.clients.openWindow('/patient');
  })());
});
