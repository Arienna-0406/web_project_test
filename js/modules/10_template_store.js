// ===== TemplateStore Module =====
// Part of StarFan Studio v2.3

// ================= 🎨 模板与特效商城 (TemplateStore) =================
const TemplateStore = {
  selectedTemplate: 'default',
  selectedEffects: [],
  paidItems: [],  // 已支付的项目
  // 模板列表（含装饰图案配置）
  templates: [
    {
      id:'default', name:'经典清新', price:0, emoji:'🌿',
      gradient:'linear-gradient(135deg,#a8d8ff,#ffd700)',
      desc:'默认风格，简洁大方',
      pattern: 'none',
      decoItems: []
    },
    {
      id:'sakura', name:'樱花浪漫', price:0.5, emoji:'🌸',
      gradient:'linear-gradient(135deg,#ffc3d0,#ff9ecb,#e8a0bf)',
      desc:'粉嫩樱花主题',
      // SVG 底纹：小花瓣散落
      pattern: 'sakura',
      decoItems: [
        { emoji:'🌸', size:32, positions:[[10,15],[75,8],[45,70],[88,55],[20,85],[60,20],[5,50],[92,80]], rotate:true },
        { emoji:'✿', size:18, positions:[[30,5],[55,40],[15,60],[80,25],[70,75],[40,90]], rotate:true }
      ]
    },
    {
      id:'galaxy', name:'星空梦幻', price:0.5, emoji:'🌌',
      gradient:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
      desc:'深邃星空背景',
      // SVG 底纹：星星 + 星座连线
      pattern: 'galaxy',
      decoItems: [
        { emoji:'⭐', size:20, positions:[[8,12],[25,5],[50,15],[78,8],[92,20],[15,45],[70,50],[40,75],[85,70],[10,80],[60,88],[95,55]], rotate:false },
        { emoji:'🌟', size:28, positions:[[30,25],[65,35],[20,70],[85,85],[50,50]], rotate:true },
        { emoji:'🌙', size:36, positions:[[80,15]], rotate:false }
      ]
    },
    {
      id:'ocean', name:'海洋蔚蓝', price:0.5, emoji:'🌊',
      gradient:'linear-gradient(135deg,#0077b6,#00b4d8,#90e0ef)',
      desc:'清爽海洋风格',
      // SVG 底纹：波浪线条
      pattern: 'ocean',
      decoItems: [
        { emoji:'🐚', size:24, positions:[[8,20],[22,75],[65,15],[85,65],[45,85],[75,40]], rotate:false },
        { emoji:'🐠', size:22, positions:[[15,50],[55,10],[90,30],[35,70]], rotate:true },
        { emoji:'🌊', size:28, positions:[[5,5],[50,0],[95,10]], rotate:false }
      ]
    },
    {
      id:'sunset', name:'落日余晖', price:0.5, emoji:'🌇',
      gradient:'linear-gradient(135deg,#f72585,#b5179e,#7209b7)',
      desc:'渐变紫粉暖色调',
      // SVG 底纹：几何光晕
      pattern: 'sunset',
      decoItems: [
        { emoji:'🔥', size:24, positions:[[12,10],[50,5],[88,15]], rotate:false },
        { emoji:'💫', size:22, positions:[[20,45],[60,30],[80,60],[35,80]], rotate:true },
        { emoji:'✦', size:16, positions:[[8,30],[30,60],[55,50],[75,25],[90,75],[45,90],[15,88],[68,10]], rotate:true }
      ]
    },
    {
      id:'minimal', name:'极简黑白', price:0.5, emoji:'🖤',
      gradient:'linear-gradient(135deg,#2b2d42,#8d99ae)',
      desc:'高级感极简设计',
      // SVG 底纹：细线网格
      pattern: 'minimal',
      decoItems: [
        { emoji:'◇', size:18, positions:[[10,10],[50,10],[90,10],[10,50],[50,50],[90,50],[10,90],[50,90],[90,90]], rotate:false },
        { emoji:'○', size:24, positions:[[30,30],[70,30],[30,70],[70,70]], rotate:false }
      ]
    }
  ],
  // 特效列表
  effects: [
    { id:'none', name:'无特效', price:0, emoji:'✋' },
    { id:'snow', name:'飘雪', price:0.5, emoji:'❄️' },
    { id:'sparkle', name:'星光闪烁', price:0.5, emoji:'✨' },
    { id:'bubbles', name:'泡泡浮动', price:0.5, emoji:'🫧' },
    { id:'hearts', name:'爱心飘落', price:0.5, emoji:'💕' },
    { id:'cherry', name:'樱花飘落', price:0.5, emoji:'🌺' },
    { id:'music', name:'音符跳动', price:0.5, emoji:'🎵' }
  ],
  init() {
    // 从 localStorage 恢复选择
    try {
      var saved = JSON.parse(localStorage.getItem(SiteManager.optsKey()) || '{}');
      if (saved.template) this.selectedTemplate = saved.template;
      if (saved.effects) this.selectedEffects = saved.effects;
      if (saved.paid) this.paidItems = saved.paid;
    } catch(e) {}
    // 页面加载时：如果所有选中的模板/特效都已购买，自动应用效果
    var self = this;
    setTimeout(function() {
      if (self._checkAllSelectedPaid()) {
        LivePreview.refresh();
      }
    }, 300);
  },
  save() {
    localStorage.setItem(SiteManager.optsKey(), JSON.stringify({
      template: this.selectedTemplate,
      effects: this.selectedEffects,
      paid: this.paidItems
    }));
  },
  getTotal() {
    var total = 0;
    var tmpl = this.templates.find(function(t){ return t.id === TemplateStore.selectedTemplate; });
    if (tmpl && tmpl.price > 0) total += tmpl.price;
    this.selectedEffects.forEach(function(eid) {
      var fx = TemplateStore.effects.find(function(e){ return e.id === eid; });
      if (fx && fx.price > 0) total += fx.price;
    });
    return total;
  },
  getUnpaidItems() {
    var items = [];
    var tmpl = this.templates.find(function(t){ return t.id === TemplateStore.selectedTemplate; });
    if (tmpl && tmpl.price > 0 && this.paidItems.indexOf(tmpl.id) === -1) {
      items.push({ id: tmpl.id, name: tmpl.name, price: tmpl.price, emoji: tmpl.emoji, type: 'template' });
    }
    var self = this;
    this.selectedEffects.forEach(function(eid) {
      var fx = self.effects.find(function(e){ return e.id === eid; });
      if (fx && fx.price > 0 && self.paidItems.indexOf(eid) === -1) {
        items.push({ id: fx.id, name: fx.name, price: fx.price, emoji: fx.emoji, type: 'effect' });
      }
    });
    return items;
  },
  // 检查当前所有选中的模板+特效是否都已购买/免费
  _checkAllSelectedPaid() {
    var tmpl = this.templates.find(function(t){ return t.id === TemplateStore.selectedTemplate; });
    if (tmpl && tmpl.price > 0 && TemplateStore.paidItems.indexOf(tmpl.id) === -1) return false;
    for (var i = 0; i < TemplateStore.selectedEffects.length; i++) {
      var eid = TemplateStore.selectedEffects[i];
      if (eid === 'none') continue;
      var fx = TemplateStore.effects.find(function(e){ return e.id === eid; });
      if (fx && fx.price > 0 && TemplateStore.paidItems.indexOf(eid) === -1) return false;
    }
    return true;
  },
  toggleTemplate(id) {
    this.selectedTemplate = id;
    this.save();
    Render.editor('template');
    Render.preview(AppState.currentTab);
    // 如果全部已购买/免费，立即应用效果
    if (this._checkAllSelectedPaid()) {
      LivePreview.refresh();
    }
  },
  toggleEffect(id) {
    var idx = this.selectedEffects.indexOf(id);
    if (id === 'none') {
      this.selectedEffects = ['none'];
    } else {
      // 移除 'none'
      var noneIdx = this.selectedEffects.indexOf('none');
      if (noneIdx > -1) this.selectedEffects.splice(noneIdx, 1);
      if (idx > -1) {
        this.selectedEffects.splice(idx, 1);
        if (this.selectedEffects.length === 0) this.selectedEffects = ['none'];
      } else {
        this.selectedEffects.push(id);
      }
    }
    this.save();
    Render.editor('template');
    Render.preview(AppState.currentTab);
    // 如果全部已购买/免费，立即应用效果
    if (this._checkAllSelectedPaid()) {
      LivePreview.refresh();
    }
  },
  // 导出前的付费检查：弹出费用清单弹窗，返回 false（异步流程，由弹窗按钮触发后续导出）
  checkBeforeExport(exportType) {
    this._exportType = exportType || 'readonly';
    var billItems = this._buildBillItems();
    var totalFee = this._calcTotalFee(billItems);
    this._showBillModal(billItems, totalFee);
    return false; // 始终返回 false：导出由弹窗确认按钮触发
  },
  // 构建费用清单项：导出费 + 模板费 + 特效费
  _buildBillItems() {
    var items = [];
    // 导出费
    items.push({ id:'_export', name:'基础导出费', price:1, emoji:'📦', type:'export', paid:false });
    // 模板费
    var self = this;
    var tmpl = this.templates.find(function(t){ return t.id === self.selectedTemplate; });
    if (tmpl && tmpl.price > 0) {
      var isPaid = this.paidItems.indexOf(tmpl.id) !== -1;
      items.push({ id:tmpl.id, name:'模板：' + tmpl.name, price:tmpl.price, emoji:tmpl.emoji, type:'template', paid:isPaid });
    }
    // 特效费
    this.selectedEffects.forEach(function(eid) {
      var fx = self.effects.find(function(e){ return e.id === eid; });
      if (fx && fx.price > 0) {
        var isPaid = self.paidItems.indexOf(eid) !== -1;
        items.push({ id:fx.id, name:'特效：' + fx.name, price:fx.price, emoji:fx.emoji, type:'effect', paid:isPaid });
      }
    });
    return items;
  },
  // 计算总费用（只算未付费的）
  _calcTotalFee(billItems) {
    var total = 0;
    billItems.forEach(function(item) {
      if (!item.paid) total += item.price;
    });
    return total;
  },
  // 显示费用清单弹窗
  _showBillModal(billItems, totalFee) {
    this._pendingBill = billItems; // 暂存，供确认支付用
    var html = '';
    billItems.forEach(function(item) {
      if (item.paid) {
        html += '<div class="bill-row paid">' +
          '<div class="bill-info"><span class="bill-emoji">' + item.emoji + '</span><span>' + item.name + '</span><span class="bill-paid-tag">✅ 已付</span></div>' +
          '<span class="bill-price">¥' + item.price + '</span></div>';
      } else {
        html += '<div class="bill-row">' +
          '<div class="bill-info"><span class="bill-emoji">' + item.emoji + '</span><span>' + item.name + '</span></div>' +
          '<span class="bill-price">¥' + item.price + '</span></div>';
      }
    });
    // 总计
    html += '<div class="bill-total-row">' +
      '<span class="label">应付合计</span>' +
      '<span class="amount' + (totalFee === 0 ? ' free' : '') + '">¥' + totalFee + '</span></div>';
    document.getElementById('billBody').innerHTML = html;
    var goBtn = document.getElementById('billGoBtn');
    if (totalFee === 0) {
      goBtn.textContent = '免费导出';
    } else {
      goBtn.textContent = '去支付 ¥' + totalFee;
    }
    document.getElementById('billOverlay').classList.add('show');
  },
  // 取消费用清单
  cancelBill() {
    document.getElementById('billOverlay').classList.remove('show');
    this._pendingBill = null;
  },
  // 确认清单 → 去支付
  goToPay() {
    var billItems = this._pendingBill;
    if (!billItems) return;
    var totalFee = this._calcTotalFee(billItems);
    // 关闭清单弹窗
    document.getElementById('billOverlay').classList.remove('show');
    if (totalFee === 0) {
      // 全部已付过，直接导出（skipCheck=true 跳过二次检查）
      if (this._exportType === 'standalone') {
        Exporter.doExport();
      } else {
        Exporter.exportReadOnly(true);
      }
      return;
    }
    // 构建未付费项给支付弹窗
    var unpaid = billItems.filter(function(item) { return !item.paid; });
    this.showPayModal(unpaid);
  },
  // 预览外观效果：先检查付费，再应用预览
  previewStyle() {
    if (!this.selectedTemplate || this.selectedTemplate === 'default') {
      var hasFx = this.selectedEffects && this.selectedEffects.length > 0 && !(this.selectedEffects.length === 1 && this.selectedEffects[0] === 'none');
      if (!hasFx) {
        alert('请先在编辑面板的「外观」标签中选择一个模板或特效');
        return;
      }
    }
    // 检查是否有未购买的模板/特效
    var unpaid = this.getUnpaidItems();
    if (unpaid.length > 0) {
      this.showStylePurchaseDialog(unpaid);
      return;
    }
    // 全部已购买，直接预览
    this._doPreview();
  },
  // 显示外观购买弹窗
  showStylePurchaseDialog(unpaid) {
    var self = this;
    // 移除旧弹窗
    var old = document.getElementById('stylePurchaseOverlay');
    if (old) old.remove();
    var total = 0;
    unpaid.forEach(function(item) { total += item.price; });
    var itemsHtml = '';
    unpaid.forEach(function(item) {
      itemsHtml += '<div class="sp-item"><div class="sp-item-name"><span>' + item.emoji + '</span><span>' + item.name + '</span></div><span class="sp-item-price">¥' + item.price.toFixed(1) + '</span></div>';
    });
    var overlay = document.createElement('div');
    overlay.id = 'stylePurchaseOverlay';
    overlay.className = 'style-purchase-overlay';
    overlay.innerHTML = '<div class="style-purchase-dialog">' +
      '<div class="style-purchase-header"><span class="sp-icon">🎨</span><h3>解锁精美外观</h3></div>' +
      '<div class="style-purchase-body">' +
        '<p>该特效/模板<b>未购买</b>，仅可预览，<br>刷新或下次点开将不会保存。</p>' +
        '<div class="sp-item-list">' + itemsHtml + '</div>' +
        '<p style="font-size:13px;color:var(--primary);font-weight:700;">合计：¥' + total.toFixed(1) + '</p>' +
      '</div>' +
      '<div class="style-purchase-footer">' +
        '<button class="sp-btn-know" id="spBtnKnow">知道了</button>' +
        '<button class="sp-btn-buy" id="spBtnBuy">立即购买 ¥' + total.toFixed(1) + '</button>' +
      '</div>' +
    '</div>';
    document.body.appendChild(overlay);
    // 动画入场
    requestAnimationFrame(function() { overlay.classList.add('show'); });
    // "知道了" — 仍然预览但不保存
    document.getElementById('spBtnKnow').onclick = function() {
      overlay.classList.remove('show');
      setTimeout(function() { overlay.remove(); }, 300);
      self._doPreview();
    };
    // "立即购买" — 打开支付弹窗
    document.getElementById('spBtnBuy').onclick = function() {
      overlay.classList.remove('show');
      setTimeout(function() { overlay.remove(); }, 300);
      self._pendingBill = unpaid.map(function(u) { return { id: u.id, name: u.name, price: u.price, emoji: u.emoji, type: u.type, paid: false }; });
      self.showPayModal(unpaid);
    };
    // 点击背景关闭
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.classList.remove('show');
        setTimeout(function() { overlay.remove(); }, 300);
      }
    });
  },
  // 实际执行预览
  _doPreview() {
    // 应用模板和特效
    LivePreview.refresh();
    // 进入全屏预览
    document.body.classList.add('fullscreen-mode');
    window.scrollTo({top:0, behavior:'smooth'});
  },
  // ═══════════ 更多模板与特效 — 市场面板 ═══════════
  showMarketPanel() {
    var self = this;
    // 移除旧面板
    var old = document.getElementById('marketOverlay');
    if (old) old.remove();

    // 构建模板列表
    var tmplHtml = '';
    this.templates.forEach(function(t) {
      var isActive = self.selectedTemplate === t.id;
      var isPaid = t.price === 0 || self.paidItems.indexOf(t.id) !== -1;
      var badge = t.price === 0 ? '免费' : (isPaid ? '已购买' : '¥' + t.price.toFixed(1));
      var badgeClass = t.price === 0 ? 'market-badge-free' : (isPaid ? 'market-badge-paid' : 'market-badge-price');
      tmplHtml += '<div class="market-card' + (isActive ? ' active' : '') + '" data-id="' + t.id + '" data-type="template">' +
        '<div class="market-card-icon">' + t.emoji + '</div>' +
        '<div class="market-card-name">' + t.name + '</div>' +
        '<div class="market-card-desc">' + t.desc + '</div>' +
        '<span class="market-card-badge ' + badgeClass + '">' + badge + '</span>' +
      '</div>';
    });

    // 构建特效列表
    var fxHtml = '';
    this.effects.forEach(function(fx) {
      if (fx.id === 'none') return; // 跳过"无特效"
      var isActive = self.selectedEffects.indexOf(fx.id) !== -1;
      var isPaid = fx.price === 0 || self.paidItems.indexOf(fx.id) !== -1;
      var badge = fx.price === 0 ? '免费' : (isPaid ? '已购买' : '¥' + fx.price.toFixed(1));
      var badgeClass = fx.price === 0 ? 'market-badge-free' : (isPaid ? 'market-badge-paid' : 'market-badge-price');
      fxHtml += '<div class="market-card' + (isActive ? ' active' : '') + '" data-id="' + fx.id + '" data-type="effect">' +
        '<div class="market-card-icon">' + fx.emoji + '</div>' +
        '<div class="market-card-name">' + fx.name + '</div>' +
        '<div class="market-card-desc">特效动画</div>' +
        '<span class="market-card-badge ' + badgeClass + '">' + badge + '</span>' +
      '</div>';
    });

    var overlay = document.createElement('div');
    overlay.id = 'marketOverlay';
    overlay.className = 'market-overlay';
    overlay.innerHTML = '<div class="market-dialog">' +
      '<div class="market-header">' +
        '<h3 class="market-title">更多模板与特效</h3>' +
        '<p class="market-subtitle">选择心仪的模板和特效装点你的粉丝站</p>' +
        '<button class="market-close" id="marketClose">✕</button>' +
      '</div>' +
      '<div class="market-body">' +
        '<div class="market-section">' +
          '<h4 class="market-section-title">站点模板</h4>' +
          '<div class="market-grid">' + tmplHtml + '</div>' +
        '</div>' +
        '<div class="market-section">' +
          '<h4 class="market-section-title">页面特效</h4>' +
          '<div class="market-grid">' + fxHtml + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
    document.body.appendChild(overlay);

    // 动画入场
    requestAnimationFrame(function() { overlay.classList.add('show'); });

    // 关闭按钮
    document.getElementById('marketClose').onclick = function() {
      overlay.classList.remove('show');
      setTimeout(function() { overlay.remove(); }, 300);
    };
    // 点击背景关闭
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.classList.remove('show');
        setTimeout(function() { overlay.remove(); }, 300);
      }
    });

    // 绑定卡片点击
    var cards = overlay.querySelectorAll('.market-card');
    cards.forEach(function(card) {
      card.onclick = function() {
        var id = card.getAttribute('data-id');
        var type = card.getAttribute('data-type');
        if (type === 'template') {
          var tmpl = self.templates.find(function(t) { return t.id === id; });
          if (!tmpl) return;
          // 检查是否已购买或免费
          if (tmpl.price === 0 || self.paidItems.indexOf(id) !== -1) {
            // 已购买/免费 → 直接切换
            self.toggleTemplate(id);
            // 刷新面板显示
            overlay.classList.remove('show');
            setTimeout(function() { overlay.remove(); }, 300);
            setTimeout(function() { self.showMarketPanel(); }, 350);
          } else {
            // 未购买 → 弹窗
            self._showMarketPurchaseDialog(tmpl, 'template', overlay);
          }
        } else if (type === 'effect') {
          var fx = self.effects.find(function(e) { return e.id === id; });
          if (!fx) return;
          if (fx.price === 0 || self.paidItems.indexOf(id) !== -1) {
            // 已购买/免费 → 直接切换
            self.toggleEffect(id);
            overlay.classList.remove('show');
            setTimeout(function() { overlay.remove(); }, 300);
            setTimeout(function() { self.showMarketPanel(); }, 350);
          } else {
            // 未购买 → 弹窗
            self._showMarketPurchaseDialog(fx, 'effect', overlay);
          }
        }
      };
    });
  },
  // 商场购买确认弹窗
  _showMarketPurchaseDialog(item, type, overlay) {
    var self = this;
    var oldDlg = document.getElementById('marketPurchaseOverlay');
    if (oldDlg) oldDlg.remove();

    var dlg = document.createElement('div');
    dlg.id = 'marketPurchaseOverlay';
    dlg.className = 'market-purchase-overlay';
    dlg.innerHTML = '<div class="market-purchase-dialog">' +
      '<div class="market-purchase-header"><span class="mp-icon">' + (item.emoji || '🎨') + '</span><h3>' + item.name + '</h3></div>' +
      '<div class="market-purchase-body">' +
        '<p>该' + (type === 'template' ? '模板' : '特效') + '需要购买后才能使用。</p>' +
        '<div class="mp-price-row"><span class="mp-label">价格</span><span class="mp-amount">¥' + item.price.toFixed(1) + '</span></div>' +
      '</div>' +
      '<div class="market-purchase-footer">' +
        '<button class="mp-btn-know" id="mpBtnKnow">知道了</button>' +
        '<button class="mp-btn-buy" id="mpBtnBuy">去购买 ¥' + item.price.toFixed(1) + '</button>' +
      '</div>' +
    '</div>';
    document.body.appendChild(dlg);
    requestAnimationFrame(function() { dlg.classList.add('show'); });

    document.getElementById('mpBtnKnow').onclick = function() {
      dlg.classList.remove('show');
      setTimeout(function() { dlg.remove(); }, 300);
    };
    document.getElementById('mpBtnBuy').onclick = function() {
      dlg.classList.remove('show');
      setTimeout(function() { dlg.remove(); }, 300);
      // 构建支付项
      var payItem = [{ id: item.id, name: item.name, price: item.price, emoji: item.emoji, type: type }];
      self._pendingBill = payItem.map(function(u) { return { id: u.id, name: u.name, price: u.price, emoji: u.emoji, type: u.type, paid: false }; });
      if (overlay) {
        overlay.classList.remove('show');
        setTimeout(function() { overlay.remove(); }, 300);
      }
      self.showPayModal(payItem);
    };
    dlg.addEventListener('click', function(e) {
      if (e.target === dlg) {
        dlg.classList.remove('show');
        setTimeout(function() { dlg.remove(); }, 300);
      }
    });
  },
  // 当前选中的支付方式
  _payMethod: 'wechat',
  // ---- 收款二维码配置（运营者修改这里）----
  // 将 null 替换为你的二维码图片 base64 或 URL
  // 示例：'data:image/png;base64,iVBORw...'  或  'https://example.com/qr.png'
  _wechatQR: 'wechat_money.jpg',    // 微信收款码
  _alipayQR: 'Alipay_money.jpg',    // 支付宝收款码
  // ---- 收款人信息（可选，展示在二维码下方）----
  _wechatName: '扫码付款',
  _alipayName: '扫码付款',
  showPayModal(items) {
    var list = document.getElementById('payItemList');
    var html = '';
    var total = 0;
    items.forEach(function(item) {
      total += item.price;
      html += '<div class="pay-item">' +
        '<div class="pay-item-info"><span class="pay-item-emoji">' + item.emoji + '</span><span>' + item.name + '</span></div>' +
        '<span class="pay-item-price">¥' + item.price + '</span>' +
        '</div>';
    });
    list.innerHTML = html;
    document.getElementById('payTotalAmount').textContent = '¥' + total;
    // 重置到微信支付 Tab
    this._payMethod = 'wechat';
    this._renderPayQR('wechat');
    document.getElementById('payOverlay').classList.add('show');
  },
  cancelPay() {
    document.getElementById('payOverlay').classList.remove('show');
  },
  switchPayMethod(method) {
    this._payMethod = method;
    this._renderPayQR(method);
    // 更新 Tab 高亮
    document.getElementById('payTabWechat').className = 'pay-method-tab wechat' + (method === 'wechat' ? ' active' : '');
    document.getElementById('payTabAlipay').className = 'pay-method-tab alipay' + (method === 'alipay' ? ' active' : '');
  },
  _renderPayQR(method) {
    var isWechat = method === 'wechat';
    var qrWrap = document.getElementById('payQrWrap');
    var hint = document.getElementById('payQrHint');
    var hintTitle = document.getElementById('payQrHintTitle');
    var confirmBtn = document.getElementById('payConfirmBtn');
    var qrPlaceholder = document.getElementById('payQrPlaceholder');
    var tip = document.getElementById('payQrTip');
    var icon = document.getElementById('payQrIcon');
    var label = document.getElementById('payQrLabel');
    var svgEl = document.getElementById('payQrSvg');
    if (isWechat) {
      qrWrap.className = 'pay-qr-wrap';
      hint.className = 'pay-qr-hint';
      hintTitle.textContent = '微信扫码支付 · ' + this._wechatName;
      confirmBtn.className = 'pay-done-wechat';
      confirmBtn.textContent = '✅ 微信已付款';
      label.textContent = '微信';
      icon.style.display = 'none';
      tip.style.display = '';
    } else {
      qrWrap.className = 'pay-qr-wrap';
      hint.className = 'pay-qr-hint';
      hintTitle.textContent = '支付宝扫码支付 · ' + this._alipayName;
      confirmBtn.className = 'pay-done-alipay';
      confirmBtn.textContent = '✅ 支付宝已付款';
      label.textContent = '支付宝';
      icon.style.display = 'none';
      tip.style.display = '';
    }
    // 决定展示图片还是占位 SVG
    var qrSrc = isWechat ? this._wechatQR : this._alipayQR;
    // 清除旧内容
    var oldImg = qrPlaceholder.querySelector('img.real-qr');
    if (oldImg) oldImg.remove();
    if (qrSrc) {
      // 有真实二维码：隐藏占位，显示图片
      svgEl.style.display = 'none';
      tip.style.display = 'none';
      var img = document.createElement('img');
      img.src = qrSrc;
      img.className = 'real-qr';
      img.style.cssText = 'width:170px;height:170px;object-fit:contain;';
      qrPlaceholder.appendChild(img);
    } else {
      // 无真实二维码：显示占位 SVG
      svgEl.style.display = '';
      tip.style.display = '';
      icon.style.display = 'none';
      // 替换 SVG 颜色
      var color = isWechat ? '#07c160' : '#1677ff';
      var svgContent = svgEl.innerHTML;
      // 更新 SVG fill/stroke 颜色
      svgEl.querySelectorAll('[fill],[stroke]').forEach(function(el) {
        if (el.getAttribute('fill') && el.getAttribute('fill') !== 'none' && el.getAttribute('fill') !== '#fff') {
          el.setAttribute('fill', color);
        }
        if (el.getAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
          el.setAttribute('stroke', color);
        }
      });
    }
  },
  confirmPay() {
    // 二次确认：增加心理成本，防止用户未付款就点确认
    if (!confirm('⚠️ 请确认您已完成扫码支付！\n\n如果您还未付款，请先扫码完成支付后再点击确认。\n\n虚拟商品，一经确认不支持退款。')) return;
    var self = this;
    // 标记所有待付款项为已付
    var pendingBill = this._pendingBill;
    if (pendingBill) {
      pendingBill.forEach(function(item) {
        if (!item.paid && self.paidItems.indexOf(item.id) === -1) {
          self.paidItems.push(item.id);
        }
      });
    }
    this.save();
    // 同步 React 状态
    if (window._reactDispatch) {
      pendingBill.forEach(function(item) {
        if (!item.paid) window._reactDispatch({ type: 'PAY_ITEM', id: item.id });
      });
    }
    this._pendingBill = null;
    document.getElementById('payOverlay').classList.remove('show');
    // 支付成功提示
    var tip = document.createElement('div');
    tip.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(16,185,129,0.95);color:#fff;padding:16px 32px;border-radius:16px;font-size:16px;font-weight:700;z-index:20000;box-shadow:0 8px 32px rgba(0,0,0,0.2);animation:tipFadeIn 0.3s ease;';
    tip.textContent = '✅ 支付成功！外观已永久解锁';
    document.body.appendChild(tip);
    // 刷新编辑台显示"已购买"
    Render.editor('template');
    setTimeout(function() {
      tip.remove();
      // 如果是样式购买触发的支付，自动预览
      if (!self._exportType) {
        self._doPreview();
      } else if (self._exportType === 'standalone') {
        Exporter.doExport();
      } else {
        Exporter.exportReadOnly(true);
      }
      self._exportType = null;
    }, 1200);
  },
  // 获取模板对应的导出样式覆盖（含装饰图案）
  getTemplateCSS(id) {
    var map = {
      'default': '',
      'sakura': '.hero{background:linear-gradient(135deg,rgba(255,195,208,0.8),rgba(232,160,191,0.8))!important;border:2px solid rgba(255,150,180,0.4)!important}.section{border:1px solid rgba(255,182,193,0.3)!important}.site-name{color:#d6336c!important}.ev-badge{background:#e8a0bf!important}body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;background-image:url("data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M30 5 C32 2,38 2,40 5 C42 2,48 2,50 5 C48 8,45 12,40 15 C35 12,32 8,30 5Z%22 fill=%22rgba(255,200,210,0.08)%22/%3E%3C/svg%3E");background-repeat:repeat}.container{position:relative;z-index:1}',
      'galaxy': 'body{background:linear-gradient(135deg,#0f0c29,#302b63)!important}.hero{background:rgba(30,20,60,0.85)!important;border:1px solid rgba(139,92,246,0.4)!important}.site-name{color:#a78bfa!important}.bio-text,.ev-desc,.card-text{color:#c4b5fd!important}h2{color:#e0e7ff!important}.footer{color:rgba(167,139,250,0.7)!important}body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;background-image:url("data:image/svg+xml,%3Csvg width=%2280%22 height=%2280%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle cx=%2210%22 cy=%2210%22 r=%221%22 fill=%22rgba(255,255,255,0.15)%22/%3E%3Ccircle cx=%2240%22 cy=%225%22 r=%220.8%22 fill=%22rgba(167,139,250,0.12)%22/%3E%3Ccircle cx=%2270%22 cy=%2215%22 r=%221.2%22 fill=%22rgba(255,255,255,0.1)%22/%3E%3Ccircle cx=%2255%22 cy=%2235%22 r=%221.5%22 fill=%22rgba(255,255,255,0.08)%22/%3E%3C/svg%3E");background-repeat:repeat}.container{position:relative;z-index:1}',
      'ocean': '.hero{background:linear-gradient(135deg,rgba(0,119,182,0.7),rgba(0,180,216,0.7))!important}.site-name{color:#0077b6!important}.section{border-left:3px solid #00b4d8!important}.weibo-btn{background:#0077b6!important}.ev-badge{background:#00b4d8!important}body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;background-image:url("data:image/svg+xml,%3Csvg width=%22120%22 height=%2240%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M0 20 Q15 8,30 20 T60 20 T90 20 T120 20%22 fill=%22none%22 stroke=%22rgba(0,180,216,0.08)%22 stroke-width=%221.5%22/%3E%3Cpath d=%22M0 30 Q15 18,30 30 T60 30 T90 30 T120 30%22 fill=%22none%22 stroke=%22rgba(0,180,216,0.05)%22 stroke-width=%221%22/%3E%3C/svg%3E");background-repeat:repeat}.container{position:relative;z-index:1}',
      'sunset': 'body{background:linear-gradient(135deg,#f72585,#7209b7)!important}.hero{background:linear-gradient(135deg,rgba(247,37,133,0.7),rgba(114,9,183,0.7))!important;border:1px solid rgba(255,255,255,0.3)!important}.site-name{color:#fff!important;text-shadow:0 2px 12px rgba(0,0,0,0.3)!important}.bio-text,.card-text{color:#fce7f3!important}h2{color:#fce7f3!important}.weibo-btn{background:#b5179e!important}.ev-badge{background:#f72585!important}.footer{color:rgba(255,255,255,0.8)!important}body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;background-image:url("data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpolygon points=%2230,5 33,22 50,22 36,32 41,48 30,38 19,48 24,32 10,22 27,22%22 fill=%22none%22 stroke=%22rgba(255,255,255,0.04)%22 stroke-width=%220.8%22/%3E%3C/svg%3E");background-repeat:repeat}.container{position:relative;z-index:1}',
      'minimal': 'body{background:linear-gradient(135deg,#f8f9fa,#e9ecef)!important}.hero{background:#fff!important;border:1px solid #dee2e6!important;box-shadow:0 8px 32px rgba(0,0,0,0.08)!important}.site-name{color:#212529!important}.section{background:#fff!important;border:1px solid #dee2e6!important;box-shadow:0 2px 12px rgba(0,0,0,0.04)!important}h2{color:#343a40!important}.footer{color:#6c757d!important}body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;background-image:url("data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cline x1=%220%22 y1=%220%22 x2=%2240%22 y2=%220%22 stroke=%22rgba(0,0,0,0.04)%22 stroke-width=%220.5%22/%3E%3Cline x1=%220%22 y1=%220%22 x2=%220%22 y2=%2240%22 stroke=%22rgba(0,0,0,0.04)%22 stroke-width=%220.5%22/%3E%3C/svg%3E");background-repeat:repeat}.container{position:relative;z-index:1}'
    };
    return map[id] || '';
  },
  // 获取模板装饰元素（浮动 emoji）的导出 JS 代码
  getDecoItemsJS(id) {
    var tmpl = this.templates.find(function(t){ return t.id === id; });
    if (!tmpl || !tmpl.decoItems || tmpl.decoItems.length === 0) return '';
    // 将 decoItems 序列化为 JS 字符串
    var decoData = JSON.stringify(tmpl.decoItems);
    return '(function(){' +
      'var _dl=document.createElement("div");' +
      '_dl.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:997;overflow:hidden";' +
      'document.body.appendChild(_dl);' +
      'var items=' + decoData + ';' +
      'var _ds=document.createElement("style");' +
      '_ds.textContent="@keyframes _df{0%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(-8px) rotate(3deg)}50%{transform:translateY(-3px) rotate(-2deg)}75%{transform:translateY(-10px) rotate(2deg)}100%{transform:translateY(0) rotate(0deg)}}";' +
      'document.head.appendChild(_ds);' +
      'items.forEach(function(g){' +
        'var ems=g.emoji.split(" ");' +
        'g.positions.forEach(function(p){' +
          'var el=document.createElement("div");' +
          'el.style.cssText="position:absolute;pointer-events:none;opacity:0.15;font-size:"+(g.size*0.6+Math.random()*g.size*0.4)+"px;left:"+(p[0]+(Math.random()*4-2))+"%;top:"+(p[1]+(Math.random()*4-2))+"%;animation:_df "+(6+Math.random()*8).toFixed(1)+"s ease-in-out infinite;animation-delay:"+(Math.random()*6).toFixed(1)+"s";' +
          'if(g.rotate)el.style.transform="rotate("+(Math.random()*60-30)+"deg)";' +
          'el.textContent=ems[Math.floor(Math.random()*ems.length)];' +
          '_dl.appendChild(el);' +
        '});' +
      '});' +
    '})();';
  },
  // 获取特效对应的导出 JS 代码
  getEffectJS(effects) {
    if (!effects || effects.length === 0 || (effects.length === 1 && effects[0] === 'none')) return '';
    var codes = '';
    effects.forEach(function(eid) {
      if (eid === 'none') return;
      var fxMap = {
        'snow': 'var _sfSnow=document.createElement("div");_sfSnow.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:7998;overflow:hidden";document.body.appendChild(_sfSnow);(function(){for(var i=0;i<40;i++){var f=document.createElement("div");f.style.cssText="position:absolute;color:#fff;font-size:"+(8+Math.random()*12)+"px;top:-20px;left:"+Math.random()*100+"%;animation:sfSnowFall "+(3+Math.random()*5)+"s linear infinite;animation-delay:"+Math.random()*5+"s;opacity:0.8";f.textContent="❄";_sfSnow.appendChild(f)}var st=document.createElement("style");st.textContent="@keyframes sfSnowFall{0%{transform:translateY(-20px) rotate(0deg)}100%{transform:translateY(105vh) rotate(360deg)}}";document.head.appendChild(st)})();',
        'sparkle': 'var _sfSp=document.createElement("div");_sfSp.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:7998;overflow:hidden";document.body.appendChild(_sfSp);(function(){for(var i=0;i<25;i++){var s=document.createElement("div");s.style.cssText="position:absolute;color:#ffd700;font-size:"+(10+Math.random()*16)+"px;top:"+Math.random()*100+"%;left:"+Math.random()*100+"%;animation:sfSparkle "+(1.5+Math.random()*2)+"s ease-in-out infinite alternate;animation-delay:"+Math.random()*3+"s;opacity:0";s.textContent="✨";_sfSp.appendChild(s)}var st=document.createElement("style");st.textContent="@keyframes sfSparkle{0%{opacity:0;transform:scale(0.5) rotate(0deg)}100%{opacity:1;transform:scale(1.2) rotate(180deg)}}";document.head.appendChild(st)})();',
        'bubbles': 'var _sfBub=document.createElement("div");_sfBub.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:7998;overflow:hidden";document.body.appendChild(_sfBub);(function(){for(var i=0;i<20;i++){var b=document.createElement("div");var sz=12+Math.random()*20;b.style.cssText="position:absolute;width:"+sz+"px;height:"+sz+"px;border-radius:50%;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,0.8),rgba(173,216,230,0.3));bottom:-30px;left:"+Math.random()*100+"%;animation:sfBubble "+(4+Math.random()*6)+"s ease-in infinite;animation-delay:"+Math.random()*6+"s;border:1px solid rgba(255,255,255,0.4)";_sfBub.appendChild(b)}var st=document.createElement("style");st.textContent="@keyframes sfBubble{0%{transform:translateY(0) scale(1);opacity:0.8}100%{transform:translateY(-110vh) scale(0.4);opacity:0}}";document.head.appendChild(st)})();',
        'hearts': 'var _sfHrt=document.createElement("div");_sfHrt.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:7998;overflow:hidden";document.body.appendChild(_sfHrt);(function(){for(var i=0;i<20;i++){var h=document.createElement("div");h.style.cssText="position:absolute;font-size:"+(14+Math.random()*14)+"px;top:-30px;left:"+Math.random()*100+"%;animation:sfHeart "+(4+Math.random()*4)+"s linear infinite;animation-delay:"+Math.random()*5+"s;opacity:0.7";h.textContent=["💕","❤️","💖","💗","💘"][Math.floor(Math.random()*5)];_sfHrt.appendChild(h)}var st=document.createElement("style");st.textContent="@keyframes sfHeart{0%{transform:translateY(-20px) rotate(0deg) scale(1)}50%{transform:translateY(50vh) rotate(15deg) scale(1.1)}100%{transform:translateY(105vh) rotate(-15deg) scale(0.6)}}";document.head.appendChild(st)})();',
        'cherry': 'var _sfCh=document.createElement("div");_sfCh.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:7998;overflow:hidden";document.body.appendChild(_sfCh);(function(){for(var i=0;i<30;i++){var c=document.createElement("div");c.style.cssText="position:absolute;font-size:"+(12+Math.random()*14)+"px;top:-25px;left:"+Math.random()*100+"%;animation:sfCherry "+(5+Math.random()*5)+"s ease-in-out infinite;animation-delay:"+Math.random()*6+"s;opacity:0.8";c.textContent=["🌸","✿","❀","🏵️"][Math.floor(Math.random()*4)];_sfCh.appendChild(c)}var st=document.createElement("style");st.textContent="@keyframes sfCherry{0%{transform:translateY(-20px) translateX(0) rotate(0deg)}25%{transform:translateY(25vh) translateX(30px) rotate(90deg)}50%{transform:translateY(50vh) translateX(-20px) rotate(180deg)}75%{transform:translateY(75vh) translateX(25px) rotate(270deg)}100%{transform:translateY(105vh) translateX(0) rotate(360deg)}}";document.head.appendChild(st)})();',
        'music': 'var _sfMus=document.createElement("div");_sfMus.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:7998;overflow:hidden";document.body.appendChild(_sfMus);(function(){for(var i=0;i<15;i++){var m=document.createElement("div");m.style.cssText="position:absolute;font-size:"+(18+Math.random()*14)+"px;bottom:-30px;left:"+Math.random()*100+"%;animation:sfMusic "+(3+Math.random()*4)+"s ease-out infinite;animation-delay:"+Math.random()*5+"s;opacity:0";m.textContent=["🎵","🎶","🎼","♪"][Math.floor(Math.random()*4)];_sfMus.appendChild(m)}var st=document.createElement("style");st.textContent="@keyframes sfMusic{0%{transform:translateY(0) rotate(0deg);opacity:0}10%{opacity:0.9}90%{opacity:0.3}100%{transform:translateY(-110vh) rotate(360deg);opacity:0}}";document.head.appendChild(st)})();'
      };
      if (fxMap[eid]) codes += fxMap[eid];
    });
    return codes;
  }
};
