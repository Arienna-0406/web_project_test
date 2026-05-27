// ===== SiteUI Module =====
// Part of StarFan Studio v2.3

// ================= 00b. 站点切换 UI =================
const SiteUI = {
  toggle() {
    var panel = document.getElementById('sitePanel');
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) this.render();
  },
  render() {
    var list = SiteManager.getAll();
    var active = SiteManager.getActive();
    var h = '<div class="site-panel-title">我的粉丝站</div><div class="site-panel-list">';
    if (list.length === 0) {
      h += '<div class="site-empty">还没有粉丝站，快创建一个吧~</div>';
    }
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      var isCurrent = s.id === active;
      h += '<div class="site-card' + (isCurrent ? ' current' : '') + '">';
      h += '<div class="site-info"><span class="site-name">' + s.name + '</span>';
      if (isCurrent) h += '<span class="site-badge">当前所在</span>';
      h += '</div><div class="site-actions">';
      if (!isCurrent) h += '<button class="site-btn-enter" onclick="SiteUI.switchTo(\'' + s.id + '\')">进入</button>';
      h += '<button class="site-btn-del" onclick="SiteUI.removeSite(\'' + s.id + '\')">删除</button>';
      h += '</div></div>';
    }
    h += '</div><button class="site-create-btn" onclick="SiteUI.createNew()">+ 创建新的粉丝站</button>';
    document.getElementById('sitePanel').innerHTML = h;
  },
  switchTo(id) {
    // 先保存当前站点数据，再切换（防止 beforeunload 时 active 已变导致数据写到错误的 key）
    AppState.save();
    window._isSwitching = true;
    SiteManager.setActive(id);
    location.reload();
  },
  createNew() {
    var name = prompt('为新的粉丝站起个名字：');
    if (!name || !name.trim()) return;
    AppState.save();
    window._isSwitching = true;
    SiteManager.create(name.trim());
    location.reload();
  },
  removeSite(id) {
    var list = SiteManager.getAll();
    var site = null;
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) { site = list[i]; break; } }
    var label = site ? site.name : '这个粉丝站';
    if (!confirm('确定删除"' + label + '"？所有数据将无法恢复！')) return;
    if (SiteManager.getActive() === id) AppState.save();
    window._isSwitching = true;
    SiteManager.remove(id);
    location.reload();
  }
};
