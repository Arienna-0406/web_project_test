// ===== InlineEditor Module =====
// Part of StarFan Studio v2.3

// ================= ✏️ 沉浸式编辑同步器 (InlineEditor) =================
const InlineEditor = {
  init() {
    const box = document.getElementById('previewContent');
    box.addEventListener('input', e => {
      const el = e.target.closest('[data-bind]');
      if(!el) return;
      const path = el.dataset.bind;
      const val = el.innerText.trim();
      const keys = path.split('.');
      let target = AppState.data;
      for(let i=0; i<keys.length-1; i++) target = target[keys[i]];
      target[keys[keys.length-1]] = val;
      AppState.save();
      // 同步左侧表单（防割裂）
      const left = document.getElementById(`inp_${keys[keys.length-1]}`);
      if(left) left.value = val;
    });
    // 阻止回车产生多余标签
    box.addEventListener('keydown', e => {
      if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); document.execCommand('insertLineBreak'); }
    });
  }
};
