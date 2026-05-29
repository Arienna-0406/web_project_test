// ===== LivePreview Module =====
// Part of StarFan Studio v2.3

// ================= 🖼 实时预览引擎 (LivePreview) =================
const LivePreview = {
  tmplStyleEl: null,
  decoStyleEl: null,
  currentEffect: null,
  init() {
    this.tmplStyleEl = document.createElement('style');
    this.tmplStyleEl.id = 'livePreviewStyle';
    document.head.appendChild(this.tmplStyleEl);
    this.decoStyleEl = document.createElement('style');
    this.decoStyleEl.id = 'liveDecoStyle';
    document.head.appendChild(this.decoStyleEl);
  },
  getPatternSVG(pid) {
    var m = {
      'sakura': '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="sp" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30 5 C32 2,38 2,40 5 C42 2,48 2,50 5 C48 8,45 12,40 15 C35 12,32 8,30 5Z" fill="rgba(255,255,255,0.06)"/><circle cx="30" cy="30" r="1.5" fill="rgba(255,255,255,0.04)"/></pattern></defs><rect width="100%" height="100%" fill="url(#sp)"/></svg>',
      'galaxy': '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="gp" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.15)"/><circle cx="40" cy="5" r="0.8" fill="rgba(167,139,250,0.12)"/><circle cx="70" cy="15" r="1.2" fill="rgba(255,255,255,0.1)"/><circle cx="55" cy="35" r="1.5" fill="rgba(255,255,255,0.08)"/><line x1="10" y1="10" x2="40" y2="5" stroke="rgba(255,255,255,0.03)" stroke-width="0.5"/><line x1="40" y1="5" x2="55" y2="35" stroke="rgba(255,255,255,0.03)" stroke-width="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#gp)"/></svg>',
      'ocean': '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="op" x="0" y="0" width="120" height="40" patternUnits="userSpaceOnUse"><path d="M0 20 Q15 8,30 20 T60 20 T90 20 T120 20" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/><path d="M0 30 Q15 18,30 30 T60 30 T90 30 T120 30" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#op)"/></svg>',
      'sunset': '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="snp" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse"><polygon points="30,5 33,22 50,22 36,32 41,48 30,38 19,48 24,32 10,22 27,22" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.8"/><circle cx="10" cy="50" r="3" fill="rgba(255,255,255,0.03)"/></pattern></defs><rect width="100%" height="100%" fill="url(#snp)"/></svg>',
      'minimal': '<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="mp" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="40" y2="0" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/><line x1="0" y1="0" x2="0" y2="40" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.08)"/></pattern></defs><rect width="100%" height="100%" fill="url(#mp)"/></svg>'
    };
    return m[pid] || '';
  },
  clearDecoLayer() {
    var l = document.getElementById('themeDecoLayer');
    if (l) l.innerHTML = '';
  },
  applyTemplate(tmplId) {
    this.tmplStyleEl.textContent = '';
    this.decoStyleEl.textContent = '';
    this.clearDecoLayer();
    var tmpl = TemplateStore.templates.find(function(t){ return t.id === tmplId; });
    if (!tmpl || tmpl.id === 'default') return;
    var previewCSS = {
      'sakura': 'body{background:linear-gradient(135deg,#ffc3d0,#ff9ecb,#e8a0bf)!important}.header{text-shadow:0 2px 12px rgba(180,80,100,0.3)!important}.panel{background:rgba(255,240,245,0.88)!important}.news-card,.gallery-item,.event-card,.shop-card,.comments li{border:1px solid rgba(255,182,193,0.3)!important}',
      'galaxy': 'body{background:linear-gradient(135deg,#0f0c29,#302b63,#24243e)!important}.header{color:#e0e7ff!important}.panel{background:rgba(30,20,60,0.9)!important;border-right-color:rgba(139,92,246,0.4)!important}input,textarea,select,.item-card,.news-card,.gallery-item,.shop-card,.comments li{background:rgba(60,40,90,0.6)!important;color:#e0e7ff!important;border-color:rgba(139,92,246,0.3)!important}.section-header h2,.section-header .inline-btn,.cal-header h3,h3{color:#e0e7ff!important}button:not(.tutorial-skip):not(.tutorial-next){background:#7c3aed!important}.tab-btn{color:#c4b5fd!important;border-color:rgba(139,92,246,0.3)!important}.tab-btn.active{background:#7c3aed!important;color:#fff!important}',
      'ocean': 'body{background:linear-gradient(135deg,#0077b6,#00b4d8,#90e0ef)!important}.panel{background:rgba(0,119,182,0.85)!important}.news-card,.gallery-item,.event-card,.shop-card,.comments li,.item-card{border-left:3px solid #00b4d8!important}.section-header h2{color:#0077b6!important}button:not(.tutorial-skip):not(.tutorial-next){background:#0077b6!important}.tab-btn.active{background:#0077b6!important;border-color:#0077b6!important}',
      'sunset': 'body{background:linear-gradient(135deg,#f72585,#b5179e,#7209b7)!important}.header{color:#fce7f3!important;text-shadow:0 2px 12px rgba(0,0,0,0.3)!important}.panel{background:rgba(114,9,183,0.85)!important}input,textarea,select,.item-card,.news-card,.gallery-item,.shop-card,.comments li{background:rgba(183,23,158,0.5)!important;color:#fce7f3!important;border-color:rgba(255,255,255,0.2)!important}.section-header h2,.section-header .inline-btn,h3{color:#fce7f3!important}button:not(.tutorial-skip):not(.tutorial-next){background:#f72585!important}.tab-btn{color:#fce7f3!important;border-color:rgba(255,255,255,0.2)!important}.tab-btn.active{background:#f72585!important;color:#fff!important}',
      'minimal': 'body{background:linear-gradient(135deg,#f8f9fa,#e9ecef)!important}.panel{background:rgba(248,249,250,0.95)!important;border-right-color:#dee2e6!important}.news-card,.gallery-item,.event-card,.shop-card,.comments li,.item-card{background:#fff!important;border:1px solid #dee2e6!important;box-shadow:0 2px 12px rgba(0,0,0,0.04)!important}.section-header h2{color:#343a40!important}button:not(.tutorial-skip):not(.tutorial-next){background:#343a40!important}.tab-btn.active{background:#343a40!important;border-color:#343a40!important}'
    };
    this.tmplStyleEl.textContent = previewCSS[tmplId] || '';
    // SVG pattern overlay
    if (tmpl.pattern && tmpl.pattern !== 'none') {
      var svg = this.getPatternSVG(tmpl.pattern);
      if (svg) {
        var layer = document.getElementById('themeDecoLayer');
        if (layer) {
          var wrap = document.createElement('div');
          wrap.style.cssText = 'position:absolute;inset:0;';
          wrap.innerHTML = svg;
          layer.appendChild(wrap);
        }
      }
    }
    // Floating deco items
    if (tmpl.decoItems && tmpl.decoItems.length > 0) {
      var layer2 = document.getElementById('themeDecoLayer');
      if (!layer2) return;
      tmpl.decoItems.forEach(function(group) {
        var emojis = group.emoji.split(' ');
        group.positions.forEach(function(pos) {
          var el = document.createElement('div');
          el.className = 'theme-deco-float';
          el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
          el.style.fontSize = (group.size * 0.6 + Math.random() * group.size * 0.4) + 'px';
          el.style.left = (pos[0] + (Math.random() * 4 - 2)) + '%';
          el.style.top = (pos[1] + (Math.random() * 4 - 2)) + '%';
          if (group.rotate) el.style.transform = 'rotate(' + (Math.random() * 60 - 30) + 'deg)';
          var dur = 6 + Math.random() * 8;
          el.style.animation = 'decoFloat ' + dur.toFixed(1) + 's ease-in-out infinite';
          el.style.animationDelay = (Math.random() * dur).toFixed(1) + 's';
          layer2.appendChild(el);
        });
      });
      this.decoStyleEl.textContent = '@keyframes decoFloat{0%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(-8px) rotate(3deg)}50%{transform:translateY(-3px) rotate(-2deg)}75%{transform:translateY(-10px) rotate(2deg)}100%{transform:translateY(0) rotate(0deg)}}.theme-deco-float{animation-name:decoFloat}';
    }
  },
  // 应用特效预览（叠加模式，不清除已有特效）
  applyEffect(fxId) {
    if (!fxId || fxId === 'none') return;
    var layer = document.getElementById('liveFxLayer');
    if (!layer) return;
    var config = {
      'snow':    { emoji:'❄️', count:30, size:[8,18], anim:'lfxSnow', dur:[8,18], axis:'y', fromTop:true },
      'sparkle': { emoji:'✨', count:20, size:[10,24], anim:'lfxSparkle', dur:[4,9], axis:'pulse', pos:'random' },
      'bubbles': { emoji:'🫧', count:15, size:[12,28], anim:'lfxBubble', dur:[10,22], axis:'y-up', shape:'circle' },
      'hearts':  { emoji:'💕❤️💖💗💘', count:15, size:[14,24], anim:'lfxHeart', dur:[8,18], axis:'y', fromTop:true },
      'cherry':  { emoji:'🌸✿❀', count:22, size:[12,24], anim:'lfxCherry', dur:[10,22], axis:'y', fromTop:true },
      'music':   { emoji:'🎵🎶🎼♪', count:12, size:[16,28], anim:'lfxMusic', dur:[7,16], axis:'y-up' }
    };
    var cfg = config[fxId];
    if (!cfg) return;
    this.currentEffect = fxId;
    var emojis = cfg.emoji.split(' ');
    for (var i = 0; i < cfg.count; i++) {
      var el = document.createElement('div');
      el.className = 'live-fx-item';
      var size = cfg.size[0] + Math.random() * (cfg.size[1] - cfg.size[0]);
      var dur = cfg.dur[0] + Math.random() * (cfg.dur[1] - cfg.dur[0]);
      var delay = Math.random() * dur;
      var emoji = emojis[Math.floor(Math.random() * emojis.length)];
      if (cfg.shape === 'circle') {
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.borderRadius = '50%';
        el.style.background = 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), rgba(173,216,230,0.15))';
        el.style.border = '1px solid rgba(255,255,255,0.25)';
        el.style.bottom = '-30px';
        el.style.left = Math.random() * 100 + '%';
      } else {
        el.textContent = emoji;
        el.style.fontSize = size + 'px';
        el.style.lineHeight = '1';
        if (cfg.fromTop) {
          el.style.top = '-25px';
          el.style.left = Math.random() * 100 + '%';
        } else if (cfg.axis === 'y-up') {
          el.style.bottom = '-30px';
          el.style.left = Math.random() * 100 + '%';
        } else if (cfg.pos === 'random') {
          el.style.top = Math.random() * 100 + '%';
          el.style.left = Math.random() * 100 + '%';
        }
      }
      el.style.animation = cfg.anim + ' ' + dur.toFixed(1) + 's ease-in-out infinite';
      el.style.animationDelay = delay.toFixed(1) + 's';
      if (cfg.axis === 'pulse') el.style.opacity = '0';
      else el.style.opacity = '0.4';
      layer.appendChild(el);
    }
  },
  // 清除特效
  clearEffect() {
    var layer = document.getElementById('liveFxLayer');
    if (layer) layer.innerHTML = '';
    this.currentEffect = null;
  },
  // 刷新全部（模板 + 所有特效同时叠加）
  refresh() {
    this.applyTemplate(TemplateStore.selectedTemplate);
    // 清除旧特效，再叠加所有选中特效
    this.clearEffect();
    var effects = TemplateStore.selectedEffects || [];
    if (effects.length === 1 && effects[0] === 'none') return;
    var self = this;
    effects.forEach(function(fxId) {
      if (fxId !== 'none') self.applyEffect(fxId);
    });
  }
};
