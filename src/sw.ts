/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title: string = data.title ?? 'Máquina de Vendas IA'
  const options: NotificationOptions = {
    body: data.body ?? '',
    icon: '/favicon.webp',
    badge: '/favicon.webp',
    tag: data.tag ?? 'default',
    data: { url: data.url ?? '/' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url: string = event.notification.data?.url ?? '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return (client as WindowClient).focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})
