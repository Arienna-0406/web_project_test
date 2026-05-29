// StarFan React Core — shared data, reducer, context
window.SF = window.SF || {};

window.SF.moduleColors = {
  celebrity: 'accent-pink', news: 'accent-amber', gallery: 'accent-sky',
  community: 'accent-purple', calendar: 'accent-green', shop: 'accent-rose'
};
window.SF.moduleTitles = {
  celebrity: '偶像资料', news: '追忆时光', gallery: '照片画廊',
  community: '粉丝心语', calendar: '活动日历', shop: '周边收藏'
};
window.SF.moduleDescs = {
  celebrity: '名字、头像、简介', news: '记录每一次心动', gallery: '珍藏影像瞬间',
  community: '记录每一份心情', calendar: '演唱会与见面会', shop: '我的周边小柜'
};
window.SF.catLabels = { '周边': '周边', '专辑': '专辑', '服饰': '服饰', '配饰': '配饰' };

window.SF.initialState = {
  activeTab: 'dashboard',
  data: {
    celebrity: { siteName: '', name: '', colors: '淡蓝+金色', bio: '', avatar: '', social: { weibo: '' }, bgType: 'stars' },
    news: [], gallery: [], community: [], calendar: [], shop: []
  },
  paidItems: [], selectedTemplate: 'default', selectedEffects: [],
  modal: null, modalData: null, viewMode: 'grid',
  calMonth: new Date(), calSelected: null,
  editingNews: null, newsCover: null, editingShop: null, shopImage: null,
  isPreview: false,
};

window.SF.reducer = function(state, action) {
  switch (action.type) {
    case 'SET_TAB': return { ...state, activeTab: action.tab };
    case 'LOAD_DATA': return { ...state, data: action.data };
    case 'UPDATE_CELEBRITY': return { ...state, data: { ...state.data, celebrity: { ...state.data.celebrity, ...action.payload } } };
    case 'SET_CELEBRITY': return { ...state, data: { ...state.data, celebrity: action.payload } };
    case 'ADD_NEWS': return { ...state, data: { ...state.data, news: [...state.data.news, action.item] } };
    case 'UPDATE_NEWS': return { ...state, data: { ...state.data, news: state.data.news.map(function(n) { return n.id === action.item.id ? action.item : n; }) } };
    case 'DELETE_NEWS': return { ...state, data: { ...state.data, news: state.data.news.filter(function(n) { return n.id !== action.id; }) } };
    case 'SET_GALLERY': return { ...state, data: { ...state.data, gallery: action.list } };
    case 'DELETE_GALLERY': return { ...state, data: { ...state.data, gallery: state.data.gallery.filter(function(g) { return g.id !== action.id; }) } };
    case 'UPDATE_GALLERY_CAPTION': return { ...state, data: { ...state.data, gallery: state.data.gallery.map(function(g) { return g.id === action.id ? { ...g, caption: action.caption } : g; }) } };
    case 'ADD_COMMENT': return { ...state, data: { ...state.data, community: [...state.data.community, action.item] } };
    case 'DELETE_COMMENT': return { ...state, data: { ...state.data, community: state.data.community.filter(function(_, i) { return i !== action.idx; }) } };
    case 'SET_CALENDAR': return { ...state, data: { ...state.data, calendar: action.list } };
    case 'ADD_CALENDAR': return { ...state, data: { ...state.data, calendar: [...state.data.calendar, action.item] } };
    case 'DELETE_CALENDAR': return { ...state, data: { ...state.data, calendar: state.data.calendar.filter(function(e) { return e.id !== action.id; }) } };
    case 'TOGGLE_REGISTER': return { ...state, data: { ...state.data, calendar: state.data.calendar.map(function(e) { return e.id === action.id ? { ...e, registered: !e.registered } : e; }) } };
    case 'SET_SHOP': return { ...state, data: { ...state.data, shop: action.list } };
    case 'ADD_SHOP': return { ...state, data: { ...state.data, shop: [...state.data.shop, action.item] } };
    case 'DELETE_SHOP': return { ...state, data: { ...state.data, shop: state.data.shop.filter(function(s) { return s.id !== action.id; }) } };
    case 'SET_PAID': return { ...state, paidItems: action.list };
    case 'PAY_ITEM': return { ...state, paidItems: [...state.paidItems, action.id] };
    case 'SET_TEMPLATE': return { ...state, selectedTemplate: action.id };
    case 'TOGGLE_EFFECT':
      var eid = action.id;
      var fx = state.selectedEffects.includes(eid) ? state.selectedEffects.filter(function(e) { return e !== eid; }) : [...state.selectedEffects, eid];
      return { ...state, selectedEffects: fx };
    case 'SET_MODAL': return { ...state, modal: action.modal, modalData: action.data || null };
    case 'SET_VIEW_MODE': return { ...state, viewMode: action.mode };
    case 'SET_CAL_MONTH': return { ...state, calMonth: action.date };
    case 'SET_CAL_SELECTED': return { ...state, calSelected: action.date };
    case 'SET_EDITING_NEWS': return { ...state, editingNews: action.item, newsCover: null };
    case 'SET_SHOP_EDIT': return { ...state, editingShop: action.item, shopImage: null };
    case 'SET_IS_PREVIEW': return { ...state, isPreview: action.val };
    case 'SET_DATA': return { ...state, data: action.data };
    default: return state;
  }
};

window.SF.AppContext = React.createContext(null);
