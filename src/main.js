import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const sceneHost = document.querySelector("#scene");

const scene = new THREE.Scene();
scene.background = new THREE.Color("#e8d9c7");
scene.fog = new THREE.Fog("#e8d9c7", 42, 105);

const camera = new THREE.PerspectiveCamera(
 37, innerWidth / innerHeight, 0.1, 250
);

camera.position.set(23, 28, 29);

const renderer = new THREE.WebGLRenderer({
 antialias: true,
 powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

sceneHost.appendChild(renderer.domElement);

// CAMERA

const controls = new OrbitControls(camera, renderer.domElement);

controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 17;
controls.maxDistance = 65;
controls.maxPolarAngle = Math.PI * 0.47;
controls.minPolarAngle = 0.25;
controls.enablePan = true;

// LIGHTS

scene.add(
 new THREE.HemisphereLight(0xffffff, 0xb0a18b, 2.1)
);

const sun = new THREE.DirectionalLight(0xffffff, 2.3);

sun.position.set(-18, 35, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);

scene.add(sun);

// MATERIALS

const mat = (color, roughness = 0.9) =>
 new THREE.MeshStandardMaterial({ color, roughness });

const groundMat = mat("#d8d1a5");
const sidewalkMat = mat("#e9d8b5");
const roadMat = mat("#777286");
const lineMat = mat("#eee2b8");

const greenMat = mat("#83bd85");
const trunkMat = mat("#936b4b");
const lampMat = mat("#30334c");
const windowMat = mat("#f4d98d");
const darkWindow = mat("#264c4b");

// BASIC BOX

function box(
 parent, x, y, z,
 w, h, d, material, cast = true
) {
 const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(w, h, d),
  material
 );
 
 mesh.position.set(x, y, z);
 mesh.castShadow = cast;
 mesh.receiveShadow = true;
 
 parent.add(mesh);
 
 return mesh;
}

// GROUND

const ground = new THREE.Mesh(
 new THREE.PlaneGeometry(150, 150),
 groundMat
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.16;
ground.receiveShadow = true;

scene.add(ground);

// =================================
// CENTRAL ROUNDABOUT
// =================================

const ringInner = 7.2;
const ringOuter = 10.2;
const armEnd = 43;

const ringRoad = new THREE.Mesh(
 new THREE.RingGeometry(
  ringInner,
  ringOuter,
  96
 ),
 new THREE.MeshStandardMaterial({
  color: "#777286",
  roughness: 1,
  side: THREE.DoubleSide
 })
);

ringRoad.rotation.x = -Math.PI / 2;
ringRoad.position.y = 0.015;

scene.add(ringRoad);

// Айланма жолдун сызыктары

for (const radius of [7.35, 10.05]) {
 
 const line = new THREE.Mesh(
  new THREE.RingGeometry(
   radius - 0.045,
   radius + 0.045,
   96
  ),
  new THREE.MeshBasicMaterial({
   color: "#eee2b8",
   side: THREE.DoubleSide
  })
 );
 
 line.rotation.x = -Math.PI / 2;
 line.position.y = 0.09;
 
 scene.add(line);
}

// =================================
// FOUR MAIN SIX-LANE ROADS
// =================================

for (const angle of [
  0,
  Math.PI / 2,
  Math.PI,
  Math.PI * 1.5
 ]) {
 
 const g = new THREE.Group();
 
 g.rotation.y = angle;
 scene.add(g);
 
 // Негизги жол
 
 box(
  g,
  0,
  -0.02,
  (ringOuter + armEnd) / 2,
  6,
  0.13,
  armEnd - ringOuter,
  roadMat,
  false
 );
 
 // Жол тилкелеринин белгилери
 
 for (let lane = -2; lane <= 2; lane++) {
  
  if (lane === 0) continue;
  
  for (
   let z = 12; z < armEnd - 1; z += 4
  ) {
   
   box(
    g,
    lane * 1,
    0.06,
    z,
    0.035,
    0.012,
    1.8,
    lineMat,
    false
   );
   
  }
 }
 
 // Жолдун четтери
 
 for (const side of [-1, 1]) {
  
  box(
   g,
   side * 3.18,
   0.015,
   (ringOuter + armEnd) / 2,
   0.32,
   0.16,
   armEnd - ringOuter,
   sidewalkMat,
   false
  );
  
 }
}

// =================================
// CENTRAL BUILDING 6x6 — GREEN DOME
// =================================

const centralGreen = mat("#80b995");
const centralDarkGreen = mat("#568c70");
const domeMat = mat("#78bd96");
const domeBaseMat = mat("#d9c995");

// Имараттын негизи
box(scene, 0, 0.03, 0, 6, 0.18, 6, domeBaseMat, false);

// Негизги имарат
box(scene, 0, 1.25, 0, 5.6, 2.5, 5.6, centralGreen);

// Чатыр
box(scene, 0, 2.65, 0, 5.9, 0.3, 5.9, centralDarkGreen);

// Чатырдын үстүндөгү күмбөздүн негизи
const domeBase = new THREE.Mesh(
 new THREE.CylinderGeometry(1.35, 1.45, 0.3, 32),
 domeBaseMat
);
domeBase.position.set(0, 2.9, 0);
domeBase.castShadow = true;
scene.add(domeBase);

// Жарым шар формасындагы күмбөз
const dome = new THREE.Mesh(
 new THREE.SphereGeometry(
  1.3, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2
 ),
 domeMat
);

dome.position.set(0, 3.05, 0);
dome.castShadow = true;
dome.receiveShadow = true;
scene.add(dome);

// Күмбөздүн учундагы кооздук
const finial = new THREE.Mesh(
 new THREE.CylinderGeometry(0.035, 0.07, 0.65, 10),
 domeBaseMat
);
finial.position.set(0, 4.45, 0);
scene.add(finial);

// Терезелер
for (let i = -2; i <= 2; i++) {
 for (let j = -2; j <= 2; j++) {
  if (Math.abs(i) + Math.abs(j) > 2) continue;
  
  box(
   scene, i * 0.9, 1.3, 2.82,
   0.35, 0.8, 0.08,
   windowMat, false
  );
 }
}

// =================================
// SECONDARY ROADS — TWO LANES
// =================================

for (const angle of [
  0,
  Math.PI / 2,
  Math.PI,
  Math.PI * 1.5
 ]) {
 const g = new THREE.Group();
 g.rotation.y = angle;
 scene.add(g);
 
 for (const side of [-1, 1]) {
  
  // Эки тилкелүү жол
  box(
   g,
   side * 8,
   -0.025,
   26,
   2.5,
   0.12,
   34,
   roadMat,
   false
  );
  
  // Борбордук бөлүү сызыгы
  for (let z = 11; z < 43; z += 5) {
   box(
    g,
    side * 8,
    0.05,
    z,
    0.035,
    0.012,
    2.2,
    lineMat,
    false
   );
  }
 }
}

// =================================
// BIZTOWN FLAG
// =================================

const flagPole = new THREE.Mesh(
 new THREE.CylinderGeometry(0.055, 0.075, 5, 15),
 mat("#f4eee0")
);

flagPole.position.set(0, 6.3, 0);
flagPole.castShadow = true;

scene.add(flagPole);

// Желекке логотип тартуу

const flagCanvas = document.createElement("canvas");

flagCanvas.width = 512;
flagCanvas.height = 256;

const fctx = flagCanvas.getContext("2d");

fctx.fillStyle = "#5144a5";
fctx.fillRect(0, 0, 512, 256);

fctx.fillStyle = "#ffd36a";

fctx.beginPath();
fctx.arc(110, 128, 65, 0, Math.PI * 2);
fctx.fill();

fctx.fillStyle = "#5144a5";
fctx.font = "bold 100px sans-serif";
fctx.textAlign = "center";
fctx.fillText("B", 110, 163);

fctx.fillStyle = "#ffffff";
fctx.font = "bold 66px sans-serif";
fctx.textAlign = "left";
fctx.fillText("BIZTOWN", 200, 150);

const flagTexture = new THREE.CanvasTexture(flagCanvas);

const flag = new THREE.Mesh(
 new THREE.PlaneGeometry(3.7, 1.85),
 new THREE.MeshStandardMaterial({
  map: flagTexture,
  side: THREE.DoubleSide,
  roughness: 0.8
 })
);

flag.position.set(1.85, 7, 0);
flag.castShadow = true;

scene.add(flag);

// =================================
// TREES
// =================================

function tree(x, z, s = 1) {
 
 const g = new THREE.Group();
 
 g.position.set(x, 0, z);
 scene.add(g);
 
 box(
  g,
  0,
  0.45 * s,
  0,
  0.18 * s,
  0.9 * s,
  0.18 * s,
  trunkMat
 );
 
 const crown = new THREE.Mesh(
  new THREE.ConeGeometry(0.65 * s, 1.25 * s, 7),
  greenMat
 );
 
 crown.position.y = 1.25 * s;
 crown.castShadow = true;
 
 g.add(crown);
 
 return g;
}

// Борбордук имараттын айланасындагы бактар

for (let i = 0; i < 24; i++) {
 
 const a = i * Math.PI * 2 / 24;
 
 tree(
  Math.cos(a) * 6.4,
  Math.sin(a) * 6.4,
  0.8 + (i % 3) * 0.08
 );
 
}

// =================================
// SHOP BUILDINGS
// =================================

const shopColors = [
 "#70b99a",
 "#69a9d5",
 "#e5bd65",
 "#dc829d",
 "#9b8bd1",
 "#d78c62"
];

const plots = [];
const buildings = [];
const clickable = [];

function makeTower(
 x, z, floors,
 color,
 name = "Жаңы дүкөн",
 type = "Дүкөн",
 lastColorChangeAt = Date.now()
) {
 
 const group = new THREE.Group();
 
 group.position.set(x, 0, z);
 
 scene.add(group);
 
 const facade = mat(color);
 
 const trim = mat(
  new THREE.Color(color).multiplyScalar(0.78)
 );
 
 const width = 1.8;
 const depth = 1.8;
 const floorH = 1.05;
 
 box(
  group, 0, 0.05, 0,
  2.2, 0.1, 2.2,
  sidewalkMat, false
 );
 
 box(
  group,
  0,
  floors * floorH / 2 + 0.1,
  0,
  width,
  floors * floorH,
  depth,
  facade
 );
 
 for (let f = 0; f < floors; f++) {
  
  const y = 0.2 + f * floorH;
  
  for (const side of [-1, 1]) {
   
   box(
    group,
    side * 0.48,
    y + 0.23,
    depth / 2 + 0.012,
    0.32, 0.48, 0.035,
    windowMat,
    false
   );
   
   box(
    group,
    side * 0.48,
    y + 0.23,
    -depth / 2 - 0.012,
    0.32, 0.48, 0.035,
    windowMat,
    false
   );
   
   box(
    group,
    width / 2 + 0.012,
    y + 0.23,
    side * 0.48,
    0.035, 0.48, 0.32,
    windowMat,
    false
   );
   
   box(
    group,
    -width / 2 - 0.012,
    y + 0.23,
    side * 0.48,
    0.035, 0.48, 0.32,
    windowMat,
    false
   );
   
  }
  
  box(
   group,
   0,
   y + 0.23,
   depth / 2 + 0.025,
   0.3, 0.5, 0.04,
   darkWindow,
   false
  );
  
  box(
   group,
   0,
   y + 0.23,
   -depth / 2 - 0.025,
   0.3, 0.5, 0.04,
   darkWindow,
   false
  );
  
  box(
   group,
   0,
   0.2 + (f + 1) * floorH,
   0,
   width + 0.08,
   0.07,
   depth + 0.08,
   trim,
   false
  );
  
 }
 
 // Дүкөндүн үстүндөгү жазуу
 
 box(
  group,
  0,
  floors * floorH + 0.32,
  0,
  1.1,
  0.32,
  0.12,
  mat("#fff8e9"),
  false
 );
 
 const signCanvas = document.createElement("canvas");
 
 signCanvas.width = 512;
 signCanvas.height = 128;
 
 const ctx = signCanvas.getContext("2d");
 
 ctx.fillStyle = "#fff8e9";
 ctx.fillRect(0, 0, 512, 128);
 
 ctx.fillStyle = "#332d49";
 ctx.font = "bold 48px sans-serif";
 ctx.textAlign = "center";
 ctx.fillText(name.slice(0, 18), 256, 82);
 
 const tex = new THREE.CanvasTexture(signCanvas);
 
 const sign = new THREE.Mesh(
  new THREE.PlaneGeometry(1.05, 0.26),
  new THREE.MeshBasicMaterial({
   map: tex,
   transparent: true
  })
 );
 
 sign.position.set(
  0,
  floors * floorH + 0.33,
  0.067
 );
 
 group.add(sign);
 
 group.userData = {
  name,
  type,
  floors,
  color,
  sign,
  signCanvas,
  facadeMaterial: facade,
  trimMaterial: trim,
  lastColorChangeAt
 };
 
 buildings.push(group);
 
 return group;
}

// =================================
// DENSE SHOP PLOTS
// =================================

const positions = [];

for (const angle of [
  0,
  Math.PI / 2,
  Math.PI,
  Math.PI * 1.5
 ]) {
 
 for (let radius = 13; radius <= 39; radius += 1.9) {
  
  for (const side of [-1, 1]) {
   
   const localX = side * 5.8;
   const localZ = radius;
   
   const x =
    localX * Math.cos(angle) +
    localZ * Math.sin(angle);
   
   const z = -localX * Math.sin(angle) +
    localZ * Math.cos(angle);
   
   positions.push([x, z]);
  }
 }
}

positions.forEach(([x, z], i) => {
 
 const pad = box(
  scene,
  x,
  -0.005,
  z,
  1.65,
  0.12,
  1.65,
  mat("#c9d99a"),
  false
 );
 
 pad.userData.plotIndex = i;
 clickable.push(pad);
 
 const border = new THREE.LineSegments(
  new THREE.EdgesGeometry(
   new THREE.BoxGeometry(1.67, 0.13, 1.67)
  ),
  new THREE.LineBasicMaterial({
   color: "#fff2ca"
  })
 );
 
 border.position.set(x, 0.065, z);
 scene.add(border);
 
 plots.push({
  x,
  z,
  mesh: pad,
  border,
  building: null,
  index: i
 });
 
});

// =================================
// REALISTIC TWO-WAY TRAFFIC
// =================================

const cars = [];

function car(
 x, z, color, speed,
 kind, angle = 0, direction = 1,
 lane = 0, baseX = 0, progress = 0
) {
 
 const g = new THREE.Group();
 
 g.position.set(x, 0.16, z);
 
 scene.add(g);
 
 box(
  g, 0, 0.12, 0,
  0.72, 0.3, 1.25,
  mat(color)
 );
 
 box(
  g, 0, 0.34, -0.05,
  0.48, 0.2, 0.55,
  mat("#b9dce2")
 );
 
 // Алдыңкы фаралар
 for (const side of [-1, 1]) {
  box(
   g, side * 0.24, 0.18, 0.63,
   0.13, 0.08, 0.035,
   mat("#fff4c2"), false
  );
 }
 
 for (const wx of [-0.3, 0.3]) {
  for (const wz of [-0.38, 0.38]) {
   const wheel = new THREE.Mesh(
    new THREE.BoxGeometry(0.13, 0.2, 0.22),
    lampMat
   );
   
   wheel.position.set(wx, 0.02, wz);
   g.add(wheel);
  }
 }
 
 cars.push({
  g,
  speed,
  kind,
  angle,
  direction,
  lane,
  baseX,
  progress,
  radius: 8.7
 });
 
 return g;
}

const trafficColors = [
 "#e97865",
 "#e8c65e",
 "#6da8d1",
 "#e8e4dc",
 "#d58ac2",
 "#75b99a"
];

// АЙЛАНМА ЖОЛ — эки багыт

for (let i = 0; i < 10; i++) {
 
 const a = i * Math.PI * 2 / 10;
 
 const direction = i % 2 === 0 ? 1 : -1;
 
 car(
  Math.cos(a) * 8.7,
  Math.sin(a) * 8.7,
  trafficColors[i % trafficColors.length],
  3.0 + (i % 3) * 0.3,
  "ring",
  a,
  direction
 );
 
}

// НЕГИЗГИ 6 ТИЛКЕЛҮҮ ЖОЛДОР

for (const angle of [
  0,
  Math.PI / 2,
  Math.PI,
  Math.PI * 1.5
 ]) {
 
 for (const direction of [-1, 1]) {
  
  // Ар бир багытка үч тилке
  for (let lane = 0; lane < 3; lane++) {
   
   const offset =
    direction * (0.5 + lane * 1);
   
   for (let i = 0; i < 2; i++) {
    
    const progress = 14 + i * 19;
    
    car(
     offset * Math.cos(angle) +
     progress * Math.sin(angle),
     
     -offset * Math.sin(angle) +
     progress * Math.cos(angle),
     
     trafficColors[(lane + i) % trafficColors.length],
     
     4 + lane * 0.3,
     "road",
     angle,
     direction,
     offset,
     0,
     progress
    );
    
   }
  }
 }
 
}

// ЭКИ ТИЛКЕЛҮҮ КАЛГАН ЖОЛДОР

for (const angle of [
  0,
  Math.PI / 2,
  Math.PI,
  Math.PI * 1.5
 ]) {
 
 for (const side of [-1, 1]) {
  
  for (const direction of [-1, 1]) {
   
   const lane = direction * 0.62;
   
   for (let i = 0; i < 2; i++) {
    
    const progress = 15 + i * 18;
    
    const offset = side * 8 + lane;
    
    car(
     offset * Math.cos(angle) +
     progress * Math.sin(angle),
     
     -offset * Math.sin(angle) +
     progress * Math.cos(angle),
     
     trafficColors[(i + 3) % trafficColors.length],
     
     3.5,
     "road",
     angle,
     direction,
     lane,
     side * 8,
     progress
    );
    
   }
  }
 }
}

// =================================
// STREET LAMPS
// =================================

for (let k = -2; k <= 2; k++) {
 
 for (const side of [-1, 1]) {
  
  const x = side * 4.1;
  const z = k * 7;
  
  box(
   scene,
   x,
   0.85,
   z,
   0.09,
   1.7,
   0.09,
   lampMat,
   false
  );
  
  const bulb = new THREE.Mesh(
   new THREE.SphereGeometry(0.18, 10, 8),
   mat("#fff2c9")
  );
  
  bulb.position.set(x, 1.8, z);
  
  scene.add(bulb);
  
 }
 
}

// =================================
// GAME ECONOMY
// =================================

let coins = 500;
let selected = null;

const coinEl = document.querySelector("#coins");
const panel = document.querySelector("#panel");

const title = document.querySelector("#plot-title");
const desc = document.querySelector("#plot-description");

const buildBtn = document.querySelector("#build-btn");
const upgradeBtn = document.querySelector("#upgrade-btn");

const form = document.querySelector("#shop-form");
const stats = document.querySelector("#shop-stats");

function setCoins(v) {
 
 coins = v;
 
 coinEl.textContent =
  Math.floor(coins).toLocaleString("en-US");
 
}

function toast(msg) {
 
 const el = document.querySelector("#toast");
 
 el.textContent = msg;
 
 el.classList.add("show");
 
 setTimeout(() => {
  el.classList.remove("show");
 }, 1800);
 
}

// =================================
// SELECT A PLOT
// =================================

function openPlot(plot) {
 
 selected = plot;
 
 panel.classList.add("open");
 
 form.hidden = true;
 stats.hidden = true;
 
 if (plot.building) {
  const colorControl =
   document.querySelector("#color-control");
  
  colorControl.hidden = false;
  
  document.querySelector("#new-shop-color").value =
   d.color;
  
  const remaining =
   3600000 - (Date.now() - d.lastColorChangeAt);
  
  const colorBtn =
   document.querySelector("#change-color-btn");
  
  const cooldownText =
   document.querySelector("#color-cooldown");
  
  if (remaining > 0) {
   
   const minutes = Math.ceil(remaining / 60000);
   
   colorBtn.disabled = true;
   
   colorBtn.textContent =
    `${minutes} мүнөттөн кийин жеткиликтүү`;
   
   cooldownText.textContent =
    "⏳ Кийинки өзгөртүүгө чейин убакыт бар.";
   
  } else {
   
   colorBtn.disabled = false;
   
   colorBtn.textContent =
    "Түстү өзгөртүү · 100 🪙";
   
   cooldownText.textContent =
    "Түс өзгөртүү акысы: 100 монета.";
   
  }
  const d = plot.building.userData;
  
  title.textContent = d.name;
  
  desc.textContent =
   `${d.type} · ${d.floors}-деңгээл`;
  
  buildBtn.hidden = true;
  upgradeBtn.hidden = false;
  
  upgradeBtn.textContent =
   `Деңгээлин көтөрүү · ${100 + d.floors * 50} 🪙`;
  
  stats.hidden = false;
  
  stats.textContent =
   `🏢 Кабаттар: ${d.floors}`;
  
 } else {
  document.querySelector("#color-control").hidden = true;
  title.textContent = "Бош жер";
  
  desc.textContent =
   "Бул жерге өз дүкөнүңүздү куруңуз.";
  
  buildBtn.hidden = false;
  upgradeBtn.hidden = true;
  
  buildBtn.textContent =
   "Дүкөн куруу · 100 🪙";
  
 }
 
}

// =================================
// CLICK DETECTION
// =================================

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

renderer.domElement.addEventListener(
 "pointerup",
 e => {
  
  const r =
   renderer.domElement.getBoundingClientRect();
  
  pointer.x =
   ((e.clientX - r.left) / r.width) * 2 - 1;
  
  pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  
  raycaster.setFromCamera(pointer, camera);
  
  const hits =
   raycaster.intersectObjects(clickable, true);
  
  if (hits.length) {
   
   const idx =
    hits[0].object.userData.plotIndex;
   
   const plot = plots[idx];
   
   if (plot) openPlot(plot);
   
  }
  
 }
);

// =================================
// BUILD SHOP
// =================================

document.querySelector("#close-panel").onclick = () => {
 panel.classList.remove("open");
};

buildBtn.onclick = () => {
 
 if (!selected) return;
 
 if (coins < 100) {
  return toast("Монета жетишсиз!");
 }
 
 form.hidden = false;
 
 document.querySelector("#shop-name").focus();
 
};

document.querySelector("#confirm-build").onclick = () => {
 
 if (!selected || selected.building) return;
 
 const name =
  document.querySelector("#shop-name").value.trim() ||
  "Менин дүкөнүм";
 
 const type =
  document.querySelector("#shop-type").value;
 
 const color =
  document.querySelector("#shop-color").value;
 
 if (coins < 100) {
  return toast("Монета жетишсиз!");
 }
 
 setCoins(coins - 100);
 
 selected.building = makeTower(
  selected.x,
  selected.z,
  1,
  color,
  name,
  type
 );
 
 form.hidden = true;
 
 openPlot(selected);
 
 toast("Дүкөн ийгиликтүү курулду!");
 
};

// =================================
// UPGRADE SHOP
// =================================

upgradeBtn.onclick = () => {
 
 if (!selected?.building) return;
 
 const d = selected.building.userData;
 
 const cost = 100 + d.floors * 50;
 
 if (coins < cost) {
  return toast("Монета жетишсиз!");
 }
 
 setCoins(coins - cost);
 
 const plot = selected;
 
 scene.remove(plot.building);
 
 buildings.splice(
  buildings.indexOf(plot.building),
  1
 );
 
 plot.building = makeTower(
  plot.x,
  plot.z,
  d.floors + 1,
  d.color,
  d.name,
  d.type,
  d.lastColorChangeAt
 );
 
 openPlot(plot);
 
 toast("Дүкөндүн жаңы кабаты кошулду!");
 
};

// =================================
// SHOP COLOR CHANGE SYSTEM
// =================================

const COLOR_CHANGE_COST = 100;
const COLOR_COOLDOWN = 60 * 60 * 1000;

document.querySelector("#change-color-btn")
 .onclick = () => {
  
  if (!selected?.building) return;
  
  const d = selected.building.userData;
  
  const elapsed =
   Date.now() - d.lastColorChangeAt;
  
  
