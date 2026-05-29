// ===== AIService Module =====
// Part of StarFan Studio v2.5 | 火山方舟 DeepSeek V4 Flash

const AIService = {
  mode: 'real', // real=火山方舟 / mock=本地模拟
  apiKey: 'ark-b4aeef1b-19e7-40c6-8c36-fffab0dc0c57-9781a',
  endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  model: 'deepseek-v4-flash-260425',

  prompts: {
    bio: (name) => `请为偶像"${name||'未知'}"写一段80-100字的粉丝站欢迎简介。要求：语气热情专业，突出其代表作与粉丝昵称，适合放在网站首页。`,
    news: (title, date) => `请根据新闻标题"${title}"和日期"${date}"，生成一段120-150字的娱乐新闻报道正文。要求：语气客观积极，结构完整，适合粉丝站发布。`,
    gallery: (count) => `请为${count}张偶像活动照片生成简短图注。要求：每句8-12字，风格唯美/应援/纪实，用换行分隔，不要编号。`
  },
  async generate(prompt, onChunk) {
    if(this.mode === 'mock') return this.mockGenerate(prompt, onChunk);
    return this.realGenerate(prompt, onChunk);
  },
  async mockGenerate(prompt, onChunk) {
    const nameMatch = prompt.match(/偶像"([^"]+)"/);
    const titleMatch = prompt.match(/标题"([^"]+)"/);
    const countMatch = prompt.match(/(\d+)张/);
    const name = nameMatch ? nameMatch[1] : '偶像';
    const title = titleMatch ? titleMatch[1] : '最新动态';
    const count = countMatch ? parseInt(countMatch[1]) : 3;
    let text = '';
    if(prompt.includes('简介')) {
      const styles = ['元气', '深情', '专业', '热血', '治愈'];
      const works = ['《星辰大海》', '《追光者》', '《破晓》', '《逆风飞翔》', '《极光之约》'];
      const s = styles[Math.floor(Math.random() * styles.length)];
      const w = works[Math.floor(Math.random() * works.length)];
      text = `✨ 欢迎来到${name}的专属应援站！这里是所有${s}粉丝的聚集地。从${w}的惊艳亮相，到舞台上的每一次闪耀，我们陪你走过每一步。未来可期，一起为${name}点亮星光吧！💙`;
    } else if(prompt.includes('新闻')) {
      const events = ['巡回演唱会', '新专辑发布', '品牌代言官宣', '粉丝见面会', '影视剧杀青'];
      const cities = ['北京、上海、广州', '成都、杭州、深圳', '全国十大核心城市', '长三角重点城市'];
      const e = events[Math.floor(Math.random() * events.length)];
      const c = cities[Math.floor(Math.random() * cities.length)];
      text = `📢 重磅消息！${name}「${title}」${e}正式定档。本次行程将覆盖${c}，舞台与互动环节全面升级。官方通道将于明日10:00开启，请各位粉丝提前准备应援物料，我们现场见！🎫`;
    } else if(prompt.includes('图注')) {
      const pool = ['聚光灯下的绝对焦点','后台默词的专注侧影','与粉丝击掌的温暖瞬间','机场出发的清爽穿搭','领奖台上的高光时刻','排练室挥洒的汗水','回眸一笑的治愈画面','手握麦克风的坚定姿态','谢幕时深深的鞠躬','雨中撑伞的温柔守候','彩排时的认真走位','庆功宴上的开心干杯'];
      const shuffled = pool.sort(() => 0.5 - Math.random());
      text = shuffled.slice(0, Math.min(count, pool.length)).join('\n');
    } else {
      text = '🤖 AI正在为您生成专属内容，请稍候...';
    }
    const chunks = text.match(/.{1,3}/g) || [];
    var accumulated = '';
    for(let i=0; i<chunks.length; i++) {
      accumulated += chunks[i];
      await new Promise(r => setTimeout(r, 30 + Math.random()*40));
      onChunk(accumulated, i === chunks.length-1);
    }
  },
  async realGenerate(prompt, onChunk) {
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
        body: JSON.stringify({ model: this.model, messages: [{role:'user', content:prompt}], stream: true, temperature: 0.9 })
      });
      if(!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`API ${res.status}: ${errText.slice(0,200)}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      var realAccumulated = '';
      while(true) {
        const {done, value} = await reader.read();
        if(done) break;
        buffer += decoder.decode(value, {stream:true});
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for(let line of lines) {
          if(line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const json = JSON.parse(line.slice(6));
              const delta = json.choices?.[0]?.delta;
              const content = delta?.content || '';
              if(content) {
                realAccumulated += content;
                onChunk(realAccumulated, false);
              }
            } catch(e) {}
          }
        }
      }
      onChunk(realAccumulated, true);
    } catch(e) {
      console.error('🤖 火山方舟API失败，降级为模拟模式', e);
      onChunk('\n⚠️ AI服务暂时不可用，已切换为本地模拟。', true);
      this.mode = 'mock';
    }
  }
};
