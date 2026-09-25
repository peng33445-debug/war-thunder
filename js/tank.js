// ===== 文件：js/tank.js =====
// 豹2A7 俯视半写实绘制 + 4模块判定系统
// 坐标系统：坦克本地坐标，中心(0,0)，车头朝上(-y方向)

export const TANK_SIZE = 128; // 画布逻辑尺寸

// ---- 模块定义（本地坐标，与绘制共用）----
// 4个模块：front(正面) side(侧面) rear(后面) engine(发动机)
export const MODULES = {
  front:  { name: '正面',   color: '#e74c3c', x: -30, y: -55, w: 60, h: 45 },
  sideL:  { name: '左侧',   color: '#f1c40f', x: -42, y: -10, w: 14, h: 80 },
  sideR:  { name: '右侧',   color: '#f1c40f', x:  28, y: -10, w: 14, h: 80 },
  rear:   { name: '后面',   color: '#3498db', x: -32, y:  35, w: 64, h: 18 },
  engine: { name: '发动机', color: '#2ecc71', x: -30, y:  53, w: 60, h: 25 },
};

// 把 sideL/sideR 合并成"侧面"逻辑
export function hitTest(localX, localY) {
  for (const key of Object.keys(MODULES)) {
    const m = MODULES[key];
    if (localX >= m.x && localX <= m.x + m.w &&
        localY >= m.y && localY <= m.y + m.h) {
      if (key === 'sideL' || key === 'sideR') return 'side';
      return key;
    }
  }
  return null; // 未命中
}

// ---- 绘制 ----
export function drawTank(ctx, x, y, angle = 0, showModules = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle); // 弧度，0 = 车头朝上

  drawTracks(ctx);
  drawHull(ctx);
  drawTurret(ctx);
  drawBarrel(ctx);
  drawEngineDeck(ctx);

  if (showModules) drawModuleOverlay(ctx);

  ctx.restore();
}

function drawTracks(ctx) {
  // 左右履带
  for (const sx of [-42, 28]) {
    const g = ctx.createLinearGradient(sx, 0, sx + 14, 0);
    g.addColorStop(0, '#1a1d21');
    g.addColorStop(0.5, '#2c3238');
    g.addColorStop(1, '#1a1d21');
    ctx.fillStyle = g;
    roundRect(ctx, sx, -60, 14, 120, 5);
    ctx.fill();

    // 履带纹
    ctx.strokeStyle = '#3d444c';
    ctx.lineWidth = 1;
    for (let ty = -56; ty < 58; ty += 8) {
      ctx.beginPath();
      ctx.moveTo(sx + 1, ty);
      ctx.lineTo(sx + 13, ty);
      ctx.stroke();
    }
    // 负重轮暗示
    ctx.strokeStyle = '#111';
    for (let wy = -50; wy < 55; wy += 18) {
      ctx.beginPath();
      ctx.arc(sx + 7, wy, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawHull(ctx) {
  // 车体主轮廓（豹2车体：前部略窄，后部略宽）
  const g = ctx.createLinearGradient(-32, 0, 32, 0);
  g.addColorStop(0, '#3f4d2e');
  g.addColorStop(0.5, '#55663f');
  g.addColorStop(1, '#3f4d2e');

  ctx.beginPath();
  ctx.moveTo(-28, -62);   // 前左
  ctx.lineTo( 28, -62);   // 前右
  ctx.lineTo( 32, -40);
  ctx.lineTo( 32,  68);   // 后右
  ctx.lineTo( 28,  78);
  ctx.lineTo(-28,  78);   // 后左
  ctx.lineTo(-32,  68);
  ctx.lineTo(-32, -40);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#26301b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 前部倾斜装甲高光
  ctx.beginPath();
  ctx.moveTo(-28, -62);
  ctx.lineTo( 28, -62);
  ctx.lineTo( 24, -50);
  ctx.lineTo(-24, -50);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fill();

  // 侧裙板
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(-32, -40, 4, 108);
  ctx.fillRect( 28, -40, 4, 108);
}

function drawTurret(ctx) {
  // 豹2楔形炮塔
  const g = ctx.createLinearGradient(0, -30, 0, 30);
  g.addColorStop(0, '#5f7048');
  g.addColorStop(1, '#46552f');

  ctx.beginPath();
  ctx.moveTo(-22, -30);  // 炮塔前左
  ctx.lineTo( 22, -30);
  ctx.lineTo( 26, -10);  // 楔形外扩
  ctx.lineTo( 26,  28);
  ctx.lineTo( 22,  36);
  ctx.lineTo(-22,  36);
  ctx.lineTo(-26,  28);
  ctx.lineTo(-26, -10);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#26301b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 楔形前脸高光
  ctx.beginPath();
  ctx.moveTo(-22, -30);
  ctx.lineTo( 22, -30);
  ctx.lineTo( 25, -12);
  ctx.lineTo(-25, -12);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fill();

  // 车长/炮手舱盖
  ctx.fillStyle = '#3a4630';
  ctx.strokeStyle = '#1f2418';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(-10, 5, 7, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc( 10, 5, 7, 0, Math.PI*2); ctx.fill(); ctx.stroke();

  // 炮塔尾部弹仓
  ctx.fillStyle = '#3d4a30';
  ctx.fillRect(-20, 38, 40, 12);
  ctx.strokeRect(-20, 38, 40, 12);
}

function drawBarrel(ctx) {
  const g = ctx.createLinearGradient(-5, 0, 5, 0);
  g.addColorStop(0, '#2c3324');
  g.addColorStop(0.5, '#454f38');
  g.addColorStop(1, '#2c3324');
  ctx.fillStyle = g;
  ctx.fillRect(-5, -95, 10, 68);   // 炮管

  // 炮口制退器
  ctx.fillStyle = '#1f2418';
  ctx.fillRect(-7, -98, 14, 12);

  // 热护套纹
  ctx.strokeStyle = '#5a6548';
  ctx.lineWidth = 1;
  for (let by = -85; by < -35; by += 8) {
    ctx.beginPath();
    ctx.moveTo(-4, by);
    ctx.lineTo( 4, by);
    ctx.stroke();
  }
}

function drawEngineDeck(ctx) {
  // 发动机舱栅格
  ctx.fillStyle = 'rgba(0,0,0,0.30)';
  ctx.fillRect(-26, 52, 52, 24);
  ctx.strokeStyle = '#5a6548';
  ctx.lineWidth = 1;
  for (let gx = -24; gx < 26; gx += 6) {
    ctx.beginPath();
    ctx.moveTo(gx, 54);
    ctx.lineTo(gx, 74);
    ctx.stroke();
  }
}

function drawModuleOverlay(ctx) {
  for (const key of Object.keys(MODULES)) {
    const m = MODULES[key];
    ctx.fillStyle = m.color;
    ctx.globalAlpha = 0.28;
    ctx.fillRect(m.x, m.y, m.w, m.h);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = m.color;
    ctx.lineWidth = 1;
    ctx.strokeRect(m.x, m.y, m.w, m.h);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
