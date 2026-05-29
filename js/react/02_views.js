// StarFan React Views — Celebrity, News, Gallery, Community, Calendar, Shop, Dashboard

// --- CelebrityView ---
function CelebrityView() {
  var ctx = React.useContext(window.SF.AppContext);
  var state = ctx.state;
  var dispatch = ctx.dispatch;
  var c = state.data.celebrity;
  var _useState = React.useState;
  var editingState = _useState(false);
  var editing = editingState[0];
  var setEditing = editingState[1];
  var formState = _useState({ siteName: c.siteName, name: c.name, colors: c.colors, bio: c.bio, weibo: c.social ? c.social.weibo || '' : '' });
  var form = formState[0];
  var setForm = formState[1];
  var avatarRef = React.useRef(null);
  var aiState = _useState(false);
  var aiLoading = aiState[0];
  var setAiLoading = aiState[1];
  var aiTextState = _useState('');
  var aiText = aiTextState[0];
  var setAiText = aiTextState[1];

  React.useEffect(function() {
    setForm({ siteName: c.siteName, name: c.name, colors: c.colors, bio: c.bio, weibo: c.social ? c.social.weibo || '' : '' });
  }, [c]);

  function handleAvatar(e) {
    var file = e.target.files ? e.target.files[0] : null;
    if (!file || file.size > 50*1024*1024) return alert('图片不能超过 50MB');
    var reader = new FileReader();
    reader.onload = function(ev) {
      AssetDB.save('avatar', ev.target.result).then(function() {
        dispatch({ type: 'UPDATE_CELEBRITY', payload: { avatar: ev.target.result } });
      });
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    dispatch({ type: 'SET_CELEBRITY', payload: Object.assign({}, c, { siteName: form.siteName, name: form.name, colors: form.colors, bio: form.bio, social: { weibo: form.weibo } }) });
    setEditing(false);
  }

  function handleAI() {
    if (!form.name) return;
    setAiLoading(true); setAiText('');
    AIService.generate(AIService.prompts.bio(form.name), function(text, done) {
      setAiText(text);
      if (done) { setForm(function(f) { return Object.assign({}, f, { bio: text }); }); setAiLoading(false); }
    });
  }

  var bgTypes = [
    { id: 'stars', label: '闪烁星空' },
    { id: 'moon', label: '梦幻月影' },
    { id: 'particles', label: '浮动粒子' },
  ];

  return React.createElement('div', null,
    React.createElement(ModuleHeader, { tab: 'celebrity', showEdit: !editing, onEdit: function() { setEditing(true); }, btnText: (c.name ? '编辑' : '开始设置') }),
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      // 头像 + Banner
      React.createElement('div', { className: 'lg:col-span-1' },
        React.createElement(CardContainer, null,
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', { className: 'relative w-32 h-32 mx-auto mb-4' },
              React.createElement('img', {
                src: c.avatar || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23E8DEF8" width="100" height="100" rx="50"/><text x="50" y="55" text-anchor="middle" fill="%237C5CFC" font-size="40">★</text></svg>',
                className: 'w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg', alt: 'avatar'
              }),
              editing && React.createElement('button', {
                onClick: function() { if (avatarRef.current) avatarRef.current.click(); },
                className: 'absolute bottom-0 right-0 w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center text-sm shadow-md hover:bg-primary-hover transition-colors'
              }, '+')
            ),
            React.createElement('input', { ref: avatarRef, type: 'file', accept: 'image/*', onChange: handleAvatar, className: 'hidden' }),
            editing
              ? React.createElement('input', { value: form.name, onChange: function(e) { setForm(Object.assign({}, form, { name: e.target.value })); }, placeholder: '偶像名字', className: 'text-center text-lg font-bold border-b-2 border-primary outline-none w-full bg-transparent py-1' })
              : React.createElement('h3', { className: 'text-xl font-bold text-text-main' }, c.name || '未命名')
          )
        ),
        // 数据浮标
        React.createElement('div', { className: 'grid grid-cols-2 gap-3 mt-3' },
          [
            { label: '追忆', val: state.data.news.length },
            { label: '照片', val: state.data.gallery.length },
            { label: '心语', val: state.data.community.length },
            { label: '活动', val: state.data.calendar.length },
          ].map(function(s) {
            return React.createElement('div', { key: s.label, className: 'bg-white/90 backdrop-blur-md rounded-card shadow-card p-4 text-center' },
              React.createElement('div', { className: 'text-2xl font-bold text-primary' }, s.val),
              React.createElement('div', { className: 'text-xs text-text-sub mt-1' }, s.label)
            );
          })
        )
      ),
      // 编辑区
      React.createElement('div', { className: 'lg:col-span-2 space-y-4' },
        React.createElement(CardContainer, null,
          React.createElement('div', { className: 'space-y-4' },
            editing
              ? React.createElement(React.Fragment, null,
                  React.createElement('div', null,
                    React.createElement('label', { className: 'block text-sm font-medium text-text-sub mb-1' }, '站点名称'),
                    React.createElement('input', { value: form.siteName, onChange: function(e) { setForm(Object.assign({}, form, { siteName: e.target.value })); }, placeholder: '给你的粉丝站起个名字', className: 'w-full px-4 py-2.5 border border-border-light rounded-btn text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors' })
                  ),
                  React.createElement('div', null,
                    React.createElement('label', { className: 'block text-sm font-medium text-text-sub mb-1' }, '主色调'),
                    React.createElement('input', { value: form.colors, onChange: function(e) { setForm(Object.assign({}, form, { colors: e.target.value })); }, placeholder: '如：淡蓝+金色', className: 'w-full px-4 py-2.5 border border-border-light rounded-btn text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors' })
                  ),
                  React.createElement('div', null,
                    React.createElement('label', { className: 'block text-sm font-medium text-text-sub mb-1' }, '动态背景'),
                    React.createElement('div', { className: 'flex gap-2' },
                      bgTypes.map(function(bg) {
                        return React.createElement('button', {
                          key: bg.id,
                          onClick: function() { dispatch({ type: 'UPDATE_CELEBRITY', payload: { bgType: bg.id } }); if (typeof BackgroundFX !== 'undefined') BackgroundFX.setType(bg.id); },
                          className: 'px-4 py-2 rounded-btn text-sm font-medium transition-all ' + (c.bgType === bg.id ? 'bg-primary text-white' : 'bg-gray-100 text-text-sub hover:bg-gray-200')
                        }, bg.label);
                      })
                    )
                  ),
                  React.createElement('div', null,
                    React.createElement('label', { className: 'block text-sm font-medium text-text-sub mb-1' }, '个人简介'),
                    React.createElement('textarea', { value: form.bio, onChange: function(e) { setForm(Object.assign({}, form, { bio: e.target.value })); }, rows: 4, placeholder: '写下偶像的简介...', className: 'w-full px-4 py-2.5 border border-border-light rounded-btn text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none' }),
                    React.createElement('div', { className: 'flex gap-2 mt-2' },
                      React.createElement('button', { onClick: handleAI, disabled: aiLoading, className: 'px-4 py-2 text-sm bg-gradient-to-r from-purple-400 to-primary text-white rounded-btn font-medium hover:opacity-90 transition-opacity disabled:opacity-50' },
                        aiLoading ? 'AI 生成中...' : 'AI 生成简介'
                      )
                    )
                  ),
                  React.createElement('div', null,
                    React.createElement('label', { className: 'block text-sm font-medium text-text-sub mb-1' }, '微博链接'),
                    React.createElement('input', { value: form.weibo, onChange: function(e) { setForm(Object.assign({}, form, { weibo: e.target.value })); }, placeholder: 'https://weibo.com/...', className: 'w-full px-4 py-2.5 border border-border-light rounded-btn text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors' })
                  ),
                  React.createElement('div', { className: 'flex gap-3 pt-2' },
                    React.createElement('button', { onClick: handleSave, className: 'px-6 py-2.5 bg-primary text-white rounded-btn font-medium hover:bg-primary-hover transition-colors' }, '保存'),
                    React.createElement('button', { onClick: function() { setEditing(false); }, className: 'px-6 py-2.5 bg-gray-100 text-text-sub rounded-btn font-medium hover:bg-gray-200 transition-colors' }, '取消')
                  )
                )
              : React.createElement(React.Fragment, null,
                  React.createElement('div', { className: 'mb-4' },
                    React.createElement('span', { className: 'text-xs text-text-sub' }, '主色调'),
                    React.createElement('span', { className: 'ml-2 px-3 py-1 bg-primary-light text-primary rounded-full text-sm font-medium' }, c.colors || '未设置')
                  ),
                  React.createElement('div', null,
                    React.createElement('span', { className: 'text-xs text-text-sub' }, '简介'),
                    React.createElement('p', { className: 'mt-2 text-text-main leading-relaxed whitespace-pre-wrap' }, c.bio || '还没有简介，点击编辑按钮添加')
                  ),
                  c.social && c.social.weibo && React.createElement('div', { className: 'mt-4' },
                    React.createElement('a', { href: c.social.weibo, target: '_blank', className: 'text-sm text-primary hover:underline' }, c.social.weibo)
                  )
                )
          )
        )
      )
    )
  );
}

