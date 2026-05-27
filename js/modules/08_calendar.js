// ===== CalendarModule Module =====
// Part of StarFan Studio v2.3

// ================= 🗓 活动日历模块 (CalendarModule) =================
const CalendarModule = {
  viewDate: new Date(),
  selectedDate: null,
  render(box, events) {
    const now = new Date();
    const y = this.viewDate.getFullYear();
    const m = this.viewDate.getMonth();
    const monthNames = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
    const dayNames = ['日','一','二','三','四','五','六'];
    // 计算日历格子
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    const daysInPrev = new Date(y, m, 0).getDate();
    let cells = '';
    // 上月补位
    for(let i = firstDay-1; i>=0; i--) {
      cells += `<div class="cal-cell other-month"><div class="cal-date">${daysInPrev-i}</div></div>`;
    }
    // 本月
    for(let d=1; d<=daysInMonth; d++) {
      const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const isToday = now.getFullYear()===y && now.getMonth()===m && now.getDate()===d;
      const isSel = this.selectedDate === dateStr;
      const dayEvents = events.filter(e=>e.date===dateStr);
      cells += `<div class="cal-cell${isToday?' today':''}${isSel?' selected':''}" onclick="CalendarModule.selectDate('${dateStr}')">
        <div class="cal-date">${d}</div>
        ${dayEvents.map(()=>`<span class="cal-dot"></span>`).join('')}
      </div>`;
    }
    // 下月补位
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    let nextD = 1;
    for(let i = firstDay + daysInMonth; i < totalCells; i++) {
      cells += `<div class="cal-cell other-month"><div class="cal-date">${nextD++}</div></div>`;
    }
    // 过滤显示的活动列表
    const listEvents = this.selectedDate
      ? events.filter(e=>e.date===this.selectedDate)
      : events.sort((a,b)=>a.date.localeCompare(b.date));
    const tagLabel = {concert:'演唱会','fan-meet':'见面会',release:'新专发布',other:'其他活动'};
    box.innerHTML = `
      <div class="section-header">
        <h2>活动日历</h2>
        <div style="display:flex;gap:8px;">
          ${this.selectedDate?`<button class="inline-btn" onclick="CalendarModule.clearSelect()">📋 全部活动</button>`:''}
          <button class="inline-btn" onclick="Events.openEditorFor('calendar')">➕ 添加活动</button>
        </div>
      </div>
      <div class="calendar-wrap">
        <div class="cal-header">
          <button class="cal-nav" onclick="CalendarModule.prevMonth()">‹</button>
          <h3>${y}年 ${monthNames[m]}</h3>
          <button class="cal-nav" onclick="CalendarModule.nextMonth()">›</button>
        </div>
        <div class="cal-grid">
          ${dayNames.map(d=>`<div class="cal-day-name">${d}</div>`).join('')}
          ${cells}
        </div>
      </div>
      ${!listEvents.length ? `<div class="empty">${this.selectedDate?'当天暂无活动':'暂无活动，点击上方按钮添加'}</div>` : `
      <div class="event-list">
        ${listEvents.map(ev=>{
          const [ey,em,ed] = ev.date.split('-');
          return `<div class="event-card">
            <button class="inline-del" onclick="Events.deleteEvent('${ev.id}')" title="删除">✕</button>
            <div class="event-date-badge">
              <div class="month">${parseInt(em)}月</div>
              <div class="day">${parseInt(ed)}</div>
            </div>
            <div class="event-info">
              <h4>${ev.name}</h4>
              ${ev.venue?`<div class="desc">📍 ${ev.venue}</div>`:''}
              ${ev.desc?`<div class="desc" style="margin-top:4px;">${ev.desc}</div>`:''}
              <span class="event-tag ${ev.type}">${tagLabel[ev.type]||ev.type}</span>
              <div>
                <button class="register-btn${ev.registered?' registered':''}" onclick="Events.toggleRegister('${ev.id}')">
                  ${ev.registered?'✅ 已报名':'🎫 立即报名'}
                </button>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>`}
    `;
  },
  selectDate(dateStr) {
    this.selectedDate = this.selectedDate===dateStr ? null : dateStr;
    Render.preview('calendar');
  },
  clearSelect() { this.selectedDate=null; Render.preview('calendar'); },
  prevMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth()-1, 1);
    Render.preview('calendar');
  },
  nextMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth()+1, 1);
    Render.preview('calendar');
  }
};
