// ===== Exporter Module =====
// Part of StarFan Studio v2.3

// ================= 🚀 独立网页导出器 (Exporter) =================
const Exporter = {
  togglePreview() {
    document.body.classList.toggle('fullscreen-mode');
    window.scrollTo({top:0, behavior:'smooth'});
  },
  download() {
    this.doExport();
  },
  // 导出不可编辑的纯展示版
  async exportReadOnly() {

    const btn = document.querySelector('.export-btn');
    const ori = btn ? btn.innerText : '📦 导出展示版';
    if (btn) { btn.innerText = '⏳ 打包中...'; btn.disabled = true; }

    try {
      // 从 IndexedDB 加载头像
      var avatarData = AppState.data.celebrity.avatar || '';

      // 从 IndexedDB 加载追忆图片（封面 + 多图）
      const newsWithImages = [];
      for (let n of AppState.data.news) {
        const item = Object.assign({}, n);
        // 封面：如果是 imgId 格式（非 base64、非 http）则从 DB 加载
        if (item.cover && !item.cover.startsWith('data:') && !item.cover.startsWith('http')) {
          var coverData = await AssetDB.load(item.cover);
          item._coverB64 = coverData || '';
        } else {
          item._coverB64 = item.cover || '';
        }
        // 多图
        item._loadedImages = [];
        if (item.images && item.images.length) {
          for (let imgId of item.images) {
            var imgData = await AssetDB.load(imgId);
            if (imgData) item._loadedImages.push(imgData);
          }
        }
        newsWithImages.push(item);
      }

      // 从 IndexedDB 加载画廊图片
      const galleryWithImages = [];
      for (let g of (AppState.data.gallery || [])) {
        const gitem = Object.assign({}, g);
        if (gitem.url && !gitem.url.startsWith('data:') && !gitem.url.startsWith('http')) {
          var gImgData = await AssetDB.load(gitem.url);
          gitem._b64 = gImgData || '';
        } else {
          gitem._b64 = gitem.url || '';
        }
        galleryWithImages.push(gitem);
      }

      const d = Object.assign({}, AppState.data, {
        news: newsWithImages,
        gallery: galleryWithImages,
        celebrity: Object.assign({}, AppState.data.celebrity, { avatar: avatarData })
      });

      // 加载背景图作为 base64（用于导出嵌入）
      // 用 Image + Canvas 替代 fetch，避免 CORS/路径解析问题
      var bgImageB64 = '';
      try {
        var bgEl = document.querySelector('#bgImageLayer');
        if (bgEl) {
          var style = window.getComputedStyle(bgEl).backgroundImage;
          var match = style.match(/url\(["']?([^"')]+)["']?\)/);
          if (match && match[1] && match[1] !== 'none') {
            var imgUrl = match[1];
            bgImageB64 = await new Promise(function(resolve) {
              var img = new Image();
              img.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                try { resolve(canvas.toDataURL('image/jpeg', 0.85)); }
                catch(e) { resolve(''); }
              };
              img.onerror = function() { resolve(''); };
              img.src = imgUrl;
            });
          }
        }
      } catch(e) { console.warn('背景图加载失败，跳过', e); }

      const htmlContent = this.generateReadOnlyHTML(d, bgImageB64);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (AppState.data.celebrity.name || 'StarFan') + '_展示版.html';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (btn) { btn.innerText = '✅ 导出成功'; btn.style.background = '#10b981'; }
    } catch(e) {
      console.error('导出失败', e);
      alert('⚠️ 导出失败：' + e.message);
      if (btn) btn.innerText = ori;
    }
    setTimeout(() => {
      if (btn) { btn.innerText = ori; btn.disabled = false; btn.style.background = ''; }
    }, 2500);
  },
  generateReadOnlyHTML(d, bgImageB64) {
    var c = d.celebrity;
    var theme = this.parseTheme(c.colors);
    var hexToRgba = function(hex, alpha) {
      hex = hex.replace('#','');
      var r = parseInt(hex.substring(0,2), 16);
      var g = parseInt(hex.substring(2,4), 16);
      var b = parseInt(hex.substring(4,6), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    };
    var safe = function(str) { return str ? str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : ''; };
    
    var S = [];
    function w(t) { S.push(t); }
    w('<!DOCTYPE html><html lang="zh-CN"><head>');
    w('<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">');
    w('<title>' + safe(c.name || 'StarFan') + ' 的回忆录</title>');
    w('<style>');
    w(':root{--bg1:' + hexToRgba(theme.c1, 0.35) + ';--bg2:' + hexToRgba(theme.c2, 0.35) + ';--pri:#6366f1;--r:12px;--sh:0 4px 16px rgba(0,0,0,0.08);}');
    w('*{box-sizing:border-box;margin:0;padding:0;}');
    w('body{font-family:system-ui,-apple-system,sans-serif;background:#f0f0f5;min-height:100vh;color:#1f2937;line-height:1.6;}');
    w('#bgLayer{position:fixed;inset:0;z-index:-2;background:linear-gradient(135deg,var(--bg1),var(--bg2));}');
    if(bgImageB64) {
      w('#bgImg{position:fixed;inset:0;z-index:-3;background-image:url(' + bgImageB64 + ');background-size:cover;background-position:center;background-repeat:no-repeat;opacity:0.50;}');
    }
    w('.container{max-width:900px;margin:0 auto;padding:20px 16px 60px;}');
    w('.hero{text-align:center;padding:40px 24px;background:rgba(255,255,255,0.2);backdrop-filter:blur(12px);border-radius:16px;box-shadow:var(--sh);margin-bottom:24px;}');
    w('.avatar{width:120px;height:120px;border-radius:50%;object-fit:cover;border:4px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.15);margin-bottom:12px;}');
    w('.avatar-ph{width:120px;height:120px;border-radius:50%;background:#e5e7eb;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:40px;}');
    w('h1{font-size:28px;margin-bottom:8px;}');
    w('.bio{color:#6b7280;max-width:600px;margin:0 auto 16px;white-space:pre-wrap;}');
    w('.weibo-btn{display:inline-block;padding:10px 20px;background:#ff8200;color:#fff;text-decoration:none;border-radius:20px;font-weight:500;}');
    w('.section{background:rgba(255,255,255,0.2);backdrop-filter:blur(10px);border-radius:16px;padding:20px;margin-bottom:24px;box-shadow:var(--sh);}');
    w('.sec-hd{font-size:18px;font-weight:700;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid rgba(0,0,0,0.05);}');
    w('.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;}');
    w('.card{background:rgba(255,255,255,0.2);border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);transition:0.2s;cursor:pointer;}');
    w('.card:hover{transform:translateY(-3px);box-shadow:0 8px 20px rgba(0,0,0,0.12);}');
    w('.card img{width:100%;height:140px;object-fit:cover;background:#f3f4f6;}');
    w('.card-body{padding:12px;}');
    w('.card-title{font-weight:700;margin:0 0 4px;font-size:15px;}');
    w('.card-meta{font-size:12px;color:#9ca3af;margin-bottom:6px;}');
    w('.card-text{font-size:13px;color:#4b5563;line-height:1.5;white-space:pre-wrap;max-height:60px;overflow:hidden;}');
    w('.gallery{column-count:3;column-gap:12px;}');
    w('.g-item{position:relative;break-inside:avoid;margin-bottom:12px;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);cursor:pointer;background:#f3f4f6;}');
    w('.g-item img{width:100%;display:block;transition:0.3s;}.g-item:hover img{transform:scale(1.05);}');
    w('.g-cap{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.7));color:#fff;font-size:12px;padding:20px 8px 8px;}');
    w('.ev-card{background:rgba(255,255,255,0.2);border-radius:10px;padding:14px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);display:flex;gap:14px;transition:0.2s;}');
    w('.ev-card:hover{transform:translateX(4px);}');
    w('.ev-badge{min-width:52px;text-align:center;background:var(--pri);color:#fff;border-radius:10px;padding:8px 4px;}');
    w('.ev-badge .mo{font-size:11px;opacity:0.85;}.ev-badge .dy{font-size:22px;font-weight:800;line-height:1;}');
    w('.ev-info{flex:1;} .ev-info h4{font-size:15px;margin:0 0 4px;} .ev-desc{font-size:13px;color:#6b7280;}');
    w('.ev-tag{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;background:#e0e7ff;color:var(--pri);margin-top:6px;}');
    w('.sh-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;}');
    w('.sh-card{background:rgba(255,255,255,0.2);border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);transition:0.2s;}');
    w('.sh-card:hover{transform:translateY(-3px);}');
    w('.sh-thumb{height:160px;display:flex;align-items:center;justify-content:center;font-size:52px;background:linear-gradient(135deg,#f0f7ff,#e0e7ff);}');
    w('.sh-body{padding:12px;} .sh-name{font-weight:700;font-size:14px;margin-bottom:4px;}');
    w('.sh-desc{color:#9ca3af;font-size:12px;margin-bottom:4px;}');
    w('.sh-tag{display:inline-block;padding:2px 8px;background:#ede9fe;color:var(--pri);border-radius:10px;font-size:11px;font-weight:600;}');
    w('.comments{list-style:none;padding:0;}');
    w('.comments li{background:rgba(255,255,255,0.2);padding:12px 14px;border-radius:10px;margin-bottom:8px;box-shadow:0 1px 4px rgba(0,0,0,0.04);display:flex;align-items:flex-start;gap:8px;font-size:14px;}');
    w('.c-time{font-size:11px;color:#9ca3af;margin-left:auto;flex-shrink:0;white-space:nowrap;}');
    w('.footer{text-align:center;padding:20px;color:rgba(255,255,255,0.7);font-size:13px;}');
    // 追忆弹窗
    w('.mo{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);z-index:9000;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.3s;}');
    w('.mo.show{opacity:1;pointer-events:auto;}');
    w('.mo-box{background:rgba(255,255,255,0.95);border-radius:20px;width:min(600px,94vw);max-height:85vh;overflow:hidden;box-shadow:0 25px 80px rgba(0,0,0,0.3);transform:translateY(20px) scale(0.95);transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1);display:flex;flex-direction:column;position:relative;}');
    w('.mo.show .mo-box{transform:translateY(0) scale(1);}');
    w('.mo-hd{padding:20px 24px 16px;border-bottom:1px solid #f3f4f6;} .mo-hd h3{margin:0 0 4px;font-size:18px;} .mo-hd .mo-meta{font-size:13px;color:#9ca3af;}');
    w('.mo-bd{padding:20px 24px;overflow-y:auto;flex:1;}');
    w('.mo-imgs{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-bottom:16px;}');
    w('.mo-imgs img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;cursor:pointer;transition:0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.1);} .mo-imgs img:hover{transform:scale(1.05);}');
    w('.mo-imgs img:first-child{grid-column:span 2;grid-row:span 2;aspect-ratio:auto;}');
    w('.mo-text{font-size:15px;color:#374151;line-height:1.8;white-space:pre-wrap;}');
    w('.mo-close{position:absolute;top:16px;right:16px;background:rgba(0,0,0,0.06);border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;color:#6b7280;z-index:1;} .mo-close:hover{background:rgba(0,0,0,0.12);}');
    w('.mo-lb{position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:10000;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;pointer-events:none;transition:0.3s;} .mo-lb.show{opacity:1;pointer-events:auto;} .mo-lb img{max-width:92vw;max-height:92vh;border-radius:12px;object-fit:contain;}');
    w('.empty{text-align:center;color:#9ca3af;padding:20px;font-size:14px;}');
    w('.badge-readonly{display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;margin-left:8px;vertical-align:middle;}');
    w('@media(max-width:600px){.grid,.sh-grid{grid-template-columns:1fr;}.gallery{column-count:2;}.hero{padding:24px 16px;}.mo-imgs{grid-template-columns:1fr 1fr;}.mo-imgs img:first-child{grid-column:span 2;grid-row:span 1;}}');
    w('</style></head><body>');
    w('<div id="bgLayer"></div>');
    if(bgImageB64) { w('<div id="bgImg"></div>'); }
    w('<div class="container">');
    // Hero
    w('<div class="hero">');
    w(c.avatar ? '<img class="avatar" src="'+c.avatar+'">' : '<div class="avatar-ph">🌟</div>');
    w('<h1>'+safe(c.name||'偶像名字')+'<span class="badge-readonly">展示版</span></h1>');
    w('<p class="bio">'+safe(c.bio||'')+'</p>');
    if(c.social&&c.social.weibo) w('<a class="weibo-btn" href="'+safe(c.social.weibo)+'" target="_blank">👉 微博主页</a>');
    w('</div>');
    // 追忆时光
    var news = d.news||[];
    if(news.length) {
      w('<div class="section"><div class="sec-hd">追忆时光</div><div class="grid">');
      news.forEach(function(n,i){
        // 封面：优先用 _coverB64（已从IndexedDB加载），再用 cover，最后用占位
        var coverSrc = n._coverB64 || n.cover || '';
        w('<div class="card" onclick="openMo('+i+')">');
        w(coverSrc?'<img src="'+coverSrc+'">':'<div style="height:140px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:32px;">无封面</div>');
        w('<div class="card-body"><div class="card-title">'+safe(n.title)+'</div>');
        var imgCount = (n._loadedImages||[]).length + (coverSrc?1:0);
        w('<div class="card-meta">' + n.date + (imgCount>0 ? ' · ' + imgCount + '张' : '') + '</div>');
        w('<div class="card-text">'+safe(n.content)+'</div></div></div>');
      });
      w('</div></div>');
    }
    // 画廊
    var gallery = d.gallery||[];
    if(gallery.length) {
      w('<div class="section"><div class="sec-hd">影像珍藏</div><div class="gallery">');
      gallery.forEach(function(g){
        // 优先用 _b64（已从IndexedDB加载），再用 url
        var imgSrc = g._b64 || g.url || '';
        if (!imgSrc) return; // 跳过空图片
        w('<div class="g-item"><img src="'+imgSrc+'"><div class="g-cap">'+safe(g.caption)+'</div></div>');
      });
      w('</div></div>');
    }
    // 心语
    var com = d.community||[];
    if(com.length) {
      w('<div class="section"><div class="sec-hd">粉丝心语</div><ul class="comments">');
      com.forEach(function(c){
        var entry = typeof c==='object'?c:{text:c,time:''};
        w('<li>'+(entry.time?'<span class="c-time">'+safe(entry.time)+'</span>':'')+'<span>'+(safe(entry.text||c))+'</span></li>');
      });
      w('</ul></div>');
    }
    // 日历
    var cal = (d.calendar||[]).slice().sort(function(a,b){return a.date.localeCompare(b.date);});
    if(cal.length) {
      var tagLabel={concert:'演唱会','fan-meet':'见面会',release:'新专发布',other:'其他'};
      w('<div class="section"><div class="sec-hd">活动日历</div>');
      cal.forEach(function(ev){
        var p=ev.date.split('-'),em=parseInt(p[1]),ed=parseInt(p[2]);
        w('<div class="ev-card"><div class="ev-badge"><div class="mo">'+em+'月</div><div class="dy">'+ed+'</div></div>');
        w('<div class="ev-info"><h4>'+safe(ev.name)+'</h4>');
        if(ev.venue) w('<div class="ev-desc">📍 '+safe(ev.venue)+'</div>');
        if(ev.desc) w('<div class="ev-desc" style="margin-top:4px;">'+safe(ev.desc)+'</div>');
        w('<span class="ev-tag">'+(tagLabel[ev.type]||ev.type)+'</span></div></div>');
      });
      w('</div>');
    }
    // 周边收藏
    var shop = d.shop||[];
    if(shop.length) {
      w('<div class="section"><div class="sec-hd">周边收藏</div><div class="sh-grid">');
      shop.forEach(function(item){
        w('<div class="sh-card"><div class="sh-thumb">'+(item.image?'<img src="'+item.image+'" style="width:100%;height:100%;object-fit:cover;">':'<span style="color:#9ca3af;font-size:14px;">暂无图片</span>')+'</div>');
        w('<div class="sh-body"><div class="sh-name">'+safe(item.name)+'</div>');
        if(item.desc) w('<div class="sh-desc">'+safe(item.desc)+'</div>');
        w('<span class="sh-tag">'+safe(item.cat||'周边')+'</span></div></div>');
      });
      w('</div></div>');
    }
    w('<div class="footer">由 StarFan Studio 生成 | 展示版 · 仅供查看</div>');
    w('</div>');
    // 追忆弹窗
    w('<div class="mo" id="moOv" onclick="if(event.target===this)closeMo()"><div class="mo-box">');
    w('<button class="mo-close" onclick="closeMo()">✕</button>');
    w('<div class="mo-hd"><h3 id="moT"></h3><div class="mo-meta" id="moM"></div></div>');
    w('<div class="mo-bd" id="moB"></div>');
    w('</div></div>');
    w('<div class="mo-lb" id="moLb" onclick="this.classList.remove(String.fromCharCode(115,104,111,119))"><img id="moLbImg"></div>');
    // JS
    w('<scr'+'ipt>');
    w('var _news=' + JSON.stringify(news.map(function(n){
      // 使用已从 IndexedDB 加载的 base64 图片
      var coverSrc = n._coverB64 || n.cover || '';
      var item={title:n.title,date:n.date,content:n.content,cover:coverSrc};
      var imgs=[];
      if(n._loadedImages) imgs=n._loadedImages.slice();
      if(imgs.length) item.images=imgs;
      return item;
    })) + ';');
    w('function openMo(i){var n=_news[i];if(!n)return;');
    w('document.getElementById("moT").textContent=n.title;');
    w('document.getElementById("moM").textContent="📅 "+n.date+(n.images&&n.images.length?" · 📷 "+n.images.length+"张":"");');
    w('var h="";var all=[];if(n.cover)all.push(n.cover);if(n.images)all=all.concat(n.images);');
    w("if(all.length){h+='<div class='+String.fromCharCode(109,111,45,105,109,103,115)+'>';all.forEach(function(s){h+='<img src='+String.fromCharCode(34)+s+String.fromCharCode(34)+' onclick='+String.fromCharCode(34)+'openLb(this.src)'+String.fromCharCode(34)+'>';});h+='</div>';}");
    w(String.fromCharCode(104,43,61,39,60,100,105,118,32,99,108,97,115,115,61,34,109,111,45,116,101,120,116,34,62,39,43,110,46,99,111,110,116,101,110,116,43,39,60,47,100,105,118,62,39,59));
    w('document.getElementById("moB").innerHTML=h;document.getElementById("moOv").classList.add("show");document.body.style.overflow="hidden";}');
    w('function closeMo(){document.getElementById("moOv").classList.remove("show");document.body.style.overflow="";}');
    w('function openLb(s){document.getElementById("moLbImg").src=s;document.getElementById("moLb").classList.add("show");}');
    w('document.addEventListener("keydown",function(e){if(e.key==="Escape")closeMo();});');
    w('</scr'+'ipt>');
    // 注入模板样式
    var tmplCSS = TemplateStore.getTemplateCSS(TemplateStore.selectedTemplate);
    if(tmplCSS) { w('<style>'+tmplCSS+'</style>'); }
    // 注入装饰元素（浮动 emoji）
    var decoJS = TemplateStore.getDecoItemsJS(TemplateStore.selectedTemplate);
    if(decoJS) { w('<scr'+'ipt>'+decoJS+'</scr'+'ipt>'); }
    // 注入特效
    var fxJS = TemplateStore.getEffectJS(TemplateStore.selectedEffects);
    if(fxJS) { w('<scr'+'ipt>'+fxJS+'</scr'+'ipt>'); }
    // 🔑 嵌入原始数据 JSON（供导入恢复使用）
    // ⚠️ 图片 base64 数据不导出（太大，localStorage 装不下），导入后需重新上传
    var exportData = {
      celebrity: {
        name: d.celebrity.name || '',
        colors: d.celebrity.colors || '',
        bio: d.celebrity.bio || '',
        avatar: '',  // 图片不导出
        social: d.celebrity.social || { weibo: '' },
        sitename: d.celebrity.sitename || '',
        bgType: d.celebrity.bgType || 'stars'
      },
      news: (d.news||[]).map(function(n){ return {title:n.title,date:n.date,content:n.content,cover:'',images:(n.images||[]).slice()}; }),
      gallery: (d.gallery||[]).map(function(g){ return {caption:g.caption||'',url:''}; }),
      community: d.community||[],
      calendar: d.calendar||[],
      shop: (d.shop||[]).map(function(s){ return {name:s.name||'',emoji:s.emoji||'🎁',cat:s.cat||'周边',desc:s.desc||''}; })
    };
    w('<scr'+'ipt type="application/json" id="starfan-data">'+JSON.stringify(exportData)+'</scr'+'ipt>');
    w('</body></html>');
    return S.join('');
  },
  doExport() {
    const btn = document.querySelector('.action-bar button.ai');
    const ori = btn.innerText; btn.innerText = '⏳ 打包中...'; btn.disabled = true;
    
    setTimeout(() => {
      try {
        const html = this.generateStandaloneHTML(AppState.data);
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${AppState.data.celebrity.name || 'StarFan'}_粉丝站.html`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        btn.innerText = '✅ 导出成功'; btn.style.background = '#10b981';
      } catch(e) {
        console.error('导出失败', e);
        alert('⚠️ 导出失败，请检查控制台');
        btn.innerText = ori;
      }
      setTimeout(() => { btn.innerText = ori; btn.disabled = false; btn.style.background = ''; }, 1500);
    }, 300);
  },
  generateStandaloneHTML(d) {
    var c = d.celebrity;
    var theme = this.parseTheme(c.colors);
    var safe = function(str) { return str ? str.replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''; };
    var _scrClose = '<' + '/script>';
    var dataJson = JSON.stringify(d).replace(new RegExp(_scrClose, 'gi'), '<\\/script>');
    var S = [];
    function w(t) { S.push(t); }
    w('<!DOCTYPE html>');
    w('<html lang="zh-CN">');
    w('<head>');
    w('<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">');
    w('<title>' + (safe(c.name) || '粉丝站') + ' 的专属粉丝站</title>');
    w('<style>');
    w(':root{');
    w('  --bg1:' + theme.c1 + ';--bg2:' + theme.c2 + ';');
    w('  --pri:#6366f1;--pri-h:#4f46e5;--pri-l:#e0e7ff;');
    w('  --text:#1f2937;--sub:#6b7280;--card:#fff;');
    w('  --r:12px;--sh:0 4px 16px rgba(0,0,0,0.08);--sh2:0 8px 24px rgba(0,0,0,0.14);');
    w('  --danger:#ef4444;--success:#10b981;');
    w('}');
    w('*{box-sizing:border-box}');
    w('body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:linear-gradient(135deg,var(--bg1),var(--bg2));min-height:100vh;color:var(--text);line-height:1.6}');
    w('.container{max-width:1000px;margin:0 auto;padding:20px 16px 80px}');
    w('/* Hero */');
    w('.hero{text-align:center;padding:40px 20px;background:rgba(255,255,255,0.75);backdrop-filter:blur(12px);border-radius:var(--r);box-shadow:var(--sh);margin-bottom:24px;position:relative}');
    w('.avatar-wrap{position:relative;display:inline-block;margin-bottom:4px}');
    w('.avatar{width:120px;height:120px;border-radius:50%;object-fit:cover;border:4px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:block}');
    w('.avatar-placeholder{width:120px;height:120px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:40px;margin:0 auto}');
    w('.avatar-upload-btn{position:absolute;bottom:4px;right:4px;background:var(--pri);color:#fff;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:14px;display:none;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.2)}');
    w("body.edit-on .avatar-upload-btn{display:flex}");
    w('h1.site-name{margin:12px 0 8px;font-size:28px}');
    w('.bio-text{color:var(--sub);max-width:600px;margin:0 auto 16px;white-space:pre-wrap;min-height:24px}');
    w('.weibo-btn{display:inline-block;padding:10px 20px;background:#ff8200;color:#fff;text-decoration:none;border-radius:20px;font-weight:500;transition:0.2s}');
    w('[contenteditable="true"]{outline:none;border-radius:6px;transition:0.15s}');
    w("body.edit-on [contenteditable='true']:hover{background:rgba(99,102,241,0.06);cursor:text}");
    w("body.edit-on [contenteditable='true']:focus{background:rgba(99,102,241,0.1);box-shadow:0 0 0 2px var(--pri-l)}");
    w('/* Sections */');
    w('.section{background:rgba(255,255,255,0.82);backdrop-filter:blur(10px);border-radius:var(--r);padding:20px;margin-bottom:24px;box-shadow:var(--sh)}');
    w('.sec-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;border-bottom:2px solid rgba(0,0,0,0.05);padding-bottom:10px}');
    w('.sec-hd h2{margin:0;font-size:20px}');
    w('.add-btn{background:var(--pri);color:#fff;border:none;border-radius:20px;padding:7px 14px;font-size:13px;cursor:pointer;display:none;gap:4px;align-items:center;font-weight:600;transition:0.2s}');
    w('.add-btn:hover{background:var(--pri-h);transform:translateY(-1px)}');
    w("body.edit-on .add-btn{display:inline-flex}");
    w('/* News */');
    w('.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}');
    w('.card{background:var(--card);border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);transition:0.2s;position:relative}');
    w('.card:hover{transform:translateY(-3px)}');
    w('.card img{width:100%;height:140px;object-fit:cover;background:#f3f4f6}');
    w('.card-body{padding:12px}');
    w('.card-title{font-weight:700;margin:0 0 6px;font-size:15px}');
    w('.card-meta{font-size:12px;color:var(--sub);margin-bottom:8px}');
    w('.card-text{font-size:13px;color:#4b5563;line-height:1.5;white-space:pre-wrap;min-height:18px}');
    w('/* Gallery */');
    w('.gallery{column-count:3;column-gap:12px}');
    w('.g-item{position:relative;break-inside:avoid;margin-bottom:12px;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);background:#f3f4f6}');
    w('.g-item img{width:100%;display:block;transition:0.3s}.g-item:hover img{transform:scale(1.05)}');
    w('.g-cap{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.7));color:#fff;font-size:12px;padding:20px 8px 8px;transform:translateY(100%);transition:0.3s}.g-item:hover .g-cap{transform:translateY(0)}');
    w('/* Comments */');
    w('.comments{list-style:none;padding:0;margin:0}');
    w('.comments li{background:#fff;padding:12px 14px;border-radius:8px;margin-bottom:8px;box-shadow:0 1px 4px rgba(0,0,0,0.04);position:relative;display:flex;align-items:center;gap:8px}');
    w('.comments li .c-text{flex:1}');
    w('/* Calendar */');
    w('.event-card{background:#fff;border-radius:10px;padding:14px;margin-bottom:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);display:flex;gap:14px;position:relative;transition:0.2s}');
    w('.event-card:hover{transform:translateX(4px)}');
    w('.ev-badge{min-width:52px;text-align:center;background:var(--pri);color:#fff;border-radius:10px;padding:8px 4px}');
    w('.ev-badge .mo{font-size:11px;opacity:0.85}.ev-badge .dy{font-size:22px;font-weight:800;line-height:1}');
    w('.ev-info{flex:1}');
    w('.ev-info h4{margin:0 0 4px;font-size:15px}');
    w('.ev-desc{font-size:13px;color:var(--sub)}');
    w('.ev-tag{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;background:#e0e7ff;color:var(--pri);margin-top:6px}');
    w('/* Shop */');
    w('.shop-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}');
    w('.sh-card{background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);transition:0.2s;position:relative}');
    w('.sh-card:hover{transform:translateY(-3px)}');
    w('.sh-thumb{height:140px;display:flex;align-items:center;justify-content:center;font-size:52px;background:linear-gradient(135deg,#f0f7ff,#e0e7ff)}');
    w('.sh-body{padding:12px}');
    w('.sh-name{font-weight:700;font-size:14px;margin-bottom:6px}');
    w('.sh-price{color:#ef4444;font-weight:800;font-size:18px}');
    w('.sh-orig{color:var(--sub);font-size:12px;text-decoration:line-through;margin-left:4px}');
    w('/* Delete btn */');
    w('.del-btn{background:rgba(239,68,68,0.9);color:#fff;border:none;border-radius:50%;width:24px;height:24px;font-size:12px;cursor:pointer;display:none;align-items:center;justify-content:center;flex-shrink:0;transition:0.15s;padding:0}');
    w('.del-btn:hover{background:#dc2626;transform:scale(1.1)}');
    w("body.edit-on .del-btn{display:flex}");
    w('.card-del{position:absolute;top:8px;right:8px}');
    w('.sh-del{position:absolute;top:8px;right:8px}');
    w('.g-del{position:absolute;top:6px;right:6px;z-index:5}');
    w('.ev-del{position:absolute;top:10px;right:10px}');
    w('/* Modal */');
    w('.sf-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9000;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:0.25s}');
    w('.sf-modal-bg.open{opacity:1;pointer-events:auto}');
    w('.sf-modal{background:#fff;border-radius:16px;padding:24px;width:min(480px,92vw);max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2);transform:scale(0.9);transition:0.25s}');
    w('.sf-modal-bg.open .sf-modal{transform:scale(1)}');
    w('.sf-modal h3{margin:0 0 16px;font-size:17px}');
    w('.sf-field{margin-bottom:12px}');
    w('.sf-field label{display:block;font-size:13px;font-weight:600;color:var(--sub);margin-bottom:4px}');
    w('.sf-field input,.sf-field textarea,.sf-field select{width:100%;padding:9px 12px;border-radius:8px;border:1px solid #e5e7eb;font-size:14px;transition:0.2s;font-family:inherit}');
    w('.sf-field input:focus,.sf-field textarea:focus,.sf-field select:focus{outline:none;border-color:var(--pri);box-shadow:0 0 0 3px var(--pri-l)}');
    w('.sf-modal-btns{display:flex;gap:8px;margin-top:16px}');
    w('.sf-modal-btns button{flex:1;padding:11px;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:0.2s}');
    w('.sf-btn-ok{background:var(--pri);color:#fff}');
    w('.sf-btn-ok:hover{background:var(--pri-h)}');
    w('.sf-btn-cancel{background:#f3f4f6;color:#374151}');
    w('.sf-btn-cancel:hover{background:#e5e7eb}');
    w('/* FAB */');
    w('.edit-fab{position:fixed;bottom:24px;right:24px;z-index:8000;width:54px;height:54px;border-radius:50%;background:var(--pri);color:#fff;border:none;font-size:22px;cursor:pointer;box-shadow:0 4px 16px rgba(99,102,241,0.45);display:flex;align-items:center;justify-content:center;transition:0.3s}');
    w('.edit-fab:hover{transform:scale(1.12) rotate(15deg);background:var(--pri-h)}');
    w('body.edit-on .edit-fab{background:#374151;transform:rotate(45deg)}');
    w('body.edit-on .edit-fab:hover{transform:rotate(45deg) scale(1.1)}');
    w('/* Banner */');
    w('.edit-banner{position:fixed;top:0;left:0;right:0;z-index:7999;background:linear-gradient(90deg,var(--pri),#8b5cf6);color:#fff;text-align:center;padding:8px 16px;font-size:13px;font-weight:600;transform:translateY(-100%);transition:0.3s;box-shadow:0 2px 8px rgba(99,102,241,0.35)}');
    w('body.edit-on .edit-banner{transform:translateY(0)}');
    w("body.edit-on .container{padding-top:48px}");
    w('/* Comment form */');
    w('.comment-form{display:none;gap:8px;margin-bottom:12px}');
    w("body.edit-on .comment-form{display:flex}");
    w('.comment-form input{flex:1;padding:9px 12px;border-radius:8px;border:1px solid #e5e7eb;font-size:14px;font-family:inherit}');
    w('.comment-form input:focus{outline:none;border-color:var(--pri);box-shadow:0 0 0 3px var(--pri-l)}');
    w('.comment-form button{padding:9px 16px;background:var(--pri);color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}');
    w('.comment-form button:hover{background:var(--pri-h)}');
    w('.footer{text-align:center;padding:20px;color:rgba(255,255,255,0.8);font-size:13px}');
    w('@media(max-width:600px){.grid,.gallery,.shop-grid{grid-template-columns:1fr}.hero{padding:24px 16px}}');
    w('</style>');
    w('</head>');
    w('<body>');
    w('<div class="edit-banner">编辑模式已开启 — 点击文字即可修改，点击 × 关闭编辑</div>');
    w('<div class="container">');
    w('  <div class="hero" id="siteHero">');
    w('    <div class="avatar-wrap">');
    w('      <div id="avatarContainer"></div>');
    w('      <button class="avatar-upload-btn" title="更换头像" onclick="document.getElementById(\'avatarFileInput\').click()">+</button>');
    w('      <input type="file" id="avatarFileInput" accept="image/*" style="display:none" onchange="SF.uploadAvatar(this)">');
    w('    </div>');
    w('    <h1 class="site-name" id="siteName" contenteditable="false">' + (safe(c.name) || '偶像名字') + '</h1>');
    w('    <p class="bio-text" id="siteBio" contenteditable="false">' + (safe(c.bio) || '这里是简介，点击编辑按钮后可以直接修改') + '</p>');
    w('    <div id="weiboWrap"></div>');
    w('  </div>');
    w('  <div class="section" id="sec-news"><div class="sec-hd"><h2>新闻动态</h2><button class="add-btn" onclick="SF.openModal(\'news\')">添加新闻</button></div><div class="grid" id="newsGrid"></div></div>');
    w('  <div class="section" id="sec-gallery"><div class="sec-hd"><h2>影像画廊</h2><button class="add-btn" onclick="document.getElementById(\'galleryFileInput\').click()">上传照片</button><input type="file" id="galleryFileInput" accept="image/*" multiple style="display:none" onchange="SF.uploadGallery(this)"></div><div class="gallery" id="galleryGrid"></div></div>');
    w('  <div class="section" id="sec-calendar"><div class="sec-hd"><h2>活动日历</h2><button class="add-btn" onclick="SF.openModal(\'calendar\')">添加活动</button></div><div id="calendarList"></div></div>');
    w('  <div class="section" id="sec-shop"><div class="sec-hd"><h2>周边商城</h2><button class="add-btn" onclick="SF.openModal(\'shop\')">添加商品</button></div><div class="shop-grid" id="shopGrid"></div></div>');
    w('  <div class="section" id="sec-community"><div class="sec-hd"><h2>粉丝留言</h2></div><div class="comment-form"><input id="newCommentInput" placeholder="写下你的留言..."><button onclick="SF.addComment()">发布</button></div><ul class="comments" id="commentList"></ul></div>');
    w('  <div class="footer">由 StarFan Studio 生成 | 仅供粉丝交流使用</div>');
    w('</div>');
    w('<button class="edit-fab" id="editFab" onclick="SF.toggleEdit()" title="开启/关闭编辑模式">+</button>');
    w('<div class="sf-modal-bg" id="sfModalBg" onclick="if(event.target===this)SF.closeModal()"><div class="sf-modal"><div id="sfModalContent"></div></div></div>');
    w('<script>');
    w('const INIT_DATA = ' + dataJson + ';');
    // Now output the SF JavaScript - use only string concatenation, no backticks
    w('var SF = {');
    w('  data: null, editMode: false,');
    w("  STORE_KEY: 'sf_standalone_' + (INIT_DATA.celebrity.name || 'site'),");
    w('  init() {');
    w('    var saved = localStorage.getItem(this.STORE_KEY);');
    w('    if (saved) { try { this.data = JSON.parse(saved); } catch(e) { this.data = JSON.parse(JSON.stringify(INIT_DATA)); } } else { this.data = JSON.parse(JSON.stringify(INIT_DATA)); }');
    w('    this.renderAll(); this.bindInlineEditors();');
    w('  },');
    w('  save() { try { localStorage.setItem(this.STORE_KEY, JSON.stringify(this.data)); } catch(e) {} },');
    w('  renderAll() { this.renderHero(); this.renderNews(); this.renderGallery(); this.renderCalendar(); this.renderShop(); this.renderComments(); this.toggleSections(); },');
    w('  toggleSections() {');
    w("    [['sec-news',this.data.news&&this.data.news.length>0],['sec-gallery',this.data.gallery&&this.data.gallery.length>0],['sec-calendar',this.data.calendar&&this.data.calendar.length>0],['sec-shop',this.data.shop&&this.data.shop.length>0],['sec-community',true]].forEach(function(pair){");
    w("      var el=document.getElementById(pair[0]); if(el) el.style.display=(pair[1]||SF.editMode)?'':'none';");
    w('    });');
    w('  },');
    w('  renderHero() {');
    w('    var c=this.data.celebrity||{};');
    w('    var ac=document.getElementById("avatarContainer");');
    w('    if(ac){ if(c.avatar){ ac.innerHTML=\'<img src="\'+c.avatar+\'" class="avatar">\'; }else{ ac.innerHTML=\'<div class="avatar-placeholder">?</div>\'; } }');
    w('    var nameEl=document.getElementById("siteName"), bioEl=document.getElementById("siteBio");');
    w('    if(nameEl) nameEl.innerText=c.name||"偶像名字";');
    w('    if(bioEl) bioEl.innerText=c.bio||"这里是简介，点击编辑按钮后可以直接修改";');
    w('    var wb=document.getElementById("weiboWrap");');
    w('    if(wb){ wb.innerHTML=c.social&&c.social.weibo?\'<a href="\'+c.social.weibo+\'" target="_blank" class="weibo-btn">👉 微博主页</a>\':\'\'; }');
    w('  },');
    w('  renderNews() {');
    w('    var box=document.getElementById("newsGrid"); if(!box) return;');
    w('    var news=this.data.news||[];');
    w('    if(!news.length){ box.innerHTML=\'<div style="color:#9ca3af;padding:20px;grid-column:1/-1">暂无新闻\'+(this.editMode?"，点击上方「添加新闻」":"")+\'</div>\'; return; }');
    w('    var h="";');
    w('    news.forEach(function(n,i){');
    w("      h+='<div class=\"card\">';");
    w("      h+=n.cover?'<img src=\"'+n.cover+'\" alt=\"\">':'<div style=\"height:140px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:13px\">无封面</div>';");
    w("      h+='<button class=\"del-btn card-del\" onclick=\"SF.deleteItem(\\'news\\','+i+')\" title=\"删除\">✕</button>';");
    w("      h+='<div class=\"card-body\"><div class=\"card-title\" contenteditable=\"false\" data-model=\"news['+i+'].title\">'+SF.safe(n.title)+'</div>';");
    w("      h+='<div class=\"card-meta\">'+n.date+'</div>';");
    w("      h+='<div class=\"card-text\" contenteditable=\"false\" data-model=\"news['+i+'].content\">'+SF.safe(n.content)+'</div></div></div>';");
    w('    });');
    w('    box.innerHTML=h; this.applyEditMode();');
    w('  },');
    w('  renderGallery() {');
    w('    var box=document.getElementById("galleryGrid"); if(!box) return;');
    w('    var gallery=this.data.gallery||[];');
    w('    if(!gallery.length){ box.innerHTML=\'<div style="color:#9ca3af;padding:20px;grid-column:1/-1">暂无照片\'+(this.editMode?"，点击上方「上传照片」":"")+\'</div>\'; return; }');
    w('    var h="";');
    w('    gallery.forEach(function(g,i){');
    w("      h+='<div class=\"g-item\"><img src=\"'+(g.url||'')+'\" alt=\"\">';");
    w("      h+='<button class=\"del-btn g-del\" onclick=\"SF.deleteItem(\\'gallery\\','+i+')\" title=\"删除\">✕</button>';");
    w("      h+='<div class=\"g-cap\" contenteditable=\"false\" data-model=\"gallery['+i+'].caption\">'+(SF.safe(g.caption)||'图注')+'</div></div>';");
    w('    });');
    w('    box.innerHTML=h; this.applyEditMode();');
    w('  },');
    w('  renderCalendar() {');
    w('    var box=document.getElementById("calendarList"); if(!box) return;');
    w('    var cal=(this.data.calendar||[]).slice().sort(function(a,b){return a.date.localeCompare(b.date);});');
    w('    var tagLabel={concert:"演唱会","fan-meet":"见面会",release:"新专发布",other:"其他"};');
    w('    if(!cal.length){ box.innerHTML=\'<div style="color:#9ca3af;padding:20px;">暂无活动\'+(this.editMode?"，点击上方「添加活动」":"")+\'</div>\'; return; }');
    w('    var h="";');
    w('    cal.forEach(function(ev,i){');
    w('      var p=ev.date.split("-"), em=parseInt(p[1]), ed=parseInt(p[2]);');
    w("      h+='<div class=\"event-card\">';");
    w("      h+='<button class=\"del-btn ev-del\" onclick=\"SF.deleteItem(\\'calendar\\','+i+')\" title=\"删除\">✕</button>';");
    w("      h+='<div class=\"ev-badge\"><div class=\"mo\">'+em+'月</div><div class=\"dy\">'+ed+'</div></div>'; ");
    w("      h+='<div class=\"ev-info\"><h4>'+SF.safe(ev.name)+'</h4>'; ");
    w("      if(ev.venue) h+='<div class=\"ev-desc\">'+SF.safe(ev.venue)+'</div>'; ");
    w("      if(ev.desc) h+='<div class=\"ev-desc\" style=\"margin-top:4px;\">'+SF.safe(ev.desc)+'</div>'; ");
    w("      h+='<span class=\"ev-tag\">'+(tagLabel[ev.type]||ev.type)+'</span></div></div>'; ");
    w('    });');
    w('    box.innerHTML=h; this.applyEditMode();');
    w('  },');
    w('  renderShop() {');
    w('    var box=document.getElementById("shopGrid"); if(!box) return;');
    w('    var shop=this.data.shop||[];');
    w('    if(!shop.length){ box.innerHTML=\'<div style="color:#9ca3af;padding:20px;grid-column:1/-1">暂无商品\'+(this.editMode?"，点击上方「添加商品」":"")+\'</div>\'; return; }');
    w('    var h="";');
    w('    shop.forEach(function(item,i){');
    w("      h+='<div class=\"sh-card\"><button class=\"del-btn sh-del\" onclick=\"SF.deleteItem(\\'shop\\','+i+')\" title=\"删除\">✕</button>'; ");
    w("      h+='<div class=\"sh-thumb\">'+(item.emoji||'🎁')+'</div><div class=\"sh-body\"><div class=\"sh-name\">'+SF.safe(item.name)+'</div>'; ");
    w("      if(item.desc) h+='<div style=\"font-size:12px;color:#9ca3af;margin-bottom:6px;\">'+SF.safe(item.desc)+'</div>'; ");
    w("      h+='<div><span class=\"sh-price\">¥'+item.price.toFixed(2)+'</span>'; ");
    w("      if(item.orig) h+='<span class=\"sh-orig\">¥'+item.orig.toFixed(2)+'</span>'; ");
    w("      h+='</div></div></div>'; ");
    w('    });');
    w('    box.innerHTML=h; this.applyEditMode();');
    w('  },');
    w('  renderComments() {');
    w('    var box=document.getElementById("commentList"); if(!box) return;');
    w('    var com=this.data.community||[];');
    w('    if(!com.length){ box.innerHTML=\'<li style="color:#9ca3af;list-style:none;">暂无留言，快来抢沙发！</li>\'; return; }');
    w('    var h="";');
    w('    com.forEach(function(c,i){');
    w("      h+='<li><span class=\"c-text\">'+SF.safe(c)+'</span>'; ");
    w("      h+='<button class=\"del-btn\" onclick=\"SF.deleteItem(\\'community\\','+i+')\" title=\"删除\">✕</button></li>'; ");
    w('    });');
    w('    box.innerHTML=h; this.applyEditMode();');
    w('  },');
    w('  toggleEdit() {');
    w('    this.editMode=!this.editMode;');
    w('    document.body.classList.toggle("edit-on",this.editMode);');
    w("    document.getElementById('editFab').textContent=this.editMode?'X':'+';");
    w('    this.applyEditMode(); this.toggleSections();');
    w('  },');
    w('  applyEditMode() {');
    w("    document.querySelectorAll('[contenteditable]').forEach(function(el){ el.contentEditable=SF.editMode?'true':'false'; });");
    w('  },');
    w('  bindInlineEditors() {');
    w("    document.addEventListener('input',function(e){");
    w("      var el=e.target.closest('[data-model]'); if(!el||!SF.editMode) return;");
    w("      var path=el.dataset.model, val=el.innerText;");
    w("      try { var m=path.match(/^(\\w+)\\[(\\d+)\\]\\.(\\w+)$/); if(m){ var arr=m[1],idx=parseInt(m[2]),key=m[3]; if(SF.data[arr]&&SF.data[arr][idx]){ SF.data[arr][idx][key]=val; SF.save(); } } } catch(ex){}");
    w('    });');
    w("    var nameEl=document.getElementById('siteName'), bioEl=document.getElementById('siteBio');");
    w("    if(nameEl) nameEl.addEventListener('input',function(e){ SF.data.celebrity.name=e.target.innerText; SF.save(); });");
    w("    if(bioEl) bioEl.addEventListener('input',function(e){ SF.data.celebrity.bio=e.target.innerText; SF.save(); });");
    w("    document.addEventListener('keydown',function(e){ if(e.key==='Enter'&&e.target.matches('[contenteditable=\"true\"]')&&!e.shiftKey){ e.preventDefault(); document.execCommand('insertLineBreak'); } });");
    w('  },');
    w("  deleteItem(type,idx) { if(!confirm('确定删除这条内容？')) return; if(Array.isArray(this.data[type])){ this.data[type].splice(idx,1); this.save(); this.renderAll(); } },");
    w("  deleteCalEvent(idx) { this.deleteItem('calendar',idx); },");
    w("  addComment() { var inp=document.getElementById('newCommentInput'); var txt=inp?inp.value.trim():''; if(!txt) return; if(!this.data.community) this.data.community=[]; this.data.community.push(txt); this.save(); inp.value=''; this.renderComments(); this.toggleSections(); },");
    w("  uploadAvatar(input) { var f=input.files[0]; if(!f) return; if(f.size>50*1024*1024){alert('图片请≤50MB');return;} var reader=new FileReader(); reader.onload=function(e){ SF.data.celebrity.avatar=e.target.result; SF.save(); SF.renderHero(); }; reader.readAsDataURL(f); input.value=''; },");
    w("  uploadGallery(input) { var files=Array.from(input.files); if(!files.length) return; if(!SF.data.gallery) SF.data.gallery=[]; var count=0; files.forEach(function(f){ if(f.size>50*1024*1024){alert(f.name+' 超过50MB，已跳过');return;} var reader=new FileReader(); reader.onload=function(e){ SF.data.gallery.push({id:'g'+Date.now()+Math.random().toString(36).substr(2,4),url:e.target.result,caption:''}); count++; if(count===files.length){SF.save();SF.renderAll();} }; reader.readAsDataURL(f); }); input.value=''; },");
    w('  currentModalType: null,');
    w("  openModal(type) {");
    w("    this.currentModalType=type;");
    w("    var box=document.getElementById('sfModalContent'), bg=document.getElementById('sfModalBg');");
    w("    var h='';");
    w("    if(type==='news'){");
    w("      h+='<h3>添加新闻</h3>'; h+='<div class=\"sf-field\"><label>标题</label><input id=\"m_news_title\" placeholder=\"新闻标题\"></div>'; h+='<div class=\"sf-field\"><label>日期</label><input type=\"date\" id=\"m_news_date\"></div>'; h+='<div class=\"sf-field\"><label>正文</label><textarea id=\"m_news_content\" rows=\"4\" placeholder=\"新闻内容...\"></textarea></div>'; h+='<div class=\"sf-field\"><label>封面图</label><input type=\"file\" id=\"m_news_cover\" accept=\"image/*\"></div>'; h+='<div class=\"sf-modal-btns\"><button class=\"sf-btn-cancel\" onclick=\"SF.closeModal()\">取消</button><button class=\"sf-btn-ok\" onclick=\"SF.submitNews()\">添加</button></div>';");
    w("    } else if(type==='calendar'){");
    w("      h+='<h3>添加活动</h3>'; h+='<div class=\"sf-field\"><label>活动名称</label><input id=\"m_cal_name\" placeholder=\"演唱会、见面会...\"></div>'; h+='<div class=\"sf-field\"><label>活动日期</label><input type=\"date\" id=\"m_cal_date\"></div>'; h+='<div class=\"sf-field\"><label>活动地点</label><input id=\"m_cal_venue\" placeholder=\"城市/场馆名称\"></div>'; h+='<div class=\"sf-field\"><label>活动说明</label><textarea id=\"m_cal_desc\" rows=\"3\" placeholder=\"活动详情...\"></textarea></div>'; h+='<div class=\"sf-field\"><label>活动类型</label><select id=\"m_cal_type\"><option value=\"concert\">演唱会</option><option value=\"fan-meet\">粉丝见面会</option><option value=\"release\">新专发布</option><option value=\"other\">其他活动</option></select></div>'; h+='<div class=\"sf-modal-btns\"><button class=\"sf-btn-cancel\" onclick=\"SF.closeModal()\">取消</button><button class=\"sf-btn-ok\" onclick=\"SF.submitCalendar()\">添加</button></div>';");
    w("    } else if(type==='shop'){");
    w("      h+='<h3>添加商品</h3>'; h+='<div class=\"sf-field\"><label>商品名称</label><input id=\"m_sh_name\" placeholder=\"官方周边应援棒\"></div>'; h+='<div class=\"sf-field\"><label>售价（元）</label><input type=\"number\" id=\"m_sh_price\" placeholder=\"98\" min=\"0\" step=\"0.01\"></div>'; h+='<div class=\"sf-field\"><label>原价（可留空）</label><input type=\"number\" id=\"m_sh_orig\" placeholder=\"128\" min=\"0\" step=\"0.01\"></div>'; h+='<div class=\"sf-field\"><label>图标 emoji</label><input id=\"m_sh_emoji\" placeholder=\"🎤\" maxlength=\"4\"></div>'; h+='<div class=\"sf-field\"><label>类别</label><select id=\"m_sh_cat\"><option value=\"周边\">周边</option><option value=\"专辑\">专辑</option><option value=\"服饰\">服饰</option><option value=\"配饰\">配饰</option><option value=\"其他\">其他</option></select></div>'; h+='<div class=\"sf-field\"><label>商品描述</label><textarea id=\"m_sh_desc\" rows=\"2\" placeholder=\"商品说明...\"></textarea></div>'; h+='<div class=\"sf-modal-btns\"><button class=\"sf-btn-cancel\" onclick=\"SF.closeModal()\">取消</button><button class=\"sf-btn-ok\" onclick=\"SF.submitShop()\">添加</button></div>';");
    w("    }");
    w("    box.innerHTML=h; bg.classList.add('open');");
    w('  },');
    w("  closeModal() { document.getElementById('sfModalBg').classList.remove('open'); },");
    w("  submitNews() {");
    w("    var title=document.getElementById('m_news_title'); var date=document.getElementById('m_news_date'); var content=document.getElementById('m_news_content'); var coverFile=document.getElementById('m_news_cover');");
    w("    var t=title?title.value.trim():''; if(!t){alert('请填写标题');return;}");
    w("    var item={id:'n'+Date.now(),title:t,date:date?date.value:new Date().toISOString().split('T')[0],content:content?content.value.trim():'',cover:''};");
    w("    function doAdd(cover){ item.cover=cover||''; if(!SF.data.news) SF.data.news=[]; SF.data.news.unshift(item); SF.save(); SF.closeModal(); SF.renderAll(); }");
    w("    if(coverFile&&coverFile.files[0]){ var r=new FileReader(); r.onload=function(e){doAdd(e.target.result);}; r.readAsDataURL(coverFile.files[0]); } else { doAdd(''); }");
    w('  },');
    w("  submitCalendar() {");
    w("    var name=document.getElementById('m_cal_name'), date=document.getElementById('m_cal_date'), venue=document.getElementById('m_cal_venue'), desc=document.getElementById('m_cal_desc'), type=document.getElementById('m_cal_type');");
    w("    var n=name?name.value.trim():''; var d=date?date.value:''; if(!n){alert('请填写活动名称');return;} if(!d){alert('请选择活动日期');return;}");
    w("    if(!SF.data.calendar) SF.data.calendar=[]; SF.data.calendar.push({id:'ev'+Date.now(),name:n,date:d,venue:venue?venue.value.trim():'',desc:desc?desc.value.trim():'',type:type?type.value:'other'}); SF.save(); SF.closeModal(); SF.renderAll();");
    w('  },');
    w("  submitShop() {");
    w("    var name=document.getElementById('m_sh_name'), price=document.getElementById('m_sh_price'), orig=document.getElementById('m_sh_orig'), emoji=document.getElementById('m_sh_emoji'), cat=document.getElementById('m_sh_cat'), desc=document.getElementById('m_sh_desc');");
    w("    var n=name?name.value.trim():''; var p=price?parseFloat(price.value):NaN; if(!n){alert('请填写商品名称');return;} if(isNaN(p)||p<0){alert('请填写正确的价格');return;}");
    w("    var o=orig?parseFloat(orig.value)||0:0; var e=emoji?emoji.value.trim():'🎁'; var c=cat?cat.value:'周边'; var d=desc?desc.value.trim():'';");
    w("    if(!SF.data.shop) SF.data.shop=[]; SF.data.shop.push({id:'sp'+Date.now(),name:n,price:p,orig:o,emoji:e,cat:c,desc:d}); SF.save(); SF.closeModal(); SF.renderAll();");
    w('  },');
    w('  safe(str) { if(!str) return ""; var lt = String.fromCharCode(60); var gt = String.fromCharCode(62); return str.replace(/&/g,"&amp;").replace(new RegExp(lt,"g"),"&lt;").replace(new RegExp(gt,"g"),"&gt;"); }');
    w('};');
    w('SF.init();');
    // 注入模板样式覆盖
    var tmplCSS = TemplateStore.getTemplateCSS(TemplateStore.selectedTemplate);
    if (tmplCSS) {
      w('var _sfTmplSt=document.createElement("style");_sfTmplSt.textContent=' + JSON.stringify(tmplCSS) + ';document.head.appendChild(_sfTmplSt);');
    }
    // 注入装饰元素（浮动 emoji）
    var decoJS = TemplateStore.getDecoItemsJS(TemplateStore.selectedTemplate);
    if (decoJS) {
      w('var _sfTmplDeco=document.createElement("script");_sfTmplDeco.textContent=' + JSON.stringify(decoJS) + ';document.body.appendChild(_sfTmplDeco);');
    }
    // 注入特效动画
    var fxJS = TemplateStore.getEffectJS(TemplateStore.selectedEffects);
    if (fxJS) { w(fxJS); }
    w('<' + '/scr' + 'ipt>');
    w('</body>');
    w('</html>');
    return S.join('');
  },
  parseTheme(text) {
    const map = {"蓝":"#4a90e2","淡蓝":"#a8d8ff","粉":"#ff9ecb","淡粉":"#ffd1dc","紫":"#b388ff","黄":"#ffd700","金":"#ffd700","白":"#ffffff","黑":"#222222","红":"#ff4757","绿":"#2ed573","橙":"#ffa502"};
    let c1="#a8d8ff", c2="#ffd700";
    if(text) {
      const p = text.split('+').map(s=>s.trim());
      for(let k in map) if(p[0]?.includes(k)) c1=map[k];
      for(let k in map) if(p[1]?.includes(k)) c2=map[k];
    }
    return {c1, c2};
  }
};