// --- NewsView ---
function NewsView() {
  var ctx = React.useContext(window.SF.AppContext);
  var state = ctx.state;
  var dispatch = ctx.dispatch;
  var _useState = React.useState;
  var showEditorState = _useState(false);
  var showEditor = showEditorState[0];
  var setShowEditor = showEditorState[1];
  var formState = _useState({ title: '', date: new Date().toISOString().slice(0,10), content: '' });
  var form = formState[0];
  var setForm = formState[1];
  var coverState = _useState(null);
  var coverDataUrl = coverState[0];
  var setCoverDataUrl = coverState[1];
  var extraState = _useState([]);
  var extraImages = extraState[0];
  var setExtraImages = extraState[1];
  var aiState = _useState(false);
  var aiLoading = aiState[0];
  var setAiLoading = aiState[1];
  var detailState = _useState(null);
  var detailItem = detailState[0];
  var setDetailItem = detailState[1];

  function handleSave() {
    if (!form.title && !form.content) return alert('请填写标题或内容');
    var id = 'n' + Date.now().toString(36);
    var item = { id: id, title: form.title, date: form.date, content: form.content, cover: '', images: [] };
    var promises = [];
    if (coverDataUrl) {
      promises.push(AssetDB.save('news_' + id, coverDataUrl).then(function() { item.cover = coverDataUrl; }));
    }
    if (extraImages.length) {
      for (var i = 0; i < extraImages.length; i++) {
        var niId = 'ni_' + Date.now().toString(36) + i;
        (function(niId, img) {
          promises.push(AssetDB.save(niId, img).then(function() { item.images.push(niId); }));
        })(niId, extraImages[i]);
      }
    }
    Promise.all(promises).then(function() {
      dispatch({ type: 'ADD_NEWS', item: item });
      setShowEditor(false); setForm({ title: '', date: new Date().toISOString().slice(0,10), content: '' }); setCoverDataUrl(null); setExtraImages([]);
    });
  }

  function handleCoverUpload(e) {
    var file = e.target.files ? e.target.files[0] : null;
    if (!file || file.size > 50*1024*1024) return;
    var reader = new FileReader();
    reader.onload = function(ev) { setCoverDataUrl(ev.target.result); };
    reader.readAsDataURL(file);
  }

  function handleExtraUpload(e) {
    var files = Array.from(e.target.files || []).filter(function(f) { return f.size <= 50*1024*1024; });
    files.forEach(function(f) {
      var r = new FileReader();
      r.onload = function(ev) { setExtraImages(function(prev) { return prev.concat([ev.target.result]); }); };
      r.readAsDataURL(f);
    });
  }

  function handleAI() {
    setAiLoading(true);
    AIService.generate(AIService.prompts.news(form.title || '珍贵回忆', form.date), function(text, done) {
      setForm(function(f) { return Object.assign({}, f, { content: text }); });
      if (done) setAiLoading(false);
    });
  }

  function handleDelete(id) {
    AssetDB.delete('news_' + id);
    dispatch({ type: 'DELETE_NEWS', id: id });
  }

  if (detailItem) {
    return React.createElement('div', { className: 'max-w-2xl mx-auto' },
      React.createElement('button', { onClick: function() { setDetailItem(null); }, className: 'mb-4 text-sm text-primary hover:underline' }, '← 返回列表'),
      React.createElement(CardContainer, null,
        detailItem.cover && React.createElement('img', { src: detailItem.cover, className: 'w-full h-48 object-cover rounded-lg mb-4' }),
        React.createElement('h2', { className: 'text-xl font-bold text-text-main mb-2' }, detailItem.title),
        React.createElement('p', { className: 'text-xs text-text-sub mb-4' }, detailItem.date),
        React.createElement('p', { className: 'text-text-main leading-relaxed whitespace-pre-wrap' }, detailItem.content),
        detailItem.images && detailItem.images.length > 0 && React.createElement('div', { className: 'mt-4 columns-2 gap-3' },
          detailItem.images.map(function(niId, i) {
            return React.createElement('img', {
              key: i, src: niId.indexOf('ni_') === 0 ? '' : niId,
              className: 'w-full rounded-lg mb-3 object-cover', alt: '',
              onError: function(e) { if (niId.indexOf('ni_') === 0) { AssetDB.load(niId).then(function(d) { if (d) e.target.src = d; }); } }
            });
          })
        ),
        React.createElement('div', { className: 'flex gap-2 mt-4 pt-4 border-t border-border-light' },
          React.createElement('button', { onClick: function() { setDetailItem(null); }, className: 'text-sm text-text-sub hover:text-text-main' }, '关闭'),
          React.createElement('button', { onClick: function() { setForm(detailItem); setShowEditor(true); setDetailItem(null); }, className: 'text-sm text-primary' }, '编辑'),
          React.createElement('button', { onClick: function() { handleDelete(detailItem.id); setDetailItem(null); }, className: 'text-sm text-red-400' }, '删除')
        )
      )
    );
  }

  return React.createElement('div', null,
    React.createElement(ModuleHeader, { tab: 'news', showEdit: true, onEdit: function() { setShowEditor(true); } }),

    showEditor && React.createElement('div', {
      className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm',
      onClick: function(e) { if (e.target === e.currentTarget) setShowEditor(false); }
    },
      React.createElement('div', { className: 'bg-white rounded-card shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto' },
        React.createElement('h3', { className: 'text-lg font-bold text-text-main mb-4' }, form.id ? '编辑追忆' : '新增追忆'),
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-text-sub mb-1' }, '标题'),
            React.createElement('input', { value: form.title, onChange: function(e) { setForm(Object.assign({}, form, { title: e.target.value })); }, placeholder: '追忆标题', className: 'w-full px-4 py-2.5 border border-border-light rounded-btn text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-text-sub mb-1' }, '日期'),
            React.createElement('input', { type: 'date', value: form.date, onChange: function(e) { setForm(Object.assign({}, form, { date: e.target.value })); }, className: 'w-full px-4 py-2.5 border border-border-light rounded-btn text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-text-sub mb-1' }, '封面图片'),
            React.createElement('input', { type: 'file', accept: 'image/*', onChange: handleCoverUpload, className: 'w-full text-sm' }),
            coverDataUrl && React.createElement('img', { src: coverDataUrl, className: 'mt-2 w-full h-32 object-cover rounded-lg' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-text-sub mb-1' }, '额外图片（最多9张）'),
            React.createElement('input', { type: 'file', accept: 'image/*', multiple: true, onChange: handleExtraUpload, className: 'w-full text-sm' }),
            extraImages.length > 0 && React.createElement('div', { className: 'flex gap-2 mt-2 flex-wrap' },
              extraImages.map(function(img, i) { return React.createElement('img', { key: i, src: img, className: 'w-16 h-16 object-cover rounded-lg' }); })
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-medium text-text-sub mb-1' }, '内容'),
            React.createElement('textarea', { value: form.content, onChange: function(e) { setForm(Object.assign({}, form, { content: e.target.value })); }, rows: 5, placeholder: '写下你的追忆...', className: 'w-full px-4 py-2.5 border border-border-light rounded-btn text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none' }),
            React.createElement('button', { onClick: handleAI, disabled: aiLoading, className: 'mt-2 px-4 py-1.5 text-xs bg-primary-light text-primary rounded-full hover:bg-primary/20 transition-colors' },
              aiLoading ? 'AI 生成中...' : 'AI 辅助写作'
            )
          )
        ),
        React.createElement('div', { className: 'flex gap-3 mt-6' },
          React.createElement('button', { onClick: handleSave, className: 'flex-1 py-2.5 bg-primary text-white rounded-btn font-medium hover:bg-primary-hover transition-colors' }, '保存'),
          React.createElement('button', { onClick: function() { setShowEditor(false); }, className: 'flex-1 py-2.5 bg-gray-100 text-text-sub rounded-btn font-medium hover:bg-gray-200 transition-colors' }, '取消')
        )
      )
    ),

    state.data.news.length === 0
      ? React.createElement(EmptyState, { title: '还没有追忆记录', desc: '记录下你和偶像之间最珍贵的每一个瞬间', action: '写第一条追忆', onAction: function() { setShowEditor(true); } })
      : React.createElement('div', { className: 'columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4' },
          [].concat(state.data.news).reverse().map(function(item) {
            return React.createElement(CardContainer, {
                key: item.id, onClick: function() { setDetailItem(item); }, className: 'break-inside-avoid group'
              },
              item.cover && React.createElement('img', { src: item.cover, className: 'w-full h-40 object-cover rounded-lg mb-3' }),
              React.createElement('p', { className: 'text-xs text-text-sub mb-1' }, item.date),
              React.createElement('h4', { className: 'text-base font-semibold text-text-main mb-2' }, item.title || '无标题'),
              React.createElement('p', { className: 'text-sm text-text-sub line-clamp-3' }, (item.content || '').slice(0, 100)),
              React.createElement('div', { className: 'flex gap-2 mt-3 pt-3 border-t border-border-light opacity-0 group-hover:opacity-100 transition-opacity' },
                React.createElement('button', { onClick: function(e) { e.stopPropagation(); setDetailItem(item); }, className: 'text-xs text-primary hover:underline' }, '查看'),
                React.createElement('button', { onClick: function(e) { e.stopPropagation(); setForm(item); setShowEditor(true); }, className: 'text-xs text-text-sub hover:text-text-main' }, '编辑'),
                React.createElement('button', { onClick: function(e) { e.stopPropagation(); handleDelete(item.id); }, className: 'text-xs text-red-400 hover:text-red-500' }, '删除')
              )
            );
          })
        )
  );
}

// --- GalleryView ---
function GalleryView() {
  var ctx = React.useContext(window.SF.AppContext);
  var state = ctx.state;
  var dispatch = ctx.dispatch;
  var _useState = React.useState;
  var lbState = _useState(null);
  var lightboxIdx = lbState[0];
  var setLightboxIdx = lbState[1];
  var batchState = _useState(false);
  var batchMode = batchState[0];
  var setBatchMode = batchState[1];
  var selState = _useState(new Set());
  var selected = selState[0];
  var setSelected = selState[1];

  function handleUpload(e) {
    var files = Array.from(e.target.files || []).filter(function(f) { return f.size <= 50*1024*1024; });
    var newList = [].concat(state.data.gallery);
    files.forEach(function(f) {
      var reader = new FileReader();
      reader.onload = function(ev) {
        var id = 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
        AssetDB.save('gallery_' + id, ev.target.result).then(function() {
          newList.push({ id: id, caption: '', url: ev.target.result });
          dispatch({ type: 'SET_GALLERY', list: [].concat(newList) });
        });
      };
      reader.readAsDataURL(f);
    });
  }

  function handleDelete(id) { AssetDB.delete('gallery_' + id); dispatch({ type: 'DELETE_GALLERY', id: id }); }
  function handleBatchDelete() { selected.forEach(function(id) { handleDelete(id); }); setSelected(new Set()); setBatchMode(false); }
  function toggleSelect(id) { var next = new Set(selected); if (next.has(id)) next.delete(id); else next.add(id); setSelected(next); }

  var items = state.data.gallery;

  return React.createElement('div', null,
    React.createElement(ModuleHeader, { tab: 'gallery', showEdit: true, onEdit: function() { var el = document.getElementById('galleryUploadInput'); if (el) el.click(); } }),
    React.createElement('input', { id: 'galleryUploadInput', type: 'file', accept: 'image/*', multiple: true, onChange: handleUpload, className: 'hidden' }),

    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', { className: 'flex gap-1 bg-gray-100 rounded-btn p-1' },
        ['grid', 'list', 'focus'].map(function(mode) {
          return React.createElement('button', {
            key: mode, onClick: function() { dispatch({ type: 'SET_VIEW_MODE', mode: mode }); },
            className: 'px-4 py-1.5 rounded-btn text-xs font-medium transition-colors ' + (state.viewMode === mode ? 'bg-white shadow-sm text-text-main' : 'text-text-sub hover:text-text-main')
          }, mode === 'grid' ? '网格' : mode === 'list' ? '列表' : '聚焦');
        })
      ),
      React.createElement('div', { className: 'flex gap-2' },
        items.length > 0 && React.createElement('button', {
          onClick: function() { setBatchMode(!batchMode); setSelected(new Set()); },
          className: 'px-3 py-1.5 text-xs rounded-btn font-medium transition-colors ' + (batchMode ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-text-sub hover:bg-gray-200')
        }, batchMode ? '取消' : '批量管理')
      )
    ),

    batchMode && selected.size > 0 && React.createElement('div', { className: 'flex items-center gap-3 mb-4 px-4 py-2 bg-red-50 rounded-btn text-sm' },
      React.createElement('span', { className: 'text-red-500' }, '已选 ' + selected.size + ' 张'),
      React.createElement('button', { onClick: handleBatchDelete, className: 'text-red-500 font-semibold hover:underline' }, '删除选中')
    ),

    items.length === 0
      ? React.createElement(EmptyState, { title: '还没有照片', desc: '上传偶像的精彩瞬间到画廊', action: '上传照片', onAction: function() { var el = document.getElementById('galleryUploadInput'); if (el) el.click(); } })
      : state.viewMode === 'list'
        ? React.createElement('div', { className: 'space-y-3' },
            items.map(function(item) {
              return React.createElement('div', { key: item.id, className: 'flex items-center gap-4 bg-white/90 backdrop-blur-md rounded-card shadow-card p-4 group' },
                batchMode && React.createElement('input', { type: 'checkbox', checked: selected.has(item.id), onChange: function() { toggleSelect(item.id); }, className: 'w-4 h-4' }),
                React.createElement('img', { src: item.url, className: 'w-16 h-16 object-cover rounded-lg cursor-pointer', onClick: function() { setLightboxIdx(items.indexOf(item)); } }),
                React.createElement('div', { className: 'flex-1 min-w-0' },
                  React.createElement('p', { className: 'text-sm text-text-main truncate' }, item.caption || '未命名')
                ),
                React.createElement('div', { className: 'flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity' },
                  React.createElement('button', { onClick: function() { setLightboxIdx(items.indexOf(item)); }, className: 'text-xs text-primary' }, '查看'),
                  React.createElement('button', { onClick: function() { handleDelete(item.id); }, className: 'text-xs text-red-400' }, '删除')
                )
              );
            })
          )
        : state.viewMode === 'focus'
          ? React.createElement('div', { className: 'max-w-2xl mx-auto space-y-6' },
              items.map(function(item, i) {
                return React.createElement(CardContainer, { key: item.id, className: 'text-center' },
                  React.createElement('img', { src: item.url, className: 'w-full max-h-[500px] object-contain rounded-lg mb-4 cursor-pointer', onClick: function() { setLightboxIdx(i); } }),
                  React.createElement('p', { className: 'text-sm text-text-sub' }, item.caption || '未命名')
                );
              })
            )
          : React.createElement('div', { className: 'columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3' },
              items.map(function(item, i) {
                return React.createElement('div', {
                  key: item.id,
                  className: 'break-inside-avoid relative group cursor-pointer',
                  onClick: function() { if (batchMode) toggleSelect(item.id); else setLightboxIdx(i); }
                },
                  React.createElement('img', { src: item.url, className: 'w-full rounded-lg object-cover', loading: 'lazy' }),
                  batchMode && React.createElement('div', { className: 'absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ' + (selected.has(item.id) ? 'bg-primary border-primary text-white' : 'bg-white/80 border-white') },
                    selected.has(item.id) ? '\u2713' : null
                  ),
                  React.createElement('div', { className: 'absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-end p-3 opacity-0 group-hover:opacity-100' },
                    React.createElement('p', { className: 'text-white text-xs truncate' }, item.caption || '未命名')
                  )
                );
              })
            ),

    lightboxIdx !== null && React.createElement('div', { className: 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center', onClick: function() { setLightboxIdx(null); } },
      React.createElement('button', { onClick: function() { setLightboxIdx(null); }, className: 'absolute top-4 right-4 text-white text-2xl hover:opacity-70 z-10' }, '\u2715'),
      React.createElement('button', { onClick: function(e) { e.stopPropagation(); setLightboxIdx(lightboxIdx > 0 ? lightboxIdx - 1 : items.length - 1); }, className: 'absolute left-4 text-white text-3xl hover:opacity-70 z-10' }, '\u2039'),
      React.createElement('img', { src: items[lightboxIdx] ? items[lightboxIdx].url : '', className: 'max-w-[90vw] max-h-[85vh] object-contain', onClick: function(e) { e.stopPropagation(); } }),
      React.createElement('button', { onClick: function(e) { e.stopPropagation(); setLightboxIdx(lightboxIdx < items.length - 1 ? lightboxIdx + 1 : 0); }, className: 'absolute right-4 text-white text-3xl hover:opacity-70 z-10' }, '\u203a'),
      React.createElement('div', { className: 'absolute bottom-6 text-white text-sm' }, (lightboxIdx + 1) + ' / ' + items.length)
    )
  );
}

// --- CommunityView ---
function CommunityView() {
  var ctx = React.useContext(window.SF.AppContext);
  var state = ctx.state;
  var dispatch = ctx.dispatch;
  var _useState = React.useState;
  var textState = _useState('');
  var text = textState[0];
  var setText = textState[1];

  function handleSend() {
    if (!text.trim()) return;
    var now = new Date();
    var time = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
    dispatch({ type: 'ADD_COMMENT', item: { text: text.trim(), time: time } });
    setText('');
  }

  function handleDelete(idx) { dispatch({ type: 'DELETE_COMMENT', idx: idx }); }

  var items = state.data.community;

  return React.createElement('div', null,
    React.createElement(ModuleHeader, { tab: 'community' }),
    React.createElement('div', { className: 'bg-white/90 backdrop-blur-md rounded-card shadow-card p-4 mb-6' },
      React.createElement('div', { className: 'flex gap-3' },
        React.createElement('textarea', {
          value: text, onChange: function(e) { setText(e.target.value); },
          onKeyDown: function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } },
          placeholder: '写下你想对偶像说的话...', rows: 2,
          className: 'flex-1 px-4 py-2.5 border border-border-light rounded-btn text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none'
        }),
        React.createElement('button', {
          onClick: handleSend, disabled: !text.trim(),
          className: 'self-end px-6 py-2.5 bg-primary text-white rounded-btn font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        }, '发送')
      )
    ),
    items.length === 0
      ? React.createElement(EmptyState, { title: '还没有心语', desc: '写下你对偶像的爱意，记录每一份心动' })
      : React.createElement('div', { className: 'max-w-2xl space-y-4' },
          [].concat(items).reverse().map(function(item, i) {
            var msgText = typeof item === 'object' ? item.text : item;
            var msgTime = typeof item === 'object' ? item.time : '';
            var origIdx = items.length - 1 - i;
            return React.createElement('div', { key: i, className: 'flex gap-3 group' },
              React.createElement('div', { className: 'w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-lg flex-shrink-0' },
                React.createElement('span', null, '心')
              ),
              React.createElement('div', { className: 'flex-1' },
                React.createElement('div', { className: 'bg-white/90 backdrop-blur-md rounded-2xl rounded-tl-sm shadow-card p-4' },
                  React.createElement('p', { className: 'text-sm text-text-main leading-relaxed' }, msgText)
                ),
                React.createElement('div', { className: 'flex items-center gap-3 mt-1.5' },
                  React.createElement('span', { className: 'text-xs text-text-sub' }, msgTime),
                  React.createElement('button', { onClick: function() { handleDelete(origIdx); }, className: 'text-xs text-red-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500' }, '删除')
                )
              )
            );
          })
        )
  );
}

// --- CalendarView ---
function CalendarView() {
  var ctx = React.useContext(window.SF.AppContext);
  var state = ctx.state;
  var dispatch = ctx.dispatch;
  var _useState = React.useState;
  var showEditorState = _useState(false);
  var showEditor = showEditorState[0];
  var setShowEditor = showEditorState[1];
  var formState = _useState({ name: '', date: new Date().toISOString().slice(0,10), venue: '', desc: '', type: 'concert' });
  var form = formState[0];
  var setForm = formState[1];
  var viewModeState = _useState('calendar');
  var viewMode = viewModeState[0];
  var setViewMode = viewModeState[1];

  function handleSave() {
    if (!form.name) return;
    dispatch({ type: 'ADD_CALENDAR', item: Object.assign({}, form, { id: 'ev' + Date.now().toString(36), registered: false }) });
    setShowEditor(false); setForm({ name: '', date: new Date().toISOString().slice(0,10), venue: '', desc: '', type: 'concert' });
  }
  function handleDelete(id) { dispatch({ type: 'DELETE_CALENDAR', id: id }); }
  function handleToggleRegister(id) { dispatch({ type: 'TOGGLE_REGISTER', id: id }); }

  var typeLabels = { concert: '演唱会', 'fan-meet': '见面会', release: '发布', other: '其他' };
  var events = state.data.calendar;
  var calDate = state.calMonth;
  var year = calDate.getFullYear();
  var month = calDate.getMonth();
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var firstDay = new Date(year, month, 0).getDay();
  var selectedDateEvents = state.calSelected ? events.filter(function(e) { return e.date === state.calSelected; }) : [];
  var timelineEvents = [].concat(events).sort(function(a, b) { return a.date.localeCompare(b.date); });

  function MiniCalendar() {
    var days = [];
    for (var i = 0; i < firstDay; i++) days.push(null);
    for (var d = 1; d <= daysInMonth; d++) {
      var ds = year + '-' + String(month+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
      var hasEvent = events.some(function(e) { return e.date === ds; });
      var isSelected = state.calSelected === ds;
      var isToday = ds === new Date().toISOString().slice(0,10);
      days.push({ day: d, ds: ds, hasEvent: hasEvent, isSelected: isSelected, isToday: isToday });
    }

    return React.createElement('div', { className: 'bg-white/90 backdrop-blur-md rounded-card shadow-card p-5' },
      React.createElement('div', { className: 'flex items-center justify-between mb-4' },
        React.createElement('button', { onClick: function() { dispatch({ type: 'SET_CAL_MONTH', date: new Date(year, month - 1) }); }, className: 'text-text-sub hover:text-text-main text-lg' }, '\u2039'),
        React.createElement('h3', { className: 'text-base font-semibold text-text-main' }, year + '年' + (month + 1) + '月'),
        React.createElement('button', { onClick: function() { dispatch({ type: 'SET_CAL_MONTH', date: new Date(year, month + 1) }); }, className: 'text-text-sub hover:text-text-main text-lg' }, '\u203a')
      ),
      React.createElement('div', { className: 'grid grid-cols-7 gap-1 text-center text-xs text-text-sub mb-2' },
        ['日','一','二','三','四','五','六'].map(function(d) { return React.createElement('div', { key: d }, d); })
      ),
      React.createElement('div', { className: 'grid grid-cols-7 gap-1' },
        days.map(function(d, i) {
          return React.createElement('div', {
            key: i,
            onClick: function() { if (d) dispatch({ type: 'SET_CAL_SELECTED', date: d.ds }); },
            className: 'aspect-square flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all relative ' +
              (!d ? '' : d.isSelected ? 'bg-primary text-white font-semibold' : d.isToday ? 'bg-primary-light text-primary font-semibold' : 'hover:bg-gray-100 text-text-main') +
              (d && d.hasEvent ? ' font-semibold' : '')
          }, d ? d.day : '');
        })
      )
    );
  }

  return React.createElement('div', null,
    React.createElement(ModuleHeader, { tab: 'calendar', showEdit: true, onEdit: function() { setShowEditor(true); } }),

    showEditor && React.createElement('div', { className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm', onClick: function(e) { if (e.target === e.currentTarget) setShowEditor(false); } },
      React.createElement('div', { className: 'bg-white rounded-card shadow-2xl w-full max-w-md mx-4 p-6' },
        React.createElement('h3', { className: 'text-lg font-bold text-text-main mb-4' }, '新增活动'),
        React.createElement('div', { className: 'space-y-3' },
          React.createElement('input', { value: form.name, onChange: function(e) { setForm(Object.assign({}, form, { name: e.target.value })); }, placeholder: '活动名称', className: 'w-full px-4 py-2.5 border border-border-light rounded-btn text-sm focus:border-primary outline-none' }),
          React.createElement('input', { type: 'date', value: form.date, onChange: function(e) { setForm(Object.assign({}, form, { date: e.target.value })); }, className: 'w-full px-4 py-2.5 border border-border-light rounded-btn text-sm focus:border-primary outline-none' }),
          React.createElement('input', { value: form.venue, onChange: function(e) { setForm(Object.assign({}, form, { venue: e.target.value })); }, placeholder: '地点', className: 'w-full px-4 py-2.5 border border-border-light rounded-btn text-sm focus:border-primary outline-none' }),
          React.createElement('textarea', { value: form.desc, onChange: function(e) { setForm(Object.assign({}, form, { desc: e.target.value })); }, rows: 2, placeholder: '描述', className: 'w-full px-4 py-2.5 border border-border-light rounded-btn text-sm focus:border-primary outline-none resize-none' }),
          React.createElement('select', { value: form.type, onChange: function(e) { setForm(Object.assign({}, form, { type: e.target.value })); }, className: 'w-full px-4 py-2.5 border border-border-light rounded-btn text-sm focus:border-primary outline-none bg-white' },
            Object.entries(typeLabels).map(function(entry) { return React.createElement('option', { key: entry[0], value: entry[0] }, entry[1]); })
          )
        ),
        React.createElement('div', { className: 'flex gap-3 mt-6' },
          React.createElement('button', { onClick: handleSave, className: 'flex-1 py-2.5 bg-primary text-white rounded-btn font-medium hover:bg-primary-hover' }, '保存'),
          React.createElement('button', { onClick: function() { setShowEditor(false); }, className: 'flex-1 py-2.5 bg-gray-100 text-text-sub rounded-btn font-medium hover:bg-gray-200' }, '取消')
        )
      )
    ),

    events.length === 0
      ? React.createElement(EmptyState, { title: '还没有活动安排', desc: '记录偶像的演唱会、见面会等重要日程', action: '添加活动', onAction: function() { setShowEditor(true); } })
      : React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
          React.createElement('div', { className: 'lg:col-span-1' }, React.createElement(MiniCalendar)),
          React.createElement('div', { className: 'lg:col-span-2' },
            React.createElement('div', { className: 'flex gap-1 mb-4' },
              ['calendar', 'timeline'].map(function(m) {
                return React.createElement('button', {
                  key: m,
                  onClick: function() { setViewMode(m); if (m === 'calendar') dispatch({ type: 'SET_CAL_SELECTED', date: null }); },
                  className: 'px-4 py-1.5 rounded-btn text-xs font-medium transition-colors ' + (viewMode === m ? 'bg-primary text-white' : 'bg-gray-100 text-text-sub hover:bg-gray-200')
                }, m === 'calendar' ? '按日期' : '时间轴');
              })
            ),
            viewMode === 'calendar' && state.calSelected && React.createElement('div', { className: 'mb-4' },
              React.createElement('h4', { className: 'text-sm font-semibold text-text-main mb-2' }, state.calSelected + ' 的活动'),
              selectedDateEvents.length === 0
                ? React.createElement('p', { className: 'text-sm text-text-sub' }, '当天没有活动')
                : React.createElement('div', { className: 'space-y-2' },
                    selectedDateEvents.map(function(e) {
                      return React.createElement('div', { key: e.id, className: 'bg-white/90 backdrop-blur-md rounded-card shadow-card p-4 group' },
                        React.createElement('div', { className: 'flex items-center justify-between' },
                          React.createElement('div', null,
                            React.createElement('h5', { className: 'font-semibold text-text-main' }, e.name),
                            React.createElement('p', { className: 'text-xs text-text-sub mt-1' }, e.venue + (e.desc ? ' · ' + e.desc : ''))
                          ),
                          React.createElement('div', { className: 'flex items-center gap-2' },
                            React.createElement('button', {
                              onClick: function() { handleToggleRegister(e.id); },
                              className: 'text-xs px-3 py-1 rounded-full font-medium ' + (e.registered ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-text-sub')
                            }, e.registered ? '\u2713 已报名' : '报名'),
                            React.createElement('button', { onClick: function() { handleDelete(e.id); }, className: 'text-xs text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-500' }, '删除')
                          )
                        )
                      );
                    })
                  )
            ),
            viewMode === 'timeline' && React.createElement('div', { className: 'relative pl-8 border-l-2 border-primary-light space-y-6' },
              timelineEvents.map(function(e, i) {
                return React.createElement('div', { key: e.id, className: 'relative group' },
                  React.createElement('div', { className: 'absolute -left-[25px] w-3 h-3 rounded-full bg-primary border-2 border-white' }),
                  React.createElement(CardContainer, { onClick: null },
                    React.createElement('div', { className: 'flex items-center justify-between mb-2' },
                      React.createElement('span', { className: 'text-xs text-text-sub' }, e.date),
                      React.createElement('span', { className: 'text-xs px-2 py-0.5 bg-primary-light text-primary rounded-full' }, typeLabels[e.type] || e.type)
                    ),
                    React.createElement('h5', { className: 'font-semibold text-text-main' }, e.name),
                    React.createElement('p', { className: 'text-xs text-text-sub mt-1' }, e.venue + (e.desc ? ' · ' + e.desc : '')),
                    React.createElement('div', { className: 'flex items-center gap-2 mt-3 pt-3 border-t border-border-light' },
                      React.createElement('button', {
                        onClick: function() { handleToggleRegister(e.id); },
                        className: 'text-xs px-3 py-1 rounded-full font-medium ' + (e.registered ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-text-sub hover:bg-gray-200')
                      }, e.registered ? '\u2713 已报名' : '报名'),
                      React.createElement('button', { onClick: function() { handleDelete(e.id); }, className: 'text-xs text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-500' }, '删除')
                    )
                  )
                );
              })
            )
          )
        )
  );
}

// --- ShopView ---
function ShopView() {
  var ctx = React.useContext(window.SF.AppContext);
  var state = ctx.state;
  var dispatch = ctx.dispatch;
  var _useState = React.useState;
  var showEditorState = _useState(false);
  var showEditor = showEditorState[0];
  var setShowEditor = showEditorState[1];
  var formState = _useState({ name: '', emoji: '', cat: '周边', desc: '' });
  var form = formState[0];
  var setForm = formState[1];
  var imgState = _useState(null);
  var imageDataUrl = imgState[0];
  var setImageDataUrl = imgState[1];
  var filterState = _useState('全部');
  var filterCat = filterState[0];
  var setFilterCat = filterState[1];

  function handleSave() {
    if (!form.name) return;
    var id = 'sp' + Date.now().toString(36);
    var item = Object.assign({}, form, { id: id, image: '' });
    if (imageDataUrl) {
      AssetDB.save('shop_' + id, imageDataUrl).then(function() { item.image = imageDataUrl; dispatch({ type: 'ADD_SHOP', item: item }); });
    } else {
      dispatch({ type: 'ADD_SHOP', item: item });
    }
    setShowEditor(false); setForm({ name: '', emoji: '', cat: '周边', desc: '' }); setImageDataUrl(null);
  }

  function handleImageUpload(e) {
    var file = e.target.files ? e.target.files[0] : null;
    if (!file || file.size > 50*1024*1024) return;
    var reader = new FileReader();
    reader.onload = function(ev) { setImageDataUrl(ev.target.result); };
    reader.readAsDataURL(file);
  }

  function handleDelete(id) { AssetDB.delete('shop_' + id); dispatch({ type: 'DELETE_SHOP', id: id }); }

  var cats = ['全部', '周边', '专辑', '服饰', '配饰'];
  var filtered = filterCat === '全部' ? state.data.shop : state.data.shop.filter(function(s) { return s.cat === filterCat; });

  return React.createElement('div', null,
    React.createElement(ModuleHeader, { tab: 'shop', showEdit: true, onEdit: function() { setShowEditor(true); } }),

    showEditor && React.createElement('div', { className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm', onClick: function(e) { if (e.target === e.currentTarget) setShowEditor(false); } },
      React.createElement('div', { className: 'bg-white rounded-card shadow-2xl w-full max-w-md mx-4 p-6' },
        React.createElement('h3', { className: 'text-lg font-bold text-text-main mb-4' }, '添加收藏'),
        React.createElement('div', { className: 'space-y-3' },
          React.createElement('input', { value: form.name, onChange: function(e) { setForm(Object.assign({}, form, { name: e.target.value })); }, placeholder: '收藏名称', className: 'w-full px-4 py-2.5 border border-border-light rounded-btn text-sm focus:border-primary outline-none' }),
          React.createElement('input', { value: form.emoji, onChange: function(e) { setForm(Object.assign({}, form, { emoji: e.target.value })); }, placeholder: '图标文字', className: 'w-full px-4 py-2.5 border border-border-light rounded-btn text-sm focus:border-primary outline-none' }),
          React.createElement('select', { value: form.cat, onChange: function(e) { setForm(Object.assign({}, form, { cat: e.target.value })); }, className: 'w-full px-4 py-2.5 border border-border-light rounded-btn text-sm focus:border-primary outline-none bg-white' },
            ['周边','专辑','服饰','配饰'].map(function(c) { return React.createElement('option', { key: c, value: c }, c); })
          ),
          React.createElement('textarea', { value: form.desc, onChange: function(e) { setForm(Object.assign({}, form, { desc: e.target.value })); }, rows: 2, placeholder: '心得备注', className: 'w-full px-4 py-2.5 border border-border-light rounded-btn text-sm focus:border-primary outline-none resize-none' }),
          React.createElement('input', { type: 'file', accept: 'image/*', onChange: handleImageUpload, className: 'w-full text-sm' }),
          imageDataUrl && React.createElement('img', { src: imageDataUrl, className: 'w-full h-32 object-cover rounded-lg' })
        ),
        React.createElement('div', { className: 'flex gap-3 mt-6' },
          React.createElement('button', { onClick: handleSave, className: 'flex-1 py-2.5 bg-primary text-white rounded-btn font-medium hover:bg-primary-hover' }, '保存'),
          React.createElement('button', { onClick: function() { setShowEditor(false); }, className: 'flex-1 py-2.5 bg-gray-100 text-text-sub rounded-btn font-medium hover:bg-gray-200' }, '取消')
        )
      )
    ),

    state.data.shop.length > 0 && React.createElement('div', { className: 'flex gap-2 mb-4 flex-wrap' },
      cats.map(function(c) {
        return React.createElement('button', {
          key: c, onClick: function() { setFilterCat(c); },
          className: 'px-4 py-1.5 rounded-full text-xs font-medium transition-colors ' + (filterCat === c ? 'bg-primary text-white' : 'bg-gray-100 text-text-sub hover:bg-gray-200')
        }, c);
      })
    ),

    state.data.shop.length === 0
      ? React.createElement(EmptyState, { title: '还没有周边收藏', desc: '记录你收藏的偶像周边，打造专属小柜', action: '添加收藏', onAction: function() { setShowEditor(true); } })
      : React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4' },
          filtered.map(function(item) {
            return React.createElement(CardContainer, { key: item.id, onClick: null, className: 'group text-center' },
              React.createElement('div', { className: 'w-full h-36 bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden' },
                item.image
                  ? React.createElement('img', { src: item.image, className: 'w-full h-full object-cover' })
                  : React.createElement('span', { className: 'text-4xl text-text-sub' }, item.emoji || '图')
              ),
              React.createElement('h5', { className: 'font-semibold text-sm text-text-main' }, item.name),
              React.createElement('p', { className: 'text-xs text-text-sub mt-1' }, (item.desc || '').slice(0, 20)),
              React.createElement('span', { className: 'text-[10px] px-2 py-0.5 bg-primary-light text-primary rounded-full mt-2 inline-block' }, item.cat),
              React.createElement('button', { onClick: function() { handleDelete(item.id); }, className: 'block mx-auto mt-2 text-xs text-red-300 opacity-0 group-hover:opacity-100 hover:text-red-500' }, '删除')
            );
          })
        )
  );
}

// --- Dashboard ---
function Dashboard() {
  var ctx = React.useContext(window.SF.AppContext);
  var state = ctx.state;
  var dispatch = ctx.dispatch;
  var tabs = ['celebrity', 'news', 'gallery', 'community', 'calendar', 'shop'];

  // 活动倒计时计算
  var today = new Date();
  today.setHours(0,0,0,0);
  var upcoming = [].concat(state.data.calendar)
    .filter(function(e) { return e.date && new Date(e.date) >= today; })
    .sort(function(a,b) { return new Date(a.date) - new Date(b.date); });

  // 按日期分组
  var dateGroups = [];
  upcoming.forEach(function(e) {
    var last = dateGroups[dateGroups.length - 1];
    if (last && last.date === e.date) {
      last.events.push(e);
    } else {
      dateGroups.push({ date: e.date, events: [e] });
    }
  });
  // 取最近 3 组
  dateGroups = dateGroups.slice(0, 3);

  function daysUntil(dateStr) {
    var d = new Date(dateStr);
    d.setHours(0,0,0,0);
    return Math.ceil((d - today) / 86400000);
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr);
    return (d.getMonth()+1) + '月' + d.getDate() + '日';
  }

  function typeLabel(t) {
    return t === '演唱会' ? '演唱会' : t === '见面会' ? '见面会' : t === '发布' ? '发布活动' : '活动';
  }

  return React.createElement('div', null,
    // Celebrity Card
    React.createElement(CardContainer, { className: 'mb-6 !p-0 overflow-hidden' },
      React.createElement('div', { className: 'h-24 bg-gradient-to-r from-primary to-purple-400' }),
      React.createElement('div', { className: 'px-6 pb-6 -mt-10 flex items-end gap-4' },
        React.createElement('img', {
          src: state.data.celebrity.avatar || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23E8DEF8" width="100" height="100" rx="50"/><text x="50" y="55" text-anchor="middle" fill="%237C5CFC" font-size="40">★</text></svg>',
          className: 'w-20 h-20 rounded-full border-4 border-white shadow-md object-cover'
        }),
        React.createElement('div', null,
          React.createElement('h2', { className: 'text-xl font-bold text-text-main' }, state.data.celebrity.name || '未设置偶像'),
          React.createElement('p', { className: 'text-sm text-text-sub' }, (state.data.celebrity.bio || '').slice(0, 50) || '')
        )
      ),
      React.createElement('div', { className: 'px-6 pb-4 flex gap-4' },
        [
          { label: '追忆', val: state.data.news.length },
          { label: '照片', val: state.data.gallery.length },
          { label: '心语', val: state.data.community.length },
          { label: '活动', val: state.data.calendar.length },
          { label: '收藏', val: state.data.shop.length },
        ].map(function(s) {
          return React.createElement('div', { key: s.label, className: 'text-center' },
            React.createElement('div', { className: 'text-lg font-bold text-primary' }, s.val),
            React.createElement('div', { className: 'text-[10px] text-text-sub' }, s.label)
          );
        })
      )
    ),
    // Module Grid
    React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' },
      tabs.map(function(tab) { return React.createElement(ModuleCard, { key: tab, tab: tab, data: state.data }); })
    ),
    // 活动倒计时
    dateGroups.length > 0 && React.createElement('div', { className: 'mt-6' },
      React.createElement('h3', { className: 'text-base font-semibold text-text-main mb-4' }, '即将到来的活动'),
      React.createElement('div', { className: 'space-y-3' },
        dateGroups.map(function(group) {
          var days = daysUntil(group.date);
          var isToday = days === 0;
          var isTomorrow = days === 1;
          var label = isToday ? '就是今天！' : isTomorrow ? '明天' : '倒计时 ' + days + ' 天';
          return React.createElement(CardContainer, { key: group.date, className: '!bg-gradient-to-r from-primary-light/50 to-white/90' },
            React.createElement('div', { className: 'flex items-center gap-4' },
              React.createElement('div', { className: 'text-center min-w-[60px]' },
                React.createElement('div', { className: 'text-2xl font-bold ' + (isToday ? 'text-accent-pink' : isTomorrow ? 'text-accent-amber' : 'text-primary') }, isToday ? '今天' : isTomorrow ? '1' : String(days)),
                React.createElement('div', { className: 'text-[10px] text-text-sub' }, isToday ? '' : isTomorrow ? '天' : '天')
              ),
              React.createElement('div', { className: 'flex-1' },
                React.createElement('div', { className: 'text-xs text-text-sub' }, formatDate(group.date)),
                React.createElement('div', { className: 'mt-1 space-y-0.5' },
                  group.events.map(function(e, i) {
                    return React.createElement('div', { key: i, className: 'text-sm font-medium text-text-main flex items-center gap-2' },
                      React.createElement('span', { className: 'inline-block w-1.5 h-1.5 rounded-full bg-primary' }),
                      e.title || typeLabel(e.type),
                      React.createElement('span', { className: 'text-[10px] text-text-sub' }, typeLabel(e.type))
                    );
                  })
                )
              ),
              React.createElement('button', {
                onClick: function() { dispatch({ type: 'SET_TAB', tab: 'calendar' }); },
                className: 'text-xs text-primary hover:underline shrink-0'
              }, '查看日历')
            )
          );
        })
      )
    )
  );
}
