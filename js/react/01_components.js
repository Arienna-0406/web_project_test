// StarFan React Components — CardContainer, EmptyState, ModuleCard, ModuleHeader, Sidebar, RightPanel

// --- Card 容器 ---
function CardContainer(props) {
  return React.createElement('div', {
    className: 'bg-white/90 backdrop-blur-md rounded-card shadow-card p-6 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-card-hover ' + (props.className || ''),
    onClick: props.onClick
  }, props.children);
}

// --- 空状态 ---
function EmptyState(props) {
  return React.createElement('div', { className: 'flex flex-col items-center justify-center py-16 text-center' },
    React.createElement('div', { className: 'w-20 h-20 rounded-full bg-primary-light flex items-center justify-center mb-4' },
      React.createElement('span', { className: 'text-3xl' }, props.icon || '')
    ),
    React.createElement('h3', { className: 'text-lg font-semibold text-text-main mb-2' }, props.title),
    React.createElement('p', { className: 'text-sm text-text-sub mb-6 max-w-xs' }, props.desc),
    props.action && React.createElement('button', {
      onClick: props.onAction,
      className: 'px-6 py-2.5 bg-primary text-white rounded-btn font-medium hover:bg-primary-hover transition-colors'
    }, props.action)
  );
}

// --- 模块卡片（Dashboard 网格用） ---
function ModuleCard(props) {
  var tab = props.tab;
  var data = props.data;
  var color = window.SF.moduleColors[tab];
  var dispatch = React.useContext(window.SF.AppContext).dispatch;

  function getPreview() {
    switch (tab) {
      case 'celebrity':
        if (data.celebrity.name) return React.createElement('span', { className: 'text-sm font-semibold text-text-main' }, data.celebrity.name);
        return React.createElement('span', { className: 'text-sm text-text-sub italic' }, '点击编辑偶像信息');
      case 'news':
        return data.news.length
          ? React.createElement('span', { className: 'inline-block text-xs font-semibold text-primary bg-primary-light px-3 py-1 rounded-full' }, data.news.length + ' 条追忆')
          : React.createElement('span', { className: 'text-sm text-text-sub italic' }, '还没有追忆记录');
      case 'gallery':
        return data.gallery.length
          ? React.createElement('div', { className: 'flex gap-1.5 mt-1' },
              data.gallery.slice(0,4).map(function(g,i) { return React.createElement('img', { key: i, src: g.url, className: 'w-10 h-10 rounded-lg object-cover border-2 border-white shadow-sm' }); }),
              React.createElement('span', { className: 'text-xs text-text-sub self-center ml-1' }, '+' + data.gallery.length)
            )
          : React.createElement('span', { className: 'text-sm text-text-sub italic' }, '还没有照片');
      case 'community':
        return data.community.length
          ? React.createElement('span', { className: 'inline-block text-xs font-semibold text-primary bg-primary-light px-3 py-1 rounded-full' }, data.community.length + ' 条心语')
          : React.createElement('span', { className: 'text-sm text-text-sub italic' }, '还没有心语');
      case 'calendar':
        var up = data.calendar.filter(function(e) { return e.date >= new Date().toISOString().slice(0,10); }).length;
        return data.calendar.length
          ? React.createElement('span', { className: 'text-xs text-text-sub' }, data.calendar.length + ' 个活动' + (up ? '（' + up + ' 场待举办）' : ''))
          : React.createElement('span', { className: 'text-sm text-text-sub italic' }, '还没有活动安排');
      case 'shop':
        return data.shop.length
          ? React.createElement('span', { className: 'inline-block text-xs font-semibold text-primary bg-primary-light px-3 py-1 rounded-full' }, data.shop.length + ' 件收藏')
          : React.createElement('span', { className: 'text-sm text-text-sub italic' }, '还没有周边收藏');
    }
  }

  return React.createElement(CardContainer, {
    onClick: function() { dispatch({ type: 'SET_TAB', tab: tab }); },
    className: 'group'
  },
    React.createElement('div', { className: 'flex items-center gap-3 mb-3' },
      React.createElement('div', null,
        React.createElement('div', { className: 'font-semibold text-base text-text-main' }, window.SF.moduleTitles[tab]),
        React.createElement('div', { className: 'text-xs text-text-sub' }, window.SF.moduleDescs[tab])
      )
    ),
    React.createElement('div', { className: 'min-h-[32px]' }, getPreview())
  );
}

// --- 模块页头 ---
function ModuleHeader(props) {
  return React.createElement('div', { className: 'flex items-center justify-between mb-6' },
    React.createElement('div', null,
      React.createElement('h2', { className: 'text-2xl font-bold text-text-main' }, window.SF.moduleTitles[props.tab]),
      React.createElement('p', { className: 'text-sm text-text-sub mt-1' }, window.SF.moduleDescs[props.tab])
    ),
    props.showEdit && props.onEdit && React.createElement('button', {
      onClick: props.onEdit,
      className: 'px-5 py-2.5 bg-primary text-white rounded-btn text-sm font-medium hover:bg-primary-hover transition-colors'
    }, props.btnText || '+ 新增')
  );
}

