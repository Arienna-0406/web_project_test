// ===== Events Module =====
// Part of StarFan Studio v2.3

// ================= 4. 事件处理 (Events) =================
const Events = {
  initTabs() {
    document.querySelectorAll('#editorTabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#editorTabs .tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AppState.currentTab = btn.dataset.tab;
        editingNewsId = null; // 切换标签时重置编辑状态
        Render.editor(AppState.currentTab);
        Render.preview(AppState.currentTab);
      });
    });
  },
  // 导览条快捷切换 tab（不弹出编辑面板，只切换预览内容）
  switchTab(tab) {
    // 激活对应 tab 按钮
    document.querySelectorAll('#editorTabs .tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    AppState.currentTab = tab;
    editingNewsId = null;
    Render.editor(tab);
    Render.preview(tab);
  },
  applyPreview() {
    Render.preview(AppState.currentTab);
    const btn = document.querySelector('#editorContent button:not(.ai):not(.danger):not(.small)');
    if(!btn) return;
    const ori=btn.innerText; btn.innerText='✅ 已更新'; btn.style.background='#2ecc71';
    setTimeout(()=>{ btn.innerText=ori; btn.style.background=''; }, 1000);
  },
  // 🤖 AI 工作流
  async triggerAI(type) {
    const draft = AppState.aiDraft;
    if(draft.loading) return;
    let prompt = '';
    if(type==='bio') {
      const name = document.getElementById('inp_name')?.value || AppState.data.celebrity.name;
      if(!name) return alert('请先输入偶像名字');
      prompt = AIService.prompts.bio(name); draft.context = '生成个人简介';
    } else if(type==='news') {
      const title = document.getElementById('news_title')?.value;
      const date = document.getElementById('news_date')?.value;
      if(!title) return alert('请先输入新闻标题');
      prompt = AIService.prompts.news(title, date||'今日'); draft.context = '生成新闻正文';
    } else if(type==='gallery') {
      const count = AppState.data.gallery.length;
      if(!count) return alert('请先上传照片');
      prompt = AIService.prompts.gallery(count); draft.context = '生成画廊图注';
    }
    draft.loading = true; draft.text = '';
    Render.renderAIPanel();
    await AIService.generate(prompt, (chunk, isDone) => { draft.text += chunk; if(isDone) draft.loading = false; Render.renderAIPanel(); });
  },
  // 为单张照片 AI 生成图注
  async triggerAICaption(galleryId) {
    const draft = AppState.aiDraft;
    if(draft.loading) return;
    const g = AppState.data.gallery.find(g => g.id === galleryId);
    if(!g) return alert('找不到该照片');
    draft._targetGalleryId = galleryId;
    // 生成一张照片的图注
    const prompt = '请为一张偶像活动照片生成一句简短唯美的图注，8-12字，风格应援/纪实，只输出一句话，不要编号和解释。';
    draft.loading = true; draft.text = ''; draft.context = 'AI 生成图注中...';
    Render.renderAIPanel();
    await AIService.generate(prompt, (chunk, isDone) => { draft.text += chunk; if(isDone) draft.loading = false; Render.renderAIPanel(); });
  },
  acceptAI() {
    const draft = AppState.aiDraft; const tab = AppState.currentTab;
    if(tab==='celebrity') { document.getElementById('inp_bio').value = draft.text; AppState.update('celebrity','bio', draft.text); }
    else if(tab==='news') { document.getElementById('news_content').value = draft.text; }
    else if(tab==='gallery') {
      const targetId = draft._targetGalleryId;
      if (targetId) {
        // 单张图注模式
        const g = AppState.data.gallery.find(g => g.id === targetId);
        if (g) {
          g.caption = draft.text.trim();
          AppState.save();
          Render.renderGalleryEditorList();
          Render.preview('gallery');
        }
        draft._targetGalleryId = null;
      } else {
        // 批量模式（兼容旧逻辑）
        const lines = draft.text.split('\n').filter(l=>l.trim());
        AppState.data.gallery.forEach((g,i) => { if(lines[i]) g.caption = lines[i].trim(); });
        AppState.save(); Render.renderGalleryEditorList();
      }
    }
    draft.text = ''; draft.loading = false; draft.context = null;
    Render.renderAIPanel(); Render.preview(tab);
  },
  regenerateAI() {
    const type = AppState.aiDraft.context?.includes('简介')?'bio':AppState.aiDraft.context?.includes('新闻')?'news':'gallery';
    this.triggerAI(type);
  },
  // 📰 新闻增删改查闭环
  editNews(id) {
    const news = AppState.data.news.find(n => n.id === id);
    if (!news) return;
    editingNewsId = id;
    document.getElementById('news_title').value = news.title;
    document.getElementById('news_date').value = news.date;
    document.getElementById('news_content').value = news.content;
    document.getElementById('news_cover').value = '';
    document.getElementById('news_submit_btn').innerText = '💾 保存修改';
    document.getElementById('news_cancel_btn').style.display = 'block';
    document.getElementById('editorContent').scrollIntoView({ behavior: 'smooth' });
    Render.renderNewsEditorList();
  },
  cancelEditNews() {
    editingNewsId = null;
    document.getElementById('news_title').value = '';
    document.getElementById('news_date').value = '';
    document.getElementById('news_content').value = '';
    document.getElementById('news_cover').value = '';
    var extraInput = document.getElementById('news_images');
    if (extraInput) extraInput.value = '';
    document.getElementById('news_submit_btn').innerText = '📖 添加追忆';
    document.getElementById('news_cancel_btn').style.display = 'none';
    Render.renderNewsEditorList();
  },
  async saveNews() {
    const title = document.getElementById('news_title').value.trim();
    const date = document.getElementById('news_date').value;
    const content = document.getElementById('news_content').value.trim();
    const coverFile = document.getElementById('news_cover').files[0];
    const extraFiles = Array.from((document.getElementById('news_images')||{}).files||[]);
    if (!title) return alert('请填写追忆标题');
    // 处理额外图片
    var images = [];
    if (extraFiles.length > 0) {
      if (extraFiles.length > 9) return alert('⚠️ 最多上传9张额外照片');
      for (var ef of extraFiles) {
        if (ef.size > 50*1024*1024) { alert('⚠️ ' + ef.name + ' 超过50MB，已跳过'); continue; }
        try {
          var dataUrl = await new Promise((res,rej)=>{ var r=new FileReader(); r.onload=e=>res(e.target.result); r.onerror=rej; r.readAsDataURL(ef); });
          var imgId = 'ni_' + Date.now().toString(36) + Math.random().toString(36).substr(2,4);
          images.push(imgId);
          await AssetDB.save(imgId, dataUrl);
        } catch(e) { console.warn('图片上传失败', e); }
      }
    }
    if (editingNewsId) {
      const idx = AppState.data.news.findIndex(n => n.id === editingNewsId);
      if (idx === -1) return;
      const item = AppState.data.news[idx];
      item.title = title;
      item.date = date || item.date;
      item.content = content;
      if (coverFile) {
        if (coverFile.size > 50*1024*1024) return alert('⚠️ 图片请≤50MB');
        const r = new FileReader();
        r.onload = async e => {
          item.cover = e.target.result;
          if (images.length) item.images = (item.images||[]).concat(images);
          AppState.save();
          var _newsKey1 = 'news_' + item.id;
          await AssetDB.save(_newsKey1, item.cover);
          Events.cancelEditNews();
          Render.preview('news');
        }; r.readAsDataURL(coverFile);
      } else {
        if (images.length) item.images = (item.images||[]).concat(images);
        AppState.save();
        Events.cancelEditNews();
        Render.preview('news');
      }
    } else {
      const id = 'n' + Date.now().toString(36);
      const item = { id, title, date: date || new Date().toISOString().split('T')[0], content, cover: '', images };
      if (coverFile) {
        if (coverFile.size > 50*1024*1024) return alert('⚠️ 图片请≤50MB');
        const r = new FileReader();
        r.onload = async e => {
          item.cover = e.target.result;
          AppState.data.news.unshift(item);
          AppState.save();
          var _newsKey2 = 'news_' + id;
          await AssetDB.save(_newsKey2, item.cover);
          Render.editor('news'); Render.preview('news');
        }; r.readAsDataURL(coverFile);
      } else {
        AppState.data.news.unshift(item);
        AppState.save();
        Render.editor('news'); Render.preview('news');
      }
    }
  },
  async deleteNews(id) {
    if(!confirm('确定删除此新闻？')) return;
    AppState.data.news = AppState.data.news.filter(n=>n.id!==id);
    AppState.save();
    var _newsDelKey = 'news_' + id;
    await AssetDB.delete(_newsDelKey);
    Render.editor('news'); Render.preview('news');
  },
  // 📖 追忆详情弹窗
  async openMemoir(id) {
    const news = AppState.data.news.find(n => n.id === id);
    if (!news) return;
    document.getElementById('memoirTitle').textContent = news.title;
    document.getElementById('memoirMeta').textContent = '📅 ' + news.date + (news.images && news.images.length ? ' · 📷 ' + (news.images.length + (news.cover ? 1 : 0)) + '张照片' : '');
    var body = document.getElementById('memoirBody');
    var h = '';
    // 照片区
    var allImages = [];
    if (news.cover) allImages.push(news.cover);
    for (var imgId of (news.images||[])) {
      var imgData = await AssetDB.load(imgId);
      if (imgData) allImages.push(imgData);
    }
    if (allImages.length > 0) {
      h += '<div class="memoir-images">';
      allImages.forEach(function(src, i) {
        var cls = i === 0 && allImages.length > 1 ? ' cover-img' : '';
        h += '<img src="' + src + '" class="' + cls + '" onclick="Events.openMemoirLightbox(this.src)" alt="追忆照片">';
      });
      h += '</div>';
    }
    h += '<div class="memoir-content">' + (news.content || '') + '</div>';
    body.innerHTML = h;
    document.getElementById('memoirOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
  },
  closeMemoir() {
    document.getElementById('memoirOverlay').classList.remove('show');
    document.body.style.overflow = '';
  },
  openMemoirLightbox(src) {
    document.getElementById('memoirLightboxImg').src = src;
    document.getElementById('memoirLightbox').classList.add('show');
  },
  // 🖼 画廊 & 💬 社区 (同Phase3)
  async uploadGallery() {
    const files = document.getElementById('gallery_files').files;
    if(!files.length) return;
    for(let f of files) {
      if(f.size>50*1024*1024) { alert(`⚠️ ${f.name} 超过50MB，已跳过`); continue; }
      const id = 'g'+Date.now().toString(36)+Math.random().toString(36).substr(2,4);
      const r = new FileReader();
      r.onload = async e => {
        const url = e.target.result;
        AppState.data.gallery.push({ id, caption: '', url });
        AppState.save();
        var _galKey = 'gallery_' + id;
        await AssetDB.save(_galKey, url);
        Render.renderGalleryEditorList();
        Render.preview('gallery');
      }; r.readAsDataURL(f);
    }
    document.getElementById('gallery_files').value = '';
  },
  updateGalleryCaption(id, val) {
    const item = AppState.data.gallery.find(g=>g.id===id);
    if(item) { item.caption = val; AppState.save(); Render.preview('gallery'); }
  },
  async deleteGallery(id) {
    if(!confirm('确定删除此照片？')) return;
    AppState.data.gallery = AppState.data.gallery.filter(g=>g.id!==id);
    AppState.save();
    var _galDelKey = 'gallery_' + id;
    await AssetDB.delete(_galDelKey);
    Render.editor('gallery'); Render.preview('gallery');
  },
  addComment() {
    const inp=document.getElementById('inp_comment'); const txt=inp?.value.trim();
    if(!txt) return alert('心语不能为空');
    var now = new Date();
    var timeStr = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0')+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
    AppState.data.community.push({text:txt, time:timeStr}); AppState.save(); inp.value='';
    Render.editor('community'); Render.preview('community');
  },
  deleteComment(idx) {
    AppState.data.community.splice(idx,1); AppState.save();
    Render.editor('community'); Render.preview('community');
  },
  // 📅 活动日历
  saveEvent() {
    const name = document.getElementById('cal_name')?.value.trim();
    const date = document.getElementById('cal_date')?.value;
    const venue = document.getElementById('cal_venue')?.value.trim();
    const desc = document.getElementById('cal_desc')?.value.trim();
    const type = document.getElementById('cal_type')?.value;
    if(!name) return alert('请填写活动名称');
    if(!date) return alert('请选择活动日期');
    const id = 'ev' + Date.now().toString(36);
    AppState.data.calendar.push({ id, name, date, venue, desc, type, registered: false });
    AppState.save();
    // 清空表单
    ['cal_name','cal_venue','cal_desc'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
    Render.renderCalEditorList(); Render.preview('calendar');
  },
  deleteEvent(id) {
    if(!confirm('确定删除此活动？')) return;
    AppState.data.calendar = AppState.data.calendar.filter(ev=>ev.id!==id);
    AppState.save(); Render.renderCalEditorList(); Render.preview('calendar');
  },
  toggleRegister(id) {
    const ev = AppState.data.calendar.find(e=>e.id===id);
    if(!ev) return;
    ev.registered = !ev.registered;
    AppState.save(); Render.preview('calendar');
  },
  // 🛒 在线商城
  async saveShopItem() {
    const name = document.getElementById('shop_name')?.value.trim();
    const emoji = document.getElementById('shop_emoji')?.value.trim() || '🎁';
    const cat = document.getElementById('shop_cat')?.value || '周边';
    const desc = document.getElementById('shop_desc')?.value.trim();
    if(!name) return alert('请填写收藏名称');
    const id = 'sp' + Date.now().toString(36);
    const imageFile = document.getElementById('shop_image')?.files[0];
    if (imageFile) {
      if (imageFile.size > 50*1024*1024) return alert('⚠️ 图片请≤50MB');
      const r = new FileReader();
      r.onload = async e => {
        AppState.data.shop.push({ id, name, emoji, cat, desc, image: e.target.result });
        AppState.save(); Render.renderShopEditorList(); Render.preview('shop');
      };
      r.readAsDataURL(imageFile);
    } else {
      AppState.data.shop.push({ id, name, emoji, cat, desc });
      AppState.save(); Render.renderShopEditorList(); Render.preview('shop');
    }
    ['shop_name','shop_emoji','shop_desc'].forEach(i=>{ const el=document.getElementById(i); if(el) el.value=''; });
    document.getElementById('shop_image').value = '';
  },
  deleteShopItem(id) {
    if(!confirm('确定删除此商品？')) return;
    var _shopDelKey = 'shop_' + id;
    AssetDB.delete(_shopDelKey);
    AppState.data.shop = AppState.data.shop.filter(s=>s.id!==id);
    AppState.save(); Render.renderShopEditorList(); Render.preview('shop');
  },
  toggleEditor() {
    const panel = document.getElementById('editorPanel');
    const overlay = document.getElementById('overlay');
    const isOpen = panel.classList.toggle('open');
    overlay.classList.toggle('show', isOpen);
  },
  openEditorFor(tab) {
    document.getElementById('editorPanel').classList.add('open');
    document.getElementById('overlay').classList.add('show');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
    AppState.currentTab = tab;
    Render.editor(tab);
  },
};
