// ===== AppState Module =====
// Part of StarFan Studio v2.3

// ================= 1. 状态管理器 (State) =================
const AppState = {
  currentTab: 'celebrity',
  defaults: {
    celebrity: { name: '', colors: '淡蓝+金色', bio: '', avatar: '', social: { weibo: '' }, bgType: 'stars' },
    news: [], gallery: [], community: [], calendar: [], shop: []
  },
  data: {},
  aiDraft: { text: '', loading: false, context: null },
  async init() {
    this.data = JSON.parse(JSON.stringify(this.defaults));
    var key = SiteManager.dataKey();
    console.log('📂 加载站点数据:', key, '(站点:', SiteManager.getActive(), ')');
    var saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.data.celebrity = { ...this.data.celebrity, ...parsed.celebrity };
        this.data.celebrity.social = { ...this.data.celebrity.social, ...(parsed.celebrity?.social || {}) };
        this.data.news = Array.isArray(parsed.news) ? parsed.news : [];
        this.data.gallery = Array.isArray(parsed.gallery) ? parsed.gallery : [];
        this.data.community = Array.isArray(parsed.community) ? parsed.community : [];
        this.data.calendar = Array.isArray(parsed.calendar) ? parsed.calendar : [];
        this.data.shop = Array.isArray(parsed.shop) ? parsed.shop : [];
      } catch(e) { console.warn('⚠️ 缓存解析失败', e); }
    }
    await this.loadAssets();
  },
  async loadAssets() {
    try {
      const av = await AssetDB.load('avatar');
      if(av) this.data.celebrity.avatar = av;
      for(let n of this.data.news) {
        const cover = await AssetDB.load('news_' + n.id);
        if(cover) n.cover = cover;
        // 恢复追忆多图
        if(n.images && n.images.length) {
          for(let ni=0; ni<n.images.length; ni++) {
            var imgData = await AssetDB.load(n.images[ni]);
            if(imgData) n['_img_'+n.images[ni]] = imgData;
          }
        }
      }
      for(let g of this.data.gallery) {
        const img = await AssetDB.load('gallery_' + g.id);
        if(img) g.url = img;
      }
      // 恢复商品图片
      if(this.data.shop) {
        for(let item of this.data.shop) {
          if(item.id) {
            const shopImg = await AssetDB.load('shop_' + item.id);
            if(shopImg) item.image = shopImg;
          }
        }
      }
    } catch(e) { console.warn('⚠️ 资产加载异常', e); }
  },
  update(module, path, value) {
    const keys = path.split('.');
    let target = this.data[module];
    for(let i=0; i<keys.length-1; i++) target = target[keys[i]];
    target[keys[keys.length-1]] = value;
    this.save();
  },
  save() {
    try {
      const clone = JSON.parse(JSON.stringify(this.data));
      if(clone.celebrity) delete clone.celebrity.avatar;
      clone.news.forEach(n => delete n.cover);
      clone.gallery.forEach(g => delete g.url);
      // 剥离商品图片并存入 IndexedDB（防止 base64 超 localStorage 配额）
      clone.shop.forEach(item => {
        if(item.image) {
          AssetDB.save('shop_' + item.id, item.image);
          delete item.image;
        }
      });
      var key = SiteManager.dataKey();
      localStorage.setItem(key, JSON.stringify(clone));
      console.log('💾 数据已保存到:', key, '(站点:', SiteManager.getActive(), ')');
    } catch (e) { console.error('💾 保存失败', e); }
  }
};
