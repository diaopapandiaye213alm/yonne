// Offline-First Outbox — stockage IndexedDB natif (zéro dépendance externe).
// Les actions échouées pendant une coupure réseau sont sérialisées ici et
// rejouées séquentiellement dès que la session est réhydratée avec succès.
// Guard SSR inclus : les appels retournent silencieusement si indexedDB est absent.

const DB_NAME    = "yonne_outbox";
const DB_VERSION = 1;
const STORE_NAME = "actions";

export interface OfflineAction {
  id: string;
  action: string;
  payload: unknown;
  timestamp: number;
  attempts: number;
}

function isIndexedDBAvailable(): boolean {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}

function openDB(): Promise<IDBDatabase> {
  if (!isIndexedDBAvailable()) {
    return Promise.reject(new Error("[outbox] IndexedDB unavailable (SSR context)"));
  }
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror  = () => reject(req.error);
  });
}

export async function enqueueAction(
  action: Omit<OfflineAction, "attempts">,
): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req   = store.put({ ...action, attempts: 0 });
    req.onsuccess = () => { db.close(); resolve(); };
    req.onerror   = () => { db.close(); reject(req.error); };
  });
}

export async function getAllActions(): Promise<OfflineAction[]> {
  if (!isIndexedDBAvailable()) return [];
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req   = store.getAll();
    req.onsuccess = () => { db.close(); resolve(req.result as OfflineAction[]); };
    req.onerror   = () => { db.close(); reject(req.error); };
  });
}

export async function deleteAction(id: string): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req   = store.delete(id);
    req.onsuccess = () => { db.close(); resolve(); };
    req.onerror   = () => { db.close(); reject(req.error); };
  });
}

async function incrementAttempts(id: string): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const action = getReq.result as OfflineAction | undefined;
      if (!action) { db.close(); resolve(); return; }
      const putReq = store.put({ ...action, attempts: action.attempts + 1 });
      putReq.onsuccess = () => { db.close(); resolve(); };
      putReq.onerror   = () => { db.close(); reject(putReq.error); };
    };
    getReq.onerror = () => { db.close(); reject(getReq.error); };
  });
}

/**
 * Dépile l'outbox séquentiellement dans l'ordre chronologique.
 * executor(action) → true = succès (supprime l'entrée), false = échec (incrémente attempts).
 * Maximum 3 tentatives par action — au-delà, l'action est abandonnée.
 */
export async function drainOutbox(
  executor: (action: OfflineAction) => Promise<boolean>,
): Promise<void> {
  if (!isIndexedDBAvailable()) return;

  let actions: OfflineAction[];
  try {
    actions = await getAllActions();
  } catch (err) {
    console.error("[outbox] lecture IndexedDB impossible:", err);
    return;
  }

  if (actions.length === 0) return;

  // Tri chronologique pour garantir l'ordre de replay
  actions.sort((a, b) => a.timestamp - b.timestamp);

  console.info(`[outbox] drain — ${actions.length} action(s) en attente`);

  for (const action of actions) {
    // Abandonner les actions après 3 tentatives pour éviter les boucles infinies
    if (action.attempts >= 3) {
      console.warn(`[outbox] abandon action ${action.id} (${action.attempts} tentatives)`);
      await deleteAction(action.id);
      continue;
    }
    try {
      const ok = await executor(action);
      if (ok) {
        await deleteAction(action.id);
        console.info(`[outbox] ✓ action ${action.action} (${action.id}) rejouée`);
      } else {
        await incrementAttempts(action.id);
      }
    } catch (err) {
      console.error(`[outbox] erreur replay ${action.id}:`, err);
      await incrementAttempts(action.id);
    }
  }
}
