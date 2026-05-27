// ===== BackgroundFX Module =====
// Part of StarFan Studio v2.3

// ================= 🌌 动态背景引擎 (BackgroundFX) =================
const BackgroundFX = {
  canvas: null, ctx: null, animId: null, type: 'stars', items: [],
  init() {
    this.canvas = document.getElementById('bgCanvas');
    if(!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.start();
  },
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.generate();
  },
  setType(type) {
    if(type === 'custom') return alert('👑 自定义背景为 VIP 专属功能，敬请期待！');
    this.type = type;
    this.generate();
  },
  generate() {
    this.items = [];
    const count = this.type === 'particles' ? 45 : (this.type === 'stars' ? 80 : 35);
    for(let i=0; i<count; i++) {
      this.items.push({
        x: Math.random()*this.canvas.width, y: Math.random()*this.canvas.height,
        r: Math.random()*5 + 3, // 🔹 尺寸放大至 3~8px
        dx: (Math.random()-0.5)*0.25, dy: (Math.random()-0.5)*0.25, // 🔹 飘动更慢更明显
        alpha: Math.random()*0.5 + 0.3, phase: Math.random()*Math.PI*2,
        rot: Math.random()*Math.PI*2, rotSpeed: (Math.random()-0.5)*0.01
      });
    }
  },
  drawStar(ctx, x, y, r, rot) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(rot);
    ctx.beginPath();
    for(let i=0;i<5;i++){ ctx.lineTo(Math.cos((18+i*72)/180*Math.PI)*r, -Math.sin((18+i*72)/180*Math.PI)*r); ctx.lineTo(Math.cos((54+i*72)/180*Math.PI)*r*0.4, -Math.sin((54+i*72)/180*Math.PI)*r*0.4); }
    ctx.closePath(); ctx.fill(); ctx.restore();
  },
  drawMoon(ctx, x, y, r, rot) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(rot);
    ctx.beginPath(); ctx.arc(0,0,r,0.5*Math.PI,1.5*Math.PI); ctx.arc(r*0.4,0,r*0.8,1.5*Math.PI,0.5*Math.PI,true);
    ctx.closePath(); ctx.fill(); ctx.restore();
  },
  start() {
    if(this.animId) cancelAnimationFrame(this.animId);
    const draw = () => {
      this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
      const t = Date.now()*0.001;
      this.items.forEach(p => {
        p.x += p.dx; p.y += p.dy; p.rot += p.rotSpeed;
        if(p.x<-20) p.x=this.canvas.width+20; if(p.x>this.canvas.width+20) p.x=-20;
        if(p.y<-20) p.y=this.canvas.height+20; if(p.y>this.canvas.height+20) p.y=-20;
        const pulse = 0.6 + 0.4*Math.sin(t*1.5+p.phase);
        this.ctx.fillStyle = this.type==='moon' ? `rgba(255,245,200,${pulse*0.7})` : `rgba(255,255,255,${pulse*0.8})`;
        if(this.type==='stars') this.drawStar(this.ctx, p.x, p.y, p.r, p.rot);
        else if(this.type==='moon') this.drawMoon(this.ctx, p.x, p.y, p.r, p.rot);
        else { this.ctx.beginPath(); this.ctx.arc(p.x,p.y,p.r,0,Math.PI*2); this.ctx.fill(); }
      });
      this.animId = requestAnimationFrame(draw);
    };
    draw();
  },
  stop() { if(this.animId) cancelAnimationFrame(this.animId); }
};
