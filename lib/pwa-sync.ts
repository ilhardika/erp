// Helper untuk queue request ke IndexedDB dan trigger background sync
export async function queueRequest(url: string, options: RequestInit) {
  const db = await openIndexedDB();
  const tx = db.transaction("requests", "readwrite");
  const store = tx.objectStore("requests");
  await store.add({ url, options });
  // IndexedDB transaction selesai otomatis
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    const reg = await navigator.serviceWorker.ready;
    if (reg.sync && typeof reg.sync.register === "function") {
      await reg.sync.register("sync-queued-requests");
    }
  }
}

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("pwa-sync-db", 1);
    request.onupgradeneeded = function (event) {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("requests")) {
        db.createObjectStore("requests", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
    request.onsuccess = function (event) {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    request.onerror = function (event) {
      reject(event);
    };
  });
}
