const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("gameOverlay");
const startButton = document.getElementById("startButton");
const scoreEl = document.getElementById("score");
const bananasEl = document.getElementById("bananas");
const bestEl = document.getElementById("best");
const intro = document.getElementById("intro");
const skipIntro = document.getElementById("skipIntro");

let W = canvas.width, H = canvas.height;
const groundY = 340;
let running = false;
let last = 0;
let score = 0;
let bananas = 0;
let speed = 360;
let spawnTimer = 0;
let bananaTimer = 0;
let objects = [];
let best = Number(localStorage.getItem("ranggaptr-jungle-best") || 0);
bestEl.textContent = String(best).padStart(4,"0");

const player = {
  x: 125, y: groundY - 72, w: 64, h: 72,
  vy: 0, onGround: true, duck: false, phase: 0
};

function reset(){
  score = 0; bananas = 0; speed = 360;
  spawnTimer = .9; bananaTimer = .7; objects = [];
  player.y = groundY - 72; player.vy = 0; player.onGround = true; player.duck = false;
  scoreEl.textContent = "0000";
  bananasEl.textContent = "00";
}

function start(){
  reset();
  running = true;
  overlay.classList.add("hidden");
}

function end(){
  running = false;
  best = Math.max(best, Math.floor(score));
  localStorage.setItem("ranggaptr-jungle-best", best);
  bestEl.textContent = String(best).padStart(4,"0");
  overlay.classList.remove("hidden");
  overlay.querySelector(".tiny").textContent = "RUN ENDED";
  overlay.querySelector("h2").innerHTML = `SCORE ${Math.floor(score)}<br>RUN IT BACK?`;
  startButton.textContent = "RUN AGAIN";
}

function jump(){
  if(!running){ start(); return; }
  if(player.onGround){
    player.vy = -770;
    player.onGround = false;
  }
}

function setDuck(value){
  player.duck = value;
}

window.addEventListener("keydown", e => {
  if(["Space","ArrowUp"].includes(e.code)){ e.preventDefault(); jump(); }
  if(e.code === "ArrowDown"){ e.preventDefault(); setDuck(true); }
});
window.addEventListener("keyup", e => {
  if(e.code === "ArrowDown") setDuck(false);
});
canvas.addEventListener("pointerdown", jump);
startButton.addEventListener("click", start);
skipIntro.addEventListener("click", ()=>intro.classList.add("done"));
setTimeout(()=>intro.classList.add("done"), 5200);

function spawnObstacle(){
  const bug = Math.random() > .45;
  objects.push({
    type: bug ? "bug" : "stump",
    x: W + 40,
    y: bug ? groundY - 46 : groundY - 46,
    w: bug ? 42 : 48,
    h: 46,
    passed:false
  });
}

function spawnBanana(){
  const high = Math.random() > .45;
  objects.push({
    type:"banana",
    x:W + 40,
    y: high ? groundY - 150 : groundY - 95,
    w:30,h:34,collected:false
  });
}

function rects(a,b){
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}

