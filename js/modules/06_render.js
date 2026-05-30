// ===== Render Module =====
// Part of StarFan Studio v2.3

// ================= 3. 渲染引擎 (Render) =================
const Render = {
  editor(tab) {
    const box = document.getElementById('editorContent');
    let html = '';
    const d = AppState.data;
    switch(tab) {
      case 'celebrity':
        html = `
          <div class="form-group"><label>站点名称</label><input id="inp_sitename" value="${d.celebrity.siteName||''}" placeholder="给你的粉丝站起个名字，如：星光守护站"></div>
          <div class="form-group"><label>偶像名字</label><input id="inp_name" value="${d.celebrity.name||''}"></div>
          <div class="form-group"><label>主色调</label><input id="inp_colors" value="${d.celebrity.colors||''}" placeholder="如：淡蓝+金色"></div>
          <div class="form-group"><label>动态背景</label>
            <select id="bg_selector" onchange="Events.changeBackground(this.value)" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd;">
              <option value="stars" ${d.celebrity.bgType==='stars'?'selected':''}>闪烁星空</option>
              <option value="moon" ${d.celebrity.bgType==='moon'?'selected':''}>梦幻月影</option>
              <option value="particles" ${d.celebrity.bgType==='particles'?'selected':''}>浮动粒子</option>
              <option value="custom" disabled>自定义背景 <span class="vip-tag">需VIP</span></option>
            </select>
          </div>
          <div class="form-group"><label>个人简介</label><textarea id="inp_bio" rows="3">${d.celebrity.bio||''}</textarea></div>
          <button class="ai" onclick="Events.triggerAI('bio')">AI 生成简介</button>
          <div class="ai-slot" id="aiSlot_celebrity"></div>
          <div class="form-group"><label>头像上传</label><input type="file" id="inp_avatar" accept="image/*"></div>
          <div class="form-group"><label>微博链接</label><input id="inp_weibo" value="${d.celebrity.social?.weibo||''}"></div>
          <button onclick="Events.applyPreview()">更新预览</button>`; break;
      case 'news':
        html = `
          <div class="form-group"><label>追忆标题</label><input id="news_title" placeholder="如：第一次看演唱会"></div>
          <div class="form-group"><label>追忆日期</label><input type="date" id="news_date"></div>
          <div class="form-group"><label>正文内容</label><textarea id="news_content" rows="4" placeholder="记录当时的心情和细节..."></textarea></div>
          <button class="ai" onclick="Events.triggerAI('news')">AI 帮写</button>
          <div class="ai-slot" id="aiSlot_news"></div>
          <div class="form-group"><label>封面图</label><input type="file" id="news_cover" accept="image/*"></div>
          <div class="form-group"><label>更多照片（最多9张，每张≤50MB）</label><input type="file" id="news_images" accept="image/*" multiple></div>
          <div style="display:flex; gap:8px;">
            <button id="news_submit_btn" onclick="Events.saveNews()">添加追忆</button>
            <button id="news_cancel_btn" class="danger" style="display:none; flex:0.4;" onclick="Events.cancelEditNews()">取消</button>
          </div>
          <div class="item-list" id="newsEditorList"></div>`; break;
      case 'gallery':
        html = `
          <div class="form-group"><label>批量上传照片</label><input type="file" id="gallery_files" accept="image/*" multiple onchange="Events.uploadGallery()"></div>
          <p style="font-size:12px;color:#888;margin:0 0 10px;">支持多选，单张≤50MB。上传后可在下方点击 🤖 为单张照片 AI 生成图注。</p>
          <button onclick="Events.uploadGallery()" style="width:100%;margin-bottom:10px;">📤 上传照片</button>
          <div class="item-list" id="galleryEditorList"></div>`; break;
      case 'community':
        html = `
          <div class="form-group"><label>写下此刻的心情</label><input id="inp_comment" placeholder="对偶像说点什么..."></div>
          <button onclick="Events.addComment()">发布心语</button>
          <div class="item-list" id="editorComments"></div>`; break;
      case 'calendar':
        html = `
          <div class="form-group"><label>活动名称</label><input id="cal_name" placeholder="如：演唱会、见面会..."></div>
          <div class="form-group"><label>活动日期</label><input type="date" id="cal_date"></div>
          <div class="form-group"><label>活动地点</label><input id="cal_venue" placeholder="如：上海梅赛德斯奔驰文化中心"></div>
          <div class="form-group"><label>活动描述</label><textarea id="cal_desc" rows="3" placeholder="活动详细说明..."></textarea></div>
          <div class="form-group"><label>活动类型</label>
            <select id="cal_type" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd;">
              <option value="concert">演唱会</option>
              <option value="fan-meet">粉丝见面会</option>
              <option value="release">新专发布</option>
              <option value="other">其他活动</option>
            </select>
          </div>
          <button onclick="Events.saveEvent()">添加活动</button>
          <div class="item-list" id="calEditorList"></div>`; break;
      case 'shop':
        html = `
          <div class="form-group"><label>收藏名称</label><input id="shop_name" placeholder="如：演唱会官方应援棒"></div>
          <div class="form-group"><label>收藏照片</label><input type="file" id="shop_image" accept="image/*"><p style="font-size:11px;color:#888;margin:4px 0 0;">建议尺寸 400×400，≤50MB</p></div>
          <div class="form-group"><label>图标（emoji）</label><input id="shop_emoji" placeholder="🎤" maxlength="4"></div>
          <div class="form-group"><label>类别</label>
            <select id="shop_cat" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd;">
              <option value="周边">周边</option>
              <option value="专辑">专辑</option>
              <option value="服饰">服饰</option>
              <option value="配饰">配饰</option>
            </select>
          </div>
          <div class="form-group"><label>心得备注</label><textarea id="shop_desc" rows="2" placeholder="记录入手时的感受..."></textarea></div>
          <button onclick="Events.saveShopItem()">添加收藏</button>
          <div class="item-list" id="shopEditorList"></div>`; break;
      case 'template':
        html = this.renderTemplateEditor(); break;
      default:
        html = `<div class="empty">${tab} 模块将在后续阶段开放</div>`;
    }
    box.innerHTML = html;
    this.bindInputs(tab);
    this.renderAIPanel();
    if(tab==='news') this.renderNewsEditorList();
    if(tab==='gallery') this.renderGalleryEditorList();
    if(tab==='community') this.syncCommentList();
    if(tab==='calendar') this.renderCalEditorList();
    if(tab==='shop') this.renderShopEditorList();
  },
  renderTemplateEditor() {
    var TS = TemplateStore;
    var total = TS.getTotal();
    var h = '';
    // 模板区
    h += '<div class="tmpl-section"><h4>页面模板</h4>';
    h += '<div class="tmpl-grid">';
    TS.templates.forEach(function(t) {
      var sel = TS.selectedTemplate === t.id;
      h += '<div class="tmpl-card' + (sel ? ' selected' : '') + '" onclick="TemplateStore.toggleTemplate(\'' + t.id + '\')">';
      h += '<div class="tmpl-preview" style="background:' + t.gradient + ';">';
      // 装饰预览：显示2-3个主题元素
      if (t.decoItems && t.decoItems.length > 0) {
        h += '<div class="tmpl-preview-deco">';
        t.decoItems.forEach(function(group) {
          var emojis = group.emoji.split(' ');
          var showCount = Math.min(group.positions.length, 4);
          for (var di = 0; di < showCount; di++) {
            var pos = group.positions[di];
            var em = emojis[di % emojis.length];
            h += '<span class="tmpl-deco-item" style="font-size:' + Math.round(group.size * 0.55) + 'px;left:' + pos[0] + '%;top:' + pos[1] + '%;opacity:0.5;' + (group.rotate ? 'transform:rotate(' + (di * 25 - 15) + 'deg);' : '') + '">' + em + '</span>';
          }
        });
        h += '</div>';
      }
      h += '<div class="tmpl-preview-label"><span class="tmpl-emoji">' + t.emoji + '</span><span class="tmpl-label-text">' + t.name + '</span></div>';
      if (sel) h += '<div style="position:absolute;top:6px;right:6px;background:var(--primary);color:#fff;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;z-index:3;">✓</div>';
      h += '</div>';
      h += '<div class="tmpl-card-info">';
      h += '<div class="name">' + t.name + (t.price > 1 ? ' <span class="tmpl-tag">HOT</span>' : '') + '</div>';
      h += '<div class="price-tag' + (t.price === 0 || TS.paidItems.indexOf(t.id) !== -1 ? ' free' : '') + '">';
      if (t.price === 0) {
        h += '<span>免费</span>';
      } else if (TS.paidItems.indexOf(t.id) !== -1) {
        h += '<span class="check-mark">✓</span><span>已购买</span>';
      } else {
        h += '<span>¥' + t.price.toFixed(1) + '</span>';
      }
      h += '</div></div></div>';
    });
    h += '</div></div>';
    // 特效区
    h += '<div class="tmpl-section"><h4>页面特效</h4>';
    h += '<div style="display:flex;flex-wrap:wrap;">';
    TS.effects.forEach(function(fx) {
      var sel = TS.selectedEffects.indexOf(fx.id) > -1;
      h += '<div class="fx-chip' + (sel ? ' selected' : '') + '" onclick="TemplateStore.toggleEffect(\'' + fx.id + '\')">';
      h += '<span class="fx-emoji">' + fx.emoji + '</span>';
      h += '<span>' + fx.name + '</span>';
      if (fx.price > 0) {
        if (TS.paidItems.indexOf(fx.id) !== -1) {
          h += '<span class="fx-price" style="color:#10b981;">已购买</span>';
        } else {
          h += '<span class="fx-price">¥' + fx.price.toFixed(1) + '</span>';
        }
      } else {
        h += '<span class="fx-price" style="color:#10b981;">免费</span>';
      }
      h += '</div>';
    });
    h += '</div></div>';
    // 费用汇总
    h += '<div class="tmpl-summary">';
    h += '<span class="total-label">当前选择</span>';
    if (total === 0) {
      h += '<span class="total-amount free-tip">免费</span>';
    } else {
      h += '<span class="total-amount">¥' + total + '</span>';
    }
    h += '</div>';
    // 预览按钮
    h += '<button onclick="TemplateStore.previewStyle()" style="width:100%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;padding:12px;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;margin-top:12px;">预览外观效果</button>';
    // 说明
    h += '<div style="margin-top:12px;padding:10px 12px;background:#fef3c7;border-radius:10px;font-size:12px;color:#92400e;line-height:1.6;">';
    h += '<b>外观说明</b><br>';
    h += '• 每个模板/特效 ¥0.50，一次购买永久使用<br>';
    h += '• 未购买时点击"预览外观"会弹出提示<br>';
    h += '• 购买后再次点击即永久生效';
    h += '</div>';
    return h;
  },
  renderAIPanel() {
    const draft = AppState.aiDraft;
    // 找到当前 tab 对应的 AI 槽位
    var slotId = 'aiSlot_' + AppState.currentTab;
    var slot = document.getElementById(slotId);
    if (!slot) {
      // fallback: 在底部创建 panel
      var container = document.getElementById('editorContent');
      var panel = document.getElementById('aiPanel');
      if (!panel) { panel = document.createElement('div'); panel.id = 'aiPanel'; container.appendChild(panel); }
      slot = panel;
    }
    if (!draft.loading && !draft.text) { slot.style.display = 'none'; slot.innerHTML = ''; return; }
    slot.style.display = 'block';
    slot.innerHTML = '<div class="ai-panel">' +
      '<div class="header"><b>AI 生成中...</b><span style="font-size:12px;color:#888;">' + (draft.context||'') + '</span></div>' +
      '<div class="content ' + (draft.loading?'typing-cursor':'') + '">' + (draft.text || '正在思考...') + '</div>' +
      '<div class="actions" style="' + (draft.loading?'display:none':'') + '">' +
        '<button class="success" onclick="Events.acceptAI()">采用内容</button>' +
        '<button onclick="Events.regenerateAI()">重新生成</button>' +
      '</div></div>';
  },
  preview(tab) {
    const box = document.getElementById('previewContent');
    const titleEl = document.getElementById('previewTitle');
    const d = AppState.data;
    // 更新底部站点名称
    var heroTitle = document.getElementById('siteHeroTitle');
    if (heroTitle) heroTitle.textContent = d.celebrity.siteName || 'StarFan Studio 粉丝站生成器';
    if(tab==='celebrity') {
      if(titleEl) titleEl.innerText = d.celebrity.name ? `${d.celebrity.name} 的粉丝站` : '粉丝站预览';
      this.applyTheme(d.celebrity.colors);
      box.innerHTML = `
        <div style="text-align:center;margin-bottom:30px;padding:40px 24px;background:rgba(255,255,255,0.2);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);border:1px solid var(--border);">
          ${d.celebrity.avatar ? `<img src="${d.celebrity.avatar}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:4px solid #fff;box-shadow:0 4px 20px rgba(123,111,229,0.2);">` : '<div style="width:120px;height:120px;border-radius:50%;background:linear-gradient(135deg,var(--primary-light),rgba(155,126,222,0.1));margin:0 auto;display:flex;align-items:center;justify-content:center;color:var(--text-sub);font-size:14px;font-weight:500;">未上传</div>'}
          <h3 style="margin:16px 0 8px;font-size:26px;font-weight:800;color:var(--text-main);" contenteditable="true" data-bind="celebrity.name">${d.celebrity.name || '点击输入偶像名字'}</h3>
          <p style="color:var(--text-sub);font-size:15px;white-space:pre-wrap;max-width:600px;margin:0 auto;line-height:1.7;" contenteditable="true" data-bind="celebrity.bio">${d.celebrity.bio || '点击输入简介，或让AI生成...'}</p>
          ${d.celebrity.social?.weibo ? `<a href="${d.celebrity.social.weibo}" target="_blank" style="display:inline-block;margin-top:20px;padding:10px 24px;background:linear-gradient(135deg,var(--primary),var(--ai));color:white;text-decoration:none;border-radius:20px;font-size:14px;font-weight:600;box-shadow:0 4px 14px rgba(123,111,229,0.3);transition:0.2s;">微博主页</a>` : ''}
        </div>`;
    } else if(tab==='news') {
      if(titleEl) titleEl.innerText = '追忆时光';
      box.innerHTML = `
        <div class="section-header"><h2>追忆时光</h2><button class="inline-btn" onclick="Events.openEditorFor('news')">添加追忆</button></div>
        ${!d.news.length ? '<div class="empty">还没有追忆记录，点击上方添加你的第一次心动吧</div>' : `<div class="news-grid">${d.news.map(n=>`
          <div class="card-wrap" style="position:relative;">
            <button class="inline-del" onclick="Events.deleteNews('${n.id}')" title="删除">✕</button>
            <div class="news-card" style="cursor:pointer;" onclick="Events.openMemoir('${n.id}')">
              ${n.cover ? `<img src="${n.cover}">` : '<div style="height:140px;background:#eee;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:14px;">暂无封面</div>'}
              <div class="body">
                <div class="title">${n.title}</div>
                <div class="meta">${n.date}${n.images && n.images.length ? ' · '+(n.images.length+1)+'张照片' : ''}</div>
                <div class="content" style="max-height:60px;overflow:hidden;white-space:pre-wrap;">${n.content}</div>
              </div>
            </div>
          </div>`).join('')}</div>`}
      `;
    } else if(tab==='gallery') {
      if(titleEl) titleEl.innerText = '媒体画廊';
      box.innerHTML = `
        <div class="section-header"><h2>影像珍藏</h2><button class="inline-btn" onclick="Events.openEditorFor('gallery')">上传照片</button></div>
        ${!d.gallery.length ? '<div class="empty">暂无照片，点击上方按钮上传</div>' : `<div class="gallery-grid">${d.gallery.map(g=>`
          <div class="card-wrap" style="position:relative;">
            <button class="inline-del" onclick="Events.deleteGallery('${g.id}')" title="删除">✕</button>
            <div class="gallery-item"><img src="${g.url||''}"><div class="caption">${g.caption||'未命名'}</div></div>
          </div>`).join('')}</div>`}
      `;
    } else if(tab==='community') {
      if(titleEl) titleEl.innerText = '粉丝心语';
      box.innerHTML = `
        <div class="section-header"><h2>粉丝心语</h2><button class="inline-btn" onclick="Events.openEditorFor('community')">发布心语</button></div>
        <ul class="comments">${d.community.map((c,i)=>{
          var entry = typeof c === 'object' ? c : {text:c, time:''};
          var timeStr = entry.time ? '<span style="font-size:11px;color:#9ca3af;margin-left:auto;flex-shrink:0;">'+entry.time+'</span>' : '';
          return '<li style="display:flex;align-items:flex-start;gap:8px;">'+timeStr+'<div style="flex:1;">'+(typeof c==='object'?entry.text:c)+'</div><button class="inline-del" style="top:8px;right:8px;opacity:0.6;" onclick="Events.deleteComment('+i+')">✕</button></li>';
        }).join('')}</ul>
        ${!d.community.length ? '<div class="empty">还没有心语记录，写下你的第一份心情吧</div>' : ''}
      `;
    } else if(tab==='calendar') {
      if(titleEl) titleEl.innerText = '活动日历';
      CalendarModule.render(box, d.calendar);
    } else if(tab==='shop') {
      if(titleEl) titleEl.innerText = '周边收藏';
      ShopModule.render(box, d.shop);
    }
  },  
  applyTheme(text) {
    const map = {"蓝":"#4a90e2","淡蓝":"#a8d8ff","天蓝":"#87ceeb","粉":"#ff9ecb","淡粉":"#ffd1dc","紫":"#b388ff","淡紫":"#D4D2E7","薰衣草":"#CEC9E8","紫粉":"#D8BCE3","深紫":"#8A73BB","黄":"#ffd700","黄色":"#ffd700","金":"#ffd700","金色":"#ffd700","白":"#ffffff","黑":"#222222","黑色":"#222222","红":"#ff4757","绿":"#2ed573","橙":"#ffa502","灰":"#a4b0be"};
    let c1="#a8d8ff", c2="#ffd700";
    // 将 hex 转为 rgba，alpha ~0.6，使背景图透出
    const toRgba = (hex, alpha) => { const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16); return `rgba(${r},${g},${b},${alpha})`; };
    if(!text) { document.body.style.background = `linear-gradient(135deg, ${toRgba(c1,0.45)}, ${toRgba(c2,0.45)})`; return; }
    const parts = text.split('+').map(s => s.trim());
    const matchColor = (str) => { if(!str) return null; for(let k in map) if(str===k) return map[k]; for(let k in map) if(str.includes(k)) return map[k]; return null; };
    const m1 = matchColor(parts[0]); const m2 = matchColor(parts[1]);
    if(m1) c1=m1; if(m2) c2=m2;
    document.body.style.background = `linear-gradient(135deg, ${toRgba(c1,0.45)}, ${toRgba(c2,0.45)})`;
  },
  bindInputs(tab) {
    if(tab==='celebrity') {
      const bind=(id,path)=>{ const el=document.getElementById(id); if(el) el.addEventListener('input',e=>AppState.update('celebrity',path,e.target.value)); };
      bind('inp_sitename','siteName');
      bind('inp_name','name'); bind('inp_colors','colors'); bind('inp_bio','bio'); bind('inp_weibo','social.weibo');
      document.getElementById('inp_avatar')?.addEventListener('change', async e=>{
        const f=e.target.files[0]; if(!f) return;
        if(f.size>50*1024*1024) return alert('⚠️ 图片请≤50MB');
        const r=new FileReader(); r.onload=async ev=>{ AppState.update('celebrity','avatar',ev.target.result); Render.preview('celebrity'); await AssetDB.save('avatar', ev.target.result); }; r.readAsDataURL(f);
      });
    }
  },
  renderNewsEditorList() {
    const box = document.getElementById('newsEditorList');
    if(!box) return;
    box.innerHTML = AppState.data.news.map(n=>`
      <div class="item-card" style="${editingNewsId===n.id?'border:2px solid var(--primary);background:#f0f7ff;':''}">
        <div class="info"><b>${n.title}</b><span>${n.date}</span></div>
        <div style="display:flex;gap:6px;">
          <button class="small" onclick="Events.editNews('${n.id}')">编辑</button>
          <button class="small danger" onclick="Events.deleteNews('${n.id}')">删除</button>
        </div>
      </div>`).join('') || '<div class="empty" style="padding:10px">暂无新闻</div>';
  },
  renderGalleryEditorList() {
    const box = document.getElementById('galleryEditorList');
    if(!box) return;
    box.innerHTML = AppState.data.gallery.map(g=>`
      <div class="item-card" style="flex-wrap:wrap;">
        <img src="${g.url||''}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;margin-right:8px;">
        <input value="${g.caption||''}" placeholder="输入图注" style="flex:1;margin:0;padding:6px;font-size:12px;" onchange="Events.updateGalleryCaption('${g.id}', this.value)">
        <button class="small ai" style="margin-left:4px;background:var(--ai);color:#fff;padding:4px 8px;font-size:11px;" onclick="Events.triggerAICaption('${g.id}')" title="AI 生成图注">🤖</button>
        <button class="small danger" onclick="Events.deleteGallery('${g.id}')" style="margin-left:4px;">删</button>
      </div>`).join('') || '<div class="empty" style="padding:10px">暂无照片</div>';
  },
  syncCommentList() {
    const list = document.getElementById('editorComments');
    if(!list) return;
    list.innerHTML = AppState.data.community.map((c,i)=>{
      var entry = typeof c === 'object' ? c : {text:c, time:''};
      var timeInfo = entry.time ? ' · '+entry.time : '';
      return '<div class="item-card"><div class="info"><b>'+(entry.text||c)+'</b><span>'+timeInfo+'</span></div><button class="small danger" onclick="Events.deleteComment('+i+')">删除</button></div>';
    }).join('') || '<div class="empty" style="padding:10px">暂无心语</div>';
  },
  renderCalEditorList() {
    const box = document.getElementById('calEditorList');
    if(!box) return;
    const tagMap = {concert:'演唱会','fan-meet':'见面会',release:'新专发布',other:'其他'};
    box.innerHTML = AppState.data.calendar.map(ev=>`
      <div class="item-card">
        <div class="info"><b>${ev.name}</b><span>${ev.date} · ${tagMap[ev.type]||ev.type}</span></div>
        <button class="small danger" onclick="Events.deleteEvent('${ev.id}')">删除</button>
      </div>`).join('') || '<div class="empty" style="padding:10px">暂无活动</div>';
  },
  renderShopEditorList() {
    const box = document.getElementById('shopEditorList');
    if(!box) return;
    box.innerHTML = AppState.data.shop.map(item=>`
      <div class="item-card">
        <div class="info"><b>${item.name}</b><span>${item.cat}${item.desc?' · '+item.desc:''}</span></div>
        <button class="small danger" onclick="Events.deleteShopItem('${item.id}')">删除</button>
      </div>`).join('') || '<div class="empty" style="padding:10px">暂无收藏</div>';
  }
};
