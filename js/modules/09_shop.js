// ===== ShopModule Module =====
// Part of StarFan Studio v2.3

// ================= 💝 周边收藏模块 (ShopModule) =================
const ShopModule = {
  currentCat: '全部',
  render(box, items) {
    const cats = ['全部', ...new Set(items.map(i=>i.cat))];
    const filtered = this.currentCat==='全部' ? items : items.filter(i=>i.cat===this.currentCat);
    box.innerHTML = `
      <div class="section-header">
        <h2>💝 周边收藏</h2>
        <button class="inline-btn" onclick="Events.openEditorFor('shop')">➕ 添加收藏</button>
      </div>
      <div class="shop-filter">
        ${cats.map(c=>`<button class="filter-btn${this.currentCat===c?' active':''}" onclick="ShopModule.filterCat('${c}')">${c}</button>`).join('')}
      </div>
      ${!filtered.length ? '<div class="empty">还没有收藏周边，点击上方添加</div>' : `
      <div class="shop-grid">
        ${filtered.map(item=>`
          <div class="shop-card card-wrap" style="position:relative;">
            <button class="inline-del" onclick="Events.deleteShopItem('${item.id}')" title="删除">✕</button>
            <div class="thumb">${item.image ? '<img src="'+item.image+'" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">' : (item.emoji||'🎁')}</div>
            <div class="shop-body">
              <div class="shop-name">${item.name}</div>
              ${item.desc?`<div class="shop-desc-text">${item.desc}</div>`:''}
              <span class="shop-cat-tag">${item.cat}</span>
            </div>
          </div>`).join('')}
      </div>`}
    `;
  },
  filterCat(cat) {
    this.currentCat = cat;
    Render.preview('shop');
  }
};