// --- Sidebar ---
function Sidebar() {
  var ctx = React.useContext(window.SF.AppContext);
  var state = ctx.state;
  var dispatch = ctx.dispatch;
  var tabs = ['dashboard', 'celebrity', 'news', 'gallery', 'community', 'calendar', 'shop'];

  return React.createElement('aside', { id: 'app-sidebar', className: 'w-[220px] min-w-[220px] h-screen sticky top-0 bg-white/90 backdrop-blur-md border-r border-border-light shadow-sidebar flex flex-col z-10' },
    // Logo
    React.createElement('div', { className: 'p-6 pb-4' },
      React.createElement('h1', { className: 'text-xl font-bold text-primary tracking-tight' }, state.data.celebrity.siteName || 'StarFan Studio'),
      React.createElement('p', { className: 'text-xs text-text-sub mt-1' }, '爱豆回忆录生成器')
    ),
    // 导航
    React.createElement('nav', { className: 'flex-1 px-3 space-y-0.5 overflow-y-auto' },
      tabs.map(function(tab) {
        return React.createElement('button', {
          id: 'nav-' + tab,
          key: tab,
          onClick: function() { dispatch({ type: 'SET_TAB', tab: tab }); },
          className: 'w-full flex items-center gap-3 px-4 py-2.5 rounded-btn text-sm font-medium transition-all duration-200 ' +
            (state.activeTab === tab ? 'bg-primary-light text-primary font-semibold' : 'text-text-sub hover:bg-gray-50 hover:text-text-main')
        }, tab === 'dashboard' ? '首页' : window.SF.moduleTitles[tab]);
      })
    ),
    // 操作按钮
    React.createElement('div', { id: 'sidebar-actions', className: 'p-3 border-t border-border-light space-y-2' },
      React.createElement('button', { onClick: function() { if (typeof SiteUI !== 'undefined') SiteUI.toggle(); }, className: 'w-full px-4 py-2 text-sm text-text-sub bg-gray-50 hover:bg-gray-100 rounded-btn transition-colors text-left' }, '切换粉丝站'),
      React.createElement('button', { onClick: function() { if (typeof TemplateStore !== 'undefined') TemplateStore.showMarketPanel(); }, className: 'w-full px-4 py-2 text-sm text-text-sub bg-gray-50 hover:bg-gray-100 rounded-btn transition-colors text-left' }, '更多模板与特效'),
      React.createElement('button', { onClick: function() { if (typeof Exporter !== 'undefined') Exporter.exportReadOnly(); }, className: 'w-full px-4 py-2 text-sm bg-primary text-white hover:bg-primary-hover rounded-btn transition-colors font-medium' }, '导出展示版')
    ),
    // 底部
    React.createElement('div', { className: 'p-4 text-center' },
      React.createElement('p', { className: 'text-[10px] text-text-sub' }, '用 StarFan Studio 记录偶像的每一个精彩瞬间')
    )
  );
}

// --- RightPanel (Dashboard 仪表盘右侧) ---
function RightPanel() {
  var state = React.useContext(window.SF.AppContext).state;
  var d = state.data;

  var stats = [
    { label: '追忆记录', value: d.news.length },
    { label: '珍藏照片', value: d.gallery.length },
    { label: '粉丝心语', value: d.community.length },
    { label: '活动安排', value: d.calendar.length },
    { label: '周边收藏', value: d.shop.length },
  ];

  var recentItems = [].concat(
    d.news.slice(-3).map(function(n) { return { text: n.title || '追忆', time: n.date }; }),
    d.community.slice(-3).map(function(c) { return { text: (typeof c === 'object' ? c.text : c) ? (typeof c === 'object' ? c.text : c).slice(0,20) : '心语', time: (typeof c === 'object' ? c.time : '') }; })
  ).slice(-5).reverse();

  return React.createElement('aside', { id: 'app-right-panel', className: 'w-[280px] min-w-[280px] h-screen sticky top-0 overflow-y-auto p-5 space-y-5 border-l border-border-light bg-white/90 backdrop-blur-md' },
    // 数据统计
    React.createElement('div', { className: 'bg-white/90 backdrop-blur-md rounded-card shadow-card p-5' },
      React.createElement('h3', { className: 'text-sm font-semibold text-text-main mb-4' }, '数据总览'),
      React.createElement('div', { className: 'space-y-3' },
        stats.map(function(s) {
          return React.createElement('div', { key: s.label, className: 'flex items-center justify-between' },
            React.createElement('span', { className: 'text-sm text-text-sub' }, s.label),
            React.createElement('span', { className: 'text-sm font-semibold text-primary bg-primary-light px-2.5 py-0.5 rounded-full' }, s.value)
          );
        })
      )
    ),
    // 最近动态
    recentItems.length > 0 && React.createElement('div', { className: 'bg-white/90 backdrop-blur-md rounded-card shadow-card p-5' },
      React.createElement('h3', { className: 'text-sm font-semibold text-text-main mb-4' }, '最近动态'),
      React.createElement('div', { className: 'space-y-3' },
        recentItems.map(function(item, i) {
          return React.createElement('div', { key: i, className: 'flex items-start gap-2' },
            React.createElement('div', null,
              React.createElement('p', { className: 'text-xs text-text-main leading-relaxed' }, item.text),
              item.time && React.createElement('p', { className: 'text-[10px] text-text-sub' }, item.time)
            )
          );
        })
      )
    ),
    // AI 助手
    React.createElement('div', { className: 'bg-gradient-to-br from-primary-light to-white rounded-card shadow-card p-5' },
      React.createElement('h3', { className: 'text-sm font-semibold text-text-main mb-2' }, 'AI 助手'),
      React.createElement('p', { className: 'text-xs text-text-sub mb-3' }, '试试让我帮你写偶像简介、生成图注~'),
      React.createElement('button', {
        onClick: function() {},
        className: 'w-full px-4 py-2 text-sm bg-primary text-white rounded-btn hover:bg-primary-hover transition-colors font-medium'
      }, '开始使用 AI')
    )
  );
}
