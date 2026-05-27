// ===== SiteManager Module =====
// Part of StarFan Studio v2.3

let editingNewsId = null; // 📌 新闻编辑状态追踪
// ================= 00. 站点管理器 (多粉丝站支持) =================
// 管理多个粉丝站的数据隔离：每个站点有独立的 localStorage key 和 IndexedDB 库
const SiteManager = {
  KEY_LIST: 'starfan_sites',       // 存站点列表 [{id, name, createdAt}]
  KEY_ACTIVE: 'starfan_active',    // 当前激活的站点 ID
  PREFIX: 'starfan_',              // 数据 key 前缀
  getAll() {
    try { return JSON.parse(localStorage.getItem(this.KEY_LIST) || '[]'); }
    catch(e) { return []; }
  },
  getActive() {
    return localStorage.getItem(this.KEY_ACTIVE) || null;
  },
  setActive(id) {
    localStorage.setItem(this.KEY_ACTIVE, id);
  },
  create(name) {
    var list = this.getAll();
    var id = 'site_' + Date.now();
    list.push({ id: id, name: name, createdAt: new Date().toLocaleDateString('zh-CN') });
    localStorage.setItem(this.KEY_LIST, JSON.stringify(list));
    this.setActive(id);
    return id;
  },
  remove(id) {
    var list = this.getAll().filter(function(s) { return s.id !== id; });
    localStorage.setItem(this.KEY_LIST, JSON.stringify(list));
    localStorage.removeItem(this.PREFIX + id + '_data');
    localStorage.removeItem(this.PREFIX + id + '_opts');
    try { indexedDB.deleteDatabase('StarFanAssets_' + id); } catch(e) {}
    if (this.getActive() === id) {
      this.setActive(list.length ? list[0].id : null);
    }
  },
  dataKey() {
    return this.PREFIX + (this.getActive() || 'default') + '_data';
  },
  optsKey() {
    return this.PREFIX + (this.getActive() || 'default') + '_opts';
  },
  dbName() {
    return 'StarFanAssets_' + (this.getActive() || 'default');
  }
};
