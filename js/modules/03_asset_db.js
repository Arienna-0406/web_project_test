// ===== AssetDB Module =====
// Part of StarFan Studio v2.3

// ================= 0. IndexedDB 资产存储模块 =================
const AssetDB = {
  db: null,
  async open() {
    if (this.db) return;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(SiteManager.dbName(), 1);
      req.onupgradeneeded = e => e.target.result.createObjectStore('images');
      req.onsuccess = e => { this.db = e.target.result; resolve(); };
      req.onerror = e => reject(e.target.error);
    });
  },
  async save(key, dataUrl) {
    await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('images', 'readwrite');
      tx.objectStore('images').put(dataUrl, key);
      tx.oncomplete = () => resolve();
      tx.onerror = e => reject(e.target.error);
    });
  },
  async load(key) {
    await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('images', 'readonly');
      const req = tx.objectStore('images').get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = e => reject(e.target.error);
    });
  },
  async delete(key) {
    await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('images', 'readwrite');
      tx.objectStore('images').delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = e => reject(e.target.error);
    });
  }
};
