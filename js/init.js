// ===== StarFan Studio v2.3 - Global Variables & Initialization =====





// ================= 6. 初始化 (Init) =================
// 🔧 重置模式：访问 ?reset=true 清空所有数据后跳转回干净页面
if (location.search.includes('reset=true')) {
  localStorage.removeItem(SiteManager.dataKey());
  try { indexedDB.deleteDatabase(SiteManager.dbName()); } catch(e) {}
  localStorage.removeItem(SiteManager.optsKey());
  // 清除当前站点的教程和版本标记
  localStorage.removeItem(SiteManager.PREFIX + (SiteManager.getActive() || 'default') + '_tutorial_done');
  localStorage.removeItem(SiteManager.PREFIX + (SiteManager.getActive() || 'default') + '_last_version');
  localStorage.removeItem(SiteManager.PREFIX + (SiteManager.getActive() || 'default') + '_btnpos');
  console.log('🧹 当前站点数据已全部清零！页面将以全新状态加载。');
  history.replaceState(null, '', location.pathname);
}
// 🔄 站点初始化 + 新用户检测
var _isNewUser = false;  // 全局标记：是否为真正的新用户（第一次访问）
if (SiteManager.getAll().length === 0) {
  // 检查是否有旧版数据（老用户第一次跑新代码）
  var _hasOldData = localStorage.getItem('starfan_data') || localStorage.getItem('starfan_tutorial_done');
  SiteManager.create('我的第一个粉丝站');
  if (_hasOldData) {
    // 老用户迁移：迁移旧数据到默认站点 key，不触发教程
    var _oldData = localStorage.getItem('starfan_data');
    if (_oldData) {
      localStorage.setItem(SiteManager.dataKey(), _oldData);
      localStorage.removeItem('starfan_data');
      console.log('📦 已将旧版数据迁移到多站点格式');
    }
    var _oldOpts = localStorage.getItem('starfan_template_opts');
    if (_oldOpts) {
      localStorage.setItem(SiteManager.optsKey(), _oldOpts);
      localStorage.removeItem('starfan_template_opts');
      console.log('📦 已将旧版选项迁移到多站点格式');
    }
    var _oldTut = localStorage.getItem('starfan_tutorial_done');
    if (_oldTut) {
      localStorage.setItem(SiteManager.PREFIX + (SiteManager.getActive() || 'default') + '_tutorial_done', _oldTut);
      localStorage.removeItem('starfan_tutorial_done');
    }
    _isNewUser = false;  // 老用户，不触发教程
  } else {
    _isNewUser = true;   // 真正的新用户，触发教程
  }
} else {
  // 已有站点列表：迁移全局教程标记到各站点（一次性兼容）
  var _globalTut = localStorage.getItem('starfan_tutorial_done');
  if (_globalTut) {
    var _sites = SiteManager.getAll();
    for (var _si = 0; _si < _sites.length; _si++) {
      var _sk = SiteManager.PREFIX + _sites[_si].id + '_tutorial_done';
      if (!localStorage.getItem(_sk)) {
        localStorage.setItem(_sk, _globalTut);
      }
    }
    localStorage.removeItem('starfan_tutorial_done');
    console.log('📦 已将全局教程标记迁移到各站点');
  }
}
window.addEventListener('DOMContentLoaded', async () => {
  // 更新通知最先弹出（优先级最高，在教程之前）
  UpdateNotifier.init();
  // 只有真正的新用户才触发教程
  if (_isNewUser) Tutorial.init();
  await AppState.init();
  TemplateStore.init();
  LivePreview.init();
  Events.initTabs();
  Render.editor('celebrity');
  Render.preview('celebrity');
  BackgroundFX.init();
  BackgroundFX.setType(AppState.data.celebrity.bgType || 'stars');
  InlineEditor.init();
  DragButton.init();
  // 💾 页面关闭/刷新前确保所有数据已保存（切换站点时跳过，因为 switchTo 已提前保存）
  window.addEventListener('beforeunload', function() {
    if (window._isSwitching) return;
    AppState.save();
  });
  // 不在页面加载时自动应用模板/特效，由用户手动点击"预览外观"触发
});