function update(dt){
  if(!running) return;

  score += dt * 18;
  speed = Math.min(680, 360 + score * .10);
  player.phase += dt * 12;

  player.vy += 2050 * dt;
  player.y += player.vy * dt;
  const ph = player.duck ? 46 : 72;
  player.h = ph;

  if(player.y >= groundY - player.h){
    player.y = groundY - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  spawnTimer -= dt;
  bananaTimer -= dt;

  if(spawnTimer <= 0){
    spawnObstacle();
    spawnTimer = 1.0 + Math.random() * 1.05;
  }
  if(bananaTimer <= 0){
    spawnBanana();
    bananaTimer = .85 + Math.random() * 1.25;
  }

  const hitbox = {x:player.x+10,y:player.y+8,w:player.w-20,h:player.h-8};

  for(const o of objects){
    o.x -= speed * dt;
    if(o.type === "banana"){
      if(!o.collected && rects(hitbox,o)){
        o.collected = true;
        bananas++;
        score += 55;
        bananasEl.textContent = String(bananas).padStart(2,"0");
      }
    }else if(rects(hitbox,o)){
      end(); return;
    }
  }

  objects = objects.filter(o => o.x > -80 && !o.collected);
  scoreEl.textContent = String(Math.floor(score)).padStart(4,"0");
}

function roundedRect(x,y,w,h,r,fill){
  ctx.beginPath();
  ctx.roundRect(x,y,w,h,r);
  ctx.fillStyle=fill; ctx.fill();
}

function drawBackground(t){
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,"#07180d"); g.addColorStop(.58,"#0d3519"); g.addColorStop(1,"#06150a");
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

  // moon glow
  const rg = ctx.createRadialGradient(745,90,5,745,90,170);
  rg.addColorStop(0,"rgba(150,255,170,.20)");
  rg.addColorStop(1,"rgba(150,255,170,0)");
  ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(745,90,170,0,Math.PI*2); ctx.fill();

  // hills
  ctx.fillStyle="#0a2b15";
  ctx.beginPath(); ctx.moveTo(0,260);
  for(let x=0;x<=W;x+=80){
    ctx.lineTo(x,220 + Math.sin((x+t*18)/120)*34);
  }
  ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.fill();

  // trees
  for(let i=0;i<11;i++){
    const x=(i*113 - (t*speed*.12)%113);
    ctx.fillStyle="#071f0f"; ctx.fillRect(x,140,18,210);
    ctx.fillStyle="#164b24";
    ctx.beginPath(); ctx.arc(x+9,135,48,0,Math.PI*2); ctx.fill();
  }

  ctx.fillStyle="#082311"; ctx.fillRect(0,groundY,W,H-groundY);
  ctx.fillStyle="#1d6c32"; ctx.fillRect(0,groundY,W,4);

  // fireflies
  ctx.fillStyle="#dfff71";
  for(let i=0;i<18;i++){
    const x=(i*157 + t*17) % W, y=80 + ((i*83)%190) + Math.sin(t*2+i)*8;
    ctx.globalAlpha=.25 + .6*(.5+.5*Math.sin(t*3+i));
    ctx.beginPath();ctx.arc(x,y,2.2,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
}

function drawGorilla(){
  const x=player.x, y=player.y, h=player.h;
  const duck=player.duck;
  const cy=y+(duck?24:30);

  // legs
  if(!duck){
    const swing=Math.sin(player.phase)*7;
    roundedRect(x+13+swing, y+50, 16, 26, 8, "#111713");
    roundedRect(x+36-swing, y+50, 16, 26, 8, "#111713");
  }

  // body
  ctx.fillStyle="#151b17";
  ctx.beginPath(); ctx.ellipse(x+32, cy+23, 31, duck?22:31,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#344039";
  ctx.beginPath(); ctx.ellipse(x+32, cy+25, 19, duck?15:21,0,0,Math.PI*2);ctx.fill();

  // head
  ctx.fillStyle="#151b17";
  ctx.beginPath();ctx.arc(x+33,cy-7,22,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#667069";
  ctx.beginPath();ctx.ellipse(x+33,cy-1,14,10,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#dfff88";
  ctx.beginPath();ctx.arc(x+25,cy-13,2.4,0,Math.PI*2);ctx.arc(x+41,cy-13,2.4,0,Math.PI*2);ctx.fill();

  // arms running
  const a=Math.sin(player.phase)*8;
  roundedRect(x-1,cy+4+a,15,42,8,"#151b17");
  roundedRect(x+51,cy+4-a,15,42,8,"#151b17");
}

function drawBanana(o){
  ctx.save(); ctx.translate(o.x+15,o.y+16); ctx.rotate(-.45);
  ctx.strokeStyle="#ffd600";ctx.lineWidth=9;ctx.lineCap="round";
  ctx.beginPath();ctx.arc(0,0,12,.2,2.1);ctx.stroke();
  ctx.strokeStyle="#9b7c00";ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(11,-3);ctx.lineTo(16,-10);ctx.stroke();
  ctx.restore();
}

function drawBug(o){
  ctx.fillStyle="#ff5f5f";
  ctx.beginPath();ctx.ellipse(o.x+21,o.y+24,18,15,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#101410";
  ctx.beginPath();ctx.arc(o.x+14,o.y+20,3,0,Math.PI*2);ctx.arc(o.x+28,o.y+20,3,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#ff8b8b";ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(o.x+6,o.y+33);ctx.lineTo(o.x-5,o.y+41);ctx.moveTo(o.x+36,o.y+33);ctx.lineTo(o.x+47,o.y+41);ctx.stroke();
}

function drawStump(o){
  roundedRect(o.x,o.y,o.w,o.h,8,"#6f4b26");
  ctx.fillStyle="#8c6335";ctx.beginPath();ctx.ellipse(o.x+o.w/2,o.y+5,o.w/2,8,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#3f2b17";ctx.lineWidth=3;ctx.beginPath();ctx.arc(o.x+o.w/2,o.y+5,11,0,Math.PI*2);ctx.stroke();
}

function draw(t){
  drawBackground(t);
  for(const o of objects){
    if(o.type==="banana") drawBanana(o);
    else if(o.type==="bug") drawBug(o);
    else drawStump(o);
  }
  drawGorilla();

  ctx.font="700 12px ui-monospace, monospace";
  ctx.fillStyle="rgba(220,255,225,.72)";
  ctx.fillText("PRODUCTION JUNGLE // BUILD 1.0",20,28);
}

function loop(ts){
  const t=ts/1000;
  const dt=Math.min(.032,(ts-last)/1000 || 0);
  last=ts;
  update(dt);draw(t);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
