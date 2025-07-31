self.addEventListener("sync", function (event) {
  if (event.tag === "sync-queued-requests") {
    event.waitUntil(syncQueuedRequests());
  }
});

async function syncQueuedRequests() {
  const db = await openIndexedDB();
  const tx = db.transaction("requests", "readwrite");
  const store = tx.objectStore("requests");
  const allRequests = await store.getAll();
  for (const req of allRequests) {
    try {
      await fetch(req.url, req.options);
      await store.delete(req.id);
    } catch (e) {
      // Gagal, biarkan tetap di queue
    }
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("pwa-sync-db", 1);
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("requests")) {
        db.createObjectStore("requests", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
    request.onsuccess = function (event) {
      resolve(event.target.result);
    };
    request.onerror = function (event) {
      reject(event);
    };
  });
}
