// ===== DragButton Module =====
// Part of StarFan Studio v2.3

// ================= 5b. 悬浮按钮拖拽模块 =================
const DragButton = {
  btn: null,
  posKey: null,
  isDragging: false,
  moved: false,
  _touchHandled: false,  // 防止触屏 touchend 和合成 click 双重触发
  startX: 0, startY: 0, startLeft: 0, startTop: 0,
  DRAG_THRESHOLD: 5,
  init() {
    this.btn = document.querySelector('.editor-toggle');
    if (!this.btn) return;
    this.posKey = SiteManager.PREFIX + (SiteManager.getActive() || 'default') + '_btnpos';
    this._restore();
    this._bind();
  },
  _restore() {
    var saved = localStorage.getItem(this.posKey);
    if (saved) {
      try {
        var pos = JSON.parse(saved);
        this.btn.style.bottom = 'auto';
        this.btn.style.right = 'auto';
        this.btn.style.left = pos.left + 'px';
        this.btn.style.top = pos.top + 'px';
      } catch(e) {}
    }
  },
  _save(left, top) {
    localStorage.setItem(this.posKey, JSON.stringify({ left: left, top: top }));
  },
  _bind() {
    var self = this;
    // 按下：开始跟踪（desktop 不 preventDefault，保留 click 能力）
    this.btn.addEventListener('mousedown', function(e) { self._onDown(e.clientX, e.clientY); });
    // 触屏：touchstart 只记录起始位置，不 preventDefault（让浏览器正常生成 click）
    this.btn.addEventListener('touchstart', function(e) {
      var t = e.touches[0]; self._onDown(t.clientX, t.clientY);
      // 不阻止默认行为，让 touchend 后仍能触发 click
    }, {passive: true});
    // 移动：更新位置
    document.addEventListener('mousemove', function(e) { if (self.isDragging) self._onMove(e.clientX, e.clientY); });
    document.addEventListener('touchmove', function(e) {
      if (self.isDragging) { var t = e.touches[0]; self._onMove(t.clientX, t.clientY); e.preventDefault(); }
    }, {passive: false});
    // 松开：结束拖拽（mouseup 在 desktop 端正常）
    document.addEventListener('mouseup', function() { if (self.isDragging) self._onUp(); });
    // 触屏松开：如果拖拽了就结束拖拽，否则触发编辑面板
    document.addEventListener('touchend', function(e) {
      if (!self.isDragging) return;
      var wasMoved = self.moved;
      self._onUp();
      if (!wasMoved) {
        // 纯点击（没拖拽）：阻止浏览器生成合成 click，自己触发编辑器
        self._touchHandled = true;
        e.preventDefault();
        setTimeout(function() { Events.toggleEditor(); }, 50);
      }
    });
    // 点击事件：桌面端正常进入编辑面板，触屏端已被 touchend 处理则跳过
    this.btn.addEventListener('click', function(e) {
      if (self._touchHandled) {
        // 触屏已处理，跳过
        self._touchHandled = false;
        return;
      }
      if (self.moved) {
        // 拖拽后的 click，阻止
        e.preventDefault(); e.stopPropagation();
        self.moved = false;
      } else {
        // 桌面端正常点击 → 打开编辑面板
        Events.toggleEditor();
      }
    });
  },
  _onDown(cx, cy) {
    this.isDragging = true;
    this.moved = false;
    this.startX = cx;
    this.startY = cy;
    var rect = this.btn.getBoundingClientRect();
    this.startLeft = rect.left;
    this.startTop = rect.top;
    this.btn.classList.add('dragging');
  },
  _onMove(cx, cy) {
    var dx = cx - this.startX;
    var dy = cy - this.startY;
    if (!this.moved && (Math.abs(dx) > this.DRAG_THRESHOLD || Math.abs(dy) > this.DRAG_THRESHOLD)) {
      this.moved = true;
    }
    if (this.moved) {
      this.btn.style.bottom = 'auto';
      this.btn.style.right = 'auto';
      this.btn.style.left = (this.startLeft + dx) + 'px';
      this.btn.style.top = (this.startTop + dy) + 'px';
    }
  },
  _onUp() {
    this.isDragging = false;
    this.btn.classList.remove('dragging');
    if (this.moved) {
      var rect = this.btn.getBoundingClientRect();
      var size = 52;
      var maxX = window.innerWidth - size;
      var maxY = window.innerHeight - size;
      var left = Math.max(0, Math.min(rect.left, maxX));
      var top = Math.max(0, Math.min(rect.top, maxY));
      this.btn.style.left = left + 'px';
      this.btn.style.top = top + 'px';
      this._save(left, top);
    }
  }
};
