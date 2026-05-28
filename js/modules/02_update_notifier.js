// ===== UpdateNotifier Module =====
// Part of StarFan Studio v2.3

// ================= 00c. 更新通知器 =================
const UpdateNotifier = {
  // >>> 每次发布新版本时修改这里的版本号和内容 <<<
  CURRENT: '2.5',
  TITLE: 'v2.5 焕新登场',
  _key() { return SiteManager.PREFIX + (SiteManager.getActive() || 'default') + '_last_version'; },
  CHANGES: [
    { icon: '✨', text: '全新视觉风格！暖紫魔法配色 + 水晶球编辑按钮 + 星空背景图，整个粉丝站闪闪发光~' },
    { icon: '🎨', text: '新增「魔法书」深色编辑面板，填写内容更有仪式感。' },
    { icon: '🖼', text: '背景图支持横竖屏自动适配，电脑手机都有完美体验。' },
    { icon: '🔤', text: '引入 Google Fonts 中英文字体，排版更精致。' }
  ],
  init() {
    var last = localStorage.getItem(this._key());
    if (last === this.CURRENT) return;
    var self = this;
    setTimeout(function() { self.show(); }, 800);
  },
  show() {
    var el = document.getElementById('updateNotice');
    if (!el) return;
    var h = '<div class="update-card"><div class="update-hero"><span class="update-icon">🎉</span>';
    h += '<h2>' + this.TITLE + '</h2><p>感谢你持续使用 StarFan Studio！</p></div>';
    h += '<div class="update-body">';
    for (var i = 0; i < this.CHANGES.length; i++) {
      var c = this.CHANGES[i];
      h += '<div class="update-item"><span>' + c.icon + '</span><span>' + c.text + '</span></div>';
    }
    h += '</div><div class="update-footer"><button class="update-ok" onclick="UpdateNotifier.close()">知道了</button></div></div>';
    el.innerHTML = h;
    el.classList.add('active');
    document.body.style.overflow = 'hidden';
  },
  close() {
    localStorage.setItem(this._key(), this.CURRENT);
    var el = document.getElementById('updateNotice');
    if (el) el.classList.remove('active');
    document.body.style.overflow = '';
  }
};
