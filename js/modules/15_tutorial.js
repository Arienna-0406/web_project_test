// ===== Tutorial Module =====
// Part of StarFan Studio v2.3

// ================= 5. 新手教程 =================
const Tutorial = {
  current: 0,  // 0 = 欢迎弹窗; 1-8 = 高亮引导步骤
  _key() { return SiteManager.PREFIX + (SiteManager.getActive() || 'default') + '_tutorial_done'; },
  // 每步定义：selector 为要高亮的元素，arrow 为气泡箭头方向，pos 为气泡相对位置
  steps: [
    {
      icon: '🌟', title: '偶像资料',
      step: '1 / 8',
      body: '点击这个卡片可以预览<b>偶像资料</b>板块。\n\n在这里你可以填写偶像名字、上传头像、设置简介、配置社交链接，还可以让 AI 一键生成欢迎文案！',
      selector: '#siteGuide .guide-item:nth-child(1)',
      arrow: 'up', bubblePos: 'below'
    },
    {
      icon: '📖', title: '追忆时光',
      step: '2 / 8',
      body: '这里是<b>追忆时光</b>板块。\n\n记录你与偶像之间的每一次心动瞬间：写下标题、正文，还能上传封面 + 最多 9 张照片，打造小红书风格的记忆卡片！',
      selector: '#siteGuide .guide-item:nth-child(2)',
      arrow: 'up', bubblePos: 'below'
    },
    {
      icon: '🖼', title: '照片画廊',
      step: '3 / 8',
      body: '这里是<b>照片画廊</b>板块。\n\n批量上传你收藏的偶像照片，系统会自动排列成瀑布流布局，还支持给每张图生成 AI 图注✨',
      selector: '#siteGuide .guide-item:nth-child(3)',
      arrow: 'up', bubblePos: 'below'
    },
    {
      icon: '💌', title: '粉丝心语',
      step: '4 / 8',
      body: '这里是<b>粉丝心语</b>板块。\n\n写下你对偶像的心里话，每条心语都会自动盖上时间戳，像一本有温度的心情日记 💕',
      selector: '#siteGuide .guide-item:nth-child(4)',
      arrow: 'up', bubblePos: 'below'
    },
    {
      icon: '📅', title: '活动日历',
      step: '5 / 8',
      body: '这里是<b>活动日历</b>板块。\n\n在日历上标记重要日期：演唱会、见面会、生日，让每一个与偶像有关的日子都被好好记住 🗓',
      selector: '#siteGuide .guide-item:nth-child(5)',
      arrow: 'up', bubblePos: 'below'
    },
    {
      icon: '💝', title: '周边收藏',
      step: '6 / 8',
      body: '这里是<b>周边收藏</b>板块。\n\n展示你珍藏的周边好物：专辑、手幅、徽章……把你的宝贝小柜子搬上粉丝站吧！',
      selector: '#siteGuide .guide-item:nth-child(6)',
      arrow: 'up', bubblePos: 'below'
    },
    {
      icon: '📦', title: '顶部功能按钮',
      step: '7 / 8',
      body: '顶部有<b>三个</b>重要按钮：\n\n🔄 <b>切换粉丝站</b>：管理多个粉丝站，一键切换不同偶像~\n\n📦 <b>导出展示版</b>：把你的粉丝站打包成独立 HTML 文件发给朋友！\n\n👁 <b>预览外观</b>：选好模板和特效后点这里实时预览效果~',
      selector: '#mainActionBar',
      arrow: 'up', bubblePos: 'below'
    },
    {
      icon: '⚙️', title: '编辑控制台',
      step: '8 / 8',
      body: '右下角这个<b>紫色小球</b>就是编辑控制台的入口。\n\n在这里填写偶像信息、上传照片、写心语，所有编辑功能都在这里！\n\n🚀 开始使用吧~',
      selector: '.editor-toggle',
      arrow: 'down', bubblePos: 'above'
    }
  ],
  init() {
    if (localStorage.getItem(this._key())) return;
    this.current = 0;
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      document.getElementById('tutWelcome').classList.add('active');
    }, 700);
  },
  next() {
    if (this.current === 0) {
      // 欢迎弹窗 → 开始高亮引导
      document.getElementById('tutWelcome').classList.remove('active');
      document.getElementById('tutExitBtn').classList.add('show');
      setTimeout(() => {
        this.current = 1;
        this._showStep(this.current);
      }, 350);
      return;
    }
    this.current++;
    if (this.current > this.steps.length) {
      this.close();
      return;
    }
    this._showStep(this.current);
  },
  _showStep(idx) {
    var step = this.steps[idx - 1];
    var total = this.steps.length;
    // 先让气泡淡出（切换动画）
    var bubble = document.getElementById('tutBubble');
    bubble.classList.remove('active');
    // 找目标元素
    var target = document.querySelector(step.selector);
    if (!target) { this.next(); return; }
    // 目标元素滚动到可见区域
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    var rect = target.getBoundingClientRect();
    var pad = 10; // 高亮区域内边距
    // 设置遮罩四块
    var mask = document.getElementById('tutMask');
    var top    = document.getElementById('tutMaskTop');
    var bottom = document.getElementById('tutMaskBottom');
    var left   = document.getElementById('tutMaskLeft');
    var right  = document.getElementById('tutMaskRight');
    var hTop = rect.top - pad;
    var hBottom = rect.bottom + pad;
    var hLeft = rect.left - pad;
    var hRight = rect.right + pad;
    top.style.height    = Math.max(0, hTop) + 'px';
    bottom.style.top    = hBottom + 'px';
    bottom.style.height = Math.max(0, window.innerHeight - hBottom) + 'px';
    left.style.top      = hTop + 'px';
    left.style.height   = (hBottom - hTop) + 'px';
    left.style.width    = Math.max(0, hLeft) + 'px';
    right.style.left    = hRight + 'px';
    right.style.top     = hTop + 'px';
    right.style.height  = (hBottom - hTop) + 'px';
    right.style.width   = Math.max(0, window.innerWidth - hRight) + 'px';
    mask.classList.add('active');
    // 设置高亮光环
    var ring = document.getElementById('tutRing');
    ring.style.top    = (rect.top - pad) + 'px';
    ring.style.left   = (rect.left - pad) + 'px';
    ring.style.width  = (rect.width + pad * 2) + 'px';
    ring.style.height = (rect.height + pad * 2) + 'px';
    ring.classList.add('active');
    // 设置气泡
    var bubble = document.getElementById('tutBubble');
    document.getElementById('tutBubbleIcon').textContent = step.icon;
    document.getElementById('tutBubbleTitle').textContent = step.title;
    document.getElementById('tutBubbleStep').textContent = step.step;
    document.getElementById('tutBubbleBody').innerHTML = step.body.replace(/\n\n/g, '<br><br>');
    // 圆点
    var dotsHtml = '';
    for (var d = 0; d < total; d++) {
      dotsHtml += '<div class="tut-dot' + (d === idx - 1 ? ' active' : '') + '"></div>';
    }
    document.getElementById('tutDots').innerHTML = dotsHtml;
    // 下一步 / 完成按钮
    var btnNext = document.getElementById('tutBtnNext');
    if (idx === total) {
      btnNext.innerHTML = '<span>开始使用</span><span style="font-size:14px;">🚀</span>';
      btnNext.className = 'tut-btn-next finish';
    } else {
      btnNext.innerHTML = '<span>下一步</span><span style="font-size:14px;">→</span>';
      btnNext.className = 'tut-btn-next';
    }
    // 气泡 class reset
    var margin = 16;
    var vpH = window.innerHeight;
    var vpW = window.innerWidth;
    bubble.className = 'tut-bubble';
    bubble.style.cssText = 'top:-9999px;left:0;';
    // 激活显示（稍微延迟等滚动）
    setTimeout(function() {
      // 重新获取 rect（滚动后位置可能变化）
      var newRect = target.getBoundingClientRect();
      var nh = newRect.top - pad;
      var nb = newRect.bottom + pad;
      var nl = newRect.left - pad;
      var nr = newRect.right + pad;
      top.style.height    = Math.max(0, nh) + 'px';
      bottom.style.top    = nb + 'px';
      bottom.style.height = Math.max(0, vpH - nb) + 'px';
      left.style.top = nh + 'px'; left.style.height = (nb - nh) + 'px'; left.style.width = Math.max(0, nl) + 'px';
      right.style.left = nr + 'px'; right.style.top = nh + 'px'; right.style.height = (nb - nh) + 'px'; right.style.width = Math.max(0, vpW - nr) + 'px';
      ring.style.top = (newRect.top - pad) + 'px'; ring.style.left = (newRect.left - pad) + 'px';
      ring.style.width = (newRect.width + pad * 2) + 'px'; ring.style.height = (newRect.height + pad * 2) + 'px';
      // 临时激活气泡以获取实际尺寸
      bubble.style.transition = 'none';
      bubble.className = 'tut-bubble arrow-up';
      bubble.classList.add('active');
      var realH = bubble.offsetHeight;
      var realW = bubble.offsetWidth;
      bubble.classList.remove('active');
      bubble.style.transition = '';
      // 水平居中于目标，限制在视口内
      var bbl = newRect.left + newRect.width / 2 - realW / 2;
      if (bbl < 10) bbl = 10;
      if (bbl + realW > vpW - 10) bbl = vpW - realW - 10;
      // 垂直位置：优先按设定方向，放不下自动换边，确保不超出视口
      var spaceBelow = vpH - newRect.bottom - pad - margin;
      var spaceAbove = newRect.top - pad - margin;
      var bbt, finalArrow;
      if (step.bubblePos === 'below') {
        if (spaceBelow >= realH) {
          bbt = newRect.bottom + pad + margin;
          finalArrow = 'arrow-up';
        } else if (spaceAbove >= realH) {
          bbt = newRect.top - pad - margin - realH;
          finalArrow = 'arrow-down';
        } else {
          bbt = Math.max(8, Math.min(newRect.bottom + pad + margin, vpH - realH - 8));
          finalArrow = 'arrow-up';
        }
      } else {
        if (spaceAbove >= realH) {
          bbt = newRect.top - pad - margin - realH;
          finalArrow = 'arrow-down';
        } else if (spaceBelow >= realH) {
          bbt = newRect.bottom + pad + margin;
          finalArrow = 'arrow-up';
        } else {
          bbt = Math.max(8, Math.min(newRect.top - pad - margin - realH, vpH - realH - 8));
          finalArrow = 'arrow-down';
        }
      }
      bubble.className = 'tut-bubble ' + finalArrow;
      bubble.style.top = bbt + 'px'; bubble.style.left = bbl + 'px';
      var ao = newRect.left + newRect.width / 2 - bbl;
      ao = Math.max(20, Math.min(realW - 20, ao));
      bubble.style.setProperty('--arrow-x', ao + 'px');
      bubble.classList.add('active');
    }, 120);
  },
  close() {
    localStorage.setItem(this._key(), '1');
    document.getElementById('tutWelcome').classList.remove('active');
    document.getElementById('tutMask').classList.remove('active');
    document.getElementById('tutRing').classList.remove('active');
    document.getElementById('tutBubble').classList.remove('active');
    document.getElementById('tutExitBtn').classList.remove('show');
    document.body.style.overflow = '';
  }
};
