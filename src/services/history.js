/**
 * N-Trace — History Service (IndexedDB)
 * Saves successfully completed execution traces locally in the browser
 * so they can be re-run, searched, and managed.
 */

import { uid } from '../utils/helpers.js';

const DB_NAME = 'ntrace_db';
const DB_VERSION = 1;
const STORE_NAME = 'history';

let dbInstance = null;

/**
 * Initialize IndexedDB and open connection
 */
export function initHistoryDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };

    request.onerror = (e) => {
      console.error('IndexedDB initialization failed:', e.target.error);
      reject(e.target.error);
    };
  });
}

/**
 * Save a trace to the history store
 * @param {string} code - source code
 * @param {string} language - language identifier
 * @param {Array} steps - steps trace from AI
 * @returns {Promise<Object>} The saved history object
 */
export async function saveTraceToHistory(code, language, steps) {
  const db = await initHistoryDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const historyItem = {
      id: uid(),
      timestamp: Date.now(),
      code,
      language,
      steps
    };

    const request = store.add(historyItem);

    request.onsuccess = () => {
      resolve(historyItem);
    };

    request.onerror = (e) => {
      reject(e.target.error);
    };
  });
}

/**
 * Retrieve all items from history store
 * @returns {Promise<Array>} List of saved history items (sorted newest first)
 */
export async function getTraceHistory() {
  const db = await initHistoryDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result || [];
      // Sort newest first
      results.sort((a, b) => b.timestamp - a.timestamp);
      resolve(results);
    };

    request.onerror = (e) => {
      reject(e.target.error);
    };
  });
}

/**
 * Delete a specific trace history item
 * @param {string} id - unique ID of the trace item
 */
export async function deleteTraceFromHistory(id) {
  const db = await initHistoryDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (e) => {
      reject(e.target.error);
    };
  });
}

/**
 * Clear all trace history
 */
export async function clearAllTraceHistory() {
  const db = await initHistoryDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (e) => {
      reject(e.target.error);
    };
  });
}
