// StarFan React Main — App component, initialization, mount

function App() {
  var stateDispatch = React.useReducer(window.SF.reducer, window.SF.initialState);
  var state = stateDispatch[0];
  var dispatch = stateDispatch[1];
  var loadedState = React.useState(false);
  var loaded = loadedState[0];
  var setLoaded = loadedState[1];
  var errorState = React.useState(null);
  var initError = errorState[0];
  var setInitError = errorState[1];

  // 初始化：加载数据
  React.useEffect(function() {
    (async function() {
      try {
        await AppState.init();
        dispatch({ type: 'LOAD_DATA', data: AppState.data });

        var opts = JSON.parse(localStorage.getItem(SiteManager.optsKey()) || '{}');
        if (opts.template) dispatch({ type: 'SET_TEMPLATE', id: opts.template });
        if (opts.effects) opts.effects.forEach(function(e) { dispatch({ type: 'TOGGLE_EFFECT', id: e }); });
        if (opts.paid) dispatch({ type: 'SET_PAID', list: opts.paid });

        if (typeof BackgroundFX !== 'undefined') {
          BackgroundFX.init();
          BackgroundFX.setType(AppState.data.celebrity.bgType || 'stars');
        }

        if (typeof LivePreview !== 'undefined') LivePreview.init();
        if (typeof TemplateStore !== 'undefined') TemplateStore.init();
        if (typeof UpdateNotifier !== 'undefined') UpdateNotifier.init();

        if (window._isNewUser) {
          setTimeout(function() {
            try { if (typeof Tutorial !== 'undefined') Tutorial.init(); }
            catch(e) { console.warn('教程初始化失败:', e); }
          }, 500);
        }

        setLoaded(true);
      } catch (err) {
        console.error('初始化失败:', err);
        setInitError(err && err.message ? err.message : '应用初始化失败，请刷新重试');
      }
    })();
  }, []);

  // 数据变更时自动保存
  React.useEffect(function() {
    if (!loaded) return;
    AppState.data = state.data;
    AppState.currentTab = state.activeTab;
    AppState.save();

    var opts = {
      template: state.selectedTemplate,
      effects: state.selectedEffects,
      paid: state.paidItems
    };
    localStorage.setItem(SiteManager.optsKey(), JSON.stringify(opts));
    if (typeof TemplateStore !== 'undefined') {
      TemplateStore.selectedTemplate = state.selectedTemplate;
      TemplateStore.selectedEffects = state.selectedEffects;
      TemplateStore.paidItems = state.paidItems;
      TemplateStore.save();
    }
  }, [state.data, state.selectedTemplate, state.selectedEffects, state.paidItems, loaded]);

  // 导出全局状态给外部模块
  React.useEffect(function() {
    window._reactState = state;
    window._reactDispatch = dispatch;
  }, [state]);

  if (!loaded) {
    return React.createElement('div', { className: 'flex items-center justify-center min-h-screen' },
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', { className: 'text-4xl mb-4 animate-bounce' }, '\u2605'),
        React.createElement('p', { className: 'text-text-sub' }, 'StarFan Studio 加载中...'),
        initError && React.createElement('div', { className: 'mt-4 p-4 bg-red-50 rounded-card max-w-sm mx-auto' },
          React.createElement('p', { className: 'text-sm text-red-500 font-medium' }, '初始化出错'),
          React.createElement('p', { className: 'text-xs text-red-400 mt-1' }, initError),
          React.createElement('button', {
            onClick: function() { location.reload(); },
            className: 'mt-3 px-4 py-2 bg-red-500 text-white rounded-btn text-xs font-medium hover:bg-red-600'
          }, '刷新重试')
        )
      )
    );
  }

  var showRightPanel = state.activeTab === 'dashboard';

  function renderContent() {
    switch (state.activeTab) {
      case 'dashboard': return React.createElement(Dashboard);
      case 'celebrity': return React.createElement(CelebrityView);
      case 'news': return React.createElement(NewsView);
      case 'gallery': return React.createElement(GalleryView);
      case 'community': return React.createElement(CommunityView);
      case 'calendar': return React.createElement(CalendarView);
      case 'shop': return React.createElement(ShopView);
      default: return React.createElement(Dashboard);
    }
  }

  return React.createElement(
    window.SF.AppContext.Provider,
    { value: { state: state, dispatch: dispatch } },
    React.createElement('div', { className: 'flex min-h-screen' },
      React.createElement(Sidebar),
      React.createElement('main', { className: 'flex-1 p-6 md:p-8 pb-24' + (showRightPanel ? '' : ' max-w-6xl mx-auto w-full') },
        renderContent()
      ),
      showRightPanel ? React.createElement(RightPanel) : null
    ),
    React.createElement('div', { id: 'sitePanel' }),
    React.createElement('div', { id: 'updateNotice' }),
    // 追忆详情弹窗（复用原版 DOM 类名）
    React.createElement('div', {
      className: 'memoir-overlay hidden', id: 'memoirOverlay',
      onClick: function(e) { if (e.target === e.currentTarget && typeof Events !== 'undefined') Events.closeMemoir(); }
    },
      React.createElement('div', { className: 'memoir-modal', style: { position: 'relative' } },
        React.createElement('button', { className: 'memoir-close', onClick: function() { if (typeof Events !== 'undefined') Events.closeMemoir(); } }, '\u2715'),
        React.createElement('div', { className: 'memoir-header' },
          React.createElement('h3', { id: 'memoirTitle' }),
          React.createElement('div', { className: 'memoir-meta', id: 'memoirMeta' })
        ),
        React.createElement('div', { className: 'memoir-body', id: 'memoirBody' })
      )
    ),
    React.createElement('div', { className: 'memoir-img-lightbox hidden', id: 'memoirLightbox', onClick: function(e) { e.currentTarget.classList.remove('show'); } },
      React.createElement('img', { id: 'memoirLightboxImg', src: '' })
    )
  );
}

// 挂载
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
