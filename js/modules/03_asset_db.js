// ===== AssetDB Module =====
// Part of StarFan Studio v2.3

// ================= 0. IndexedDB 资产存储模块 =================
const AssetDB = {
  db: null,
  _idbFailed: false, // IndexedDB 不可用时 fallback 到 localStorage
  async open() {
    if (this.db) return;
    if (this._idbFailed) return; // 已知失败，跳过重试
    return new Promise((resolve) => {
      try {
        const req = indexedDB.open(SiteManager.dbName(), 1);
        req.onupgradeneeded = e => e.target.result.createObjectStore('images');
        req.onsuccess = e => { this.db = e.target.result; resolve(); };
        req.onerror = () => {
          console.warn('⚠️ IndexedDB 打开失败，切换到 localStorage fallback');
          this._idbFailed = true;
          resolve(); // 不 reject，继续走 fallback
        };
        req.onblocked = () => {
          console.warn('⚠️ IndexedDB 被阻塞');
          this._idbFailed = true;
          resolve();
        };
        // 3秒超时 fallback（微信 WebView 有时会挂住）
        setTimeout(() => {
          if (!this.db && !this._idbFailed) {
            console.warn('⚠️ IndexedDB 超时，切换 fallback');
            this._idbFailed = true;
            resolve();
          }
        }, 3000);
      } catch(e) {
        console.warn('⚠️ IndexedDB 初始化异常', e);
        this._idbFailed = true;
        resolve();
      }
    });
  },
  // localStorage fallback key 前缀
  _lsKey(key) { return 'sfasset_' + SiteManager.dbName() + '_' + key; },
  async save(key, dataUrl) {
    await this.open();
    if (this._idbFailed || !this.db) {
      // fallback: 存 localStorage（图片较小时可行）
      try { localStorage.setItem(this._lsKey(key), dataUrl); } catch(e) { console.warn('⚠️ localStorage 也写满了', e); }
      return;
    }
    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction('images', 'readwrite');
        tx.objectStore('images').put(dataUrl, key);
        tx.oncomplete = () => resolve();
        tx.onerror = e => {
          // IDB 写入失败时 fallback
          try { localStorage.setItem(this._lsKey(key), dataUrl); } catch(le) {}
          resolve(); // 不 reject，避免中断流程
        };
      } catch(e) {
        try { localStorage.setItem(this._lsKey(key), dataUrl); } catch(le) {}
        resolve();
      }
    });
  },
  async load(key) {
    await this.open();
    if (this._idbFailed || !this.db) {
      // fallback: 从 localStorage 读
      return localStorage.getItem(this._lsKey(key)) || null;
    }
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('images', 'readonly');
        const req = tx.objectStore('images').get(key);
        req.onsuccess = () => {
          var result = req.result || null;
          // IDB 没有时，兜底从 localStorage 找
          if (!result) result = localStorage.getItem(this._lsKey(key)) || null;
          resolve(result);
        };
        req.onerror = () => resolve(localStorage.getItem(this._lsKey(key)) || null);
      } catch(e) {
        resolve(localStorage.getItem(this._lsKey(key)) || null);
      }
    });
  },
  async delete(key) {
    // 同时清 IDB 和 localStorage
    localStorage.removeItem(this._lsKey(key));
    await this.open();
    if (this._idbFailed || !this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('images', 'readwrite');
        tx.objectStore('images').delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch(e) { resolve(); }
    });
  }
};
