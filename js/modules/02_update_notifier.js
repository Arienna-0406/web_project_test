// ===== UpdateNotifier Module =====
// Part of StarFan Studio v2.3

// ================= 00c. 更新通知器 =================
const UpdateNotifier = {
  // >>> 每次发布新版本时修改这里的版本号和内容 <<<
  CURRENT: '2.3',
  TITLE: 'v2.3 更新内容',
  _key() { return SiteManager.PREFIX + (SiteManager.getActive() || 'default') + '_last_version'; },
  CHANGES: [
    { icon: '📱', text: '修复手机端编辑小球点击无反应的问题，现在手机也能正常打开编辑面板了。' },
    { icon: '🆓', text: '所有模板和特效全部免费！导出展示版无需付费，直接导出即可。' },
    { icon: '📥', text: '新增「导入展示版」功能！导出后可在任意设备导入恢复数据，替代登录注册。注意：每次只能导出一个粉丝站，图片需重新上传。' }
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
