// BOUND（Three.js + PointerLock）
// 特色：方塊人外觀/服裝、課金外觀（原創）、方塊放置/破壞、存檔/載入

window.__BOUND_READY = true;
window.__BOUND_BOOT_OK = false;

const $ = (id) => document.getElementById(id);
const ui = {
  menu: $("menu"),
  playBtn: $("playBtn"),
  loadBtn: $("loadBtn"),
  clearBtn: $("clearBtn"),
  sfxToggleBtn: $("sfxToggleBtn"),
  sfxVol: $("sfxVol"),
  expRandomBtn: $("expRandomBtn"),
  expNameText: $("expNameText"),
  experienceList: $("experienceList"),
  sidebar: $("sidebar"),
  sidePanel: $("sidePanel"),
  sidePanelTitle: $("sidePanelTitle"),
  sideClose: $("sideClose"),
  sideHome: $("sideHome"),
  sideStats: $("sideStats"),
  sideAvatar: $("sideAvatar"),
  sideSquad: $("sideSquad"),
  sideMore: $("sideMore"),
  panelHome: $("panel_home"),
  panelStats: $("panel_stats"),
  panelAvatar: $("panel_avatar"),
  panelSquad: $("panel_squad"),
  panelMore: $("panel_more"),
  panelRandomBtn: $("panelRandomBtn"),
  panelExpName: $("panelExpName"),
  panelExperienceList: $("panelExperienceList"),
  panelGems: $("panelGems"),
  panelOwned: $("panelOwned"),
  panelGame: $("panelGame"),
  panelMode: $("panelMode"),
  panelPeers: $("panelPeers"),
  panelPeerList: $("panelPeerList"),
  panelSfxToggle: $("panelSfxToggle"),
  panelSfxVol: $("panelSfxVol"),
  panelToMenu: $("panelToMenu"),
  catalogTabs: $("catalogTabs"),
  catalogHint: $("catalogHint"),
  catalogGrid: $("catalogGrid"),
  skinColors: $("skinColors"),
  shirtColors: $("shirtColors"),
  pantsColors: $("pantsColors"),
  shirtStyles: $("shirtStyles"),
  pantsStyles: $("pantsStyles"),
  hatList: $("hatList"),
  accList: $("accList"),
  randomAvatarBtn: $("randomAvatarBtn"),
  resetAvatarBtn: $("resetAvatarBtn"),
  gemsText: $("gemsText"),
  buyGemsBtn: $("buyGemsBtn"),
  equipNoneBtn: $("equipNoneBtn"),
  cosmeticGrid: $("cosmeticGrid"),
  modeSandboxBtn: $("modeSandboxBtn"),
  modeCoinsBtn: $("modeCoinsBtn"),
  modeObbyBtn: $("modeObbyBtn"),
  camThirdBtn: $("camThirdBtn"),
  camFirstBtn: $("camFirstBtn"),
  camTopBtn: $("camTopBtn"),
  modeHint: $("modeHint"),
  hud: $("hud"),
  sfxBtn: $("sfxBtn"),
  saveBtn: $("saveBtn"),
  exitBtn: $("exitBtn"),
  hotbar: $("hotbar"),
  blockName: $("blockName"),
  hintText: $("hintText"),
  canvas: $("game"),
  gameModeText: $("gameModeText"),
  camModeText: $("camModeText"),
  hudExpText: $("hudExpText"),
  progressText: $("progressText"),
  crosshair: document.querySelector(".crosshair"),
  vipCode: $("vipCode"),
  vipLoginBtn: $("vipLoginBtn"),
  vipLogoutBtn: $("vipLogoutBtn"),
  vipStatus: $("vipStatus"),
  p2pCreateBtn: $("p2pCreateBtn"),
  p2pCloseBtn: $("p2pCloseBtn"),
  p2pStatus: $("p2pStatus"),
  p2pOffer: $("p2pOffer"),
  p2pAnswer: $("p2pAnswer"),
  p2pCopyOffer: $("p2pCopyOffer"),
  p2pMakeAnswer: $("p2pMakeAnswer"),
  p2pApplyAnswer: $("p2pApplyAnswer"),
  touchControls: $("touchControls"),
  touchMove: $("touchMove"),
  touchStick: $("touchStick"),
  touchLook: $("touchLook"),
  touchJump: $("touchJump"),
  touchAction: $("touchAction"),
  touchPlace: $("touchPlace"),
  touchMenu: $("touchMenu"),
};

function setBootMsg(t) {
  const el = $("bootMsg");
  if (el) el.textContent = t;
}

async function loadThree() {
  const urls = [
    "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js",
    "https://unpkg.com/three@0.164.1/build/three.module.js",
    "https://esm.sh/three@0.164.1",
  ];
  let lastErr = null;
  for (const url of urls) {
    try {
      // @ts-ignore - dynamic import URL
      const mod = await import(url);
      return mod;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("無法載入 Three.js");
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function randPick(arr) {
  return arr[(Math.random() * arr.length) | 0];
}

const SAVE_KEY = "bound_world_v1";
const AVATAR_KEY = "bound_avatar_v1";
const PROFILE_KEY = "bound_profile_v1";
const AUDIO_KEY = "bound_audio_v1";
const VIP_KEY = "bound_vip_v1";

function loadAudioSettings() {
  try {
    const raw = localStorage.getItem(AUDIO_KEY);
    if (!raw) throw new Error("empty");
    const a = JSON.parse(raw);
    return {
      enabled: a.enabled !== false,
      volume: typeof a.volume === "number" ? clamp(a.volume, 0, 1) : 0.7,
    };
  } catch {
    return { enabled: true, volume: 0.7 };
  }
}

function loadVip() {
  try {
    const raw = localStorage.getItem(VIP_KEY);
    if (!raw) return { ok: false, hash: null };
    const v = JSON.parse(raw);
    return {
      ok: !!v.ok && typeof v.hash === "string" && v.hash.length > 10,
      hash: typeof v.hash === "string" ? v.hash : null,
    };
  } catch {
    return { ok: false, hash: null };
  }
}

function saveVip(vip) {
  localStorage.setItem(VIP_KEY, JSON.stringify({ ok: !!vip.ok, hash: vip.hash || null, t: Date.now() }));
}

function saveAudioSettings(s) {
  localStorage.setItem(AUDIO_KEY, JSON.stringify({ enabled: !!s.enabled, volume: clamp(s.volume ?? 0.7, 0, 1) }));
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hashToSeed(v) {
  const s = String(v ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeExperiences(count = 100) {
  const ex = [];
  const adjObby = ["霓虹", "彩虹", "虛空", "星際", "冰晶", "熔岩", "極光", "電光", "幻影", "重力"];
  const adjCoins = ["黃金", "閃耀", "超速", "夜市", "暴富", "甜甜圈", "雷霆", "流星", "航海", "神秘"];
  const adjSand = ["建造", "微縮", "島嶼", "森林", "沙漠", "雪境", "礦坑", "城市", "遺跡", "花園"];
  const adjGun = ["特戰", "都市", "沙丘", "霓虹", "工廠", "港口", "荒野", "冰原", "高塔", "地鐵"];
  const adjForest = ["迷霧", "幽影", "深林", "月夜", "黑潮", "冷杉", "苔蘚", "狼嚎", "極夜", "雨林"];

  // 讓每個遊戲的 seed/參數更分歧（真的「都不一樣」）
  const mk = (template, idx, baseSeed) => {
    const seed = (baseSeed + idx * 9973) >>> 0;
    const rng = mulberry32(seed);
    const themeHue = (rng() * 360) | 0;
    const variant = ((rng() * 1e9) | 0).toString(36).slice(0, 4);

    if (template === "obby") {
      const stairs = 8 + ((rng() * 14) | 0); // 8..21
      const ring = 12 + ((rng() * 24) | 0); // 12..35
      const hazards = 5 + ((rng() * 14) | 0); // 5..18
      const movers = 1 + ((rng() * 4) | 0); // 1..4
      const turn = rng() < 0.5 ? -1 : 1;
      const style = rng() < 0.5 ? "spiral" : "bridge";
      const name = `${adjObby[(rng() * adjObby.length) | 0]} 跑酷 #${idx}`;
      return {
        id: `obby_${idx}_${variant}`,
        name,
        template,
        params: { seed, themeHue, stairs, ring, hazards, movers, turn, style },
      };
    }

    if (template === "coins") {
      const total = 12 + ((rng() * 78) | 0); // 12..89
      const radius = 7 + ((rng() * 18) | 0); // 7..24
      const height = 1.2 + rng() * 1.2;
      const name = `${adjCoins[(rng() * adjCoins.length) | 0]} 金幣衝刺 #${idx}`;
      return {
        id: `coins_${idx}_${variant}`,
        name,
        template,
        params: { seed, themeHue, total, radius, height },
      };
    }

    if (template === "gunfight") {
      const bots = 1; // 固定 1v1
      const arena = 18 + ((rng() * 26) | 0); // 18..43
      const name = `${adjGun[(rng() * adjGun.length) | 0]} 槍戰 #${idx}`;
      return {
        id: `gunfight_${idx}_${variant}`,
        name,
        template,
        params: { seed, themeHue, bots, arena },
      };
    }

    if (template === "forest99") {
      const trees = 40 + ((rng() * 160) | 0); // 40..199
      const size = 26 + ((rng() * 22) | 0); // 26..47
      const fog = 0.015 + rng() * 0.02;
      const name = `${adjForest[(rng() * adjForest.length) | 0]} 森林中的九十九夜 #${idx}`;
      return {
        id: `forest99_${idx}_${variant}`,
        name,
        template,
        params: { seed, themeHue, trees, size, fog },
      };
    }

    // sandbox
    const pillars = 8 + ((rng() * 26) | 0); // 8..33
    const spread = 16 + ((rng() * 22) | 0); // 16..37
    const patches = 6 + ((rng() * 16) | 0); // 6..21
    const name = `${adjSand[(rng() * adjSand.length) | 0]} 沙盒 #${idx}`;
    return {
      id: `sandbox_${idx}_${variant}`,
      name,
      template,
      params: { seed, themeHue, pillars, spread, patches },
    };
  };

  const blocks = [
    { template: "obby", n: 30, baseSeed: 0xabc000 },
    { template: "coins", n: 20, baseSeed: 0xdef000 },
    { template: "sandbox", n: 20, baseSeed: 0x123000 },
    { template: "gunfight", n: 15, baseSeed: 0x444000 },
    { template: "forest99", n: 15, baseSeed: 0x222000 },
  ];
  const cycleLen = blocks.reduce((a, b) => a + b.n, 0); // 100
  const want = Math.max(1, (count | 0) || 1);
  for (let g = 1; g <= want; g++) {
    const cycle = ((g - 1) / cycleLen) | 0;
    const within = (g - 1) % cycleLen; // 0..99
    let acc = 0;
    for (const b of blocks) {
      if (within < acc + b.n) {
        const local = within - acc + 1; // 1..b.n
        const idx = local + cycle * b.n; // 讓每種模板的 #idx 持續往上（不重複）
        ex.push(mk(b.template, idx, b.baseSeed));
        break;
      }
      acc += b.n;
    }
  }
  // 給前 100 個縮圖用的穩定編號（01.jpg ~ 100.jpg）
  const maxThumb = Math.min(100, ex.length);
  for (let i = 0; i < maxThumb; i++) ex[i].thumbNo = i + 1;
  return ex;
}

const BLOCKS = [
  { id: "grass", name: "Grass", color: 0x4ade80 },
  { id: "stone", name: "Stone", color: 0x94a3b8 },
  { id: "sand", name: "Sand", color: 0xfbbf24 },
  { id: "wood", name: "Wood", color: 0x92400e },
  { id: "brick", name: "Brick", color: 0xef4444 },
  { id: "leaf", name: "Leaf", color: 0x22c55e },
];

const AVATAR = {
  skinPalette: ["#f7d6c1", "#e9b899", "#c98d6b", "#8a5a3b", "#ffd166", "#c7f9cc", "#a0c4ff"],
  shirtPalette: ["#2b6cff", "#7c2cff", "#ef4444", "#16a34a", "#0f1b3d", "#f59e0b", "#ffffff"],
  pantsPalette: ["#111827", "#334155", "#7c2cff", "#1f2937", "#0b1020", "#92400e", "#0ea5e9"],
  shirtStyles: [
    { id: "solid", name: "純色" },
    { id: "gradient", name: "漸層" },
    { id: "stripe", name: "斜紋" },
    { id: "camo", name: "迷彩" },
    { id: "neon", name: "霓虹線" },
  ],
  pantsStyles: [
    { id: "solid", name: "純色" },
    { id: "gradient", name: "漸層" },
    { id: "stripe", name: "斜紋" },
    { id: "camo", name: "迷彩" },
    { id: "neon", name: "霓虹線" },
  ],
  hats: [
    { id: "none", name: "無" },
    { id: "cap", name: "帽" },
    { id: "tophat", name: "禮" },
    { id: "hood", name: "帽T" },
    { id: "crown", name: "冠" },
  ],
  accs: [
    { id: "none", name: "無" },
    { id: "glasses", name: "鏡" },
    { id: "backpack", name: "包" },
    { id: "horns", name: "角" },
  ],
};

const COSMETICS = [
  {
    id: "none",
    name: "無特效",
    price: 0,
    desc: "不裝備任何課金外觀。",
  },
  {
    id: "user_bundle_cape",
    name: "你的套件披風（自製）",
    price: 0,
    desc: "把你做的圖做成披風貼圖（示意）。",
    img: "./assets/user-premium-bundle.png",
  },
  {
    id: "cape_neon_original",
    name: "霓虹披風（原創）",
    price: 0,
    desc: "披風＋頭盔（紅眼）＋翅膀（發光）＋擺動效果（原創）。",
  },
  {
    id: "emblem_neon",
    name: "霓彩徽章套件",
    price: 1200,
    desc: "背後霓虹光暈＋交叉武器＋發光徽章數字（原創示意）。",
  },
  {
    id: "halo_neon",
    name: "霓虹光環",
    price: 450,
    desc: "頭頂光環（常見熱賣類型：光環/頭飾）。",
  },
  {
    id: "wings_angel",
    name: "拱翼背飾",
    price: 900,
    desc: "背部翅膀（常見熱賣類型：翅膀/背飾）。",
  },
  {
    id: "wings_shadow",
    name: "暗影翼",
    price: 900,
    desc: "黑色翅膀＋淡淡發光邊。",
  },
  {
    id: "backpack_tech",
    name: "科技背包",
    price: 520,
    desc: "背包（常見熱賣類型：背包/背飾）。",
  },
  {
    id: "trail_spark",
    name: "星火拖尾",
    price: 680,
    desc: "移動時留下短暫光點。",
  },
  {
    id: "mask_plate",
    name: "面甲",
    price: 380,
    desc: "臉部配件（常見熱賣類型：面具/臉飾）。",
  },
  {
    id: "pet_cube",
    name: "肩上小方塊",
    price: 420,
    desc: "肩上跟著的小寵物。",
  },
];

function loadAvatar() {
  try {
    const raw = localStorage.getItem(AVATAR_KEY);
    if (!raw) throw new Error("empty");
    const a = JSON.parse(raw);
    return {
      skin: typeof a.skin === "string" ? a.skin : AVATAR.skinPalette[0],
      shirt: typeof a.shirt === "string" ? a.shirt : AVATAR.shirtPalette[0],
      pants: typeof a.pants === "string" ? a.pants : AVATAR.pantsPalette[0],
      shirtStyle: typeof a.shirtStyle === "string" ? a.shirtStyle : "solid",
      pantsStyle: typeof a.pantsStyle === "string" ? a.pantsStyle : "solid",
      hat: typeof a.hat === "string" ? a.hat : "cap",
      acc: typeof a.acc === "string" ? a.acc : "none",
    };
  } catch {
    return {
      skin: AVATAR.skinPalette[0],
      shirt: AVATAR.shirtPalette[0],
      pants: AVATAR.pantsPalette[0],
      shirtStyle: "solid",
      pantsStyle: "solid",
      hat: "cap",
      acc: "none",
    };
  }
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) throw new Error("empty");
    const p = JSON.parse(raw);
    return {
      gems: typeof p.gems === "number" ? p.gems : 1200,
      owned: Array.isArray(p.owned) ? p.owned.filter((x) => typeof x === "string") : [],
      equipped: typeof p.equipped === "string" ? p.equipped : "none",
      gameMode:
        p.gameMode === "coins"
          ? "coins"
          : p.gameMode === "obby"
            ? "obby"
            : p.gameMode === "gunfight"
              ? "gunfight"
              : p.gameMode === "forest99"
                ? "forest99"
                : "sandbox",
      camMode: p.camMode === "first" ? "first" : p.camMode === "top" ? "top" : "third",
      experienceId: typeof p.experienceId === "string" ? p.experienceId : null,
    };
  } catch {
    return { gems: 1200, owned: [], equipped: "none", gameMode: "sandbox", camMode: "third", experienceId: null };
  }
}

function saveAvatar(avatar) {
  localStorage.setItem(AVATAR_KEY, JSON.stringify(avatar));
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function saveWorld(worldBlocks) {
  const arr = [];
  for (const [k, v] of worldBlocks.entries()) arr.push([k, v.type]);
  localStorage.setItem(SAVE_KEY, JSON.stringify(arr));
  ui.hintText.textContent = "已存檔";
  setTimeout(() => (ui.hintText.textContent = "-"), 900);
}

function clearWorldSave() {
  localStorage.removeItem(SAVE_KEY);
  ui.hintText.textContent = "已清除存檔";
  setTimeout(() => (ui.hintText.textContent = "-"), 900);
}

function renderSwatches(container, palette, getVal, setVal, onChange) {
  container.innerHTML = "";
  for (const hex of palette) {
    const b = document.createElement("button");
    b.className = "swatchbtn";
    b.type = "button";
    b.style.background = hex;
    b.title = hex;
    b.addEventListener("click", () => {
      setVal(hex);
      onChange();
    });
    container.appendChild(b);
  }
  Array.from(container.children).forEach((el) => el.classList.toggle("active", el.style.background === getVal()));
}

function renderChips(container, items, getVal, setVal, onChange) {
  container.innerHTML = "";
  for (const it of items) {
    const b = document.createElement("button");
    b.className = "chip";
    b.type = "button";
    b.textContent = it.name;
    b.addEventListener("click", () => {
      setVal(it.id);
      onChange();
    });
    container.appendChild(b);
  }
  Array.from(container.children).forEach((el, idx) => el.classList.toggle("active", items[idx].id === getVal()));
}

function ownsCosmetic(profile, id) {
  if (id === "none") return true;
  return profile.owned.includes(id);
}

function buyCosmetic(profile, id) {
  const c = COSMETICS.find((x) => x.id === id);
  if (!c) return false;
  if (ownsCosmetic(profile, id)) return true;
  if (profile.gems < c.price) return false;
  profile.gems -= c.price;
  profile.owned.push(id);
  return true;
}

function buildHotbar(setSelected) {
  ui.hotbar.innerHTML = "";
  for (let i = 0; i < 5; i++) {
    const b = BLOCKS[i];
    const el = document.createElement("button");
    el.className = "slot";
    el.type = "button";
    el.innerHTML = `<div class="slot__key">${i + 1}</div><div class="slot__name">${b.name}</div>`;
    el.addEventListener("click", () => setSelected(i));
    ui.hotbar.appendChild(el);
  }
}

async function bootstrap() {
  try {
    setBootMsg("載入 3D 引擎中…");
    const THREE = await loadThree();
    setBootMsg("3D 引擎載入完成。");

    let avatar = loadAvatar();
    let profile = loadProfile();
    let audio = loadAudioSettings();
    let vip = loadVip();
    audio.userGesture = false;
    // 瀏覽器限制：AudioContext 必須在使用者手勢後才能啟動
    window.addEventListener(
      "pointerdown",
      () => {
        audio.userGesture = true;
      },
      { once: true }
    );

    const sha256Hex = async (s) => {
      const enc = new TextEncoder();
      const buf = await crypto.subtle.digest("SHA-256", enc.encode(s));
      const arr = Array.from(new Uint8Array(buf));
      return arr.map((b) => b.toString(16).padStart(2, "0")).join("");
    };

    // --- experiences（無限滑動清單：需要時再生更多） ---
    let EXPERIENCES = makeExperiences(100);
    let expById = new Map(EXPERIENCES.map((e) => [e.id, e]));
    const ensureExperiences = (wantCount) => {
      const hardCap = 5000; // 避免 DOM/記憶體爆掉，但實際上已經「滑不完」
      const want = Math.max(100, (wantCount | 0) || 0);
      const target = Math.min(hardCap, want);
      if (EXPERIENCES.length >= target) return;
      EXPERIENCES = makeExperiences(target);
      expById = new Map(EXPERIENCES.map((e) => [e.id, e]));
    };
    let activeExp = null;
    if (profile.experienceId) {
      // 若玩家上次選到比較後面的遊戲（無限清單），這裡會自動擴充清單直到找回來
      for (let n = 100; n <= 5000; n += 100) {
        ensureExperiences(n);
        const hit = expById.get(profile.experienceId);
        if (hit) {
          activeExp = hit;
          break;
        }
      }
    }
    const expThumbCache = new Map(); // id -> dataURL
    const customThumbNoCache = new Map(); // thumbNo -> dataURL (from sheet)
    let customSheetReady = false;
    let numberedThumbsOk = false;
    let numberedThumbsChecked = false;

    function expTag(ex) {
      if (ex.template === "obby") return { text: "跑酷", cls: "tag tag--violet" };
      if (ex.template === "coins") return { text: "金幣", cls: "tag tag--gold" };
      if (ex.template === "gunfight") return { text: "槍戰", cls: "tag tag--red" };
      if (ex.template === "forest99") return { text: "99夜", cls: "tag tag--green" };
      return { text: "沙盒", cls: "tag tag--aqua" };
    }

    function initCustomThumbs() {
      // 目前縮圖統一使用我幫你切好的 100 張 JPG：
      // ./assets/exthumbs/jpg/01.jpg ~ 100.jpg
      // 所以不再載入 sheet.png，也不再探測 1.png~100.png（避免 404/浪費資源）
      customSheetReady = false;
      numberedThumbsOk = false;
      numberedThumbsChecked = true;
      return;

      // 1) 先嘗試載入「100 張縮圖圖集」：./assets/exthumbs/sheet.png
      //    預設切成 10x10（剛好 100 張），依序對應 thumbNo=1..100
      try {
        const img = new Image();
        img.onload = () => {
          const cols = 10;
          const rows = 10;
          const W = 420;
          const H = 240;
          const insetPx = 8; // 內縮像素：確保不吃到白邊/隔壁縮圖

          const detectGutters = (axis, count) => {
            // 找出「格子間距（gutter）」的 run（理論上 count-1 條），
            // 再用 gutter 的左右邊界當切線（比用中心點更不會跨到隔壁）。
            const w = img.width;
            const h = img.height;
            const c0 = document.createElement("canvas");
            c0.width = w;
            c0.height = h;
            const ctx0 = c0.getContext("2d", { willReadFrequently: true });
            if (!ctx0) return null;
            ctx0.drawImage(img, 0, 0);
            const data = ctx0.getImageData(0, 0, w, h).data;

            const len = axis === "x" ? w : h;
            const ortho = axis === "x" ? h : w;
            const step = Math.max(1, Math.floor(ortho / 180)); // 取樣避免太慢

            const mean = new Float32Array(len);
            const varr = new Float32Array(len);
            const bright = new Float32Array(len);

            for (let i = 0; i < len; i++) {
              let n = 0;
              let m = 0;
              let m2 = 0;
              let brightN = 0;
              for (let j = 0; j < ortho; j += step) {
                const x = axis === "x" ? i : j;
                const y = axis === "x" ? j : i;
                const idx = (y * w + x) * 4;
                const r = data[idx] / 255;
                const g = data[idx + 1] / 255;
                const b = data[idx + 2] / 255;
                const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                n++;
                if (lum > 0.92) brightN++;
                const d = lum - m;
                m += d / n;
                m2 += d * (lum - m);
              }
              mean[i] = m;
              varr[i] = n > 1 ? m2 / (n - 1) : 0;
              bright[i] = n ? brightN / n : 0;
            }

            const gutterRuns = (mThr, vThr) => {
              const isGutter = new Uint8Array(len);
              // 需要「幾乎整條都很亮」才算真正格線，避免縮圖內容白字/亮塊誤判成間距
              for (let i = 0; i < len; i++) isGutter[i] = mean[i] > mThr && bright[i] > 0.85 && varr[i] < vThr ? 1 : 0;

              /** @type {Array<{s:number,e:number,c:number,w:number}>} */
              const runs = [];
              let s = -1;
              for (let i = 0; i < len; i++) {
                if (isGutter[i] && s < 0) s = i;
                if ((!isGutter[i] || i === len - 1) && s >= 0) {
                  const e = isGutter[i] ? i - 1 : i;
                  runs.push({ s, e, c: (s + e) / 2, w: e - s + 1 });
                  s = -1;
                }
              }
              runs.sort((a, b) => a.c - b.c);
              // merge very-close runs
              /** @type {Array<{s:number,e:number,c:number,w:number}>} */
              const merged = [];
              for (const r of runs) {
                const last = merged[merged.length - 1];
                if (!last || Math.abs(last.c - r.c) > 3) merged.push(r);
                else {
                  last.s = Math.min(last.s, r.s);
                  last.e = Math.max(last.e, r.e);
                  last.c = (last.s + last.e) / 2;
                  last.w = last.e - last.s + 1;
                }
              }
              return merged;
            };

            const runs =
              gutterRuns(0.92, 0.010) ||
              gutterRuns(0.90, 0.015) ||
              gutterRuns(0.88, 0.020) ||
              [];

            if (!runs.length) return null;

            const cell = len / count;
            // 用期望位置配對最近格線（避免抓到縮圖內容的白字）
            const used = new Set();
            /** @type {Array<{s:number,e:number,c:number,w:number}>} */
            const picks = [];
            for (let k = 1; k < count; k++) {
              const exp = k * cell;
              let best = -1;
              let bestScore = Infinity;
              for (let i = 0; i < runs.length; i++) {
                if (used.has(i)) continue;
                const d = Math.abs(runs[i].c - exp);
                // 偏好「更寬」的真正間距（gutter 通常比白字更寬、更一致）
                const widthBonus = Math.min(18, runs[i].w) * 0.35;
                const score = d - widthBonus;
                if (score < bestScore) {
                  bestScore = score;
                  best = i;
                }
              }
              if (best < 0 || bestScore > cell * 0.45) return null;
              used.add(best);
              picks.push(runs[best]);
            }
            picks.sort((a, b) => a.c - b.c);
            if (picks.length !== count - 1) return null;
            return picks;
          };

          const xGutters = detectGutters("x", cols);
          const yGutters = detectGutters("y", rows);

          customThumbNoCache.clear();
          for (let n = 1; n <= 100; n++) {
            const i = n - 1;
            const cx = i % cols;
            const cy = (i / cols) | 0;
            // 用 gutter「邊界」切：避免混到隔壁縮圖
            const x0 = xGutters ? (cx === 0 ? 0 : xGutters[cx - 1].e + 1) : (img.width * cx) / cols;
            const x1 = xGutters ? (cx === cols - 1 ? img.width : xGutters[cx].s) : (img.width * (cx + 1)) / cols;
            const y0 = yGutters ? (cy === 0 ? 0 : yGutters[cy - 1].e + 1) : (img.height * cy) / rows;
            const y1 = yGutters ? (cy === rows - 1 ? img.height : yGutters[cy].s) : (img.height * (cy + 1)) / rows;
            const cellW = x1 - x0;
            const cellH = y1 - y0;
            const sx = x0 + insetPx;
            const sy = y0 + insetPx;
            const sw = Math.max(1, cellW - insetPx * 2);
            const sh = Math.max(1, cellH - insetPx * 2);
            const c = document.createElement("canvas");
            c.width = W;
            c.height = H;
            const ctx = c.getContext("2d");
            if (!ctx) continue;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            // Roblox 風格：模糊背景填滿 + 前景清晰置中（避免黑邊很醜）
            const srcAR = sw / sh;
            const targetAR = W / H;

            // background cover + blur
            ctx.save();
            ctx.filter = "blur(14px)";
            let bsx = sx, bsy = sy, bsw = sw, bsh = sh;
            if (srcAR > targetAR) {
              bsw = sh * targetAR;
              bsx = sx + (sw - bsw) * 0.5;
            } else {
              bsh = sw / targetAR;
              bsy = sy + (sh - bsh) * 0.5;
            }
            ctx.drawImage(img, Math.round(bsx), Math.round(bsy), Math.round(bsw), Math.round(bsh), 0, 0, W, H);
            ctx.restore();
            ctx.fillStyle = "rgba(0,0,0,0.28)";
            ctx.fillRect(0, 0, W, H);

            // foreground contain (no distortion)
            const scale = Math.min(W / sw, H / sh);
            const dw = sw * scale;
            const dh = sh * scale;
            const dx = (W - dw) * 0.5;
            const dy = (H - dh) * 0.5;
            ctx.drawImage(img, Math.round(sx), Math.round(sy), Math.round(sw), Math.round(sh), dx, dy, dw, dh);

            // subtle frame
            ctx.strokeStyle = "rgba(255,255,255,0.10)";
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, W - 2, H - 2);
            customThumbNoCache.set(n, c.toDataURL("image/png"));
          }
          customSheetReady = true;
          // 讓清單立刻更新成自製縮圖
          refreshExperienceUi?.();
          refreshSideHomeUi?.();
        };
        img.onerror = () => {
          customSheetReady = false;
        };
        img.src = "./assets/exthumbs/sheet.png";
      } catch {}

      // 2) 另外探測「1.png~100.png」模式是否存在（可選）
      if (!numberedThumbsChecked) {
        numberedThumbsChecked = true;
        try {
          const probe = new Image();
          probe.onload = () => {
            numberedThumbsOk = true;
            refreshExperienceUi?.();
            refreshSideHomeUi?.();
          };
          probe.onerror = () => {
            numberedThumbsOk = false;
          };
          probe.src = "./assets/exthumbs/1.png";
        } catch {}
      }
    }

    function getCustomExperienceThumbUrl(ex) {
      // 你自製縮圖放這裡：
      // - 預設縮圖（先全部用同一張）：./assets/exthumbs/default.png
      // - 切好的 100 張 JPG：./assets/exthumbs/jpg/01.jpg ~ 100.jpg
      // - 也可在 params.thumb 指定檔名：例如 { thumb: "mycool.png" } -> ./assets/exthumbs/mycool.png
      if (!ex) return "";
      const t = ex.params?.thumb;
      if (typeof t === "string" && t.trim()) return `./assets/exthumbs/${t.trim()}`;
      // 統一用切好的 jpg（列表全部引用這批）
      if (typeof ex.thumbNo === "number" && ex.thumbNo >= 1) {
        const n = String(ex.thumbNo).padStart(2, "0");
        return `./assets/exthumbs/jpg/${n}.jpg`;
      }
      // 沒有就先用預設圖（不破圖）
      return "./assets/exthumbs/default.png";
    }

    function makeExperienceThumb(ex) {
      if (!ex?.id) return "";
      if (expThumbCache.has(ex.id)) return expThumbCache.get(ex.id);

      const seed = ex.params?.seed ?? hashToSeed(ex.id);
      const rng = mulberry32(seed);
      const W = 420;
      const H = 240;
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const ctx = c.getContext("2d");
      if (!ctx) return "";

      const themeHue = typeof ex?.params?.themeHue === "number" ? ex.params.themeHue : ((rng() * 360) | 0);

      // bg（每個遊戲 hue 不同）
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, `hsl(${themeHue}, 55%, 14%)`);
      bg.addColorStop(1, `hsl(${(themeHue + 30) % 360}, 55%, 6%)`);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // stars / particles
      ctx.globalAlpha = 0.8;
      for (let i = 0; i < 60; i++) {
        const x = rng() * W;
        const y = rng() * H;
        const r = rng() * 2;
        ctx.fillStyle = `rgba(110,231,255,${0.15 + rng() * 0.25})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const rainbow = ["#ff3b3b", "#ff8a00", "#ffd400", "#34d399", "#22c55e", "#38bdf8", "#6366f1", "#a855f7"];

      if (ex.template === "obby") {
        // rainbow path
        ctx.lineWidth = 10;
        ctx.lineCap = "round";
        let px = 40;
        let py = 170;
        for (let i = 0; i < 9; i++) {
          const nx = px + 40 + rng() * 40;
          const ny = py - 14 - rng() * 20;
          ctx.strokeStyle = rainbow[i % rainbow.length];
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.quadraticCurveTo((px + nx) / 2, Math.min(py, ny) - 24, nx, ny);
          ctx.stroke();
          px = nx;
          py = ny;
        }
        // checkpoints
        for (let i = 0; i < 3; i++) {
          const x = 120 + i * 110 + (rng() - 0.5) * 18;
          const y = 150 - i * 30;
          ctx.fillStyle = "rgba(110,231,255,0.85)";
          ctx.fillRect(x - 10, y - 10, 20, 20);
        }
      } else if (ex.template === "coins") {
        // coins scatter
        for (let i = 0; i < 18; i++) {
          const x = 60 + rng() * (W - 120);
          const y = 70 + rng() * (H - 120);
          const r = 10 + rng() * 10;
          const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 2, x, y, r * 1.2);
          g.addColorStop(0, "rgba(255,255,255,0.85)");
          g.addColorStop(0.35, "rgba(251,191,36,0.95)");
          g.addColorStop(1, "rgba(146,64,14,0.85)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,0.25)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else {
        // sandbox blocks mosaic
        const cols = 14;
        const rows = 7;
        const cellW = (W - 80) / cols;
        const cellH = (H - 90) / rows;
        const ox = 40;
        const oy = 70;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const h = rng();
            const hue = 140 + rng() * 60;
            ctx.fillStyle = `hsla(${hue}, 70%, ${35 + h * 20}%, 0.95)`;
            ctx.fillRect(ox + x * cellW, oy + y * cellH, cellW - 2, cellH - 2);
          }
        }
        ctx.strokeStyle = "rgba(255,255,255,0.10)";
        ctx.lineWidth = 2;
        ctx.strokeRect(ox - 2, oy - 2, cols * cellW + 2, rows * cellH + 2);
      }

      // title bar
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, W, 48);
      ctx.font = "900 18px system-ui, -apple-system, Segoe UI, Arial";
      ctx.fillStyle = "rgba(230,233,245,0.95)";
      ctx.fillText(ex.name || "Game", 16, 30);

      const tag = expTag(ex);
      ctx.font = "800 12px system-ui, -apple-system, Segoe UI, Arial";
      ctx.fillStyle = "rgba(110,231,255,0.9)";
      ctx.fillText(tag.text, W - 54, 30);

      // 保證每張縮圖「都不一樣」：加一個 deterministic 的小圖樣 + ID 末碼
      // （即使兩個遊戲剛好畫面很像，也會因為這個 signature 不同而不同）
      const sig = String(ex.id).slice(-6);
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(W - 116, H - 52, 104, 40);
      ctx.globalAlpha = 1;
      ctx.font = "900 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      ctx.fillStyle = "rgba(230,233,245,0.92)";
      ctx.fillText(sig.toUpperCase(), W - 108, H - 26);

      // 5x5 signature grid
      const gx = W - 54;
      const gy = H - 46;
      const cell = 6;
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
          const v = rng() > 0.5;
          ctx.fillStyle = v ? `hsla(${(themeHue + x * 20 + y * 12) % 360},95%,65%,0.95)` : "rgba(255,255,255,0.08)";
          ctx.fillRect(gx + x * (cell + 2), gy + y * (cell + 2), cell, cell);
        }
      }

      const url = c.toDataURL("image/png");
      expThumbCache.set(ex.id, url);
      return url;
    }

    // --- sfx (WebAudio, synth) ---
    const sfx = (() => {
      /** @type {AudioContext | null} */
      let ctx = null;
      /** @type {GainNode | null} */
      let master = null;

      const ensure = async () => {
        if (!audio.enabled) return false;
        if (!ctx) {
          const Ctor = window.AudioContext || window.webkitAudioContext;
          if (!Ctor) return false;
          ctx = new Ctor();
          master = ctx.createGain();
          master.gain.value = audio.volume;
          master.connect(ctx.destination);
        }
        if (ctx.state === "suspended") await ctx.resume();
        return true;
      };

      const setVolume = (v01) => {
        audio.volume = clamp(v01, 0, 1);
        if (master) master.gain.value = audio.volume;
        saveAudioSettings(audio);
      };

      const setEnabled = (on) => {
        audio.enabled = !!on;
        saveAudioSettings(audio);
      };

      const beep = (freqA, freqB, dur = 0.08, type = "sine", gain = 0.10) => {
        if (!ctx || !master) return;
        const t0 = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freqA, t0);
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqB), t0 + dur);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(g);
        g.connect(master);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
      };

      const noise = (dur = 0.10, gain = 0.12, hp = 200, lp = 1800) => {
        if (!ctx || !master) return;
        const t0 = ctx.currentTime;
        const bufferSize = Math.max(1, (ctx.sampleRate * dur) | 0);
        const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const g = ctx.createGain();
        g.gain.setValueAtTime(gain, t0);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        const high = ctx.createBiquadFilter();
        high.type = "highpass";
        high.frequency.value = hp;
        const low = ctx.createBiquadFilter();
        low.type = "lowpass";
        low.frequency.value = lp;
        src.connect(high);
        high.connect(low);
        low.connect(g);
        g.connect(master);
        src.start(t0);
        src.stop(t0 + dur);
      };

      const play = async (name) => {
        if (!audio.enabled) return;
        if (!audio.userGesture) return;
        const ok = await ensure();
        if (!ok) return;
        if (name === "click") beep(520, 760, 0.05, "triangle", 0.06);
        else if (name === "jump") beep(220, 340, 0.10, "sine", 0.10);
        else if (name === "land") noise(0.08, 0.10, 60, 800);
        else if (name === "place") beep(880, 640, 0.06, "square", 0.07);
        else if (name === "break") noise(0.10, 0.14, 120, 2400);
        else if (name === "coin") {
          beep(740, 980, 0.06, "sine", 0.08);
          setTimeout(() => beep(980, 1240, 0.06, "sine", 0.06), 55);
        } else if (name === "checkpoint") {
          beep(660, 990, 0.10, "sine", 0.08);
          setTimeout(() => beep(990, 1320, 0.10, "sine", 0.06), 80);
        } else if (name === "hazard") beep(140, 70, 0.14, "sawtooth", 0.10);
        else if (name === "finish") {
          beep(523, 784, 0.14, "sine", 0.08);
          setTimeout(() => beep(784, 1046, 0.14, "sine", 0.07), 120);
        } else if (name === "equip") beep(880, 1320, 0.08, "triangle", 0.06);
        else if (name === "shoot") beep(220, 110, 0.05, "square", 0.08);
        else if (name === "axe") noise(0.05, 0.10, 200, 2400);
        else if (name === "hit") beep(820, 520, 0.06, "triangle", 0.06);
        else if (name === "hurt") noise(0.06, 0.12, 180, 1600);
        else if (name === "kill") {
          beep(330, 220, 0.07, "sawtooth", 0.08);
          setTimeout(() => beep(220, 110, 0.08, "sine", 0.06), 55);
        }
      };

      return { ensure, play, setEnabled, setVolume };
    })();

    // --- three.js setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1020);

    const renderer = new THREE.WebGLRenderer({ canvas: ui.canvas, antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
    // 讓掛在 camera 上的第一人稱武器/特效能被渲染
    scene.add(camera);
    const camFollow = {
      init: false,
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
    };

    const hemi = new THREE.HemisphereLight(0xbfd7ff, 0x1c234a, 0.8);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(20, 36, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 120;
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    scene.add(sun);

    const groundGeo = new THREE.PlaneGeometry(400, 400, 1, 1);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x121a3a, roughness: 1, metalness: 0 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(400, 80, 0x2a356f, 0x1a234a);
    grid.position.y = 0.01;
    scene.add(grid);

    // --- world blocks ---
    const world = {
      blocks: new Map(), // key -> {type}
      meshes: new Map(), // key -> mesh
    };
    const mode = {
      coins: { items: [], collected: 0, total: 0, startT: 0, done: false },
      obby: {
        platforms: [], // [{mesh, sx, sy, sz, topY}]
        hazards: [], // [{mesh, sx, sy, sz, topY}]
        movers: [], // [{mesh, base:Vector3, axis:Vector3, amp:number, speed:number, phase:number, sx, sy, sz}]
        checkpoints: [], // Vector3[]
        idx: 0,
        startT: 0,
        done: false,
      },
      gunfight: {
        bots: [], // [{mesh, hp, shootCd, hurtCd, score}]
        hurtCd: 0,
        solids: [], // [{mesh, sx, sy, sz}]
        score: 0,
        hp: 100,
        maxHp: 100,
        deadT: 0,
        roundOver: false,
        // RIVALS-like rounds
        phase: "countdown", // countdown | live | intermission | matchOver
        phaseT: 0,
        round: 1,
        toWin: 3,
        pWins: 0,
        eWins: 0,
        spawns: { p: new THREE.Vector3(0, 1.1, 10), e: new THREE.Vector3(0, 1.1, -10) },
      },
      forest99: {
        mobs: [], // [{mesh, hp, atkCd, spd}]
        drops: [], // [{mesh, kind:"wood", spin, bob}]
        inv: { wood: 0 },
        bag: null,
        safe: null, // {center:Vector3, radius:number}
        safeFx: null, // Group
        night: 0,
        hurtCd: 0,
        maxNights: 99,
        t: 0,
        isNight: false,
        hp: 100,
        maxHp: 100,
        fog: 0.02,
        deadT: 0,
        winShown: false,
      },
      group: new THREE.Group(),
    };
    scene.add(mode.group);
    const blockGeo = new THREE.BoxGeometry(1, 1, 1);
    const blockMats = new Map();
    const matFor = (blockId) => {
      if (blockMats.has(blockId)) return blockMats.get(blockId);
      const b = BLOCKS.find((x) => x.id === blockId) ?? BLOCKS[0];
      const m = new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.95, metalness: 0.0 });
      blockMats.set(blockId, m);
      return m;
    };

    function keyOf(x, y, z) {
      return `${x},${y},${z}`;
    }
    function parseKey(k) {
      const [x, y, z] = k.split(",").map((n) => Number(n));
      return { x, y, z };
    }

    function resetWorld() {
      for (const m of world.meshes.values()) scene.remove(m);
      world.blocks.clear();
      world.meshes.clear();
      // clear mode objects
      for (const child of [...mode.group.children]) {
        mode.group.remove(child);
        // dispose materials/geometries (support nested groups too)
        child.traverse?.((obj) => {
          if (obj?.geometry) obj.geometry.dispose?.();
          if (obj?.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose?.());
            else obj.material.dispose?.();
          }
        });
      }
      mode.coins = { items: [], collected: 0, total: 0, startT: 0, done: false };
      mode.obby = { platforms: [], hazards: [], movers: [], checkpoints: [], idx: 0, startT: 0, done: false };
      mode.gunfight = {
        bots: [],
        hurtCd: 0,
        solids: [],
        score: 0,
        hp: 100,
        maxHp: 100,
        deadT: 0,
        roundOver: false,
        phase: "countdown",
        phaseT: 0,
        round: 1,
        toWin: 3,
        pWins: 0,
        eWins: 0,
        spawns: { p: new THREE.Vector3(0, 1.1, 10), e: new THREE.Vector3(0, 1.1, -10) },
      };
      mode.forest99 = {
        mobs: [],
        drops: [],
        inv: { wood: 0 },
        bag: null,
        safe: null,
        safeFx: null,
        night: 0,
        hurtCd: 0,
        maxNights: 99,
        t: 0,
        isNight: false,
        hp: 100,
        maxHp: 100,
        fog: 0.02,
        deadT: 0,
        winShown: false,
      };
    }

    const disposeObject3D = (root) => {
      if (!root) return;
      root.traverse?.((obj) => {
        if (obj?.geometry) obj.geometry.dispose?.();
        if (obj?.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose?.());
          else obj.material.dispose?.();
        }
      });
    };

    function setBlock(x, y, z, type) {
      const k = keyOf(x, y, z);
      if (world.blocks.has(k)) return;
      world.blocks.set(k, { type });
      const mesh = new THREE.Mesh(blockGeo, matFor(type));
      mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.key = k;
      scene.add(mesh);
      world.meshes.set(k, mesh);
    }

    function removeBlock(x, y, z) {
      const k = keyOf(x, y, z);
      const mesh = world.meshes.get(k);
      if (mesh) scene.remove(mesh);
      world.meshes.delete(k);
      world.blocks.delete(k);
    }

    function seedTerrain(opts = {}) {
      const rng = typeof opts.rng === "function" ? opts.rng : Math.random;
      const spread = typeof opts.spread === "number" ? opts.spread : 18;
      const pillars = typeof opts.pillars === "number" ? opts.pillars : 18;
      const patches = typeof opts.patches === "number" ? opts.patches : 10;

      for (let x = -12; x <= 12; x++) {
        for (let z = -12; z <= 12; z++) {
          setBlock(x, -1, z, "stone");
          setBlock(x, 0, z, "grass");
        }
      }
      for (let i = 0; i < pillars; i++) {
        const x = ((rng() * spread - spread / 2) | 0) || 0;
        const z = ((rng() * spread - spread / 2) | 0) || 0;
        const h = 1 + ((rng() * 4) | 0);
        for (let y = 1; y <= h; y++) setBlock(x, y, z, rng() < 0.5 ? "wood" : "brick");
      }

      // 額外裝飾 patch（讓每個沙盒更不一樣）
      for (let i = 0; i < patches; i++) {
        const cx = ((rng() * spread - spread / 2) | 0) || 0;
        const cz = ((rng() * spread - spread / 2) | 0) || 0;
        const r = 1 + ((rng() * 4) | 0);
        const type = rng() < 0.33 ? "sand" : rng() < 0.66 ? "stone" : "brick";
        for (let dx = -r; dx <= r; dx++) {
          for (let dz = -r; dz <= r; dz++) {
            if (dx * dx + dz * dz <= r * r + 0.5) setBlock(cx + dx, 1, cz + dz, type);
          }
        }
      }
    }

    function setupCoinsMode(opts = {}) {
      // 在地面平台上隨機放金幣
      const rng = typeof opts.rng === "function" ? opts.rng : Math.random;
      const total = typeof opts.total === "number" ? opts.total : 20;
      const radius = typeof opts.radius === "number" ? opts.radius : 12;

      const coinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0x442200, roughness: 0.35, metalness: 0.15 });
      const geo = new THREE.CylinderGeometry(0.22, 0.22, 0.06, 20);
      mode.coins.total = total;
      mode.coins.collected = 0;
      mode.coins.startT = performance.now() / 1000;
      mode.coins.done = false;
      for (let i = 0; i < total; i++) {
        const m = new THREE.Mesh(geo, coinMat);
        const a = rng() * Math.PI * 2;
        const r = Math.sqrt(rng()) * radius;
        const x = (Math.cos(a) * r) | 0;
        const z = (Math.sin(a) * r) | 0;
        m.position.set(x + 0.5, 1.3, z + 0.5);
        m.castShadow = true;
        mode.group.add(m);
        mode.coins.items.push(m);
      }
      ui.progressText.textContent = `0/${total}`;
      ui.hintText.textContent = "把金幣撿完！";
      setTimeout(() => (ui.hintText.textContent = "-"), 1200);
    }

    function setupObbyMode(opts = {}) {
      // Parkour / Obby：彩色漂浮平台 + 移動平台 + 陷阱 + 檢查點
      const rng = typeof opts.rng === "function" ? opts.rng : Math.random;
      const params = opts.params || {};
      const stairsN = typeof params.stairs === "number" ? params.stairs : 10;
      const ringN = typeof params.ring === "number" ? params.ring : 18;
      const hazardsN = typeof params.hazards === "number" ? params.hazards : 7;
      const moversN = typeof params.movers === "number" ? params.movers : 2;

      const mkMat = (hex, emissive = 0) =>
        new THREE.MeshStandardMaterial({ color: hex, emissive, roughness: 0.85, metalness: 0.05 });
      const chkMat = new THREE.MeshStandardMaterial({ color: 0x6ee7ff, emissive: 0x113344, roughness: 0.55 });
      const hazardMat = new THREE.MeshStandardMaterial({ color: 0xff3b3b, emissive: 0x220000, roughness: 0.6 });
      const finishMat = new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x052012, roughness: 0.55 });

      const rainbow = [0xff3b3b, 0xff8a00, 0xffd400, 0x34d399, 0x22c55e, 0x38bdf8, 0x6366f1, 0xa855f7];

      const addBox = (pos, size, mat, cast = true) => {
        const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
        const m = new THREE.Mesh(geo, mat);
        m.position.copy(pos);
        m.castShadow = cast;
        m.receiveShadow = true;
        mode.group.add(m);
        return m;
      };

      const registerPlatform = (mesh, size, list) => {
        list.push({
          mesh,
          sx: size.x,
          sy: size.y,
          sz: size.z,
          topY: mesh.position.y + size.y / 2,
        });
      };

      const addPlatform = (pos, size, colorHex) => {
        const mesh = addBox(pos, size, mkMat(colorHex));
        registerPlatform(mesh, size, mode.obby.platforms);
        return mesh;
      };

      const addHazard = (pos, size) => {
        const mesh = addBox(pos, size, hazardMat);
        registerPlatform(mesh, size, mode.obby.hazards);
        return mesh;
      };

      const addCheckpoint = (pos, size) => {
        const mesh = addBox(pos, size, chkMat);
        mesh.userData.checkpoint = mode.obby.checkpoints.length;
        const topY = mesh.position.y + size.y / 2;
        mode.obby.checkpoints.push(new THREE.Vector3(pos.x, topY + 0.01, pos.z));
        return mesh;
      };

      const addMover = (pos, size, colorHex, axis, amp, speed, phase = 0) => {
        const mesh = addBox(pos, size, mkMat(colorHex, 0x050505));
        const mover = {
          mesh,
          base: pos.clone(),
          axis: axis.clone().normalize(),
          amp,
          speed,
          phase,
          sx: size.x,
          sy: size.y,
          sz: size.z,
        };
        mode.obby.movers.push(mover);
        // movers are also solid platforms
        mode.obby.platforms.push({
          mesh,
          sx: size.x,
          sy: size.y,
          sz: size.z,
          topY: mesh.position.y + size.y / 2,
        });
        return mesh;
      };

      // reset obby state
      mode.obby.platforms = [];
      mode.obby.hazards = [];
      mode.obby.movers = [];
      mode.obby.checkpoints = [];
      mode.obby.idx = 0;
      mode.obby.startT = performance.now() / 1000;
      mode.obby.done = false;

      // --- Course layout ---
      // start pad + first checkpoint
      addPlatform(new THREE.Vector3(0, 3.0, 8), new THREE.Vector3(6.0, 0.6, 6.0), 0x94a3b8);
      addCheckpoint(new THREE.Vector3(0, 3.25, 8), new THREE.Vector3(6.4, 0.35, 6.4));

      // rainbow staircase
      for (let i = 0; i < stairsN; i++) {
        const c = rainbow[i % rainbow.length];
        const wob = (rng() - 0.5) * 0.18;
        addPlatform(new THREE.Vector3(0 + wob, 3.8 + i * 0.55, 3 - i * 2.4), new THREE.Vector3(2.6, 0.35, 2.6), c);
        if (i === ((stairsN / 2) | 0)) addCheckpoint(new THREE.Vector3(0, 4.05 + i * 0.55, 3 - i * 2.4), new THREE.Vector3(3.2, 0.32, 3.2));
      }

      // spiral tower ring steps
      const base = new THREE.Vector3(10, 9.4, -26);
      for (let i = 0; i < ringN; i++) {
        const a = (Math.PI * 2 * i) / ringN;
        const r = 6.2;
        const x = base.x + Math.cos(a) * r;
        const z = base.z + Math.sin(a) * r;
        const y = base.y + i * 0.35;
        addPlatform(new THREE.Vector3(x, y, z), new THREE.Vector3(2.2, 0.32, 2.2), rainbow[(i + 2) % rainbow.length]);
      }
      addCheckpoint(new THREE.Vector3(base.x, base.y + 6.6, base.z), new THREE.Vector3(5.2, 0.34, 5.2));

      // gap + moving platforms
      const mvY = base.y + 8.6;
      addPlatform(new THREE.Vector3(18, mvY, -26), new THREE.Vector3(3.0, 0.35, 3.0), 0x38bdf8);
      for (let i = 0; i < moversN; i++) {
        const x = 24 + i * 6;
        const phase = i * 1.2;
        const speed = 1.15 + i * 0.18;
        const amp = 3.6 + (rng() * 1.6);
        const col = rainbow[(i + 5) % rainbow.length];
        addMover(new THREE.Vector3(x, mvY + 0.2, -26), new THREE.Vector3(2.6, 0.35, 2.6), col, new THREE.Vector3(0, 0, 1), amp, speed, phase);
      }
      addPlatform(new THREE.Vector3(24 + moversN * 6, mvY, -26), new THREE.Vector3(3.4, 0.35, 3.4), 0xffd400);
      addCheckpoint(new THREE.Vector3(36, mvY + 0.2, -26), new THREE.Vector3(4.2, 0.34, 4.2));

      // hazard line (kill parts)
      for (let i = 0; i < hazardsN; i++) {
        addHazard(new THREE.Vector3(36 + i * 3.1, mvY - 0.2, -26), new THREE.Vector3(2.2, 0.25, 2.2));
        addPlatform(new THREE.Vector3(36 + i * 3.1, mvY + 0.9, -22), new THREE.Vector3(2.2, 0.35, 2.2), 0x6366f1);
      }

      // finish pad
      addBox(new THREE.Vector3(58, mvY + 2.2, -18), new THREE.Vector3(7.0, 0.6, 7.0), finishMat);
      const finishTop = mvY + 2.2 + 0.6 / 2;
      mode.obby.checkpoints.push(new THREE.Vector3(58, finishTop + 0.01, -18));
      ui.progressText.textContent = `CP 0/${mode.obby.checkpoints.length - 1}`;
      ui.hintText.textContent = "跑酷開始！碰到紅色會回檢查點。";
      setTimeout(() => (ui.hintText.textContent = "-"), 1400);

      // move player to start
      const start = mode.obby.checkpoints[0] ?? new THREE.Vector3(0, 3.35, 8);
      state.pos.copy(start);
      state.vel.set(0, 0, 0);
    }

    function setupGunfightMode(opts = {}) {
      const rng = typeof opts.rng === "function" ? opts.rng : Math.random;
      const params = opts.params || {};
      const botsN = 1; // 1v1 固定 1 個對手
      const arena = typeof params.arena === "number" ? params.arena : 28;

      mode.gunfight.bots = [];
      mode.gunfight.solids = [];
      mode.gunfight.score = 0;
      mode.gunfight.hp = mode.gunfight.maxHp = 100;
      mode.gunfight.deadT = 0;
      mode.gunfight.hurtCd = 0;
      mode.gunfight.roundOver = false;
      mode.gunfight.phase = "countdown";
      mode.gunfight.phaseT = 2.2;
      mode.gunfight.round = 1;
      mode.gunfight.toWin = 3;
      mode.gunfight.pWins = 0;
      mode.gunfight.eWins = 0;

      const mkSolidMat = (c, em = 0x000000) =>
        new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0.02, emissive: em, emissiveIntensity: 0.35 });
      const wallMat = mkSolidMat(0x0f172a, 0x05060a);
      const crateMat = mkSolidMat(0x334155, 0x05060a);
      const platMat = mkSolidMat(0x1f2937, 0x05060a);

      const addSolid = (pos, size, mat) => {
        const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
        const m = new THREE.Mesh(geo, mat);
        m.position.copy(pos);
        m.castShadow = true;
        m.receiveShadow = true;
        mode.group.add(m);
        mode.gunfight.solids.push({ mesh: m, sx: size.x, sy: size.y, sz: size.z });
        return m;
      };

      // --- RIVALS-like arena: symmetrical lanes + central cover + jump spots ---
      const A = clamp(((arena / 1.2) | 0) || 22, 16, 26); // map half-size (visual blocks)
      const G = 1.0; // ground top (blocks at y=0)

      // ground blocks (visual only)
      for (let x = -A; x <= A; x++) {
        for (let z = -A; z <= A; z++) {
          setBlock(x, -1, z, "stone");
          setBlock(x, 0, z, "sand");
        }
      }

      // boundary walls (real collision)
      const W = A - 2;
      const wallH = 3.2;
      const wallT = 1.2;
      addSolid(new THREE.Vector3(0, G + wallH / 2, W), new THREE.Vector3(W * 2 + 6, wallH, wallT), wallMat);
      addSolid(new THREE.Vector3(0, G + wallH / 2, -W), new THREE.Vector3(W * 2 + 6, wallH, wallT), wallMat);
      addSolid(new THREE.Vector3(W, G + wallH / 2, 0), new THREE.Vector3(wallT, wallH, W * 2 + 6), wallMat);
      addSolid(new THREE.Vector3(-W, G + wallH / 2, 0), new THREE.Vector3(wallT, wallH, W * 2 + 6), wallMat);

      // spawns (pads)
      const spawnZ = W - 4;
      const padY = G + 0.25;
      const pad = new THREE.Vector3(6.0, 0.5, 4.2);
      addSolid(new THREE.Vector3(0, padY, spawnZ), pad, platMat);
      addSolid(new THREE.Vector3(0, padY, -spawnZ), pad, platMat);

      // center cover (cross)
      addSolid(new THREE.Vector3(0, G + 0.6, 0), new THREE.Vector3(9.5, 1.2, 1.4), wallMat);
      addSolid(new THREE.Vector3(0, G + 0.6, 0), new THREE.Vector3(1.4, 1.2, 9.5), wallMat);

      // mid crates (peek + hop)
      const crate = new THREE.Vector3(1.0, 1.0, 1.0);
      addSolid(new THREE.Vector3(-3.2, G + 0.5, 3.2), crate, crateMat);
      addSolid(new THREE.Vector3(3.2, G + 0.5, 3.2), crate, crateMat);
      addSolid(new THREE.Vector3(-3.2, G + 0.5, -3.2), crate, crateMat);
      addSolid(new THREE.Vector3(3.2, G + 0.5, -3.2), crate, crateMat);

      // side elevated lanes (need jumps)
      const laneX = W - 4.5;
      const laneY = G + 1.85;
      const lane = new THREE.Vector3(3.0, 0.5, 12.0);
      addSolid(new THREE.Vector3(laneX, laneY, 0), lane, platMat);
      addSolid(new THREE.Vector3(-laneX, laneY, 0), lane, platMat);

      // ramps/steps to lanes (jump rhythm)
      const step = new THREE.Vector3(1.4, 0.5, 1.4);
      const mkSteps = (sx) => {
        addSolid(new THREE.Vector3(sx * (laneX - 2.6), G + 0.95, 5.2), step, crateMat);
        addSolid(new THREE.Vector3(sx * (laneX - 1.6), G + 1.35, 3.8), step, crateMat);
        addSolid(new THREE.Vector3(sx * (laneX - 0.8), G + 1.75, 2.4), step, crateMat);
      };
      mkSteps(1);
      mkSteps(-1);

      // extra cover near spawns (so it feels like RIVALS)
      addSolid(new THREE.Vector3(-4.8, G + 0.55, spawnZ - 4.5), new THREE.Vector3(2.0, 1.1, 6.0), wallMat);
      addSolid(new THREE.Vector3(4.8, G + 0.55, spawnZ - 4.5), new THREE.Vector3(2.0, 1.1, 6.0), wallMat);
      addSolid(new THREE.Vector3(-4.8, G + 0.55, -spawnZ + 4.5), new THREE.Vector3(2.0, 1.1, 6.0), wallMat);
      addSolid(new THREE.Vector3(4.8, G + 0.55, -spawnZ + 4.5), new THREE.Vector3(2.0, 1.1, 6.0), wallMat);

      const mkBotMat = (h, emissive = 0x0a0a12) =>
        new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(h, 0.78, 0.52),
          roughness: 0.62,
          metalness: 0.02,
          emissive,
          emissiveIntensity: 0.35,
        });

      const buildBotHumanoid = (botKey, hue01) => {
        const g = new THREE.Group();
        g.name = `bot_${botKey}`;
        g.userData.botKey = botKey;

        const matBody = mkBotMat(hue01, 0x0c0c14);
        const matLimb = mkBotMat((hue01 + 0.08) % 1, 0x06060e);

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.10, 0.50), matBody);
        torso.position.set(0, 1.20, 0);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.62), matLimb);
        head.position.set(0, 2.05, 0);

        const armGeo = new THREE.BoxGeometry(0.30, 0.86, 0.30);
        const legGeo = new THREE.BoxGeometry(0.36, 0.92, 0.36);
        const armL = new THREE.Mesh(armGeo, matLimb);
        const armR = new THREE.Mesh(armGeo, matLimb);
        armL.position.set(-0.70, 1.35, 0);
        armR.position.set(0.70, 1.35, 0);
        const legL = new THREE.Mesh(legGeo, matBody);
        const legR = new THREE.Mesh(legGeo, matBody);
        legL.position.set(-0.22, 0.50, 0);
        legR.position.set(0.22, 0.50, 0);

        // feet for style
        const footGeo = new THREE.BoxGeometry(0.44, 0.18, 0.56);
        const footL = new THREE.Mesh(footGeo, matLimb);
        const footR = new THREE.Mesh(footGeo, matLimb);
        footL.position.set(-0.22, 0.06, 0.08);
        footR.position.set(0.22, 0.06, 0.08);

        const parts = [torso, head, armL, armR, legL, legR, footL, footR];
        for (const p of parts) {
          p.castShadow = true;
          p.receiveShadow = true;
          p.userData.botKey = botKey;
        }
        g.add(...parts);
        return g;
      };

      for (let i = 0; i < botsN; i++) {
        const botKey = `g${i}`;
        const m = buildBotHumanoid(botKey, (rng() * 360) / 360);
        const baseScale = 1.75;
        m.scale.setScalar(baseScale);
        m.position.set((rng() - 0.5) * arena * 1.2, 1.2, (rng() - 0.5) * arena * 1.2);
        mode.group.add(m);
        mode.gunfight.bots.push({
          key: botKey,
          mesh: m,
          hp: 240,
          maxHp: 240,
          shootCd: 0.55 + rng() * 0.35,
          hurtCd: 0,
          score: 0,
          alive: true,
          baseScale,
          velY: 0,
          onGround: false,
          strafe: rng() < 0.5 ? -1 : 1,
          strafeT: rng() * 10,
        });
      }

      // spawn on pads (pad top = G + 0.5)
      mode.gunfight.spawns.p.set(0, G + 0.5, spawnZ);
      mode.gunfight.spawns.e.set(0, G + 0.5, -spawnZ);

      mode.gunfight.beginRound = () => {
        mode.gunfight.roundOver = false;
        mode.gunfight.phase = "countdown";
        mode.gunfight.phaseT = 2.2;
        mode.gunfight.hurtCd = 0;
        mode.gunfight.hp = mode.gunfight.maxHp = 100;
        state.pos.copy(mode.gunfight.spawns.p);
        state.vel.set(0, 0, 0);
        state.onGround = false;
        const b = mode.gunfight.bots[0];
        if (b) {
          b.alive = true;
          b.mesh.visible = true;
          b.hp = b.maxHp ?? 240;
          b.shootCd = 0.65;
          b.hurtCd = 0;
          b.velY = 0;
          b.onGround = false;
          b.mesh.position.copy(mode.gunfight.spawns.e);
        }
        ui.hintText.textContent = `槍戰 1v1：第 ${mode.gunfight.round} 回合，準備…`;
        ui.progressText.textContent = `HP 100 | 回合 ${mode.gunfight.pWins}-${mode.gunfight.eWins}（先到 ${mode.gunfight.toWin}）`;
      };

      mode.gunfight.endRound = (result) => {
        if (mode.gunfight.phase === "matchOver") return;
        if (mode.gunfight.phase !== "live" && mode.gunfight.phase !== "countdown") return;
        mode.gunfight.phase = "intermission";
        mode.gunfight.phaseT = 2.0;
        mode.gunfight.roundOver = true;

        if (result === "win") mode.gunfight.pWins += 1;
        else mode.gunfight.eWins += 1;

        const won = mode.gunfight.pWins >= mode.gunfight.toWin;
        const lost = mode.gunfight.eWins >= mode.gunfight.toWin;
        if (won || lost) {
          mode.gunfight.phase = "matchOver";
          mode.gunfight.phaseT = 0;
          ui.hintText.textContent = won ? "你贏了！按 R 再來一場。" : "你輸了！按 R 再來一場。";
          return;
        }

        ui.hintText.textContent = result === "win" ? "你贏了這回合！準備下一回合…" : "你輸了這回合！準備下一回合…";
      };

      mode.gunfight.beginRound();
    }

    // forest99 mob factory (set in setupForest99Mode)
    let makeForestMob = null;

    function setupForest99Mode(opts = {}) {
      const rng = typeof opts.rng === "function" ? opts.rng : Math.random;
      const params = opts.params || {};
      const trees = typeof params.trees === "number" ? params.trees : 120;
      const size = typeof params.size === "number" ? params.size : 36;
      const fog = typeof params.fog === "number" ? params.fog : 0.02;

      mode.forest99.mobs = [];
      mode.forest99.drops = [];
      mode.forest99.inv = mode.forest99.inv || { wood: 0 };
      mode.forest99.inv.wood = 0;
      mode.forest99.night = 0;
      mode.forest99.t = 0;
      mode.forest99.isNight = false;
      mode.forest99.hp = mode.forest99.maxHp = 100;
      mode.forest99.fog = fog;
      mode.forest99.deadT = 0;
      mode.forest99.hurtCd = 0;
      mode.forest99.winShown = false;

      // simple bag (third-person visual)
      if (!mode.forest99.bag) {
        const bag = new THREE.Group();
        const bagMat = new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.85, metalness: 0.02 });
        const strapMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9, metalness: 0.02 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.56, 0.22), bagMat);
        body.position.set(0, 1.18, -0.34);
        const flap = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.14, 0.26), bagMat);
        flap.position.set(0, 1.44, -0.34);
        const strapL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.62, 0.08), strapMat);
        const strapR = strapL.clone();
        strapL.position.set(-0.26, 1.28, -0.18);
        strapR.position.set(0.26, 1.28, -0.18);
        for (const m of [body, flap, strapL, strapR]) {
          m.castShadow = true;
          m.receiveShadow = true;
        }
        bag.add(body, flap, strapL, strapR);
        avatarModel.root.add(bag);
        mode.forest99.bag = bag;
      }
      mode.forest99.bag.visible = true;

      // silver fire safe zone (no one can enter)
      mode.forest99.safe = {
        center: new THREE.Vector3(0, 1.1, 8),
        radius: 4.2,
      };
      if (mode.forest99.safeFx) {
        mode.group.remove(mode.forest99.safeFx);
        mode.forest99.safeFx.traverse?.((o) => {
          if (o.geometry) o.geometry.dispose?.();
          if (o.material) {
            if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose?.());
            else o.material.dispose?.();
          }
        });
      }
      const safeFx = new THREE.Group();
      // base plate
      const plate = new THREE.Mesh(
        new THREE.CylinderGeometry(mode.forest99.safe.radius, mode.forest99.safe.radius * 0.92, 0.14, 28),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.55, emissive: 0x0b1020, emissiveIntensity: 0.15 })
      );
      plate.position.copy(mode.forest99.safe.center).add(new THREE.Vector3(0, 0.06, 0));
      plate.castShadow = true;
      plate.receiveShadow = true;
      safeFx.add(plate);
      // silver flame
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.45, 1.35, 18),
        new THREE.MeshStandardMaterial({
          color: 0xe6e9f5,
          roughness: 0.15,
          metalness: 0.35,
          emissive: 0xbfd7ff,
          emissiveIntensity: 1.2,
          transparent: true,
          opacity: 0.85,
        })
      );
      flame.position.copy(mode.forest99.safe.center).add(new THREE.Vector3(0, 1.35, 0));
      flame.castShadow = false;
      safeFx.add(flame);
      // ring glow
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(mode.forest99.safe.radius * 0.98, 0.08, 10, 64),
        new THREE.MeshBasicMaterial({ color: 0xbfd7ff, transparent: true, opacity: 0.35 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.copy(mode.forest99.safe.center).add(new THREE.Vector3(0, 0.12, 0));
      safeFx.add(ring);
      // light
      const pl = new THREE.PointLight(0xbfd7ff, 1.2, 18, 2);
      pl.position.copy(mode.forest99.safe.center).add(new THREE.Vector3(0, 1.4, 0));
      safeFx.add(pl);
      safeFx.userData = { flame, ring };
      mode.group.add(safeFx);
      mode.forest99.safeFx = safeFx;

      makeForestMob = (seedish = Math.random()) => {
        // blocky humanoid: head/torso/arms/legs
        const g = new THREE.Group();
        const seed = hashToSeed(`mob_${seedish}_${Date.now().toString(16).slice(-4)}`);
        const r = mulberry32(seed);
        const hue = (320 + r() * 60) | 0;
        const skin = new THREE.MeshStandardMaterial({ color: 0xf1c7a6, roughness: 0.85 });
        const flesh = new THREE.MeshStandardMaterial({ color: new THREE.Color(`hsl(${hue}, 65%, 38%)`), roughness: 0.75, emissive: new THREE.Color(`hsl(${hue}, 75%, 10%)`), emissiveIntensity: 0.8 });
        const dark = new THREE.MeshStandardMaterial({ color: 0x0b1020, roughness: 0.95 });
        const glow = new THREE.MeshStandardMaterial({ color: 0xff2d95, roughness: 0.25, metalness: 0.1, emissive: 0xff2d95, emissiveIntensity: 1.5 });

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.98, 0.44), flesh);
        torso.position.set(0, 1.18, 0);
        torso.castShadow = true;
        torso.receiveShadow = true;

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.56, 0.56), flesh);
        head.position.set(0, 1.92, 0);
        head.castShadow = true;
        head.receiveShadow = true;

        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.18, 0.50), dark);
        jaw.position.set(0, 1.70, 0.08);
        jaw.castShadow = true;

        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.10, 0.06), glow);
        const eyeR = eyeL.clone();
        eyeL.position.set(-0.14, 1.95, 0.30);
        eyeR.position.set(0.14, 1.95, 0.30);
        eyeL.castShadow = false;
        eyeR.castShadow = false;

        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.78, 0.22), flesh);
        const armR = armL.clone();
        armL.position.set(-0.62, 1.30, 0);
        armR.position.set(0.62, 1.30, 0);
        armL.castShadow = true;
        armR.castShadow = true;
        armL.receiveShadow = true;
        armR.receiveShadow = true;

        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.86, 0.26), flesh);
        const legR = legL.clone();
        legL.position.set(-0.22, 0.43, 0);
        legR.position.set(0.22, 0.43, 0);
        legL.castShadow = true;
        legR.castShadow = true;
        legL.receiveShadow = true;
        legR.receiveShadow = true;

        // simple "hands" tone
        const handL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.24), skin);
        const handR = handL.clone();
        handL.position.set(-0.62, 0.90, 0);
        handR.position.set(0.62, 0.90, 0);
        handL.castShadow = true;
        handR.castShadow = true;

        g.add(torso, head, jaw, eyeL, eyeR, armL, armR, legL, legR, handL, handR);
        g.userData.parts = { head, torso, armL, armR, legL, legR };
        g.userData.kind = "forest_mob";
        return g;
      };

      // forest ground
      for (let x = -size; x <= size; x++) {
        for (let z = -size; z <= size; z++) {
          setBlock(x, -1, z, "stone");
          setBlock(x, 0, z, "grass");
          if (rng() < 0.04) setBlock(x, 1, z, rng() < 0.5 ? "leaf" : "wood");
        }
      }
      // trees
      for (let i = 0; i < trees; i++) {
        const x = ((rng() * size * 2 - size) | 0);
        const z = ((rng() * size * 2 - size) | 0);
        const h = 3 + ((rng() * 6) | 0);
        for (let y = 1; y <= h; y++) setBlock(x, y, z, "wood");
        const r = 2 + ((rng() * 2) | 0);
        for (let dx = -r; dx <= r; dx++) {
          for (let dz = -r; dz <= r; dz++) {
            for (let dy = -1; dy <= 1; dy++) {
              if (dx * dx + dz * dz + dy * dy <= r * r + 0.5) {
                if (rng() < 0.82) setBlock(x + dx, h + dy, z + dz, "leaf");
              }
            }
          }
        }
      }

      // camp / safe start
      for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) setBlock(x, 1, z, "sand");
      for (let y = 1; y <= 3; y++) setBlock(0, y, 0, "brick");

      state.pos.set(0, 1.1, 8);
      state.vel.set(0, 0, 0);
      ui.hintText.textContent = "森林中的九十九夜：白天準備，夜晚撐住怪物。左鍵射擊。";
      ui.progressText.textContent = "夜 0/99 | HP 100 | 木 0";
      setTimeout(() => (ui.hintText.textContent = "-"), 1700);
    }

    function loadWorld() {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const arr = JSON.parse(raw);
      resetWorld();
      for (const [k, type] of arr) {
        const { x, y, z } = parseKey(k);
        setBlock(x, y, z, type);
      }
      return true;
    }

    // --- avatar model ---
    const playerGroup = new THREE.Group();
    scene.add(playerGroup);

    const mats = {
      skin: new THREE.MeshStandardMaterial({ color: new THREE.Color(avatar.skin), roughness: 0.8 }),
      shirt: new THREE.MeshStandardMaterial({ color: new THREE.Color(avatar.shirt), roughness: 0.9 }),
      pants: new THREE.MeshStandardMaterial({ color: new THREE.Color(avatar.pants), roughness: 0.95 }),
      black: new THREE.MeshStandardMaterial({ color: 0x0b1020, roughness: 0.95 }),
      white: new THREE.MeshStandardMaterial({ color: 0xe6e9f5, roughness: 0.85 }),
      gold: new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.45, metalness: 0.15 }),
    };
    const clothTexCache = new Map(); // key -> THREE.Texture

    function buildClothTexture(styleId, baseHex, kind) {
      const key = `${kind}:${styleId}:${baseHex}`;
      if (clothTexCache.has(key)) return clothTexCache.get(key);

      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext("2d");
      if (!ctx) return null;

      const W = c.width;
      const H = c.height;

      const base = baseHex;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, W, H);

      const overlay = (fill, alpha) => {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = fill;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      };

      if (styleId === "graphic_vip" || styleId === "graphic_skull" || styleId === "graphic_lightning" || styleId === "graphic_galaxy") {
        // 圖樣上衣/褲子：用簡單向量圖案疊上去（像商城縮圖那樣）
        overlay("rgba(0,0,0,0.10)", 1);
        const pad = 24;
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate((kind === "pants" ? 0.08 : -0.06));
        ctx.translate(-W / 2, -H / 2);
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        ctx.fillRect(pad, pad, W - pad * 2, H - pad * 2);
        ctx.restore();

        const drawCentered = (draw) => {
          ctx.save();
          ctx.translate(W / 2, H / 2 + (kind === "pants" ? 10 : -8));
          draw();
          ctx.restore();
        };

        if (styleId === "graphic_vip") {
          drawCentered(() => {
            ctx.font = "900 86px system-ui, -apple-system, Segoe UI, Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.lineWidth = 14;
            ctx.strokeStyle = "rgba(0,0,0,0.55)";
            ctx.strokeText("VIP", 0, 0);
            const lg = ctx.createLinearGradient(-90, -50, 90, 50);
            lg.addColorStop(0, "#ff2cff");
            lg.addColorStop(0.5, "#6ee7ff");
            lg.addColorStop(1, "#ffd400");
            ctx.fillStyle = lg;
            ctx.fillText("VIP", 0, 0);
          });
        } else if (styleId === "graphic_skull") {
          drawCentered(() => {
            ctx.fillStyle = "rgba(0,0,0,0.55)";
            ctx.beginPath();
            ctx.arc(0, -10, 58, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,0.85)";
            ctx.beginPath();
            ctx.arc(0, -12, 52, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(0,0,0,0.75)";
            ctx.beginPath();
            ctx.arc(-18, -16, 10, 0, Math.PI * 2);
            ctx.arc(18, -16, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(-16, 8, 32, 18);
            ctx.fillStyle = "rgba(0,0,0,0.65)";
            ctx.fillRect(-10, 10, 4, 14);
            ctx.fillRect(-2, 10, 4, 14);
            ctx.fillRect(6, 10, 4, 14);
          });
        } else if (styleId === "graphic_lightning") {
          drawCentered(() => {
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.beginPath();
            ctx.moveTo(-18, -58);
            ctx.lineTo(10, -10);
            ctx.lineTo(-6, -10);
            ctx.lineTo(18, 58);
            ctx.lineTo(-12, 6);
            ctx.lineTo(6, 6);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(110,231,255,0.55)";
            ctx.lineWidth = 8;
            ctx.stroke();
          });
        } else if (styleId === "graphic_galaxy") {
          drawCentered(() => {
            ctx.globalAlpha = 0.85;
            for (let i = 0; i < 220; i++) {
              const x = (Math.random() * 160 - 80);
              const y = (Math.random() * 120 - 60);
              const r = Math.random() * 2;
              ctx.fillStyle = `hsla(${(190 + Math.random() * 120) % 360},95%,70%,${0.15 + Math.random() * 0.35})`;
              ctx.beginPath();
              ctx.arc(x, y, r, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.globalAlpha = 1;
            const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 80);
            g.addColorStop(0, "rgba(110,231,255,0.35)");
            g.addColorStop(1, "rgba(110,231,255,0)");
            ctx.fillStyle = g;
            ctx.fillRect(-90, -70, 180, 140);
          });
        }
      } else if (styleId === "gradient") {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "rgba(255,255,255,0.18)");
        g.addColorStop(0.5, "rgba(0,0,0,0.0)");
        g.addColorStop(1, "rgba(0,0,0,0.22)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      } else if (styleId === "stripe") {
        overlay("rgba(0,0,0,0.06)", 1);
        ctx.save();
        ctx.translate(W / 2, H / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.translate(-W / 2, -H / 2);
        for (let x = -W; x < W * 2; x += 22) {
          ctx.fillStyle = "rgba(255,255,255,0.16)";
          ctx.fillRect(x, 0, 10, H);
          ctx.fillStyle = "rgba(0,0,0,0.10)";
          ctx.fillRect(x + 10, 0, 3, H);
        }
        ctx.restore();
      } else if (styleId === "camo") {
        const colors =
          kind === "pants"
            ? ["rgba(0,0,0,0.22)", "rgba(255,255,255,0.10)", "rgba(30,41,59,0.22)"]
            : ["rgba(0,0,0,0.18)", "rgba(255,255,255,0.12)", "rgba(15,23,42,0.18)"];
        for (let i = 0; i < 70; i++) {
          const x = Math.random() * W;
          const y = Math.random() * H;
          const r = 10 + Math.random() * 26;
          ctx.fillStyle = colors[i % colors.length];
          ctx.beginPath();
          ctx.ellipse(x, y, r * (0.9 + Math.random() * 0.6), r * (0.7 + Math.random() * 0.7), Math.random() * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (styleId === "neon") {
        overlay("rgba(0,0,0,0.10)", 1);
        for (let i = 0; i < 10; i++) {
          const hue = (190 + i * 14) % 360;
          ctx.strokeStyle = `hsla(${hue}, 95%, 65%, 0.65)`;
          ctx.lineWidth = 6;
          ctx.beginPath();
          const y = 20 + i * 24;
          ctx.moveTo(0, y);
          ctx.bezierCurveTo(W * 0.3, y - 12, W * 0.7, y + 12, W, y);
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 2;
        ctx.strokeRect(14, 14, W - 28, H - 28);
      } else {
        // solid: 加一點點布料陰影，避免太扁
        overlay("rgba(0,0,0,0.06)", 1);
        const g = ctx.createRadialGradient(W * 0.35, H * 0.25, 20, W * 0.5, H * 0.45, 200);
        g.addColorStop(0, "rgba(255,255,255,0.10)");
        g.addColorStop(1, "rgba(0,0,0,0.18)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      const tex = new THREE.CanvasTexture(c);
      if ("colorSpace" in tex) tex.colorSpace = THREE.SRGBColorSpace;
      // @ts-ignore
      if ("encoding" in tex) tex.encoding = THREE.sRGBEncoding;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy?.() ?? 1;
      tex.needsUpdate = true;
      clothTexCache.set(key, tex);
      return tex;
    }

    const avatarModel = {
      root: new THREE.Group(),
      hats: {},
      accs: {},
      cosmeticRoot: new THREE.Group(),
      cosmetics: {},
    };

    // premium FX 狀態必須在 applyCosmetic/clearCosmeticMeshes 之前宣告
    const cosmeticFx = {
      trail: [],
      acc: 0,
    };

    function buildBlockyAvatar() {
      playerGroup.clear();
      avatarModel.root = new THREE.Group();
      playerGroup.add(avatarModel.root);

      // 記錄部位，方便做走路/待機動畫
      avatarModel.parts = {};

      // 潮流比例：稍瘦、稍高、加一點層次
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.90, 1.10, 0.50), mats.shirt);
      torso.position.set(0, 1.15, 0);
      torso.castShadow = true;
      torso.receiveShadow = true;
      avatarModel.root.add(torso);
      avatarModel.parts.torso = torso;

      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.22), mats.skin);
      neck.position.set(0, 1.90, 0);
      avatarModel.root.add(neck);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.62), mats.skin);
      head.position.set(0, 2.08, 0);
      head.castShadow = true;
      head.receiveShadow = true;
      avatarModel.root.add(head);
      avatarModel.parts.head = head;

      // 手臂用「肩關節」群組，旋轉更自然
      const armGeo = new THREE.BoxGeometry(0.28, 0.86, 0.28);
      const mkArm = (side) => {
        const g = new THREE.Group();
        g.position.set(0.56 * side, 1.55, 0); // shoulder
        const m = new THREE.Mesh(armGeo, mats.skin);
        m.position.set(0, -0.43, 0);
        m.castShadow = true;
        g.add(m);
        // 手套/手掌
        const glove = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.14, 0.30), mats.black);
        glove.position.set(0, -0.93, 0.02);
        g.add(glove);
        return { g, m };
      };
      const aL = mkArm(-1);
      const aR = mkArm(1);
      avatarModel.root.add(aL.g);
      avatarModel.root.add(aR.g);
      avatarModel.parts.armL = aL.g;
      avatarModel.parts.armR = aR.g;

      // 腿也用髖關節群組
      const legGeo = new THREE.BoxGeometry(0.34, 0.92, 0.34);
      const mkLeg = (side) => {
        const g = new THREE.Group();
        g.position.set(0.20 * side, 0.84, 0); // hip
        const m = new THREE.Mesh(legGeo, mats.pants);
        m.position.set(0, -0.46, 0);
        m.castShadow = true;
        g.add(m);
        // 球鞋（更帥）
        const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.18, 0.52), mats.black);
        shoe.position.set(0, -0.98, 0.08);
        g.add(shoe);
        const sole = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.54), mats.white);
        sole.position.set(0, -1.08, 0.08);
        g.add(sole);
        return { g, m };
      };
      const lL = mkLeg(-1);
      const lR = mkLeg(1);
      avatarModel.root.add(lL.g);
      avatarModel.root.add(lR.g);
      avatarModel.parts.legL = lL.g;
      avatarModel.parts.legR = lR.g;

      // 腰帶
      const belt = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.10, 0.52), mats.black);
      belt.position.set(0, 0.74, 0);
      avatarModel.root.add(belt);
      const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.08), mats.gold);
      buckle.position.set(0, 0.74, 0.30);
      avatarModel.root.add(buckle);

      // face
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), mats.black);
      eye.position.set(-0.14, 2.12, 0.33);
      avatarModel.root.add(eye);
      const eye2 = eye.clone();
      eye2.position.x = 0.14;
      avatarModel.root.add(eye2);
      // 眉毛 + 微笑（更有表情）
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.02), mats.black);
      brow.position.set(-0.14, 2.20, 0.33);
      avatarModel.root.add(brow);
      const brow2 = brow.clone();
      brow2.position.x = 0.14;
      avatarModel.root.add(brow2);
      const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.05, 0.02), mats.black);
      mouth.position.set(0, 1.98, 0.33);
      avatarModel.root.add(mouth);

      // 角色輪廓線（低成本）：對頭/身體加 edges
      const outlineMat = new THREE.LineBasicMaterial({ color: 0x0b1020, transparent: true, opacity: 0.55 });
      const addOutline = (mesh) => {
        const eg = new THREE.EdgesGeometry(mesh.geometry);
        const ls = new THREE.LineSegments(eg, outlineMat);
        // 重要：把輪廓線掛在 mesh 底下，才會跟著動畫/位移一起動（否則正面會很醜）
        ls.scale.set(1.03, 1.03, 1.03);
        mesh.add(ls);
      };
      addOutline(head);
      addOutline(torso);

      // 面罩/護目鏡（讓正面更帥、更有質感）
      const visorMat = new THREE.MeshStandardMaterial({
        color: 0x0b1020,
        emissive: 0x114466,
        roughness: 0.35,
        metalness: 0.05,
        transparent: true,
        opacity: 0.70,
      });
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.22, 0.03), visorMat);
      visor.position.set(0, 2.12, 0.34);
      visor.castShadow = true;
      avatarModel.root.add(visor);

      // hats
      const hats = {};
      const cap = new THREE.Group();
      const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.40, 0.24, 18), mats.shirt);
      capTop.position.set(0, 2.40, 0);
      capTop.castShadow = true;
      cap.add(capTop);
      const capBill = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.06, 0.26), mats.shirt);
      capBill.position.set(0, 2.31, 0.36);
      capBill.castShadow = true;
      cap.add(capBill);
      hats.cap = cap;

      const topHat = new THREE.Group();
      const th1 = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.42, 18), mats.black);
      th1.position.set(0, 2.45, 0);
      topHat.add(th1);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.06, 18), mats.black);
      brim.position.set(0, 2.22, 0);
      topHat.add(brim);
      hats.tophat = topHat;

      const hood = new THREE.Group();
      const hoodShell = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.78, 0.78), mats.shirt);
      hoodShell.position.set(0, 2.10, 0);
      hoodShell.scale.set(1.05, 1.05, 1.05);
      hoodShell.castShadow = true;
      hood.add(hoodShell);
      hats.hood = hood;

      const crown = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.10, 18), mats.gold);
      ring.position.set(0, 2.33, 0);
      crown.add(ring);
      for (let i = 0; i < 5; i++) {
        const sp = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.22, 10), mats.gold);
        const a = (Math.PI * 2 * i) / 5;
        sp.position.set(Math.cos(a) * 0.34, 2.47, Math.sin(a) * 0.34);
        crown.add(sp);
      }
      hats.crown = crown;
      avatarModel.hats = hats;
      for (const h of Object.values(hats)) {
        h.visible = false;
        avatarModel.root.add(h);
      }

      // accessories
      const accs = {};
      const glasses = new THREE.Group();
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.10, 0.04), mats.black);
      frame.position.set(0, 2.18, 0.34);
      glasses.add(frame);
      const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.02), mats.white);
      lensL.position.set(-0.18, 2.18, 0.36);
      glasses.add(lensL);
      const lensR = lensL.clone();
      lensR.position.x = 0.18;
      glasses.add(lensR);
      accs.glasses = glasses;

      const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.22), mats.black);
      backpack.position.set(0, 1.18, -0.38);
      backpack.castShadow = true;
      accs.backpack = backpack;

      const horns = new THREE.Group();
      const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.28, 10), mats.black);
      hornL.position.set(-0.20, 2.45, 0);
      hornL.rotation.z = 0.25;
      horns.add(hornL);
      const hornR = hornL.clone();
      hornR.position.x = 0.20;
      hornR.rotation.z = -0.25;
      horns.add(hornR);
      accs.horns = horns;

      avatarModel.accs = accs;
      for (const a of Object.values(accs)) {
        a.visible = false;
        avatarModel.root.add(a);
      }

      // premium root
      avatarModel.cosmeticRoot = new THREE.Group();
      avatarModel.root.add(avatarModel.cosmeticRoot);
    }

    function clearCosmeticMeshes() {
      const root = avatarModel.cosmeticRoot;
      if (!root) return;
      for (const child of [...root.children]) {
        root.remove(child);
        if (child.geometry) child.geometry.dispose?.();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose?.());
          else child.material.dispose?.();
        }
      }
      avatarModel.cosmetics = {};
      cosmeticFx.trail.length = 0;
      cosmeticFx.acc = 0;
    }

    function applyCosmetic(id) {
      clearCosmeticMeshes();
      const root = avatarModel.cosmeticRoot;
      if (!root || !id || id === "none") return;

      const glowMat = new THREE.MeshStandardMaterial({ color: 0x6ee7ff, emissive: 0x114466, roughness: 0.35, metalness: 0.1 });
      const shadowGlowMat = new THREE.MeshStandardMaterial({ color: 0x0b1020, emissive: 0x220044, roughness: 0.45, metalness: 0.1 });

      if (id === "user_bundle_cape") {
        // 用你的圖片做「整套」：披風 + 頭盔(紅眼) + 法杖(水晶) + 胸口發光 R + 地板光圈
        // 全部都是原創幾何示意，讓「套件感」更接近你提供的圖
        const loader = new THREE.TextureLoader();
        const tex = loader.load("./assets/user-premium-bundle.png");
        // three r164：優先用 colorSpace（舊版用 encoding）
        if ("colorSpace" in tex) tex.colorSpace = THREE.SRGBColorSpace;
        // @ts-ignore
        if ("encoding" in tex) tex.encoding = THREE.sRGBEncoding;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy?.() ?? 1;

        const kit = new THREE.Group();
        root.add(kit);
        avatarModel.cosmetics.userKit = kit;

        const capeMat = new THREE.MeshStandardMaterial({
          map: tex,
          transparent: true,
          roughness: 0.9,
          metalness: 0.0,
        });
        const cape = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.75, 1, 1), capeMat);
        cape.position.set(0, 1.15, -0.36);
        cape.rotation.y = Math.PI; // 讓貼圖正面朝外
        cape.castShadow = true;
        kit.add(cape);
        avatarModel.cosmetics.cape = cape;

        // 地板光圈
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0x6ee7ff,
          emissive: 0x113344,
          roughness: 0.35,
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
        });
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.65, 1.15, 44), ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(0, 0.05, 0);
        kit.add(ring);
        avatarModel.cosmetics.capeRing = ring;

        // 頭盔（簡化：面罩 + 角）+ 紅眼
        const helm = new THREE.Group();
        const helmMat = new THREE.MeshStandardMaterial({ color: 0x3aa6ff, emissive: 0x0a1a2a, roughness: 0.55, metalness: 0.1 });
        const helmMat2 = new THREE.MeshStandardMaterial({ color: 0x1f3b5a, emissive: 0x050b12, roughness: 0.75, metalness: 0.15 });
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff2d2d, emissive: 0x440000, roughness: 0.25, metalness: 0.0 });
        const shell = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.66, 0.74), helmMat);
        shell.position.set(0, 2.08, 0);
        helm.add(shell);
        const mask = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.46, 0.26), helmMat2);
        mask.position.set(0, 2.04, 0.28);
        helm.add(mask);
        const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.26, 10), helmMat);
        hornL.position.set(-0.24, 2.40, 0.05);
        hornL.rotation.z = 0.35;
        helm.add(hornL);
        const hornR = hornL.clone();
        hornR.position.x = 0.24;
        hornR.rotation.z = -0.35;
        helm.add(hornR);
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.03), eyeMat);
        eyeL.position.set(-0.16, 2.10, 0.43);
        helm.add(eyeL);
        const eyeR = eyeL.clone();
        eyeR.position.x = 0.16;
        helm.add(eyeR);
        kit.add(helm);
        avatarModel.cosmetics.userHelm = helm;

        // 胸口發光 R（Sprite）
        const makeRSprite = () => {
          const c = document.createElement("canvas");
          c.width = 256;
          c.height = 256;
          const ctx = c.getContext("2d");
          if (!ctx) return null;
          ctx.clearRect(0, 0, 256, 256);
          const bg = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
          bg.addColorStop(0, "rgba(110,231,255,0.22)");
          bg.addColorStop(1, "rgba(110,231,255,0.0)");
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, 256, 256);
          ctx.font = "900 150px system-ui, -apple-system, Segoe UI, Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.lineWidth = 18;
          ctx.strokeStyle = "rgba(0,0,0,0.55)";
          ctx.strokeText("R", 128, 140);
          ctx.fillStyle = "#6ee7ff";
          ctx.fillText("R", 128, 140);
          ctx.lineWidth = 6;
          ctx.strokeStyle = "rgba(255,255,255,0.25)";
          ctx.strokeText("R", 128, 140);
          const tex = new THREE.CanvasTexture(c);
          if ("colorSpace" in tex) tex.colorSpace = THREE.SRGBColorSpace;
          // @ts-ignore
          if ("encoding" in tex) tex.encoding = THREE.sRGBEncoding;
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy?.() ?? 1;
          const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
          const sp = new THREE.Sprite(mat);
          sp.scale.set(0.62, 0.62, 0.62);
          return sp;
        };
        const rBadge = makeRSprite();
        if (rBadge) {
          rBadge.position.set(0, 1.20, 0.28); // 胸前
          kit.add(rBadge);
          avatarModel.cosmetics.userRB = rBadge;
        }

        // 法杖（右手附近）
        const staff = new THREE.Group();
        const staffMat = new THREE.MeshStandardMaterial({ color: 0x0b1020, roughness: 0.85 });
        const gemMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x2b0a44, roughness: 0.25, metalness: 0.05, transparent: true, opacity: 0.95 });
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.65, 12), staffMat);
        shaft.position.set(0, 0.2, 0);
        staff.add(shaft);
        const head = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 10, 22), new THREE.MeshStandardMaterial({ color: 0x6ee7ff, emissive: 0x114466, roughness: 0.35 }));
        head.position.set(0, 0.95, 0);
        head.rotation.x = Math.PI / 2;
        staff.add(head);
        const gem = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), gemMat);
        gem.position.set(0, 1.05, 0);
        staff.add(gem);
        staff.position.set(0.82, 0.95, 0.10); // 近似右手
        staff.rotation.z = -0.15;
        staff.rotation.x = 0.05;
        kit.add(staff);
        avatarModel.cosmetics.userStaff = staff;
        avatarModel.cosmetics.userGem = gem;

        return;
      }

      if (id === "cape_neon_original") {
        // 原創披風：程式生成貼圖 + 多段披風網格 + 動態擺動
        const makeCapeTexture = () => {
          const c = document.createElement("canvas");
          c.width = 512;
          c.height = 512;
          const ctx = c.getContext("2d");
          if (!ctx) return null;

          ctx.clearRect(0, 0, c.width, c.height);

          // 背景漸層
          const bg = ctx.createLinearGradient(0, 0, 0, 512);
          bg.addColorStop(0, "#071026");
          bg.addColorStop(0.55, "#0b1020");
          bg.addColorStop(1, "#030614");
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, 512, 512);

          // 霓虹能量線
          ctx.globalAlpha = 0.9;
          for (let i = 0; i < 18; i++) {
            const y = 40 + i * 24 + (Math.random() * 10 - 5);
            const hue = (200 + i * 8) % 360;
            ctx.strokeStyle = `hsla(${hue}, 95%, 65%, 0.55)`;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(40, y);
            ctx.bezierCurveTo(180, y - 18, 320, y + 18, 472, y);
            ctx.stroke();
          }

          // 中央徽章圈
          ctx.globalAlpha = 1;
          const rg = ctx.createRadialGradient(256, 230, 20, 256, 230, 190);
          rg.addColorStop(0, "rgba(110,231,255,0.35)");
          rg.addColorStop(1, "rgba(110,231,255,0)");
          ctx.fillStyle = rg;
          ctx.fillRect(0, 0, 512, 512);

          ctx.strokeStyle = "rgba(110,231,255,0.65)";
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.arc(256, 230, 120, 0, Math.PI * 2);
          ctx.stroke();

          // 原創符號：R
          ctx.font = "900 190px system-ui, -apple-system, Segoe UI, Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.lineWidth = 18;
          ctx.strokeStyle = "rgba(0,0,0,0.6)";
          ctx.strokeText("R", 256, 240);
          const lg = ctx.createLinearGradient(160, 160, 360, 320);
          lg.addColorStop(0, "#ff2cff");
          lg.addColorStop(0.35, "#6ee7ff");
          lg.addColorStop(0.7, "#34d399");
          lg.addColorStop(1, "#ffd400");
          ctx.fillStyle = lg;
          ctx.fillText("R", 256, 240);

          // 底部流光
          const g2 = ctx.createLinearGradient(0, 420, 512, 512);
          g2.addColorStop(0, "rgba(255,44,255,0)");
          g2.addColorStop(0.5, "rgba(110,231,255,0.22)");
          g2.addColorStop(1, "rgba(255,212,0,0)");
          ctx.fillStyle = g2;
          ctx.fillRect(0, 390, 512, 140);

          return c;
        };

        const canvas = makeCapeTexture();
        if (!canvas) return;
        const tex = new THREE.CanvasTexture(canvas);
        if ("colorSpace" in tex) tex.colorSpace = THREE.SRGBColorSpace;
        // @ts-ignore
        if ("encoding" in tex) tex.encoding = THREE.sRGBEncoding;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy?.() ?? 1;
        tex.needsUpdate = true;

        const kit = new THREE.Group();
        root.add(kit);
        avatarModel.cosmetics.userCapeKit = kit;

        // 多段披風網格（越下面擺動越大）
        const capeGeo = new THREE.PlaneGeometry(1.25, 1.75, 12, 18);
        const capeMat = new THREE.MeshStandardMaterial({
          map: tex,
          transparent: true,
          roughness: 0.88,
          metalness: 0.0,
          side: THREE.DoubleSide,
        });
        const cape = new THREE.Mesh(capeGeo, capeMat);
        cape.position.set(0, 1.15, -0.36);
        cape.rotation.y = Math.PI;
        cape.castShadow = true;
        kit.add(cape);
        avatarModel.cosmetics.procCape = cape;
        avatarModel.cosmetics.procCapeBase = capeGeo.attributes.position.array.slice(0); // float32 copy
        avatarModel.cosmetics.procCapeTick = 0;

        // 小光圈
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.62, 1.06, 44),
          new THREE.MeshStandardMaterial({ color: 0x6ee7ff, emissive: 0x113344, roughness: 0.35, transparent: true, opacity: 0.8, depthWrite: false })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(0, 0.05, 0);
        kit.add(ring);
        avatarModel.cosmetics.procCapeRing = ring;

        // 頭盔（原創）+ 紅眼
        const helm = new THREE.Group();
        const helmMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0a1a2a, roughness: 0.55, metalness: 0.1 });
        const helmDark = new THREE.MeshStandardMaterial({ color: 0x0b1020, emissive: 0x050b12, roughness: 0.78, metalness: 0.12 });
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xff2d2d, emissive: 0x550000, roughness: 0.2, metalness: 0.0 });
        const shell = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.68, 0.76), helmMat);
        shell.position.set(0, 2.08, 0);
        helm.add(shell);
        const crest = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.44, 0.70), helmMat);
        crest.position.set(0, 2.26, 0.02);
        helm.add(crest);
        const mask = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.46, 0.28), helmDark);
        mask.position.set(0, 2.04, 0.30);
        helm.add(mask);
        const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.28, 10), helmMat);
        hornL.position.set(-0.26, 2.40, 0.06);
        hornL.rotation.z = 0.40;
        helm.add(hornL);
        const hornR = hornL.clone();
        hornR.position.x = 0.26;
        hornR.rotation.z = -0.40;
        helm.add(hornR);
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.03), eyeMat);
        eyeL.position.set(-0.16, 2.10, 0.45);
        helm.add(eyeL);
        const eyeR = eyeL.clone();
        eyeR.position.x = 0.16;
        helm.add(eyeR);
        kit.add(helm);
        avatarModel.cosmetics.procHelm = helm;

        // 龍頭（左右各 2 顆）
        const dragons = new THREE.Group();
        kit.add(dragons);
        avatarModel.cosmetics.procDragons = dragons;

        const dragonHead = (baseMat, eyeMat) => {
          const g = new THREE.Group();
          // neck (讓它更像「龍頭」而不是漂浮方塊)
          const neck = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.18), baseMat);
          neck.position.set(0, -0.04, -0.18);
          g.add(neck);

          // skull (更長、後腦更大)
          const skull = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.42), baseMat);
          skull.castShadow = true;
          skull.receiveShadow = true;
          g.add(skull);

          // brow ridge（眉骨：讓眼睛更兇）
          const brow = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.06, 0.18), baseMat);
          brow.position.set(0, 0.09, 0.10);
          g.add(brow);

          // snout (拉長嘴吻)
          const snout = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.14, 0.38), baseMat);
          snout.position.set(0, -0.01, 0.40);
          snout.castShadow = true;
          g.add(snout);

          // nostrils
          const nost = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.02), new THREE.MeshStandardMaterial({ color: 0x0b1020, roughness: 0.9 }));
          nost.position.set(-0.05, -0.04, 0.62);
          g.add(nost);
          const nost2 = nost.clone();
          nost2.position.x = 0.05;
          g.add(nost2);

          // jaw (更大，明顯上下顎)
          const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.34), baseMat);
          jaw.position.set(0, -0.14, 0.40);
          g.add(jaw);

          // fangs (側邊獠牙)
          const fangMat = new THREE.MeshStandardMaterial({ color: 0xe6e9f5, roughness: 0.85 });
          const fang = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.08, 10), fangMat);
          fang.position.set(-0.11, -0.14, 0.58);
          fang.rotation.x = Math.PI;
          g.add(fang);
          const fang2 = fang.clone();
          fang2.position.x = 0.11;
          g.add(fang2);

          // teeth row (上排)
          for (let i = 0; i < 4; i++) {
            const t = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.05, 8), fangMat);
            t.position.set(-0.07 + i * 0.045, -0.06, 0.63);
            t.rotation.x = Math.PI;
            g.add(t);
          }

          // horns (更長、往後彎)
          const hornMat = new THREE.MeshStandardMaterial({
            color: baseMat.color?.clone?.() ?? new THREE.Color(0xffffff),
            emissive: baseMat.emissive?.clone?.().multiplyScalar?.(0.6) ?? new THREE.Color(0x000000),
            roughness: 0.45,
            metalness: 0.12,
          });
          const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.20, 12), hornMat);
          hornL.position.set(-0.12, 0.18, -0.16);
          hornL.rotation.x = -0.75;
          hornL.rotation.z = 0.45;
          g.add(hornL);
          const hornR = hornL.clone();
          hornR.position.x = 0.12;
          hornR.rotation.z = -0.45;
          g.add(hornR);

          // spikes / mane
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 10), hornMat);
          for (let i = 0; i < 4; i++) {
            const sp = spike.clone();
            sp.position.set(0, 0.14 - i * 0.04, -0.08 - i * 0.10);
            sp.rotation.x = -0.9;
            g.add(sp);
          }

          // eyes (斜眼更兇)
          const eye = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.035, 0.03), eyeMat);
          eye.position.set(-0.09, 0.045, 0.22);
          eye.rotation.z = 0.22;
          g.add(eye);
          const eye2 = eye.clone();
          eye2.position.x = 0.09;
          eye2.rotation.z = -0.22;
          g.add(eye2);

          return g;
        };

        // 彩虹龍頭材質（跟翅膀一致的霓虹感）
        const dragonBaseMats = Array.from({ length: 8 }, (_, i) => {
          const c = new THREE.Color().setHSL(i / 8, 0.92, 0.55);
          return new THREE.MeshStandardMaterial({
            color: c,
            emissive: c.clone().multiplyScalar(0.22),
            roughness: 0.45,
            metalness: 0.08,
          });
        });
        const dragonEyeMat = new THREE.MeshStandardMaterial({ color: 0xff2d2d, emissive: 0x550000, roughness: 0.2 });

        const mkDragon = (matIdx) => dragonHead(dragonBaseMats[matIdx % dragonBaseMats.length], dragonEyeMat);

        // 位置：以頭部高度為基準（你剛剛調高過頭）
        // 一排的那種：四顆龍頭在頭後方橫向排開（略弧形，兩側更往後，避免擋頭）
        const y0 = 2.18;
        const row = [
          { x: -1.55, y: y0 + 0.06, z: -0.52, mat: 1 },
          { x: -0.52, y: y0 + 0.16, z: -0.38, mat: 2 },
          { x: 0.52, y: y0 + 0.16, z: -0.38, mat: 6 },
          { x: 1.55, y: y0 + 0.06, z: -0.52, mat: 5 },
        ];
        for (const it of row) {
          const d = mkDragon(it.mat);
          d.position.set(it.x, it.y, it.z);
          // 龍頭向前看：跟角色同方向（本模型嘴吻朝 +Z）
          d.rotation.y = 0;
          d.rotation.x = -0.08;
          // 要大：整排放大，並往後放避免擋頭
          d.scale.set(1.55, 1.55, 1.55);
          dragons.add(d);
        }

        // 翅膀（原創）：背部發光「彩虹」翅膀（靜態姿勢）
        const rainbowMats = Array.from({ length: 12 }, (_, i) => {
          const c = new THREE.Color().setHSL(i / 12, 0.95, 0.62);
          return new THREE.MeshStandardMaterial({
            color: c,
            emissive: c.clone().multiplyScalar(0.35),
            roughness: 0.35,
            metalness: 0.05,
            transparent: true,
            opacity: 0.95,
          });
        });
        const pickWingMat = (idx) => rainbowMats[((idx % rainbowMats.length) + rainbowMats.length) % rainbowMats.length];
        const wingDark = new THREE.MeshStandardMaterial({ color: 0x0b1020, emissive: 0x220044, roughness: 0.55, metalness: 0.08 });

        const wings = new THREE.Group();
        // 不要擋頭：整組往下 + 往後（仍然很大）
        wings.position.set(0, 1.18, -0.98);
        wings.scale.set(1.75, 1.75, 1.75);
        kit.add(wings);
        avatarModel.cosmetics.procWings = wings;

        const makeWing = (side) => {
          const g = new THREE.Group();
          const s = side; // -1 left, +1 right

          // hinge
          const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.18, 0.10), wingDark);
          hinge.position.set(0.08 * s, 0.0, 0.02);
          g.add(hinge);

          // 多根翅骨（上翼 + 下翼）— 你要「上下都要」
          const addFeatherRowDown = (rowY, rowZ, count, w0, wStep, h0, hStep, tilt0, tiltStep, matOffset = 0) => {
            for (let i = 0; i < count; i++) {
              const w = w0 + i * wStep;
              const h = h0 + i * hStep;
              const plate = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.04), pickWingMat(matOffset + i + (s === 1 ? 3 : 0)));
              plate.position.set((0.22 + i * 0.14) * s, rowY - i * 0.10, rowZ - i * 0.03);
              plate.rotation.z = (tilt0 - i * tiltStep) * s;
              plate.castShadow = true;
              g.add(plate);
            }
          };
          const addFeatherRowUp = (rowY, rowZ, count, w0, wStep, h0, hStep, tilt0, tiltStep, matOffset = 0) => {
            for (let i = 0; i < count; i++) {
              const w = w0 + i * wStep;
              const h = h0 + i * hStep;
              const plate = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.04), pickWingMat(matOffset + i + (s === 1 ? 6 : 0)));
              // 往上展開：y 不往下掉太多，讓整體有「上翼」的感覺
              plate.position.set((0.20 + i * 0.13) * s, rowY - i * 0.04, rowZ - i * 0.02);
              plate.rotation.z = (tilt0 - i * tiltStep) * s;
              plate.castShadow = true;
              g.add(plate);
            }
          };

          // 上翼（往上張）— 放大：更多片、更寬、更高、更展開
          addFeatherRowUp(0.46, 0.04, 9, 0.44, 0.115, 0.16, 0.032, 0.10, 0.040, 0);
          // 中翼（新增：你說的「中間也要有」）
          // 介於上翼與下翼之間，讓翅膀更滿、更像完整三層結構
          addFeatherRowDown(0.28, 0.01, 9, 0.40, 0.11, 0.15, 0.032, 0.16, 0.055, 1);
          // 中翼（過渡）
          addFeatherRowDown(0.10, -0.02, 8, 0.34, 0.10, 0.14, 0.030, 0.20, 0.070, 3);
          // 下翼（更長、更往下）
          addFeatherRowDown(-0.12, -0.06, 9, 0.40, 0.11, 0.16, 0.034, 0.24, 0.075, 6);

          // 翅骨（中間支撐線）：避免看起來「只有羽片沒有骨架」
          const boneMat = new THREE.MeshStandardMaterial({
            color: 0x0b1020,
            emissive: 0x0a1a2a,
            roughness: 0.6,
            metalness: 0.12,
          });
          const boneGeo = new THREE.BoxGeometry(1.55, 0.03, 0.03);
          const mkBone = (y, z, rotZ) => {
            const b = new THREE.Mesh(boneGeo, boneMat);
            b.position.set(0.78 * s, y, z);
            b.rotation.z = rotZ * s;
            g.add(b);
          };
          mkBone(0.22, -0.02, -0.10);
          mkBone(-0.18, -0.08, -0.18);
          mkBone(-0.58, -0.16, -0.26);

          // 半透明翼膜（增加「整片翅膀」的感覺）
          const membraneMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x0b1222,
            roughness: 0.55,
            metalness: 0.0,
            transparent: true,
            opacity: 0.18,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const membrane = new THREE.Mesh(new THREE.PlaneGeometry(1.90, 1.40, 1, 1), membraneMat);
          membrane.position.set(0.78 * s, -0.22, -0.10);
          membrane.rotation.y = -0.10 * s;
          membrane.rotation.z = -0.22 * s;
          g.add(membrane);

          // tip glow
          const tip1 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.10, 0), pickWingMat(10 + (s === 1 ? 2 : 0)));
          tip1.position.set(1.35 * s, -0.68, -0.20);
          g.add(tip1);
          const tip2 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), pickWingMat(2 + (s === 1 ? 4 : 0)));
          tip2.position.set(1.18 * s, -0.42, -0.16);
          g.add(tip2);
          const tip3 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), pickWingMat(6 + (s === 1 ? 1 : 0)));
          tip3.position.set(1.05 * s, -0.86, -0.24);
          g.add(tip3);

          return g;
        };

        const wingL = makeWing(-1);
        const wingR = makeWing(1);
        wings.add(wingL);
        wings.add(wingR);
        avatarModel.cosmetics.procWingL = wingL;
        avatarModel.cosmetics.procWingR = wingR;

        return;
      }

      if (id === "emblem_neon") {
        const kit = new THREE.Group();

        // 霓虹背板（圓環）
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.08, 12, 36), glowMat);
        ring.position.set(0, 1.25, -0.46);
        ring.rotation.x = Math.PI / 2;
        kit.add(ring);

        // 外框線（像籠子線框）
        const cageGeo = new THREE.BoxGeometry(1.25, 1.45, 0.45);
        const edges = new THREE.EdgesGeometry(cageGeo);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xff2cff });
        const cage = new THREE.LineSegments(edges, lineMat);
        cage.position.set(0, 1.25, -0.46);
        kit.add(cage);

        // 交叉武器（簡化為兩把發光刀）
        const rainbow = [0xff3b3b, 0xff8a00, 0xffd400, 0x34d399, 0x38bdf8, 0x6366f1, 0xa855f7];
        const bladeMat1 = new THREE.MeshStandardMaterial({ color: rainbow[4], emissive: 0x0a2233, roughness: 0.35, metalness: 0.15 });
        const bladeMat2 = new THREE.MeshStandardMaterial({ color: rainbow[6], emissive: 0x220033, roughness: 0.35, metalness: 0.15 });

        const sword = (mat) => {
          const g = new THREE.Group();
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.78, 0.08), mat);
          blade.position.set(0, 0.2, 0);
          g.add(blade);
          const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 10), mat);
          tip.position.set(0, 0.67, 0);
          g.add(tip);
          const guard = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.10), new THREE.MeshStandardMaterial({ color: 0x0b1020, emissive: 0x111111, roughness: 0.6 }));
          guard.position.set(0, -0.18, 0);
          g.add(guard);
          const handle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.06), new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.95 }));
          handle.position.set(0, -0.32, 0);
          g.add(handle);
          return g;
        };

        const s1 = sword(bladeMat1);
        s1.position.set(0, 1.25, -0.46);
        s1.rotation.z = 0.78;
        s1.rotation.x = -0.12;
        kit.add(s1);

        const s2 = sword(bladeMat2);
        s2.position.set(0, 1.25, -0.46);
        s2.rotation.z = -0.78;
        s2.rotation.x = 0.12;
        kit.add(s2);

        // 發光徽章數字（CanvasTexture Sprite）
        const makeNumberSprite = (text) => {
          const c = document.createElement("canvas");
          c.width = 256;
          c.height = 256;
          const ctx = c.getContext("2d");
          if (!ctx) return null;

          // 背景透明，先畫微光暈
          ctx.clearRect(0, 0, c.width, c.height);
          const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
          g.addColorStop(0, "rgba(110,231,255,0.35)");
          g.addColorStop(1, "rgba(110,231,255,0.0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 256, 256);

          // 字體
          ctx.font = "900 118px system-ui, -apple-system, Segoe UI, Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // 漸層字
          const lg = ctx.createLinearGradient(40, 40, 216, 216);
          lg.addColorStop(0, "#ff2cff");
          lg.addColorStop(0.35, "#6ee7ff");
          lg.addColorStop(0.7, "#34d399");
          lg.addColorStop(1, "#ffd400");

          // 外框
          ctx.lineWidth = 16;
          ctx.strokeStyle = "rgba(0,0,0,0.55)";
          ctx.strokeText(text, 128, 132);

          // 內光
          ctx.fillStyle = lg;
          ctx.fillText(text, 128, 132);

          // 小描邊
          ctx.lineWidth = 5;
          ctx.strokeStyle = "rgba(255,255,255,0.25)";
          ctx.strokeText(text, 128, 132);

          const tex = new THREE.CanvasTexture(c);
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy?.() ?? 1;
          tex.needsUpdate = true;
          const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
          const sp = new THREE.Sprite(mat);
          sp.scale.set(1.05, 1.05, 1.05);
          return sp;
        };

        const badge = makeNumberSprite("67");
        if (badge) {
          badge.position.set(0, 1.55, -0.22);
          kit.add(badge);
          avatarModel.cosmetics.badge = badge;
        }

        // 小核心（像頭盔/面具的發光球）
        const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 0), new THREE.MeshStandardMaterial({ color: 0x0b1020, emissive: 0x2b0a44, roughness: 0.6 }));
        core.position.set(0, 1.28, -0.42);
        kit.add(core);

        kit.position.set(0, 0, 0);
        root.add(kit);
        avatarModel.cosmetics.emblemKit = kit;
        return;
      }

      if (id === "halo_neon") {
        const halo = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.06, 12, 28), glowMat);
        halo.position.set(0, 2.35, 0);
        halo.rotation.x = Math.PI / 2;
        root.add(halo);
        return;
      }

      if (id === "backpack_tech") {
        const pack = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.76, 0.22), new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 }));
        pack.position.set(0, 1.18, -0.42);
        pack.castShadow = true;
        root.add(pack);
        const light = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.08, 0.05), glowMat);
        light.position.set(0, 1.02, -0.29);
        root.add(light);
        return;
      }

      if (id === "mask_plate") {
        const plate = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.04), new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.55 }));
        plate.position.set(0, 1.80, 0.34);
        root.add(plate);
        const line = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, 0.02), glowMat);
        line.position.set(0, 1.79, 0.37);
        root.add(line);
        return;
      }

      if (id === "pet_cube") {
        const pet = new THREE.Group();
        const cube = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 }));
        cube.castShadow = true;
        pet.add(cube);
        const e1 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.01), mats.black);
        e1.position.set(-0.05, 0.03, 0.12);
        pet.add(e1);
        const e2 = e1.clone();
        e2.position.x = 0.05;
        pet.add(e2);
        pet.position.set(0.46, 1.62, 0);
        root.add(pet);
        avatarModel.cosmetics.pet = pet;
        return;
      }

      if (id === "wings_angel" || id === "wings_shadow") {
        const mat = id === "wings_shadow" ? shadowGlowMat : glowMat;
        const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 0.55), mat);
        wingL.position.set(-0.46, 1.35, -0.32);
        wingL.rotation.z = 0.25;
        const wingR = wingL.clone();
        wingR.position.x = 0.46;
        wingR.rotation.z = -0.25;
        root.add(wingL);
        root.add(wingR);
        const tip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.24), mat);
        tip.position.set(-0.62, 1.02, -0.38);
        tip.rotation.z = 0.45;
        const tip2 = tip.clone();
        tip2.position.x = 0.62;
        tip2.rotation.z = -0.45;
        root.add(tip);
        root.add(tip2);
        return;
      }

      // trail_spark handled in tick
    }

    function applyAvatar() {
      mats.skin.color.set(avatar.skin);
      // shirt/pants：支援圖案貼圖
      const shirtTex = buildClothTexture(avatar.shirtStyle || "solid", avatar.shirt, "shirt");
      const pantsTex = buildClothTexture(avatar.pantsStyle || "solid", avatar.pants, "pants");
      mats.shirt.map = shirtTex || null;
      mats.pants.map = pantsTex || null;
      mats.shirt.color.set(0xffffff);
      mats.pants.color.set(0xffffff);
      mats.shirt.needsUpdate = true;
      mats.pants.needsUpdate = true;
      for (const [id, h] of Object.entries(avatarModel.hats)) h.visible = id === avatar.hat;
      for (const [id, a] of Object.entries(avatarModel.accs)) a.visible = id === avatar.acc;
      applyCosmetic(profile.equipped);
    }

    // --- catalog (Roblox-like avatar shop UI) ---
    const catalog = (() => {
      /** @type {Array<{id:string, name:string, group:string, kind:string, meta?:string, payload:any}>} */
      const items = [];

      const priceOf = (it) => {
        if (typeof it.price === "number") return it.price;
        if (it.kind === "skin") return 80;
        if (it.kind === "preset") return 220;
        if (it.kind === "shirtStyle" || it.kind === "pantsStyle") return 140;
        if (it.kind === "hat" || it.kind === "acc") return 180;
        if (it.kind === "emote") return 260;
        if (it.kind === "cosmetic") return 420;
        return 200;
      };

      const add = (it) => {
        it.price = priceOf(it);
        items.push(it);
      };

      // avatar quick presets
      add({ id: "av_preset_neo", name: "潮流：Neo", group: "avatar", kind: "preset", meta: "深色街頭", payload: { shirt: "#0f1b3d", pants: "#111827", shirtStyle: "neon", pantsStyle: "solid" } });
      add({ id: "av_preset_snow", name: "潮流：Snow", group: "avatar", kind: "preset", meta: "白灰系", payload: { shirt: "#ffffff", pants: "#334155", shirtStyle: "stripe", pantsStyle: "solid" } });
      add({ id: "av_preset_vip", name: "潮流：VIP", group: "avatar", kind: "preset", meta: "圖樣上衣", payload: { shirt: "#0b1020", pants: "#111827", shirtStyle: "graphic_vip", pantsStyle: "solid" } });
      add({ id: "av_preset_cyber", name: "潮流：Cyber", group: "avatar", kind: "preset", meta: "霓虹科技", payload: { shirt: "#0b1020", pants: "#0b1020", shirtStyle: "graphic_lightning", pantsStyle: "neon", hat: "hood", acc: "backpack" } });
      add({ id: "av_preset_royal", name: "潮流：Royal", group: "avatar", kind: "preset", meta: "王者金黑", payload: { shirt: "#111827", pants: "#111827", shirtStyle: "gradient", pantsStyle: "solid", hat: "crown", acc: "glasses" } });
      add({ id: "av_preset_ranger", name: "潮流：Ranger", group: "avatar", kind: "preset", meta: "森林遊俠", payload: { shirt: "#16a34a", pants: "#92400e", shirtStyle: "camo", pantsStyle: "solid", hat: "cap", acc: "horns" } });
      add({ id: "av_preset_storm", name: "潮流：Storm", group: "avatar", kind: "preset", meta: "雷霆藍白", payload: { shirt: "#2b6cff", pants: "#334155", shirtStyle: "graphic_lightning", pantsStyle: "stripe", hat: "tophat", acc: "glasses" } });
      add({ id: "av_preset_skull", name: "潮流：Skull", group: "avatar", kind: "preset", meta: "暗黑骷髏", payload: { shirt: "#0b1020", pants: "#1f2937", shirtStyle: "graphic_skull", pantsStyle: "solid", hat: "hood", acc: "horns" } });
      add({ id: "av_preset_galaxy", name: "潮流：Galaxy", group: "avatar", kind: "preset", meta: "星雲閃耀", payload: { shirt: "#0b1020", pants: "#111827", shirtStyle: "graphic_galaxy", pantsStyle: "graphic_galaxy", hat: "cap", acc: "backpack" } });
      add({ id: "av_preset_kawaii", name: "潮流：Kawaii", group: "avatar", kind: "preset", meta: "甜系粉紫", payload: { shirt: "#7c2cff", pants: "#0ea5e9", shirtStyle: "stripe", pantsStyle: "gradient", hat: "tophat", acc: "glasses" } });

      // body / skin
      for (let i = 0; i < AVATAR.skinPalette.length; i++) {
        add({ id: `skin_${i}`, name: `膚色 #${i + 1}`, group: "body", kind: "skin", meta: AVATAR.skinPalette[i], payload: { skin: AVATAR.skinPalette[i] } });
      }

      // clothing: styles
      const shirtStyles = ["solid", "gradient", "stripe", "camo", "neon", "graphic_vip", "graphic_skull", "graphic_lightning", "graphic_galaxy"];
      const pantsStyles = ["solid", "gradient", "stripe", "camo", "neon", "graphic_galaxy"];
      for (const st of shirtStyles) {
        add({ id: `shirt_${st}`, name: `上衣：${st}`, group: "clothing", kind: "shirtStyle", meta: "點擊套用", payload: { shirtStyle: st } });
      }
      for (const st of pantsStyles) {
        add({ id: `pants_${st}`, name: `褲子：${st}`, group: "clothing", kind: "pantsStyle", meta: "點擊套用", payload: { pantsStyle: st } });
      }

      // accessories: hats + accs + cosmetics (a few)
      for (const h of AVATAR.hats) {
        if (h.id === "none") continue;
        add({ id: `hat_${h.id}`, name: `帽子：${h.name}`, group: "accessory", kind: "hat", meta: "頭部", payload: { hat: h.id } });
      }
      for (const a of AVATAR.accs) {
        if (a.id === "none") continue;
        add({ id: `acc_${a.id}`, name: `配件：${a.name}`, group: "accessory", kind: "acc", meta: "身上", payload: { acc: a.id } });
      }
      add({ id: "cos_emblem", name: "特效：霓彩徽章", group: "accessory", kind: "cosmetic", meta: "背後特效", payload: { equipped: "emblem_neon" } });
      add({ id: "cos_wings", name: "特效：霓虹披風(原創)", group: "accessory", kind: "cosmetic", meta: "翅膀/龍頭", payload: { equipped: "cape_neon_original" } });

      // emotes (simple triggers)
      add({ id: "emote_wave", name: "動畫：揮手", group: "emote", kind: "emote", meta: "點一下播放", payload: { emote: "wave" } });
      add({ id: "emote_cheer", name: "動畫：歡呼", group: "emote", kind: "emote", meta: "點一下播放", payload: { emote: "cheer" } });

      const thumbCache = new Map();

      const makeThumb = (item) => {
        if (thumbCache.has(item.id)) return thumbCache.get(item.id);
        const W = 360;
        const H = 220;
        const c = document.createElement("canvas");
        c.width = W;
        c.height = H;
        const ctx = c.getContext("2d");
        if (!ctx) return "";

        // bg gradient by id
        const seed = hashToSeed(item.id);
        const rng = mulberry32(seed);
        const hue = (rng() * 360) | 0;
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, `hsla(${hue}, 55%, 18%, 1)`);
        bg.addColorStop(1, `hsla(${(hue + 30) % 360}, 55%, 8%, 1)`);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // icon-ish shapes by kind
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(14, 14, W - 28, H - 28);

        const label = (t) => {
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.fillRect(0, 0, W, 44);
          ctx.font = "900 16px system-ui, -apple-system, Segoe UI, Arial";
          ctx.fillStyle = "rgba(230,233,245,0.95)";
          ctx.fillText(t, 14, 28);
        };

        if (item.kind === "preset") {
          const shirtHex = item.payload?.shirt || "#2b6cff";
          const pantsHex = item.payload?.pants || "#111827";
          const shirtStyle = item.payload?.shirtStyle || "solid";
          const pantsStyle = item.payload?.pantsStyle || "solid";
          const skinHex = item.payload?.skin || avatar.skin || "#f7d6c1";

          // head
          ctx.fillStyle = skinHex;
          ctx.beginPath();
          ctx.arc(W / 2, 92, 34, 0, Math.PI * 2);
          ctx.fill();
          // eyes
          ctx.fillStyle = "rgba(0,0,0,0.45)";
          ctx.beginPath();
          ctx.arc(W / 2 - 12, 88, 4.5, 0, Math.PI * 2);
          ctx.arc(W / 2 + 12, 88, 4.5, 0, Math.PI * 2);
          ctx.fill();

          // shirt (use cloth texture if available)
          const shirtTex = buildClothTexture(shirtStyle, shirtHex, "shirt");
          if (shirtTex?.image) ctx.drawImage(shirtTex.image, W / 2 - 70, 122, 140, 62);
          else {
            ctx.fillStyle = shirtHex;
            ctx.fillRect(W / 2 - 70, 122, 140, 62);
          }
          // pants
          const pantsTex = buildClothTexture(pantsStyle, pantsHex, "pants");
          if (pantsTex?.image) ctx.drawImage(pantsTex.image, W / 2 - 70, 186, 140, 58);
          else {
            ctx.fillStyle = pantsHex;
            ctx.fillRect(W / 2 - 70, 186, 140, 58);
          }
          // simple outline
          ctx.strokeStyle = "rgba(230,233,245,0.28)";
          ctx.lineWidth = 3;
          ctx.strokeRect(W / 2 - 70, 122, 140, 62);
          ctx.strokeRect(W / 2 - 70, 186, 140, 58);

          // hat / acc indicators
          const hat = item.payload?.hat;
          const acc = item.payload?.acc;
          if (hat) {
            ctx.fillStyle = "rgba(110,231,255,0.55)";
            ctx.fillRect(W / 2 - 34, 54, 68, 10);
            ctx.fillRect(W / 2 - 24, 38, 48, 18);
          }
          if (acc) {
            ctx.strokeStyle = "rgba(110,231,255,0.55)";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(W / 2, 150, 44, 0, Math.PI * 2);
            ctx.stroke();
          }
          label("套裝");
        } else if (item.kind === "skin") {
          ctx.fillStyle = item.payload.skin;
          ctx.beginPath();
          ctx.arc(W / 2, H / 2 + 10, 60, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.beginPath();
          ctx.arc(W / 2 - 20, H / 2 - 5, 8, 0, Math.PI * 2);
          ctx.arc(W / 2 + 20, H / 2 - 5, 8, 0, Math.PI * 2);
          ctx.fill();
          label("膚色");
        } else if (item.kind === "shirtStyle" || item.kind === "pantsStyle") {
          const styleId = item.kind === "shirtStyle" ? item.payload.shirtStyle : item.payload.pantsStyle;
          const base = item.kind === "shirtStyle" ? (avatar.shirt || "#2b6cff") : (avatar.pants || "#111827");
          // reuse buildClothTexture by drawing to temp canvas
          const tex = buildClothTexture(styleId, base, item.kind === "shirtStyle" ? "shirt" : "pants");
          if (tex?.image) ctx.drawImage(tex.image, 60, 62, 240, 140);
          label(item.kind === "shirtStyle" ? "上衣" : "褲子");
        } else if (item.kind === "hat") {
          ctx.fillStyle = "rgba(110,231,255,0.22)";
          ctx.beginPath();
          ctx.roundRect(70, 88, 220, 90, 18);
          ctx.fill();
          ctx.fillStyle = "rgba(0,0,0,0.30)";
          ctx.fillRect(90, 120, 180, 20);
          label("帽子");
        } else if (item.kind === "acc") {
          ctx.strokeStyle = "rgba(110,231,255,0.65)";
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.arc(W / 2, H / 2 + 12, 62, 0, Math.PI * 2);
          ctx.stroke();
          label("配件");
        } else if (item.kind === "cosmetic") {
          ctx.strokeStyle = "rgba(255,44,255,0.7)";
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(90, 150);
          ctx.lineTo(270, 90);
          ctx.moveTo(90, 90);
          ctx.lineTo(270, 150);
          ctx.stroke();
          label("特效");
        } else if (item.kind === "emote") {
          ctx.fillStyle = "rgba(251,191,36,0.22)";
          ctx.beginPath();
          ctx.arc(W / 2, H / 2 + 10, 62, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(230,233,245,0.90)";
          ctx.font = "900 44px system-ui, -apple-system, Segoe UI, Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("♪", W / 2, H / 2 + 10);
          label("動畫");
        } else {
          label("虛擬人偶");
        }

        // signature
        ctx.font = "900 12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
        ctx.fillStyle = "rgba(230,233,245,0.65)";
        ctx.fillText(item.id.slice(-6).toUpperCase(), W - 92, H - 18);

        const url = c.toDataURL("image/png");
        thumbCache.set(item.id, url);
        return url;
      };

      return { items, makeThumb };
    })();

    buildBlockyAvatar();
    applyAvatar();

    // --- input / gameplay ---
    const state = {
      running: false,
      selected: 0,
      pointerLocked: false,
      yaw: 0,
      pitch: 0,
      camYaw: 0, // 第三人稱相機 yaw（與角色朝向分離）
      camPitch: 0, // 第三人稱相機 pitch（與角色朝向分離）
      keys: new Set(),
      pos: new THREE.Vector3(0, 3, 8),
      vel: new THREE.Vector3(),
      onGround: false,
      prevOnGround: false,
      wantBreak: false,
      wantPlace: false,
      wantShoot: false,
      triggerShoot: false,
      shootCd: 0,
      shootPulse: 0,
      touch: {
        enabled: false,
        // move stick (-1..1)
        mx: 0,
        my: 0,
        movePid: null,
        stickCx: 0,
        stickCy: 0,
        // look pad
        lookPid: null,
        lookLastX: 0,
        lookLastY: 0,
        // buttons
        jump: false,
      },
      dragLook: false, // 沒有 pointer lock 時，按住右鍵拖曳轉視角
      lastMouseX: 0,
      lastMouseY: 0,
      catalogTab: "all",
      emote: null,
      emoteT: 0,
    };

    const applyLookDelta = (dx, dy) => {
      const sens = 0.0023;
      if (profile.camMode === "third") {
        state.camYaw -= dx * sens;
        state.camPitch -= dy * sens;
        state.camPitch = clamp(state.camPitch, -1.15, 1.15);
      } else {
        state.yaw -= dx * sens;
        state.pitch -= dy * sens;
        state.pitch = clamp(state.pitch, -1.15, 1.15);
      }
    };

    // --- simple weapon model (visible gun / axe) ---
    const weapon = (() => {
      const fp = new THREE.Group(); // first-person weapon (attached to camera)
      const tp = new THREE.Group(); // third-person weapon (attached to right arm)
      fp.name = "weapon_fp";
      tp.name = "weapon_tp";

      const gunMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.55, metalness: 0.18 });
      const accentMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.35, metalness: 0.05, emissive: 0x0b2440, emissiveIntensity: 0.6 });
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x7c4a1d, roughness: 0.9, metalness: 0.02 });
      const ironMat = new THREE.MeshStandardMaterial({ color: 0xa3a7b3, roughness: 0.35, metalness: 0.22, emissive: 0x0b0b12, emissiveIntensity: 0.25 });

      const buildGun = (scale = 1) => {
        const g = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.22, 1.05), gunMat);
        body.position.set(0, 0, -0.35);
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.38, 0.26), gunMat);
        grip.position.set(0.10, -0.28, -0.05);
        grip.rotation.x = -0.25;
        const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.62), gunMat);
        barrel.position.set(0, 0.03, -0.92);
        const sight = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.22), accentMat);
        sight.position.set(0, 0.16, -0.25);

        body.castShadow = true;
        grip.castShadow = true;
        barrel.castShadow = true;
        sight.castShadow = true;
        body.receiveShadow = true;
        grip.receiveShadow = true;
        barrel.receiveShadow = true;

        g.add(body, grip, barrel, sight);
        g.scale.setScalar(scale);
        return g;
      };

      const buildAxe = (scale = 1) => {
        const g = new THREE.Group();
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.05, 0.12), woodMat);
        handle.position.set(0.10, -0.20, -0.25);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.28, 0.16), ironMat);
        head.position.set(0.16, 0.35, -0.25);
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.34, 0.06), ironMat);
        blade.position.set(0.34, 0.35, -0.25);
        const spike = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.18, 0.10), ironMat);
        spike.position.set(-0.08, 0.35, -0.25);

        handle.castShadow = true;
        head.castShadow = true;
        blade.castShadow = true;
        spike.castShadow = true;
        handle.receiveShadow = true;
        head.receiveShadow = true;
        blade.receiveShadow = true;

        g.add(handle, head, blade, spike);
        g.scale.setScalar(scale);
        return g;
      };

      const fpGun = buildGun(0.75);
      const tpGun = buildGun(0.55);
      const fpAxe = buildAxe(0.85);
      const tpAxe = buildAxe(0.65);
      fp.add(fpGun, fpAxe);
      tp.add(tpGun, tpAxe);

      // muzzle flash (simple quad)
      const flashMat = new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0.0, depthWrite: false });
      const flashGeo = new THREE.PlaneGeometry(0.22, 0.22);
      const fpFlash = new THREE.Mesh(flashGeo, flashMat.clone());
      const tpFlash = new THREE.Mesh(flashGeo, flashMat.clone());
      fpFlash.position.set(0, 0.02, -1.08);
      tpFlash.position.set(0, 0.02, -1.08);
      fpFlash.rotation.y = Math.PI;
      tpFlash.rotation.y = Math.PI;
      fpGun.add(fpFlash);
      tpGun.add(tpFlash);

      // attach FP to camera so it shows even when player hidden
      camera.add(fp);
      const fpGunPos = new THREE.Vector3(0.42, -0.32, -0.72);
      const fpGunRot = new THREE.Euler(0.02, -0.02, 0.02);
      const fpAxePos = new THREE.Vector3(0.46, -0.36, -0.66);
      const fpAxeRot = new THREE.Euler(-0.35, 0.30, 0.15);
      fp.position.copy(fpGunPos);
      fp.rotation.copy(fpGunRot);

      let recoil = 0;
      let flashT = 0;
      let swing = 0;

      const activeKind = () => (profile.gameMode === "forest99" ? "axe" : "gun");

      const attachThirdPerson = () => {
        const arm = avatarModel.parts?.armR;
        const parent = arm ?? playerGroup;
        if (tp.parent !== parent) {
          tp.parent?.remove(tp);
          parent.add(tp);
        }
        // hand-ish placement (varies by weapon)
        const k = activeKind();
        if (arm) {
          if (k === "axe") {
            tp.position.set(0.10, -0.78, -0.05);
            tp.rotation.set(-0.55, 0.45, 0.15);
          } else {
            tp.position.set(0.14, -0.92, -0.18);
            tp.rotation.set(-0.15, 0.25, 0.0);
          }
        } else {
          tp.position.set(0.55, 1.05, -0.35);
          tp.rotation.set(0, 0, 0);
        }
      };

      const shootFx = () => {
        if (activeKind() === "axe") {
          swing = Math.min(1, swing + 1);
        } else {
          recoil = Math.min(1, recoil + 1);
          flashT = 0.06;
        }
      };

      const update = (dt) => {
        const isCombatMode = profile.gameMode === "gunfight" || profile.gameMode === "forest99";
        const k = activeKind();
        fp.visible = isCombatMode && profile.camMode === "first";
        tp.visible = isCombatMode && profile.camMode !== "first";

        fpGun.visible = fp.visible && k === "gun";
        fpAxe.visible = fp.visible && k === "axe";
        tpGun.visible = tp.visible && k === "gun";
        tpAxe.visible = tp.visible && k === "axe";

        if (tp.visible) attachThirdPerson();

        // recoil / swing + sway (FP only)
        recoil = Math.max(0, recoil - dt * 9.5);
        swing = Math.max(0, swing - dt * 7.5);
        if (fp.visible) {
          const spd = Math.min(1, Math.hypot(state.vel.x, state.vel.z) / 7.2);
          const t = performance.now() * 0.001;
          const sway = 0.006 + spd * 0.012;
          if (k === "axe") {
            fp.position.x = fpAxePos.x + Math.sin(t * 8.0) * sway;
            fp.position.y = fpAxePos.y + Math.cos(t * 10.0) * sway * 0.6;
            fp.position.z = fpAxePos.z;
            fp.rotation.set(fpAxeRot.x, fpAxeRot.y, fpAxeRot.z);
            // swing
            const s = swing;
            fp.rotation.x += s * 0.85;
            fp.rotation.z -= s * 0.55;
          } else {
            fp.position.x = fpGunPos.x + Math.sin(t * 8.0) * sway;
            fp.position.y = fpGunPos.y + Math.cos(t * 10.0) * sway * 0.6;
            fp.position.z = fpGunPos.z + recoil * 0.06;
            fp.rotation.set(fpGunRot.x + recoil * 0.08, fpGunRot.y, fpGunRot.z);
          }
        }

        flashT = Math.max(0, flashT - dt);
        const a = flashT > 0 ? Math.min(1, flashT / 0.06) : 0;
        const op = a * 0.95;
        fpFlash.material.opacity = fp.visible && k === "gun" ? op : 0;
        tpFlash.material.opacity = tp.visible && k === "gun" ? op : 0;
      };

      return { update, shootFx };
    })();

    // --- pseudo-multiplayer (same-origin, multi-tab) ---
    // 透過 BroadcastChannel 同步「同一台電腦 / 同瀏覽器 / 同網域」的多分頁玩家狀態
    const peersGroup = new THREE.Group();
    scene.add(peersGroup);

    // --- P2P multiplayer (WebRTC, manual code) ---
    const p2p = (() => {
      const supported = typeof RTCPeerConnection !== "undefined" && typeof RTCSessionDescription !== "undefined";
      let pc = null;
      let dc = null;
      let role = null; // host | join
      let connected = false;
      let sendAcc = 0;
      const localId = (globalThis.crypto?.randomUUID?.() ?? `p2p-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`).slice(0, 24);

      const encode = (obj) => btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
      const decode = (s) => JSON.parse(decodeURIComponent(escape(atob(String(s).trim()))));

      const setStatus = (t) => {
        if (ui.p2pStatus) ui.p2pStatus.textContent = `連線：${t}`;
      };

      const close = () => {
        connected = false;
        role = null;
        try { dc?.close?.(); } catch {}
        try { pc?.close?.(); } catch {}
        dc = null;
        pc = null;
        setStatus("未連線");
      };

      const makePc = () => {
        const p = new RTCPeerConnection({
          iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }],
        });
        p.onconnectionstatechange = () => {
          const s = p.connectionState || "unknown";
          if (s === "connected") {
            connected = true;
            setStatus("已連線");
          } else if (s === "failed" || s === "disconnected" || s === "closed") {
            connected = false;
            setStatus("已中斷");
          } else {
            setStatus(s);
          }
        };
        return p;
      };

      const waitIceComplete = async (p, ms = 2500) => {
        if (p.iceGatheringState === "complete") return;
        await new Promise((resolve) => {
          let done = false;
          const t = setTimeout(() => {
            if (done) return;
            done = true;
            resolve();
          }, ms);
          const on = () => {
            if (done) return;
            if (p.iceGatheringState === "complete") {
              done = true;
              clearTimeout(t);
              p.removeEventListener("icegatheringstatechange", on);
              resolve();
            }
          };
          p.addEventListener("icegatheringstatechange", on);
        });
      };

      const onDataMessage = (msg) => {
        try {
          const data = JSON.parse(msg);
          if (data?.type === "state") {
            // reuse BroadcastChannel peer format but with a fixed id
            const pid = String(data.id || "p2p").slice(0, 48);
            if (pid === localId) return;
            let g = peersGroup.getObjectByName?.(`peer_${pid}`) ?? null;
            if (!g) {
              const look = data.look || {};
              g = new THREE.Group();
              g.name = `peer_${pid}`;
              g.userData.p2p = { lastPulse: -1, shotT: 0, t: 0, speed: 0, weapon: "gun", aimPitch: 0 };
              // lightweight remote avatar (with simple parts for animation)
              const matsR = {
                skin: new THREE.MeshStandardMaterial({ color: new THREE.Color(look?.skin || "#f7d6c1"), roughness: 0.8 }),
                shirt: new THREE.MeshStandardMaterial({ color: new THREE.Color(look?.shirt || "#2b6cff"), roughness: 0.9 }),
                pants: new THREE.MeshStandardMaterial({ color: new THREE.Color(look?.pants || "#111827"), roughness: 0.95 }),
                black: new THREE.MeshStandardMaterial({ color: 0x0b1020, roughness: 0.95 }),
                metal: new THREE.MeshStandardMaterial({ color: 0xa3a7b3, roughness: 0.35, metalness: 0.22, emissive: 0x0b0b12, emissiveIntensity: 0.2 }),
                wood: new THREE.MeshStandardMaterial({ color: 0x7c4a1d, roughness: 0.9, metalness: 0.02 }),
              };
              g.userData.mats = matsR;

              const parts = {};
              // torso
              const torso = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.05, 0.52), matsR.shirt);
              torso.position.set(0, 1.15, 0);
              torso.castShadow = true;
              torso.receiveShadow = true;
              g.add(torso);
              parts.torso = torso;

              // head
              const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.62), matsR.skin);
              head.position.set(0, 1.88, 0);
              head.castShadow = true;
              head.receiveShadow = true;
              g.add(head);
              parts.head = head;
              const eye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), matsR.black);
              eye.position.set(-0.14, 1.92, 0.33);
              g.add(eye);
              const eye2 = eye.clone();
              eye2.position.x = 0.14;
              g.add(eye2);

              // arms as shoulder groups
              const armGeo = new THREE.BoxGeometry(0.28, 0.88, 0.28);
              const mkArm = (side) => {
                const ag = new THREE.Group();
                ag.position.set(0.56 * side, 1.55, 0);
                const m = new THREE.Mesh(armGeo, matsR.skin);
                m.position.set(0, -0.44, 0);
                m.castShadow = true;
                ag.add(m);
                g.add(ag);
                return ag;
              };
              parts.armL = mkArm(-1);
              parts.armR = mkArm(1);

              // legs as hip groups
              const legGeo = new THREE.BoxGeometry(0.34, 0.92, 0.34);
              const mkLeg = (side) => {
                const lg = new THREE.Group();
                lg.position.set(0.20 * side, 0.84, 0);
                const m = new THREE.Mesh(legGeo, matsR.pants);
                m.position.set(0, -0.46, 0);
                m.castShadow = true;
                lg.add(m);
                g.add(lg);
                return lg;
              };
              parts.legL = mkLeg(-1);
              parts.legR = mkLeg(1);

              // weapon attached to right arm
              const wRoot = new THREE.Group();
              parts.armR.add(wRoot);
              wRoot.position.set(0.14, -0.92, -0.18);
              wRoot.rotation.set(-0.15, 0.25, 0.0);
              const gun = new THREE.Group();
              const gunBody = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.20, 0.90), matsR.black);
              gunBody.position.set(0, 0, -0.30);
              const gunBarrel = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.55), matsR.black);
              gunBarrel.position.set(0, 0.02, -0.78);
              const flash = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0 }));
              flash.position.set(0, 0.02, -1.02);
              flash.rotation.y = Math.PI;
              gun.add(gunBody, gunBarrel, flash);
              const axe = new THREE.Group();
              const handle = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.95, 0.10), matsR.wood);
              handle.position.set(0.10, -0.20, -0.25);
              const head2 = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.24, 0.14), matsR.metal);
              head2.position.set(0.16, 0.32, -0.25);
              const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.30, 0.06), matsR.metal);
              blade.position.set(0.32, 0.32, -0.25);
              axe.add(handle, head2, blade);
              gun.visible = true;
              axe.visible = false;
              wRoot.add(gun, axe);
              parts.weapon = { root: wRoot, gun, axe, flash };

              g.userData.parts = parts;
              peersGroup.add(g);
            }
            // update look colors if provided
            if (data.look && g.userData?.mats) {
              try {
                g.userData.mats.skin.color.set(data.look.skin || "#f7d6c1");
                g.userData.mats.shirt.color.set(data.look.shirt || "#2b6cff");
                g.userData.mats.pants.color.set(data.look.pants || "#111827");
              } catch {}
            }
            if (data.pos) g.position.set(data.pos.x, data.pos.y, data.pos.z);
            if (typeof data.yaw === "number") g.rotation.y = data.yaw + Math.PI;
            if (g.userData?.p2p) {
              g.userData.p2p.speed = typeof data.speed === "number" ? data.speed : 0;
              g.userData.p2p.aimPitch = typeof data.aimPitch === "number" ? data.aimPitch : 0;
              g.userData.p2p.weapon = data.weapon === "axe" ? "axe" : "gun";
              const pulse = typeof data.pulse === "number" ? data.pulse : -1;
              if (pulse !== g.userData.p2p.lastPulse) {
                g.userData.p2p.lastPulse = pulse;
                g.userData.p2p.shotT = 0.08;
              }
              // switch weapon visuals
              const wp = g.userData.parts?.weapon;
              if (wp) {
                wp.gun.visible = g.userData.p2p.weapon === "gun";
                wp.axe.visible = g.userData.p2p.weapon === "axe";
              }
            }
          }
        } catch {}
      };

      const ensureDataChannel = () => {
        if (!dc) return;
        dc.onopen = () => {
          connected = true;
          setStatus("已連線");
        };
        dc.onclose = () => {
          connected = false;
          setStatus("已中斷");
        };
        dc.onmessage = (e) => onDataMessage(e.data);
      };

      const createOffer = async () => {
        if (!supported) {
          setStatus("不支援（瀏覽器不支援 WebRTC）");
          return null;
        }
        close();
        role = "host";
        pc = makePc();
        dc = pc.createDataChannel("room");
        ensureDataChannel();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await waitIceComplete(pc);
        const payload = { sdp: pc.localDescription, v: 1 };
        setStatus("已產生 Offer");
        return encode(payload);
      };

      const makeAnswer = async (offerCode) => {
        if (!supported) {
          setStatus("不支援");
          return null;
        }
        close();
        role = "join";
        pc = makePc();
        pc.ondatachannel = (e) => {
          dc = e.channel;
          ensureDataChannel();
        };
        const payload = decode(offerCode);
        await pc.setRemoteDescription(payload.sdp);
        const ans = await pc.createAnswer();
        await pc.setLocalDescription(ans);
        await waitIceComplete(pc);
        setStatus("已產生 Answer");
        return encode({ sdp: pc.localDescription, v: 1 });
      };

      const applyAnswer = async (answerCode) => {
        if (!pc) return false;
        const payload = decode(answerCode);
        await pc.setRemoteDescription(payload.sdp);
        setStatus("連線中…");
        return true;
      };

      const sendTick = (dt) => {
        if (!connected || !dc || dc.readyState !== "open") return;
        sendAcc += dt;
        if (sendAcc < 0.08) return; // ~12.5Hz
        sendAcc = 0;
        const a = getAimAngles();
        const speed = Math.hypot(state.vel.x, state.vel.z);
        const weaponKind = profile.gameMode === "forest99" ? "axe" : "gun";
        const look = {
          skin: avatar.skin,
          shirt: avatar.shirt,
          pants: avatar.pants,
          hat: avatar.hat,
          acc: avatar.acc,
        };
        const msg = {
          type: "state",
          id: localId,
          t: performance.now(),
          look,
          pos: { x: state.pos.x, y: state.pos.y, z: state.pos.z },
          yaw: state.yaw,
          aimPitch: a.pitch,
          speed,
          weapon: weaponKind,
          pulse: state.shootPulse,
        };
        try { dc.send(JSON.stringify(msg)); } catch {}
      };

      const update = (dt) => {
        for (const g of peersGroup.children || []) {
          const st = g?.userData?.p2p;
          const parts = g?.userData?.parts;
          if (!st || !parts) continue;
          st.t += dt;
          const sp = clamp(st.speed || 0, 0, MOVE_SPEED);
          const walk = clamp(sp / MOVE_SPEED, 0, 1);
          const phase = st.t * (6.0 + walk * 6.5);
          const armSwing = Math.sin(phase) * 0.65 * walk;
          const legSwing = Math.sin(phase) * 0.75 * walk;
          if (parts.armL) parts.armL.rotation.x = armSwing;
          if (parts.armR) parts.armR.rotation.x = -armSwing;
          if (parts.legL) parts.legL.rotation.x = -legSwing;
          if (parts.legR) parts.legR.rotation.x = legSwing;

          // aim pose + action
          const wp = parts.weapon;
          if (wp?.root) {
            const k = st.weapon || "gun";
            if (k === "axe") {
              wp.root.position.set(0.10, -0.78, -0.05);
              wp.root.rotation.set(-0.55, 0.45, 0.15);
            } else {
              wp.root.position.set(0.14, -0.92, -0.18);
              wp.root.rotation.set(-0.15, 0.25, 0.0);
            }
          }
          if (st.shotT > 0) {
            st.shotT = Math.max(0, st.shotT - dt);
            if (parts.armR) parts.armR.rotation.x = -1.0 + st.aimPitch * 0.15;
            if (wp?.flash) wp.flash.material.opacity = st.weapon === "gun" ? (st.shotT / 0.08) : 0;
            if (st.weapon === "axe" && wp?.root) wp.root.rotation.x -= (st.shotT / 0.08) * 0.8;
          } else {
            if (wp?.flash) wp.flash.material.opacity = 0;
          }
        }
      };

      setStatus(supported ? "未連線" : "不支援");
      return { supported, createOffer, makeAnswer, applyAnswer, close, sendTick, update, get connected() { return connected; } };
    })();

    const net = (() => {
      const enabled = typeof BroadcastChannel !== "undefined";
      const id = (globalThis.crypto?.randomUUID?.() ?? `p-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`).slice(0, 48);
      const peers = new Map(); // id -> { group, lastSeen }
      const chan = enabled ? new BroadcastChannel("bound_room_v1") : null;
      let sendAcc = 0;

      const removePeer = (pid) => {
        const p = peers.get(pid);
        if (!p) return;
        peersGroup.remove(p.group);
        // dispose materials/geometries
        p.group.traverse?.((obj) => {
          if (obj?.geometry) obj.geometry.dispose?.();
          if (obj?.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose?.());
            else obj.material.dispose?.();
          }
        });
        peers.delete(pid);
      };

      const makeRemoteAvatar = (look) => {
        const g = new THREE.Group();
        const matsR = {
          skin: new THREE.MeshStandardMaterial({ color: new THREE.Color(look?.skin || "#f7d6c1"), roughness: 0.8 }),
          shirt: new THREE.MeshStandardMaterial({ color: new THREE.Color(look?.shirt || "#2b6cff"), roughness: 0.9 }),
          pants: new THREE.MeshStandardMaterial({ color: new THREE.Color(look?.pants || "#111827"), roughness: 0.95 }),
          black: new THREE.MeshStandardMaterial({ color: 0x0b1020, roughness: 0.95 }),
          white: new THREE.MeshStandardMaterial({ color: 0xe6e9f5, roughness: 0.85 }),
          gold: new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.45, metalness: 0.15 }),
        };

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.05, 0.52), matsR.shirt);
        torso.position.set(0, 1.15, 0);
        torso.castShadow = true;
        torso.receiveShadow = true;
        g.add(torso);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.62), matsR.skin);
        head.position.set(0, 1.88, 0);
        head.castShadow = true;
        head.receiveShadow = true;
        g.add(head);

        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.88, 0.28), matsR.skin);
        armL.position.set(-0.66, 1.18, 0);
        armL.castShadow = true;
        g.add(armL);
        const armR = armL.clone();
        armR.position.x = 0.66;
        g.add(armR);

        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.92, 0.34), matsR.pants);
        legL.position.set(-0.22, 0.38, 0);
        legL.castShadow = true;
        g.add(legL);
        const legR = legL.clone();
        legR.position.x = 0.22;
        g.add(legR);

        // face
        const eye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), matsR.black);
        eye.position.set(-0.14, 1.92, 0.33);
        g.add(eye);
        const eye2 = eye.clone();
        eye2.position.x = 0.14;
        g.add(eye2);

        // simple hat / accessory (lightweight)
        if (look?.hat === "cap") {
          const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.24, 18), matsR.shirt);
          capTop.position.set(0, 2.2, 0);
          g.add(capTop);
          const capBill = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.06, 0.26), matsR.shirt);
          capBill.position.set(0, 2.11, 0.36);
          g.add(capBill);
        } else if (look?.hat === "tophat") {
          const th = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.42, 18), matsR.black);
          th.position.set(0, 2.25, 0);
          g.add(th);
          const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.06, 18), matsR.black);
          brim.position.set(0, 2.02, 0);
          g.add(brim);
        } else if (look?.hat === "crown") {
          const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 18), matsR.gold);
          ring.position.set(0, 2.13, 0);
          g.add(ring);
        }

        if (look?.acc === "backpack") {
          const pack = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.22), matsR.black);
          pack.position.set(0, 1.18, -0.38);
          g.add(pack);
        } else if (look?.acc === "glasses") {
          const frame = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.1, 0.04), matsR.black);
          frame.position.set(0, 1.98, 0.34);
          g.add(frame);
          const lens = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.02), matsR.white);
          lens.position.set(-0.18, 1.98, 0.36);
          g.add(lens);
          const lens2 = lens.clone();
          lens2.position.x = 0.18;
          g.add(lens2);
        }

        return g;
      };

      const upsertPeer = (msg) => {
        const pid = msg.id;
        if (!pid || pid === id) return;
        const now = performance.now() / 1000;
        let p = peers.get(pid);
        if (!p) {
          const g = new THREE.Group();
          const avatarG = makeRemoteAvatar(msg.look || {});
          g.add(avatarG);
          peersGroup.add(g);
          p = { group: g, lastSeen: now };
          peers.set(pid, p);
        }
        p.lastSeen = now;
        const pos = msg.pos;
        if (pos && typeof pos.x === "number") p.group.position.set(pos.x, pos.y, pos.z);
        if (typeof msg.yaw === "number") p.group.rotation.y = msg.yaw;
      };

      if (chan) {
        chan.onmessage = (ev) => {
          const msg = ev.data;
          if (!msg || typeof msg !== "object") return;
          if (msg.type === "state") upsertPeer(msg);
          if (msg.type === "bye" && msg.id && msg.id !== id) removePeer(msg.id);
        };
        window.addEventListener("beforeunload", () => {
          try {
            chan.postMessage({ type: "bye", id });
          } catch {}
        });
      }

      const getLook = () => ({
        skin: avatar.skin,
        shirt: avatar.shirt,
        pants: avatar.pants,
        hat: avatar.hat,
        acc: avatar.acc,
      });

      const sendTick = (dt) => {
        if (!chan || !state.running) return;
        sendAcc += dt;
        if (sendAcc < 0.08) return; // ~12.5Hz
        sendAcc = 0;
        try {
          chan.postMessage({
            type: "state",
            id,
            t: performance.now(),
            look: getLook(),
            pos: { x: state.pos.x, y: state.pos.y, z: state.pos.z },
            yaw: state.yaw,
          });
        } catch {}
      };

      const cleanup = () => {
        if (!enabled) return;
        const now = performance.now() / 1000;
        for (const [pid, p] of peers.entries()) {
          if (now - p.lastSeen > 4.5) removePeer(pid);
        }
      };

      return { enabled, id, sendTick, cleanup };
    })();

    const raycaster = new THREE.Raycaster();

    function getLookDirection(pitch = state.pitch, yaw = state.yaw) {
      const dir = new THREE.Vector3(0, 0, -1);
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, 0, "YXZ"));
      dir.applyQuaternion(q);
      return dir;
    }

    function getAimAngles() {
      // 第三人稱：瞄準/視角用相機角；第一人稱：用角色角
      if (profile.camMode === "third") return { pitch: state.camPitch, yaw: state.camYaw };
      return { pitch: state.pitch, yaw: state.yaw };
    }

    function doRaycast(maxDist = 8) {
      const a = getAimAngles();
      const dir = getLookDirection(a.pitch, a.yaw);
      raycaster.set(new THREE.Vector3(state.pos.x, state.pos.y + 1.25, state.pos.z), dir);
      raycaster.far = maxDist;
      const hits = raycaster.intersectObjects(Array.from(world.meshes.values()), false);
      if (!hits.length) return null;
      return hits[0];
    }

    function tryBreak() {
      const hit = doRaycast(8);
      if (!hit) return;
      const k = hit.object.userData.key;
      const { x, y, z } = parseKey(k);
      if (y <= -1) return;
      removeBlock(x, y, z);
      sfx.play("break");
    }

    function tryPlace() {
      const hit = doRaycast(8);
      if (!hit) return;
      const k = hit.object.userData.key;
      const { x, y, z } = parseKey(k);
      const n = hit.face?.normal;
      if (!n) return;
      const nx = Math.round(n.x);
      const ny = Math.round(n.y);
      const nz = Math.round(n.z);
      const px = x + nx;
      const py = y + ny;
      const pz = z + nz;

      // don't place inside player
      const dx = (px + 0.5) - state.pos.x;
      const dz = (pz + 0.5) - state.pos.z;
      const dy = (py + 0.5) - (state.pos.y + 1.0);
      if (Math.abs(dx) < 0.9 && Math.abs(dz) < 0.9 && Math.abs(dy) < 1.2) return;
      setBlock(px, py, pz, BLOCKS[state.selected].id);
      sfx.play("place");
    }

    function chopTreeFrom(x0, y0, z0) {
      // 99 夜：砍樹用（把相連的 wood/leaf 一起清掉一些）
      const startKey = keyOf(x0, y0, z0);
      const start = world.blocks.get(startKey);
      if (!start) return { total: 0, wood: 0, leaf: 0 };
      if (start.type !== "wood" && start.type !== "leaf") return { total: 0, wood: 0, leaf: 0 };

      const maxN = 180;
      const out = [];
      const q = [{ x: x0, y: y0, z: z0 }];
      const seen = new Set([startKey]);
      const minY = y0 - 2;
      const maxY = y0 + 18;
      const minX = x0 - 6;
      const maxX = x0 + 6;
      const minZ = z0 - 6;
      const maxZ = z0 + 6;

      let wood = 0;
      let leaf = 0;
      while (q.length && out.length < maxN) {
        const p = q.shift();
        if (!p) break;
        if (p.x < minX || p.x > maxX || p.z < minZ || p.z > maxZ || p.y < minY || p.y > maxY) continue;
        const k = keyOf(p.x, p.y, p.z);
        const b = world.blocks.get(k);
        if (!b) continue;
        if (b.type !== "wood" && b.type !== "leaf") continue;
        out.push({ x: p.x, y: p.y, z: p.z });
        if (b.type === "wood") wood += 1;
        else leaf += 1;

        const ns = [
          { x: p.x + 1, y: p.y, z: p.z },
          { x: p.x - 1, y: p.y, z: p.z },
          { x: p.x, y: p.y + 1, z: p.z },
          { x: p.x, y: p.y - 1, z: p.z },
          { x: p.x, y: p.y, z: p.z + 1 },
          { x: p.x, y: p.y, z: p.z - 1 },
        ];
        for (const n of ns) {
          const nk = keyOf(n.x, n.y, n.z);
          if (seen.has(nk)) continue;
          seen.add(nk);
          q.push(n);
        }
      }

      for (const p of out) removeBlock(p.x, p.y, p.z);
      return { total: out.length, wood, leaf };
    }

    function spawnWoodDrops(center, count) {
      if (profile.gameMode !== "forest99") return;
      const n = clamp(count | 0, 0, 18);
      if (!n) return;
      const mat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.85, metalness: 0.03, emissive: 0x1a0f05, emissiveIntensity: 0.25 });
      const geo = new THREE.BoxGeometry(0.26, 0.26, 0.26);
      for (let i = 0; i < n; i++) {
        const m = new THREE.Mesh(geo, mat);
        m.castShadow = true;
        m.receiveShadow = true;
        const a = Math.random() * Math.PI * 2;
        const r = 0.35 + Math.random() * 0.55;
        m.position.set(center.x + Math.cos(a) * r, center.y + 0.3 + Math.random() * 0.25, center.z + Math.sin(a) * r);
        m.userData.pickup = "wood";
        mode.group.add(m);
        mode.forest99.drops.push({ mesh: m, kind: "wood", spin: (Math.random() - 0.5) * 3.5, bob: Math.random() * 10 });
      }
    }

    function sampleBlockFloorY(x, z) {
      let topY = -Infinity;
      for (let y = -3; y <= 18; y++) {
        if (world.blocks.has(keyOf(Math.floor(x), y, Math.floor(z)))) topY = Math.max(topY, y);
      }
      if (topY === -Infinity) return null;
      return topY + 1; // 方塊頂面
    }

    function sampleObbyFloorY(x, z) {
      let best = -Infinity;
      const checkList = (list) => {
        for (const p of list) {
          const m = p.mesh;
          const sx = p.sx;
          const sz = p.sz;
          const topY = m.position.y + p.sy / 2;
          const minX = m.position.x - sx / 2;
          const maxX = m.position.x + sx / 2;
          const minZ = m.position.z - sz / 2;
          const maxZ = m.position.z + sz / 2;
          if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
            if (topY > best) best = topY;
          }
        }
      };
      checkList(mode.obby.platforms);
      checkList(mode.obby.hazards);
      if (best === -Infinity) return null;
      return best;
    }

    function sampleGunfightFloorY(x, z, y) {
      let best = -Infinity;
      for (const p of mode.gunfight.solids) {
        const m = p.mesh;
        const sx = p.sx;
        const sz = p.sz;
        const topY = m.position.y + p.sy / 2;
        const minX = m.position.x - sx / 2;
        const maxX = m.position.x + sx / 2;
        const minZ = m.position.z - sz / 2;
        const maxZ = m.position.z + sz / 2;
        if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
          // 避免「走到牆旁邊就瞬間被吸到牆頂」：
          // 只有當你已經跳到接近頂面時，才把它視為可站立地面。
          const yy = typeof y === "number" ? y : state.pos.y;
          if (yy >= topY - 0.85) {
            if (topY > best) best = topY;
          }
        }
      }
      if (best === -Infinity) return null;
      return best;
    }

    function sampleFloorY(x, z, y) {
      const a = sampleBlockFloorY(x, z);
      if (profile.gameMode === "gunfight") {
        const b = sampleGunfightFloorY(x, z, y);
        if (a == null) return b;
        if (b == null) return a;
        return Math.max(a, b);
      }
      if (profile.gameMode !== "obby") return a;
      const b = sampleObbyFloorY(x, z);
      if (a == null) return b;
      if (b == null) return a;
      return Math.max(a, b);
    }

    function isTouchingHazard() {
      // 以玩家「腳底點」判定即可（Obby 玩法）
      const x = state.pos.x;
      const y = state.pos.y;
      const z = state.pos.z;
      for (const p of mode.obby.hazards) {
        const m = p.mesh;
        const sx = p.sx;
        const sz = p.sz;
        const topY = m.position.y + p.sy / 2;
        const minX = m.position.x - sx / 2;
        const maxX = m.position.x + sx / 2;
        const minZ = m.position.z - sz / 2;
        const maxZ = m.position.z + sz / 2;
        if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
          // 腳底接近平台頂面
          if (Math.abs(y - topY) < 0.25) return true;
        }
      }
      return false;
    }

    const GRAVITY = -22;
    const MOVE_SPEED = 7.2;
    const JUMP_V = 9.2;

    function tick(dt) {
      if (!state.running) return;

      const isCombatMode = profile.gameMode === "gunfight" || profile.gameMode === "forest99";

      // obby movers
      if (profile.gameMode === "obby" && mode.obby.movers?.length) {
        const t = performance.now() / 1000;
        for (const mv of mode.obby.movers) {
          const s = Math.sin(t * mv.speed + mv.phase) * mv.amp;
          mv.mesh.position.copy(mv.base).addScaledVector(mv.axis, s);
        }
      }

      if (!isCombatMode) {
        if (state.wantBreak) {
          tryBreak();
          state.wantBreak = false;
        }
        if (state.wantPlace) {
          tryPlace();
          state.wantPlace = false;
        }
      }

      // Roblox 風格：第三人稱移動方向跟著相機 yaw
      const moveYaw = profile.camMode === "third" ? state.camYaw : state.yaw;
      const forward = new THREE.Vector3(Math.sin(moveYaw), 0, Math.cos(moveYaw)).multiplyScalar(-1);
      // right-hand coordinate: right = up × forward（或等價的 [-fz, 0, fx]）
      // 避免 A/D 左右相反
      const right = new THREE.Vector3(-forward.z, 0, forward.x);
      const mv = new THREE.Vector3();
      if (state.keys.has("KeyW")) mv.add(forward);
      if (state.keys.has("KeyS")) mv.addScaledVector(forward, -1);
      if (state.keys.has("KeyA")) mv.addScaledVector(right, -1);
      if (state.keys.has("KeyD")) mv.add(right);
      if (state.touch.enabled && (state.touch.mx || state.touch.my)) {
        mv.addScaledVector(right, state.touch.mx);
        mv.addScaledVector(forward, state.touch.my);
      }
      if (mv.lengthSq() > 0) mv.normalize().multiplyScalar(MOVE_SPEED);

      state.vel.x = mv.x;
      state.vel.z = mv.z;

      // RIVALS-like：槍戰倒數/回合間先鎖住移動
      if (profile.gameMode === "gunfight" && mode.gunfight.phase !== "live") {
        state.vel.x = 0;
        state.vel.z = 0;
      }

      // 第三人稱：角色朝向只在「有移動」時跟著相機（這樣才能繞到前面看角色）
      if (profile.camMode === "third") {
        const moving = (mv.x * mv.x + mv.z * mv.z) > 0.001;
        if (moving) {
          const wrap = (a) => {
            while (a > Math.PI) a -= Math.PI * 2;
            while (a < -Math.PI) a += Math.PI * 2;
            return a;
          };
          const delta = wrap(state.camYaw - state.yaw);
          const turn = 1 - Math.exp(-14 * dt);
          state.yaw = state.yaw + delta * turn;
        }
      }

      if (state.keys.has("Space") && state.onGround) {
        if (profile.gameMode === "gunfight" && mode.gunfight.phase !== "live") {
          // countdown/intermission 不給跳
        } else {
        state.vel.y = JUMP_V;
        state.onGround = false;
        sfx.play("jump");
        }
      }
      if (state.touch.enabled && state.touch.jump && state.onGround) {
        if (!(profile.gameMode === "gunfight" && mode.gunfight.phase !== "live")) {
          state.vel.y = JUMP_V;
          state.onGround = false;
          sfx.play("jump");
        }
        state.touch.jump = false;
      }

      state.vel.y += GRAVITY * dt;

      const resolveCylinderVsSolids = (pos, radius, h, solids) => {
        const minY = pos.y;
        const maxY = pos.y + h;
        for (let pass = 0; pass < 3; pass++) {
          let moved = false;
          for (const s of solids) {
            const m = s.mesh;
            const minX = m.position.x - s.sx / 2;
            const maxX = m.position.x + s.sx / 2;
            const minZ = m.position.z - s.sz / 2;
            const maxZ = m.position.z + s.sz / 2;
            const minSY = m.position.y - s.sy / 2;
            const maxSY = m.position.y + s.sy / 2;
            // vertical overlap?
            if (maxY < minSY + 0.01 || minY > maxSY - 0.01) continue;
            // xz overlap?
            if (pos.x + radius <= minX || pos.x - radius >= maxX || pos.z + radius <= minZ || pos.z - radius >= maxZ) continue;
            // compute minimal push-out in xz
            const px1 = (maxX + radius) - pos.x;
            const px2 = pos.x - (minX - radius);
            const pz1 = (maxZ + radius) - pos.z;
            const pz2 = pos.z - (minZ - radius);
            const pushX = px1 < px2 ? -px1 : px2;
            const pushZ = pz1 < pz2 ? -pz1 : pz2;
            if (Math.abs(pushX) < Math.abs(pushZ)) pos.x += pushX;
            else pos.z += pushZ;
            moved = true;
          }
          if (!moved) break;
        }
      };

      if (profile.gameMode === "gunfight") {
        // horizontal movement with obstacle collision
        state.pos.x += state.vel.x * dt;
        resolveCylinderVsSolids(state.pos, 0.42, 1.8, mode.gunfight.solids);
        state.pos.z += state.vel.z * dt;
        resolveCylinderVsSolids(state.pos, 0.42, 1.8, mode.gunfight.solids);
        // vertical
        state.pos.y += state.vel.y * dt;
      } else {
        state.pos.addScaledVector(state.vel, dt);
      }

      const groundY = sampleFloorY(state.pos.x, state.pos.z, state.pos.y);
      const floorY = groundY ?? 1.1;
      if (state.pos.y <= floorY) {
        state.pos.y = floorY;
        state.vel.y = 0;
        state.onGround = true;
      } else {
        state.onGround = false;
      }
      if (!state.prevOnGround && state.onGround) sfx.play("land");
      state.prevOnGround = state.onGround;

      // obby: fall reset + checkpoint progression
      if (profile.gameMode === "obby") {
        if (isTouchingHazard()) {
          const cp = mode.obby.checkpoints[mode.obby.idx] ?? new THREE.Vector3(0, 3.35, 8);
          state.pos.copy(cp);
          state.vel.set(0, 0, 0);
          ui.hintText.textContent = "碰到陷阱！回到檢查點。";
          setTimeout(() => (ui.hintText.textContent = "-"), 900);
          sfx.play("hazard");
        }
        if (state.pos.y < -6) {
          const cp = mode.obby.checkpoints[mode.obby.idx] ?? new THREE.Vector3(0, 3.35, 8);
          state.pos.copy(cp);
          state.vel.set(0, 0, 0);
        }
        // reach next checkpoint by proximity
        const nextIdx = Math.min(mode.obby.idx + 1, mode.obby.checkpoints.length - 1);
        const next = mode.obby.checkpoints[nextIdx];
        if (next && state.pos.distanceTo(next) < 1.8) {
          mode.obby.idx = nextIdx;
          ui.progressText.textContent = `CP ${mode.obby.idx}/${mode.obby.checkpoints.length - 1}`;
          sfx.play("checkpoint");
          if (mode.obby.idx === mode.obby.checkpoints.length - 1 && !mode.obby.done) {
            mode.obby.done = true;
            const t = performance.now() / 1000 - mode.obby.startT;
            ui.hintText.textContent = `完成！時間 ${t.toFixed(1)}s`;
            sfx.play("finish");
          }
        }
      }

      // coins: spin + pickup
      if (profile.gameMode === "coins" && !mode.coins.done) {
        for (const c of mode.coins.items) {
          c.rotation.y += dt * 2.2;
        }
        for (let i = mode.coins.items.length - 1; i >= 0; i--) {
          const c = mode.coins.items[i];
          const dx = c.position.x - state.pos.x;
          const dz = c.position.z - state.pos.z;
          const dy = c.position.y - (state.pos.y + 1.0);
          if (dx * dx + dz * dz + dy * dy < 0.85 * 0.85) {
            mode.group.remove(c);
            mode.coins.items.splice(i, 1);
            mode.coins.collected += 1;
            ui.progressText.textContent = `${mode.coins.collected}/${mode.coins.total}`;
            sfx.play("coin");
            if (mode.coins.collected >= mode.coins.total) {
              mode.coins.done = true;
              const t = performance.now() / 1000 - mode.coins.startT;
              ui.hintText.textContent = `完成！時間 ${t.toFixed(1)}s`;
              sfx.play("finish");
            }
          }
        }
      }

      // combat modes: shooting + AI + night cycle
      if (isCombatMode) {
        const aim = getAimAngles();
        const aimDir = getLookDirection(aim.pitch, aim.yaw);
        const origin = new THREE.Vector3(state.pos.x, state.pos.y + 1.35, state.pos.z);

        const raycastTargets = (maxDist = 60) => {
          raycaster.set(origin, aimDir);
          raycaster.far = maxDist;
          const targets = [];
          if (profile.gameMode === "gunfight") for (const b of mode.gunfight.bots) targets.push(b.mesh);
          if (profile.gameMode === "gunfight") for (const s of mode.gunfight.solids) targets.push(s.mesh);
          if (profile.gameMode === "forest99") for (const m of mode.forest99.mobs) targets.push(m.mesh);
          // allow cover blocks
          for (const m of world.meshes.values()) targets.push(m);
          const hits = raycaster.intersectObjects(targets, true);
          return hits.length ? hits[0] : null;
        };

        const doShoot = () => {
          if (profile.gameMode === "gunfight" && mode.gunfight.phase !== "live") return;
          const isAxe = profile.gameMode === "forest99";
          sfx.play(isAxe ? "axe" : "shoot");
          weapon.shootFx();

          // 99 夜：優先砍樹/打近距離（距離短一點才像斧頭）
          if (isAxe) {
            // try hit mob first (short range)
            raycaster.set(new THREE.Vector3(state.pos.x, state.pos.y + 1.35, state.pos.z), aimDir);
            raycaster.far = 7;
            const mobHits = raycaster.intersectObjects(mode.forest99.mobs.map((m) => m.mesh), true);
            if (mobHits.length) {
              const obj = mobHits[0].object;
              // hit could be a child mesh inside the mob group
              let cur = obj;
              for (let i = 0; i < 6 && cur; i++) {
                const mob = mode.forest99.mobs.find((m) => m.mesh === cur);
                if (mob) {
                  mob.hp -= 40;
                  sfx.play("hit");
                  if (mob.hp <= 0) {
                    mode.group.remove(mob.mesh);
                    disposeObject3D(mob.mesh);
                    mode.forest99.mobs = mode.forest99.mobs.filter((x) => x !== mob);
                    sfx.play("kill");
                  }
                  return;
                }
                cur = cur.parent;
              }
            }

            // then try chop tree blocks (very short range)
            raycaster.far = 4.2;
            const blockHits = raycaster.intersectObjects(Array.from(world.meshes.values()), false);
            const hit = blockHits.length ? blockHits[0] : null;
            if (!hit) return;
            const k = hit.object.userData.key;
            if (!k) return;
            const { x, y, z } = parseKey(k);
            const t = world.blocks.get(k)?.type;
            if (t === "wood" || t === "leaf") {
              const res = chopTreeFrom(x, y, z);
              if (res.total > 0) {
                sfx.play("break");
                // 掉落木頭：每 3 個 wood 給 1 個掉落（上限 12）
                const drops = clamp(Math.ceil((res.wood || 0) / 3), 0, 12);
                spawnWoodDrops(new THREE.Vector3(x + 0.5, y + 0.5, z + 0.5), drops);
              }
            }
            return;
          }

          const hit = raycastTargets(90);
          if (!hit) return;
          const obj = hit.object;
          // check bots/mobs first
          if (profile.gameMode === "gunfight") {
            const k = obj?.userData?.botKey;
            const bot = k ? mode.gunfight.bots.find((b) => b.key === k) : mode.gunfight.bots.find((b) => b.mesh === obj);
            if (bot && bot.alive) {
              bot.hp -= 30;
              bot.hurtCd = 0.12;
              sfx.play("hit");
              if (bot.hp <= 0) {
                mode.gunfight.score += 1;
                sfx.play("kill");
                bot.alive = false;
                bot.mesh.visible = false;
                mode.gunfight.endRound?.("win");
              }
            }
          } else if (profile.gameMode === "forest99") {
            let mob = mode.forest99.mobs.find((m) => m.mesh === obj);
            if (!mob && obj?.parent) mob = mode.forest99.mobs.find((m) => m.mesh === obj.parent);
            if (mob) {
              mob.hp -= 40;
              sfx.play("hit");
              if (mob.hp <= 0) {
                // remove
                mode.group.remove(mob.mesh);
                disposeObject3D(mob.mesh);
                mode.forest99.mobs = mode.forest99.mobs.filter((x) => x !== mob);
                sfx.play("kill");
              }
            }
          }
        };

        // fire control
        state.shootCd = Math.max(0, state.shootCd - dt);
        if ((state.wantShoot || state.triggerShoot) && state.shootCd <= 0) {
          doShoot();
          state.shootPulse = (state.shootPulse + 1) | 0;
          state.shootCd = 0.16;
          state.wantShoot = false;
        }

        // bots AI (simple: shoot player if line of sight-ish)
        if (profile.gameMode === "gunfight") {
          // phase controller
          if (mode.gunfight.phase === "countdown") {
            mode.gunfight.phaseT = Math.max(0, mode.gunfight.phaseT - dt);
            const n = Math.max(1, Math.ceil(mode.gunfight.phaseT));
            ui.progressText.textContent = `HP ${Math.max(0, mode.gunfight.hp)} | 回合 ${mode.gunfight.pWins}-${mode.gunfight.eWins} | 開打 ${n}`;
            if (mode.gunfight.phaseT <= 0.001) {
              mode.gunfight.phase = "live";
              ui.hintText.textContent = "-";
            }
          } else if (mode.gunfight.phase === "intermission") {
            mode.gunfight.phaseT = Math.max(0, mode.gunfight.phaseT - dt);
            ui.progressText.textContent = `HP ${Math.max(0, mode.gunfight.hp)} | 回合 ${mode.gunfight.pWins}-${mode.gunfight.eWins}`;
            if (mode.gunfight.phaseT <= 0.001) {
              mode.gunfight.round += 1;
              mode.gunfight.beginRound?.();
            }
          } else if (mode.gunfight.phase === "matchOver") {
            ui.progressText.textContent = `HP ${Math.max(0, mode.gunfight.hp)} | 回合 ${mode.gunfight.pWins}-${mode.gunfight.eWins}`;
          }

          if (mode.gunfight.phase === "live") {
            mode.gunfight.hurtCd = Math.max(0, mode.gunfight.hurtCd - dt);
            for (const b of mode.gunfight.bots) {
              if (!b.alive) continue;
              b.hurtCd = Math.max(0, b.hurtCd - dt);
              b.shootCd -= dt;
              // look at player
              const toP = new THREE.Vector3().subVectors(state.pos, b.mesh.position);
              toP.y = 0;
              const d = toP.length();
              if (d > 0.001) toP.normalize();
              // boss-ish movement: keep some distance + strafe
              const keepMin = 8.5;
              const keepMax = 15.5;
              const spd = 2.35;
              if (d > keepMax) b.mesh.position.addScaledVector(toP, dt * spd);
              else if (d < keepMin) b.mesh.position.addScaledVector(toP, -dt * spd * 0.9);
              // strafe around player
              b.strafeT = (b.strafeT || 0) + dt;
              const strafeDir = new THREE.Vector3(-toP.z, 0, toP.x).multiplyScalar(
                b.strafe * (0.45 + Math.sin(b.strafeT * 2.1) * 0.15)
              );
              b.mesh.position.addScaledVector(strafeDir, dt * 1.6);

              // gravity + floor + jump (bot can hop obstacles / climb platforms)
              b.velY += GRAVITY * dt;
              b.mesh.position.y += b.velY * dt;
              const by = sampleFloorY(b.mesh.position.x, b.mesh.position.z, b.mesh.position.y) ?? 1.2;
              if (b.mesh.position.y <= by + 0.05) {
                b.mesh.position.y = by;
                b.velY = 0;
                b.onGround = true;
              } else {
                b.onGround = false;
              }
              // jump if player is higher OR obstacle in front
              if (b.onGround) {
                const wantUp = (state.pos.y - b.mesh.position.y) > 0.85;
                let wantHop = false;
                const o = b.mesh.position.clone();
                o.y += 1.1;
                const p = new THREE.Vector3(state.pos.x, state.pos.y + 1.2, state.pos.z);
                const dir = p.clone().sub(o);
                const dist = dir.length();
                if (dist > 0.001) {
                  dir.normalize();
                  raycaster.set(o, dir);
                  raycaster.far = Math.min(2.2, dist);
                  const hits = raycaster.intersectObjects(mode.gunfight.solids.map((s) => s.mesh), false);
                  if (hits.length) wantHop = true;
                }
                if (wantUp || wantHop) {
                  b.velY = 9.0;
                  b.onGround = false;
                }
              }

              // keep bot from clipping into solids
              resolveCylinderVsSolids(b.mesh.position, 0.55, 2.2, mode.gunfight.solids);

              if (b.shootCd <= 0 && d < 28) {
                b.shootCd = 0.55 + Math.random() * 0.65;
                // bot shoots player: require line-of-sight (no block between)
                if (mode.gunfight.hurtCd <= 0) {
                  const o = b.mesh.position.clone();
                  o.y += 1.2;
                  const p = new THREE.Vector3(state.pos.x, state.pos.y + 1.35, state.pos.z);
                  const dir = p.clone().sub(o);
                  const dist = dir.length();
                  if (dist > 0.001) {
                    dir.normalize();
                    raycaster.set(o, dir);
                    raycaster.far = Math.max(0, dist - 0.2);
                    const coverHits = raycaster.intersectObjects(
                      [...Array.from(world.meshes.values()), ...mode.gunfight.solids.map((s) => s.mesh)],
                      true
                    );
                    if (!coverHits.length) {
                      mode.gunfight.hp -= 12;
                      mode.gunfight.hurtCd = 0.30;
                      sfx.play("hurt");
                    }
                  }
                }
              }
              const baseScale = b.baseScale ?? 1.0;
              if (b.hurtCd > 0) b.mesh.scale.setScalar(baseScale * (1.0 + b.hurtCd * 0.18));
              else b.mesh.scale.setScalar(baseScale);
            }
          }
          if (mode.gunfight.hp <= 0) {
            mode.gunfight.hp = 0;
            mode.gunfight.endRound?.("lose");
          }
          ui.progressText.textContent = `HP ${Math.max(0, mode.gunfight.hp)} | 回合 ${mode.gunfight.pWins}-${mode.gunfight.eWins}（先到 ${mode.gunfight.toWin}）`;
        }

        // forest99: night cycle + mobs
        if (profile.gameMode === "forest99") {
          mode.forest99.hurtCd = Math.max(0, mode.forest99.hurtCd - dt);
          mode.forest99.t += dt;
          const dayLen = 36; // seconds per full cycle
          const phase = (mode.forest99.t / dayLen) % 1;
          const nowNight = phase > 0.5;
          // lighting / fog
          const k = nowNight ? 0.22 : 1.0;
          hemi.intensity = 0.55 * k;
          sun.intensity = 1.05 * k;
          scene.background = new THREE.Color(nowNight ? 0x050714 : 0x0b1020);
          scene.fog = new THREE.FogExp2(nowNight ? 0x050714 : 0x0b1020, mode.forest99.fog * (nowNight ? 1.4 : 1.0));

          if (nowNight && !mode.forest99.isNight) {
            // night starts
            mode.forest99.isNight = true;
            mode.forest99.night += 1;
            // spawn wave
            if (mode.forest99.night <= mode.forest99.maxNights) {
              const wave = 2 + Math.min(18, (mode.forest99.night * 0.7) | 0);
              for (let i = 0; i < wave; i++) {
              const m = (typeof makeForestMob === "function" ? makeForestMob(Math.random()) : new THREE.Group());
              m.traverse?.((o) => {
                o.castShadow = true;
                o.receiveShadow = true;
              });
              const a = Math.random() * Math.PI * 2;
              const safeC = mode.forest99.safe?.center ?? new THREE.Vector3(0, 1.1, 8);
              const safeR = mode.forest99.safe?.radius ?? 4.2;
              const r = (safeR + 10) + Math.random() * 20;
              m.position.set(safeC.x + Math.cos(a) * r, 1.0, safeC.z + Math.sin(a) * r);
              mode.group.add(m);
              mode.forest99.mobs.push({
                mesh: m,
                hp: 70,
                atkCd: Math.random() * 0.8,
                spd: 2.2 + Math.random() * 0.6,
                walkT: Math.random() * 10,
                swingT: 0,
              });
            }
            }
            ui.hintText.textContent = `第 ${mode.forest99.night} 夜開始！`;
            setTimeout(() => (ui.hintText.textContent = "-"), 900);
          }
          if (!nowNight && mode.forest99.isNight) {
            // day starts
            mode.forest99.isNight = false;
            ui.hintText.textContent = "天亮了，快準備！";
            setTimeout(() => (ui.hintText.textContent = "-"), 900);
          }

          // mobs chase + attack
          const safeC = mode.forest99.safe?.center ?? new THREE.Vector3(0, 1.1, 8);
          const safeR = mode.forest99.safe?.radius ?? 4.2;
          const dxs = state.pos.x - safeC.x;
          const dzs = state.pos.z - safeC.z;
          const playerInSafe = (dxs * dxs + dzs * dzs) < (safeR - 0.25) * (safeR - 0.25);
          const hostile = nowNight; // 早上/白天：怪物沒有攻擊性

          for (const m of mode.forest99.mobs) {
            m.atkCd -= dt;
            // 白天：怪物不追人，會往森林外圍散開
            // 晚上：才追擊玩家（但玩家在結界內會只追到結界邊緣）
            let target;
            if (!hostile) {
              const away = new THREE.Vector3(m.mesh.position.x - safeC.x, 0, m.mesh.position.z - safeC.z);
              if (away.lengthSq() < 0.001) away.set(1, 0, 0);
              away.normalize();
              target = new THREE.Vector3(safeC.x, m.mesh.position.y, safeC.z).addScaledVector(away, safeR + 18);
            } else {
              target = playerInSafe ? new THREE.Vector3(safeC.x + dxs, state.pos.y, safeC.z + dzs) : state.pos;
            }

            const toP = new THREE.Vector3().subVectors(target, m.mesh.position);
            toP.y = 0;
            const d = toP.length();
            if (d > 0.001) {
              toP.normalize();
              const spd = hostile ? m.spd : m.spd * 0.55;
              m.mesh.position.addScaledVector(toP, dt * spd);
              // face move direction (blocky humanoid)
              m.mesh.rotation.y = Math.atan2(toP.x, toP.z);
              m.walkT = (m.walkT || 0) + dt * spd * 2.8;
            }

            // simple walk animation (arms/legs swing)
            const parts = m.mesh?.userData?.parts;
            if (parts?.armL && parts?.armR && parts?.legL && parts?.legR) {
              const swing = Math.sin((m.walkT || 0) * 3.2) * clamp(d, 0, 1) * 0.65;
              const idle = hostile ? 0.12 : 0.06;
              parts.legL.rotation.x = swing;
              parts.legR.rotation.x = -swing;
              parts.armL.rotation.x = -swing * 0.8 - idle;
              parts.armR.rotation.x = swing * 0.8 - idle;
            }

            // 結界：怪物推回外側（沒人可以進來）
            const mx = m.mesh.position.x - safeC.x;
            const mz = m.mesh.position.z - safeC.z;
            const md2 = mx * mx + mz * mz;
            const minR = safeR + 0.18;
            if (md2 < minR * minR) {
              const md = Math.max(0.0001, Math.sqrt(md2));
              const nx = mx / md;
              const nz = mz / md;
              m.mesh.position.x = safeC.x + nx * minR;
              m.mesh.position.z = safeC.z + nz * minR;
            }

            if (hostile && d < 1.35 && m.atkCd <= 0) {
              m.atkCd = 0.8 + Math.random() * 0.35;
              m.swingT = 0.22;
              if (!playerInSafe && mode.forest99.hurtCd <= 0) {
                mode.forest99.hp -= 8;
                mode.forest99.hurtCd = 0.22;
                sfx.play("hurt");
              }
            }

            // attack swing animation
            if (m.swingT > 0) {
              m.swingT = Math.max(0, m.swingT - dt);
              const parts = m.mesh?.userData?.parts;
              if (parts?.armR) {
                const k = 1 - m.swingT / 0.22;
                const a = Math.sin(k * Math.PI);
                parts.armR.rotation.x = -1.25 * a;
              }
            }
          }

          // silver fire FX animate
          if (mode.forest99.safeFx?.userData?.flame && mode.forest99.safeFx?.userData?.ring) {
            const t = performance.now() * 0.001;
            const flame = mode.forest99.safeFx.userData.flame;
            const ring = mode.forest99.safeFx.userData.ring;
            const pulse = 0.85 + Math.sin(t * 3.2) * 0.10 + Math.sin(t * 7.3) * 0.04;
            flame.scale.setScalar(pulse);
            ring.material.opacity = 0.26 + (pulse - 0.8) * 0.9;
          }

          // drops pickup (wood bag)
          for (let i = mode.forest99.drops.length - 1; i >= 0; i--) {
            const d = mode.forest99.drops[i];
            const m = d.mesh;
            if (!m) {
              mode.forest99.drops.splice(i, 1);
              continue;
            }
            d.bob += dt * 3.0;
            m.rotation.y += dt * (d.spin || 1.2);
            m.position.y += Math.sin(d.bob) * dt * 0.08;
            const dx = m.position.x - state.pos.x;
            const dz = m.position.z - state.pos.z;
            const dy = m.position.y - (state.pos.y + 1.0);
            if (dx * dx + dz * dz + dy * dy < 1.25 * 1.25) {
              if (d.kind === "wood") mode.forest99.inv.wood += 1;
              mode.group.remove(m);
              m.geometry?.dispose?.();
              // don't dispose shared material too aggressively; it's fine to keep
              mode.forest99.drops.splice(i, 1);
              sfx.play("coin");
            }
          }

          if (mode.forest99.hp <= 0) {
            mode.forest99.deadT += dt;
            if (mode.forest99.deadT > 1.0) {
              mode.forest99.hp = mode.forest99.maxHp;
              mode.forest99.deadT = 0;
              state.pos.set(0, 1.1, 8);
              state.vel.set(0, 0, 0);
              ui.hintText.textContent = "倒下了…回到營地。";
              setTimeout(() => (ui.hintText.textContent = "-"), 900);
            }
          }

          ui.progressText.textContent = `夜 ${Math.min(mode.forest99.night, 99)}/99 | HP ${Math.max(0, mode.forest99.hp)} | 木 ${mode.forest99.inv.wood | 0}`;
          if (mode.forest99.night >= mode.forest99.maxNights && !mode.forest99.winShown) {
            mode.forest99.winShown = true;
            ui.hintText.textContent = "你撐過了九十九夜！";
            setTimeout(() => (ui.hintText.textContent = "-"), 1600);
          }
        }
      }

      playerGroup.position.set(state.pos.x, state.pos.y, state.pos.z);
      // 角色模型的臉預設朝 +Z，但我們的「前方」是 -Z（lookDir/移動皆如此）
      // 因此把整體轉 180°，讓第三人稱會從背後看、移動方向也符合直覺（像 Roblox）
      playerGroup.rotation.y = state.yaw + Math.PI;

      // 角色動畫：待機呼吸 + 走路擺臂擺腿
      if (avatarModel.parts) {
        const t = performance.now() * 0.001;
        const speed = Math.min(1, Math.hypot(state.vel.x, state.vel.z) / MOVE_SPEED);
        const walk = speed;
        const idle = 1 - walk;
        const phase = t * (6.0 + walk * 6.5);

        // torso 微呼吸
        if (avatarModel.parts.torso) avatarModel.parts.torso.position.y = 1.15 + Math.sin(t * 2.4) * 0.02 * idle;
        if (avatarModel.parts.head) avatarModel.parts.head.position.y = 1.88 + Math.sin(t * 2.4 + 0.6) * 0.018 * idle;

        // 手臂擺動
        const armSwing = Math.sin(phase) * 0.65 * walk;
        if (avatarModel.parts.armL) avatarModel.parts.armL.rotation.x = armSwing + (state.onGround ? 0 : 0.35);
        if (avatarModel.parts.armR) avatarModel.parts.armR.rotation.x = -armSwing + (state.onGround ? 0 : 0.35);

        // 腿擺動
        const legSwing = Math.sin(phase) * 0.75 * walk;
        if (avatarModel.parts.legL) avatarModel.parts.legL.rotation.x = -legSwing;
        if (avatarModel.parts.legR) avatarModel.parts.legR.rotation.x = legSwing;
      }

      // multi-tab "friends"
      net.sendTick(dt);
      net.cleanup();
      // P2P friends (WebRTC)
      p2p.sendTick(dt);
      p2p.update(dt);

      // premium FX: trail
      if (profile.equipped === "trail_spark") {
        cosmeticFx.acc += dt;
        if (cosmeticFx.acc >= 0.06) {
          cosmeticFx.acc = 0;
          const m = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 10, 10),
            new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x114466, roughness: 0.35, transparent: true })
          );
          m.position.set(state.pos.x, state.pos.y + 1.0, state.pos.z);
          scene.add(m);
          cosmeticFx.trail.push({ mesh: m, life: 0.6 });
        }
      }
      for (let i = cosmeticFx.trail.length - 1; i >= 0; i--) {
        const p = cosmeticFx.trail[i];
        p.life -= dt;
        if (p.life <= 0) {
          scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          p.mesh.material.dispose();
          cosmeticFx.trail.splice(i, 1);
          continue;
        }
        p.mesh.position.y += dt * 0.35;
        p.mesh.material.opacity = p.life / 0.6;
      }

      // pet bob
      if (avatarModel.cosmetics?.pet) {
        avatarModel.cosmetics.pet.position.y = 1.62 + Math.sin(performance.now() * 0.004) * 0.03;
      }

      // emblem anim
      if (avatarModel.cosmetics?.emblemKit) {
        const kit = avatarModel.cosmetics.emblemKit;
        const t = performance.now() * 0.001;
        kit.rotation.y = t * 1.2;
        kit.rotation.x = Math.sin(t * 0.9) * 0.08;
        kit.position.y = Math.sin(t * 1.6) * 0.03;
        if (avatarModel.cosmetics.badge) {
          avatarModel.cosmetics.badge.material.opacity = 0.85 + Math.sin(t * 3.2) * 0.10;
        }
      }

      // user bundle anim（披風套件：光圈旋轉 / R 呼吸 / 水晶旋轉）
      if (avatarModel.cosmetics?.userKit) {
        const t = performance.now() * 0.001;
        if (avatarModel.cosmetics.capeRing) {
          avatarModel.cosmetics.capeRing.rotation.z = t * 0.9;
          avatarModel.cosmetics.capeRing.material.opacity = 0.78 + Math.sin(t * 2.0) * 0.08;
        }
        if (avatarModel.cosmetics.userRB) {
          avatarModel.cosmetics.userRB.material.opacity = 0.82 + Math.sin(t * 3.1) * 0.12;
        }
        if (avatarModel.cosmetics.userStaff) {
          avatarModel.cosmetics.userStaff.rotation.y = Math.sin(t * 1.2) * 0.12;
        }
        if (avatarModel.cosmetics.userGem) {
          avatarModel.cosmetics.userGem.rotation.y = t * 2.1;
          avatarModel.cosmetics.userGem.rotation.x = t * 1.4;
        }
        if (avatarModel.cosmetics.userHelm) {
          avatarModel.cosmetics.userHelm.rotation.y = Math.sin(t * 0.9) * 0.05;
        }
      }

      // original neon cape anim（頂端固定，底部擺動）
      if (avatarModel.cosmetics?.procCape && avatarModel.cosmetics?.procCapeBase) {
        const cape = avatarModel.cosmetics.procCape;
        const posAttr = cape.geometry.attributes.position;
        const base = avatarModel.cosmetics.procCapeBase;
        const arr = posAttr.array;

        const t = performance.now() * 0.001;
        const speed = Math.min(1.8, Math.hypot(state.vel.x, state.vel.z) / MOVE_SPEED);
        const sway = 0.08 + speed * 0.16 + (state.onGround ? 0 : 0.08);

        // y 範圍大約 [-0.875, +0.875]（PlaneGeometry 高度 1.75）
        for (let i = 0; i < arr.length; i += 3) {
          const bx = base[i + 0];
          const by = base[i + 1];
          const bz = base[i + 2];

          const u = (by + 0.875) / 1.75; // 0=下, 1=上
          const anchor = clamp(u, 0, 1);
          const w = Math.pow(1 - anchor, 1.35); // 越下越大

          const wave1 = Math.sin(t * 6.0 + (1 - u) * 5.5 + bx * 1.2) * sway;
          const wave2 = Math.sin(t * 3.7 + (1 - u) * 3.2) * (sway * 0.55);

          arr[i + 0] = bx + wave2 * w * 0.35; // x
          arr[i + 1] = by; // y
          arr[i + 2] = bz + wave1 * w; // z（飄動）
        }
        posAttr.needsUpdate = true;

        avatarModel.cosmetics.procCapeTick = (avatarModel.cosmetics.procCapeTick || 0) + 1;
        if ((avatarModel.cosmetics.procCapeTick % 6) === 0) {
          cape.geometry.computeVertexNormals();
        }
        if (avatarModel.cosmetics.procCapeRing) {
          avatarModel.cosmetics.procCapeRing.rotation.z = t * 0.8;
        }
        if (avatarModel.cosmetics.procWings && avatarModel.cosmetics.procWingL && avatarModel.cosmetics.procWingR) {
          // 翅膀固定不動（使用靜態展開姿勢）
          if (!avatarModel.cosmetics.procWingsStaticInit) {
            // 平的：貼背攤開（不要傾斜/不要俯仰）
            avatarModel.cosmetics.procWings.rotation.x = 0.0;
            const open = 0.75;
            avatarModel.cosmetics.procWingL.rotation.y = open;
            avatarModel.cosmetics.procWingL.rotation.z = 0.0;
            avatarModel.cosmetics.procWingL.rotation.x = 0.0;
            avatarModel.cosmetics.procWingR.rotation.y = -open;
            avatarModel.cosmetics.procWingR.rotation.z = 0.0;
            avatarModel.cosmetics.procWingR.rotation.x = 0.0;
            avatarModel.cosmetics.procWings.position.y = 1.18;
            avatarModel.cosmetics.procWingsStaticInit = true;
          }
        }
        if (avatarModel.cosmetics.procHelm) {
          avatarModel.cosmetics.procHelm.rotation.y = Math.sin(t * 0.9) * 0.05;
        }
      }

      // camera modes
      if (profile.camMode === "first") {
        // 第一人稱：把鏡頭放在頭部並隱藏自身模型
        playerGroup.visible = false;
        const dir = getLookDirection();
        const eye = new THREE.Vector3(state.pos.x, state.pos.y + 1.65, state.pos.z);
        camera.position.copy(eye);
        camera.lookAt(eye.clone().add(dir.multiplyScalar(10)));
        camFollow.init = false;
      } else if (profile.camMode === "top") {
        // 俯視：固定高度追蹤（可用 yaw 輕微旋轉）
        playerGroup.visible = true;
        const h = 18;
        const r = 7.5;
        const ox = Math.sin(state.yaw) * r;
        const oz = Math.cos(state.yaw) * r;
        camera.position.set(state.pos.x + ox, state.pos.y + h, state.pos.z + oz);
        camera.lookAt(state.pos.x, state.pos.y + 1.1, state.pos.z);
        camFollow.init = false;
      } else {
        // 第三人稱：更貼身的背後跟隨（更像 Roblox）
        playerGroup.visible = true;

        // Roblox 風格：滑鼠控制 yaw + pitch，鏡頭繞著角色轉（距離固定）
        const BACK_DIST = 4.8; // 越大＝越遠
        const UP = 2.35;
        const lookDir = getLookDirection(state.camPitch, state.camYaw); // 吃 pitch（相機角）
        const camOffset = lookDir.clone().multiplyScalar(-BACK_DIST);
        camOffset.y += UP;
        const desiredPos = new THREE.Vector3(state.pos.x, state.pos.y, state.pos.z).add(camOffset);
        // 視線對準頭部（偏高）
        const desiredLook = new THREE.Vector3(state.pos.x, state.pos.y + 1.85, state.pos.z);

        // 平滑跟隨：更「黏」在角色後面
        const alpha = 1 - Math.exp(-18 * dt);
        if (!camFollow.init) {
          camFollow.init = true;
          camFollow.pos.copy(desiredPos);
          camFollow.look.copy(desiredLook);
        } else {
          camFollow.pos.lerp(desiredPos, alpha);
          camFollow.look.lerp(desiredLook, alpha);
        }
        camera.position.copy(camFollow.pos);
        camera.lookAt(camFollow.look);
      }

      // weapon visibility/animation (needs camera + camMode)
      weapon.update(dt);
      if (ui.crosshair) {
        const combat = profile.gameMode === "gunfight" || profile.gameMode === "forest99";
        ui.crosshair.style.opacity = combat && state.pointerLocked ? "1" : "0";
        if (ui.hotbar) ui.hotbar.classList.toggle("hidden", combat);
      }

      // HUD
      if (ui.camModeText) ui.camModeText.textContent = profile.camMode === "first" ? "第一人稱" : profile.camMode === "top" ? "俯視" : "第三人稱";
    }

    let last = performance.now();
    function loop() {
      const t = performance.now();
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      tick(dt);
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    function setSelected(i) {
      state.selected = clamp(i, 0, BLOCKS.length - 1);
      ui.blockName.textContent = BLOCKS[state.selected].name;
      Array.from(ui.hotbar.children).forEach((el, idx) => el.classList.toggle("active", idx === state.selected));
    }

    buildHotbar(setSelected);
    setSelected(0);

    // --- UI wiring ---
    function setActiveExperience(ex) {
      activeExp = ex;
      profile.experienceId = ex?.id ?? null;
      if (ex?.template) profile.gameMode = ex.template;
      saveProfile(profile);
      refreshModeCamBtns();
      refreshExperienceUi();
    }

    // Experience feed: 無限滑動（滑到底自動再加）
    const EXP_FEED_INITIAL_MENU = 40;
    const EXP_FEED_INITIAL_SIDE = 60;
    const EXP_FEED_STEP = 40;
    const EXP_FEED_MARGIN_PX = 320;

    const expMetaLong = (ex) =>
      ex.template === "obby"
        ? "跑酷關卡（含陷阱/移動平台）"
        : ex.template === "coins"
          ? "限時撿金幣"
          : ex.template === "gunfight"
            ? "槍戰：1v1 對戰"
            : ex.template === "forest99"
              ? "生存：森林九十九夜"
              : "自由建造沙盒";

    const expMetaShort = (ex) =>
      ex.template === "obby"
        ? "跑酷關卡"
        : ex.template === "coins"
          ? "撿金幣"
          : ex.template === "gunfight"
            ? "槍戰"
            : ex.template === "forest99"
              ? "九十九夜"
              : "沙盒建造";

    const getExpScrollHost = (container) =>
      container?.closest?.(".sidepanel__card") || container?.closest?.(".menu__card") || container;

    const makeExperienceBtn = (ex, dense = false) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.exid = ex.id;
      btn.className = `exitem ${activeExp?.id === ex.id ? "active" : ""}`;
      const tag = expTag(ex);
      const fallback = makeExperienceThumb(ex);
      btn.innerHTML = `
          <div class="exitem__name">${ex.name}</div>
          <img class="exitem__img" alt="" loading="lazy" />
          <div class="exitem__tags"><span class="${tag.cls}">${tag.text}</span><span class="tag">Seed ${ex.params?.seed ?? "-"}</span></div>
          <div class="exitem__meta">${dense ? expMetaShort(ex) : expMetaLong(ex)}</div>
        `;
      const imgEl = btn.querySelector(".exitem__img");
      if (imgEl) {
        const custom = getCustomExperienceThumbUrl(ex);
        if (custom) {
          imgEl.src = custom;
          imgEl.addEventListener("error", () => (imgEl.src = fallback), { once: true });
        } else {
          imgEl.src = fallback;
        }
      }
      btn.addEventListener("click", () => {
        // 一按就進入遊戲（像 Roblox 直接點遊戲卡片）
        setActiveExperience(ex);
        enterGame({ load: false, lock: true });
      });
      return btn;
    };

    const syncActiveExperienceBtns = (container) => {
      if (!container) return;
      const activeId = activeExp?.id ?? "";
      const btns = container.querySelectorAll?.(".exitem") || [];
      for (const b of btns) b.classList.toggle("active", b.dataset.exid === activeId);
    };

    const ensureExperienceFeed = (container, { initial = 40, dense = false } = {}) => {
      if (!container) return;
      if (!container.__expFeed) {
        const host = getExpScrollHost(container);
        container.__expFeed = { rendered: 0, dense, host, onScroll: null };
        const onScroll = () => {
          const st = host.scrollTop || 0;
          const ch = host.clientHeight || 0;
          const sh = host.scrollHeight || 0;
          if (st + ch >= sh - EXP_FEED_MARGIN_PX) {
            const feed = container.__expFeed;
            const want = feed.rendered + EXP_FEED_STEP;
            ensureExperiences(want);
            const to = Math.min(want, EXPERIENCES.length);
            if (to <= feed.rendered) return;
            const frag = document.createDocumentFragment();
            for (let i = feed.rendered; i < to; i++) frag.appendChild(makeExperienceBtn(EXPERIENCES[i], feed.dense));
            container.appendChild(frag);
            feed.rendered = to;
          }
        };
        host.addEventListener("scroll", onScroll, { passive: true });
        container.__expFeed.onScroll = onScroll;
      }
      const feed = container.__expFeed;
      if (feed.rendered <= 0) {
        ensureExperiences(initial);
        const to = Math.min(initial, EXPERIENCES.length);
        const frag = document.createDocumentFragment();
        for (let i = 0; i < to; i++) frag.appendChild(makeExperienceBtn(EXPERIENCES[i], feed.dense));
        container.innerHTML = "";
        container.appendChild(frag);
        feed.rendered = to;
      }
      syncActiveExperienceBtns(container);
    };

    function refreshExperienceUi() {
      const name = activeExp?.name ?? "未選擇";
      if (ui.expNameText) ui.expNameText.textContent = name;
      if (ui.hudExpText) ui.hudExpText.textContent = activeExp?.name ?? "-";
      if (ui.experienceList) ensureExperienceFeed(ui.experienceList, { initial: EXP_FEED_INITIAL_MENU, dense: false });
    }

    function refreshSideHomeUi() {
      const name = activeExp?.name ?? "-";
      if (ui.panelExpName) ui.panelExpName.textContent = name;
      if (ui.panelExperienceList) ensureExperienceFeed(ui.panelExperienceList, { initial: EXP_FEED_INITIAL_SIDE, dense: true });
    }

    function refreshSideStatsUi() {
      if (ui.panelGems) ui.panelGems.textContent = `${vip.ok ? profile.gems : 0}`;
      if (ui.panelOwned) ui.panelOwned.textContent = `${profile.owned?.length || 0}`;
      if (ui.panelGame) ui.panelGame.textContent = activeExp?.name ?? "-";
      if (ui.panelMode) {
        ui.panelMode.textContent =
          profile.gameMode === "coins"
            ? "金幣"
            : profile.gameMode === "obby"
              ? "跑酷"
              : profile.gameMode === "gunfight"
                ? "槍戰"
                : profile.gameMode === "forest99"
                  ? "九十九夜"
                  : "沙盒";
      }
    }

    function refreshSideSquadUi() {
      // 目前 net.peers 不暴露，先用 DOM 數量顯示（簡單版）
      // 若之後要更完整，可把 peers map 暴露出來
      if (!ui.panelPeerList) return;
      const items = Array.from(peersGroup.children || []);
      if (ui.panelPeers) ui.panelPeers.textContent = `${items.length}`;
      ui.panelPeerList.innerHTML = "";
      for (let i = 0; i < items.length; i++) {
        const el = document.createElement("div");
        el.className = "peeritem";
        el.textContent = `朋友 #${i + 1}`;
        ui.panelPeerList.appendChild(el);
      }
      if (!items.length) {
        const el = document.createElement("div");
        el.className = "peeritem";
        el.textContent = "目前沒有朋友在線（開第二個分頁進遊戲試試）";
        ui.panelPeerList.appendChild(el);
      }

      // P2P status default
      if (ui.p2pStatus && !ui.p2pStatus.textContent) ui.p2pStatus.textContent = "連線：-";
    }

    function refreshSideMoreUi() {
      if (ui.panelSfxToggle) ui.panelSfxToggle.textContent = `音效：${audio.enabled ? "開" : "關"}`;
      if (ui.panelSfxVol) ui.panelSfxVol.value = `${Math.round(audio.volume * 100)}`;
      if (ui.vipStatus) {
        ui.vipStatus.textContent = vip.ok ? "VIP：已登入（商店免費）" : "VIP：未登入";
      }
      if (ui.vipLogoutBtn) ui.vipLogoutBtn.classList.toggle("hidden", !vip.ok);
    }

    function refreshSideAvatarUi() {
      if (!ui.catalogGrid) return;

      // tabs
      const tabs = Array.from(ui.catalogTabs?.querySelectorAll(".tab") || []);
      if (!state.catalogTab) state.catalogTab = "all";
      for (const t of tabs) t.classList.toggle("active", t.dataset.tab === state.catalogTab);

      // render grid
      ui.catalogGrid.innerHTML = "";
      const filter = state.catalogTab;
      const list =
        filter === "all" ? catalog.items : catalog.items.filter((it) => it.group === filter);

      for (const it of list) {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "catcard";
        const img = catalog.makeThumb(it);
        const owned = vip.ok ? true : profile.owned.includes(it.id);
        const price = typeof it.price === "number" ? it.price : 200;
        const topBadge = vip.ok ? "VIP 免費" : owned ? "已擁有" : `${price} 寶石`;
        el.innerHTML = `
          <div class="coscard__top" style="margin-bottom:8px">
            <span class="badge ${vip.ok ? "badge--on" : ""}">${topBadge}</span>
            <span class="badge">${vip.ok ? "VIP" : owned ? "使用" : "購買"}</span>
          </div>
          <img class="catcard__img" src="${img}" alt="" loading="lazy" />
          <div class="catcard__name">${it.name}</div>
          <div class="catcard__meta">${it.meta || ""}</div>
        `;
        el.addEventListener("click", () => {
          // paywall: all avatar shop items require gems unless VIP
          if (!vip.ok) {
            const has = profile.owned.includes(it.id);
            if (!has) {
              if (profile.gems < price) {
                ui.hintText.textContent = "寶石不足（或登入 VIP 免費）";
                setTimeout(() => (ui.hintText.textContent = "-"), 900);
                return;
              }
              profile.gems -= price;
              profile.owned.push(it.id);
              saveProfile(profile);
            }
          } else {
            // VIP：自動視為已擁有（方便下次不用再買）
            if (!profile.owned.includes(it.id)) {
              profile.owned.push(it.id);
              saveProfile(profile);
            }
          }

          // apply item
          if (it.kind === "preset") {
            Object.assign(avatar, it.payload || {});
            applyAvatar();
            saveAvatar(avatar);
          } else if (it.kind === "skin") {
            avatar.skin = it.payload.skin;
            applyAvatar();
            saveAvatar(avatar);
          } else if (it.kind === "shirtStyle") {
            avatar.shirtStyle = it.payload.shirtStyle;
            applyAvatar();
            saveAvatar(avatar);
          } else if (it.kind === "pantsStyle") {
            avatar.pantsStyle = it.payload.pantsStyle;
            applyAvatar();
            saveAvatar(avatar);
          } else if (it.kind === "hat") {
            avatar.hat = it.payload.hat;
            applyAvatar();
            saveAvatar(avatar);
          } else if (it.kind === "acc") {
            avatar.acc = it.payload.acc;
            applyAvatar();
            saveAvatar(avatar);
          } else if (it.kind === "cosmetic") {
            const cid = it.payload.equipped;
            const already = ownsCosmetic(profile, cid);
            if (!already) {
              if (vip.ok) {
                profile.owned.push(cid);
                saveProfile(profile);
              } else {
                const ok = buyCosmetic(profile, cid);
                if (!ok) {
                  ui.hintText.textContent = "寶石不足（或登入 VIP 免費）";
                  setTimeout(() => (ui.hintText.textContent = "-"), 900);
                  refreshSideAvatarUi();
                  refreshCosmeticsUi();
                  return;
                }
                saveProfile(profile);
              }
            }
            profile.equipped = cid;
            saveProfile(profile);
            applyCosmetic(profile.equipped);
          } else if (it.kind === "emote") {
            state.emote = it.payload.emote;
            state.emoteT = performance.now() / 1000;
          }
          sfx.play("equip");
          refreshSideAvatarUi();
          refreshCosmeticsUi();
        });
        ui.catalogGrid.appendChild(el);
      }
    }

    function openSidePanel(panel) {
      if (!ui.sidePanel) return;
      ui.sidePanel.classList.remove("hidden");
      // 解除 pointer lock 方便點選
      document.exitPointerLock?.();

      const map = {
        home: { title: "首頁", el: ui.panelHome, refresh: () => refreshSideHomeUi() },
        stats: { title: "圖表", el: ui.panelStats, refresh: () => refreshSideStatsUi() },
        avatar: { title: "虛擬人偶", el: ui.panelAvatar, refresh: () => refreshSideAvatarUi() },
        squad: { title: "隊伍", el: ui.panelSquad, refresh: () => refreshSideSquadUi() },
        more: { title: "更多", el: ui.panelMore, refresh: () => refreshSideMoreUi() },
      };
      for (const k of Object.keys(map)) {
        map[k].el?.classList.add("hidden");
      }
      const cur = map[panel] ?? map.home;
      if (ui.sidePanelTitle) ui.sidePanelTitle.textContent = cur.title;
      cur.el?.classList.remove("hidden");
      cur.refresh?.();

      // active state
      const btns = [ui.sideHome, ui.sideStats, ui.sideAvatar, ui.sideSquad, ui.sideMore].filter(Boolean);
      for (const b of btns) b.classList.toggle("active", b.dataset.panel === panel);
    }

    function closeSidePanel() {
      ui.sidePanel?.classList.add("hidden");
    }

    function refreshAvatarUi() {
      renderSwatches(ui.skinColors, AVATAR.skinPalette, () => avatar.skin, (v) => (avatar.skin = v), () => {
        applyAvatar();
        saveAvatar(avatar);
        refreshAvatarUi();
      });
      renderSwatches(ui.shirtColors, AVATAR.shirtPalette, () => avatar.shirt, (v) => (avatar.shirt = v), () => {
        applyAvatar();
        saveAvatar(avatar);
        refreshAvatarUi();
      });
      renderChips(ui.shirtStyles, AVATAR.shirtStyles, () => avatar.shirtStyle, (v) => (avatar.shirtStyle = v), () => {
        applyAvatar();
        saveAvatar(avatar);
        refreshAvatarUi();
      });
      renderSwatches(ui.pantsColors, AVATAR.pantsPalette, () => avatar.pants, (v) => (avatar.pants = v), () => {
        applyAvatar();
        saveAvatar(avatar);
        refreshAvatarUi();
      });
      renderChips(ui.pantsStyles, AVATAR.pantsStyles, () => avatar.pantsStyle, (v) => (avatar.pantsStyle = v), () => {
        applyAvatar();
        saveAvatar(avatar);
        refreshAvatarUi();
      });
      renderChips(ui.hatList, AVATAR.hats, () => avatar.hat, (v) => (avatar.hat = v), () => {
        applyAvatar();
        saveAvatar(avatar);
        refreshAvatarUi();
      });
      renderChips(ui.accList, AVATAR.accs, () => avatar.acc, (v) => (avatar.acc = v), () => {
        applyAvatar();
        saveAvatar(avatar);
        refreshAvatarUi();
      });
    }

    function refreshCosmeticsUi() {
      if (ui.gemsText) ui.gemsText.textContent = `${vip.ok ? profile.gems : 0}`;
      if (ui.buyGemsBtn) ui.buyGemsBtn.classList.toggle("hidden", !vip.ok);
      if (!ui.cosmeticGrid) return;
      ui.cosmeticGrid.innerHTML = "";
      for (const c of COSMETICS.filter((x) => x.id !== "none")) {
        const owned = ownsCosmetic(profile, c.id);
        const equipped = profile.equipped === c.id;
        const el = document.createElement("div");
        el.className = "coscard";
        const img = c.img ? `<img class="coscard__img" src="${c.img}" alt="" />` : "";
        el.innerHTML = `
          <div class="coscard__top">
            <span class="badge ${equipped ? "badge--on" : ""}">${equipped ? "使用中" : owned ? "已擁有" : "未擁有"}</span>
            <span class="badge">${owned ? "裝備" : vip.ok ? "VIP 免費" : `${c.price} 寶石`}</span>
          </div>
          ${img}
          <div class="coscard__name">${c.name}</div>
          <div class="coscard__meta">${c.desc}</div>
        `;
        el.addEventListener("click", () => {
          if (!owned) {
            if (vip.ok) {
              profile.owned.push(c.id);
            } else {
              const ok = buyCosmetic(profile, c.id);
              if (!ok) {
                ui.hintText.textContent = "寶石不足（或登入 VIP 免費）";
                setTimeout(() => (ui.hintText.textContent = "-"), 800);
                refreshCosmeticsUi();
                return;
              }
            }
          }
          profile.equipped = c.id;
          saveProfile(profile);
          applyCosmetic(profile.equipped);
          refreshCosmeticsUi();
        });
        ui.cosmeticGrid.appendChild(el);
      }
    }

    const enforceVipEconomy = () => {
      // 沒 VIP：不要有錢（寶石固定 0，且不允許加值）
      if (!vip.ok) {
        if (profile.gems !== 0) {
          profile.gems = 0;
          saveProfile(profile);
        }
      }
      if (ui.gemsText) ui.gemsText.textContent = `${vip.ok ? profile.gems : 0}`;
      if (ui.buyGemsBtn) ui.buyGemsBtn.classList.toggle("hidden", !vip.ok);
      if (ui.panelGems) ui.panelGems.textContent = `${vip.ok ? profile.gems : 0}`;
    };

    ui.randomAvatarBtn?.addEventListener("click", () => {
      avatar.skin = randPick(AVATAR.skinPalette);
      avatar.shirt = randPick(AVATAR.shirtPalette);
      avatar.pants = randPick(AVATAR.pantsPalette);
      avatar.shirtStyle = randPick(AVATAR.shirtStyles).id;
      avatar.pantsStyle = randPick(AVATAR.pantsStyles).id;
      avatar.hat = randPick(AVATAR.hats).id;
      avatar.acc = randPick(AVATAR.accs).id;
      applyAvatar();
      saveAvatar(avatar);
      refreshAvatarUi();
    });

    ui.resetAvatarBtn?.addEventListener("click", () => {
      avatar = {
        skin: AVATAR.skinPalette[0],
        shirt: AVATAR.shirtPalette[0],
        pants: AVATAR.pantsPalette[0],
        shirtStyle: "solid",
        pantsStyle: "solid",
        hat: "cap",
        acc: "none",
      };
      applyAvatar();
      saveAvatar(avatar);
      refreshAvatarUi();
    });

    ui.buyGemsBtn?.addEventListener("click", () => {
      if (!vip.ok) {
        enforceVipEconomy();
        ui.hintText.textContent = "需要 VIP 才能加值";
        setTimeout(() => (ui.hintText.textContent = "-"), 900);
        return;
      }
      profile.gems += 1000;
      saveProfile(profile);
      enforceVipEconomy();
      refreshCosmeticsUi();
      sfx.play("click");
    });
    ui.equipNoneBtn?.addEventListener("click", () => {
      profile.equipped = "none";
      saveProfile(profile);
      applyCosmetic("none");
      refreshCosmeticsUi();
      sfx.play("click");
    });

    // VIP login (local)
    ui.vipLoginBtn?.addEventListener("click", async () => {
      const code = String(ui.vipCode?.value || "").trim();
      if (!code) {
        ui.hintText.textContent = "請輸入 VIP 代碼";
        setTimeout(() => (ui.hintText.textContent = "-"), 900);
        return;
      }
      try {
        // 你指定的規則：只要代碼「含 s」就通過
        const ok = /s/i.test(code);
        vip.ok = ok;
        vip.hash = "rule_contains_s_v1"; // 不存明碼，只存規則標記（用於自動保存）
        saveVip(vip);
        ui.hintText.textContent = ok ? "VIP 登入成功" : "VIP 代碼錯誤";
        setTimeout(() => (ui.hintText.textContent = "-"), 900);
      } catch {
        ui.hintText.textContent = "VIP 登入失敗";
        setTimeout(() => (ui.hintText.textContent = "-"), 900);
      }
      if (ui.vipCode) ui.vipCode.value = "";
      enforceVipEconomy();
      refreshSideMoreUi();
      refreshSideAvatarUi();
      refreshCosmeticsUi();
    });

    ui.vipLogoutBtn?.addEventListener("click", () => {
      vip.ok = false;
      saveVip(vip);
      enforceVipEconomy();
      refreshSideMoreUi();
      refreshSideAvatarUi();
      refreshCosmeticsUi();
      ui.hintText.textContent = "已登出 VIP";
      setTimeout(() => (ui.hintText.textContent = "-"), 900);
    });

    ui.clearBtn.addEventListener("click", clearWorldSave);
    ui.saveBtn.addEventListener("click", () => saveWorld(world.blocks));

    function enterGame({ load = false, lock = false, showList = false, panel = "home" } = {}) {
      ui.menu.classList.add("hidden");
      ui.hud.classList.remove("hidden");
      state.running = true;
      // 進遊戲時同步相機角度（避免第三人稱一開始卡死在背後）
      state.camYaw = state.yaw;
      state.camPitch = state.pitch;
      // 若沒有選擇遊戲，預設挑一個（避免空白）
      if (!activeExp) activeExp = EXPERIENCES[0] ?? null;
      if (activeExp?.template) profile.gameMode = activeExp.template;
      if (ui.hudExpText) ui.hudExpText.textContent = activeExp?.name ?? "-";

      // reset lighting/fog overrides from special modes
      hemi.intensity = 0.8;
      sun.intensity = 1.0;
      scene.fog = null;
      scene.background = new THREE.Color(0x0b1020);
      if (mode.forest99?.bag) mode.forest99.bag.visible = false;

      const template = activeExp?.template ?? "sandbox";
      const isSpecialWorld = template === "gunfight" || template === "forest99";

      if (load && template === "sandbox") {
        const ok = loadWorld();
        if (!ok) {
          resetWorld();
          // 新遊戲：用體驗參數生成世界
          const rng = activeExp ? mulberry32(activeExp.params?.seed ?? hashToSeed(activeExp.id)) : Math.random;
          seedTerrain({ rng, spread: activeExp?.params?.spread, pillars: activeExp?.params?.pillars, patches: activeExp?.params?.patches });
        }
      } else {
        resetWorld();
        const rng = activeExp ? mulberry32(activeExp.params?.seed ?? hashToSeed(activeExp.id)) : Math.random;
        if (!isSpecialWorld) {
          seedTerrain({ rng, spread: activeExp?.params?.spread, pillars: activeExp?.params?.pillars, patches: activeExp?.params?.patches });
        }
      }
      // modes
      if (profile.gameMode === "coins") {
        const rng = activeExp ? mulberry32(activeExp.params?.seed ?? hashToSeed(activeExp.id)) : Math.random;
        setupCoinsMode({ rng, total: activeExp?.params?.total, radius: activeExp?.params?.radius });
      }
      if (profile.gameMode === "obby") {
        const rng = activeExp ? mulberry32(activeExp.params?.seed ?? hashToSeed(activeExp.id)) : Math.random;
        setupObbyMode({ rng, params: activeExp?.params });
      }
      if (profile.gameMode === "gunfight") {
        const rng = activeExp ? mulberry32(activeExp.params?.seed ?? hashToSeed(activeExp.id)) : Math.random;
        setupGunfightMode({ rng, params: activeExp?.params });
      }
      if (profile.gameMode === "forest99") {
        const rng = activeExp ? mulberry32(activeExp.params?.seed ?? hashToSeed(activeExp.id)) : Math.random;
        setupForest99Mode({ rng, params: activeExp?.params });
      }
      // 預設：進遊戲先顯示列表（像 Roblox 首頁），讓你一打開就看得到
      if (showList) {
        openSidePanel(panel);
        ui.hintText.textContent = "已開啟列表：點卡片選遊戲／虛擬人偶；關閉面板後點一下畫面鎖定滑鼠";
      } else {
        ui.hintText.textContent = net.enabled ? "點一下畫面鎖定滑鼠（開第二個分頁＝朋友）" : "點一下畫面鎖定滑鼠";
      }
      sfx.play("click");

      // 盡量在同一次點擊手勢內鎖定滑鼠（瀏覽器允許才會成功）
      if (lock) {
        // 要鎖定時先把面板收起來（避免被 UI 擋住）
        closeSidePanel();
        try {
          ui.canvas?.requestPointerLock?.();
        } catch {}
      }
    }

    function exitToMenu() {
      state.running = false;
      document.exitPointerLock?.();
      ui.hud.classList.add("hidden");
      ui.menu.classList.remove("hidden");
    }

    // 你要「一打開就看得到列表」：先進遊戲但先不鎖定滑鼠，直接打開首頁列表
    ui.playBtn.addEventListener("click", () => enterGame({ load: false, lock: false, showList: true, panel: "home" }));
    ui.loadBtn.addEventListener("click", () => enterGame({ load: true, lock: false, showList: true, panel: "home" }));
    ui.exitBtn.addEventListener("click", exitToMenu);

    // 音效 UI
    const refreshSfxUi = () => {
      if (ui.sfxToggleBtn) ui.sfxToggleBtn.textContent = `音效：${audio.enabled ? "開" : "關"}`;
      if (ui.sfxVol) ui.sfxVol.value = `${Math.round(audio.volume * 100)}`;
    };
    ui.sfxToggleBtn?.addEventListener("click", async () => {
      sfx.setEnabled(!audio.enabled);
      if (audio.enabled) await sfx.ensure();
      refreshSfxUi();
      sfx.play("click");
    });
    ui.sfxVol?.addEventListener("input", (e) => {
      const v = Number(e.target.value) / 100;
      sfx.setVolume(v);
      refreshSfxUi();
    });
    ui.sfxBtn?.addEventListener("click", async () => {
      sfx.setEnabled(!audio.enabled);
      if (audio.enabled) await sfx.ensure();
      refreshSfxUi();
      sfx.play("click");
    });

    // 遊戲清單 UI
    ui.expRandomBtn?.addEventListener("click", () => {
      const ex = EXPERIENCES[(Math.random() * EXPERIENCES.length) | 0];
      setActiveExperience(ex);
      enterGame({ load: false, lock: true });
    });

    // 遊戲內側邊欄（像你貼的 Roblox UI）
    const sideBtns = [ui.sideHome, ui.sideStats, ui.sideAvatar, ui.sideSquad, ui.sideMore].filter(Boolean);
    for (const b of sideBtns) {
      b.addEventListener("click", () => {
        openSidePanel(b.dataset.panel || "home");
        sfx.play("click");
      });
    }
    ui.sideClose?.addEventListener("click", () => closeSidePanel());
    ui.panelRandomBtn?.addEventListener("click", () => {
      const ex = EXPERIENCES[(Math.random() * EXPERIENCES.length) | 0];
      setActiveExperience(ex);
      enterGame({ load: false, lock: true });
    });
    ui.panelSfxToggle?.addEventListener("click", async () => {
      sfx.setEnabled(!audio.enabled);
      if (audio.enabled) await sfx.ensure();
      refreshSfxUi();
      refreshSideMoreUi();
      sfx.play("click");
    });
    ui.panelSfxVol?.addEventListener("input", (e) => {
      const v = Number(e.target.value) / 100;
      sfx.setVolume(v);
      refreshSfxUi();
      refreshSideMoreUi();
    });
    ui.panelToMenu?.addEventListener("click", () => {
      closeSidePanel();
      exitToMenu();
      sfx.play("click");
    });

    // Touch controls (tablet/mobile)
    const isCoarse = () => {
      try {
        return (
          (globalThis.matchMedia && matchMedia("(hover: none) and (pointer: coarse)").matches) ||
          "ontouchstart" in window ||
          navigator.maxTouchPoints > 0
        );
      } catch {
        return false;
      }
    };
    state.touch.enabled = !!ui.touchControls && isCoarse();
    if (state.touch.enabled) {
      document.body.classList.add("touch-on");
    }

    const setStick = (dx, dy) => {
      const maxR = 46;
      const len = Math.hypot(dx, dy) || 0;
      const k = len > maxR ? maxR / len : 1;
      const sx = dx * k;
      const sy = dy * k;
      if (ui.touchStick) ui.touchStick.style.transform = `translate(calc(-50% + ${sx}px), calc(-50% + ${sy}px))`;
      // normalized move (-1..1), y is forward (up on stick = +forward)
      state.touch.mx = clamp(sx / maxR, -1, 1);
      state.touch.my = clamp(-sy / maxR, -1, 1);
    };
    const resetStick = () => {
      state.touch.mx = 0;
      state.touch.my = 0;
      if (ui.touchStick) ui.touchStick.style.transform = "translate(-50%, -50%)";
    };

    ui.touchMove?.addEventListener("pointerdown", (e) => {
      if (!state.touch.enabled) return;
      state.touch.movePid = e.pointerId;
      ui.touchMove?.setPointerCapture?.(e.pointerId);
      const r = ui.touchMove.getBoundingClientRect();
      state.touch.stickCx = r.left + r.width / 2;
      state.touch.stickCy = r.top + r.height / 2;
      setStick(e.clientX - state.touch.stickCx, e.clientY - state.touch.stickCy);
      e.preventDefault();
    });
    ui.touchMove?.addEventListener("pointermove", (e) => {
      if (!state.touch.enabled) return;
      if (state.touch.movePid !== e.pointerId) return;
      setStick(e.clientX - state.touch.stickCx, e.clientY - state.touch.stickCy);
      e.preventDefault();
    });
    ui.touchMove?.addEventListener("pointerup", (e) => {
      if (state.touch.movePid !== e.pointerId) return;
      state.touch.movePid = null;
      resetStick();
      e.preventDefault();
    });
    ui.touchMove?.addEventListener("pointercancel", () => {
      state.touch.movePid = null;
      resetStick();
    });

    ui.touchLook?.addEventListener("pointerdown", (e) => {
      if (!state.touch.enabled) return;
      state.touch.lookPid = e.pointerId;
      ui.touchLook?.setPointerCapture?.(e.pointerId);
      state.touch.lookLastX = e.clientX;
      state.touch.lookLastY = e.clientY;
      e.preventDefault();
    });
    ui.touchLook?.addEventListener("pointermove", (e) => {
      if (!state.touch.enabled) return;
      if (state.touch.lookPid !== e.pointerId) return;
      const dx = e.clientX - state.touch.lookLastX;
      const dy = e.clientY - state.touch.lookLastY;
      state.touch.lookLastX = e.clientX;
      state.touch.lookLastY = e.clientY;
      applyLookDelta(dx, dy);
      e.preventDefault();
    });
    ui.touchLook?.addEventListener("pointerup", (e) => {
      if (state.touch.lookPid !== e.pointerId) return;
      state.touch.lookPid = null;
      e.preventDefault();
    });
    ui.touchLook?.addEventListener("pointercancel", () => {
      state.touch.lookPid = null;
    });

    ui.touchJump?.addEventListener("pointerdown", (e) => {
      if (!state.touch.enabled) return;
      state.touch.jump = true;
      sfx.play("click");
      e.preventDefault();
    });

    const pressAction = () => {
      const isCombatMode = profile.gameMode === "gunfight" || profile.gameMode === "forest99";
      if (isCombatMode) {
        state.wantShoot = true;
        state.triggerShoot = true;
      } else {
        state.wantBreak = true;
      }
    };
    const releaseAction = () => {
      state.wantBreak = false;
      state.wantShoot = false;
      state.triggerShoot = false;
    };
    ui.touchAction?.addEventListener("pointerdown", (e) => {
      if (!state.touch.enabled) return;
      pressAction();
      e.preventDefault();
    });
    ui.touchAction?.addEventListener("pointerup", (e) => {
      releaseAction();
      e.preventDefault();
    });
    ui.touchAction?.addEventListener("pointercancel", () => releaseAction());

    const pressPlace = () => {
      state.wantPlace = true;
    };
    const releasePlace = () => {
      state.wantPlace = false;
    };
    ui.touchPlace?.addEventListener("pointerdown", (e) => {
      if (!state.touch.enabled) return;
      pressPlace();
      e.preventDefault();
    });
    ui.touchPlace?.addEventListener("pointerup", (e) => {
      releasePlace();
      e.preventDefault();
    });
    ui.touchPlace?.addEventListener("pointercancel", () => releasePlace());

    ui.touchMenu?.addEventListener("click", () => {
      if (ui.sidePanel?.classList.contains("hidden")) openSidePanel("home");
      else closeSidePanel();
      sfx.play("click");
    });

    // P2P connect UI
    ui.p2pCreateBtn?.addEventListener("click", async () => {
      try {
        const offer = await p2p.createOffer();
        if (offer && ui.p2pOffer) ui.p2pOffer.value = offer;
        if (ui.p2pAnswer) ui.p2pAnswer.value = "";
        refreshSideSquadUi();
        sfx.play("click");
      } catch {
        ui.hintText.textContent = "建立房間失敗";
        setTimeout(() => (ui.hintText.textContent = "-"), 900);
      }
    });
    ui.p2pCopyOffer?.addEventListener("click", async () => {
      const txt = String(ui.p2pOffer?.value || "").trim();
      if (!txt) return;
      try {
        await navigator.clipboard?.writeText?.(txt);
        ui.hintText.textContent = "已複製 Offer";
        setTimeout(() => (ui.hintText.textContent = "-"), 800);
      } catch {
        // fallback: select text
        ui.p2pOffer?.focus?.();
        ui.p2pOffer?.select?.();
      }
      sfx.play("click");
    });
    ui.p2pMakeAnswer?.addEventListener("click", async () => {
      const offer = String(ui.p2pOffer?.value || "").trim();
      if (!offer) {
        ui.hintText.textContent = "請先貼上 Offer";
        setTimeout(() => (ui.hintText.textContent = "-"), 900);
        return;
      }
      try {
        const ans = await p2p.makeAnswer(offer);
        if (ans && ui.p2pAnswer) ui.p2pAnswer.value = ans;
        refreshSideSquadUi();
        sfx.play("click");
      } catch {
        ui.hintText.textContent = "產生 Answer 失敗";
        setTimeout(() => (ui.hintText.textContent = "-"), 900);
      }
    });
    ui.p2pApplyAnswer?.addEventListener("click", async () => {
      const ans = String(ui.p2pAnswer?.value || "").trim();
      if (!ans) {
        ui.hintText.textContent = "請先貼上 Answer";
        setTimeout(() => (ui.hintText.textContent = "-"), 900);
        return;
      }
      try {
        await p2p.applyAnswer(ans);
        refreshSideSquadUi();
        sfx.play("click");
      } catch {
        ui.hintText.textContent = "套用 Answer 失敗";
        setTimeout(() => (ui.hintText.textContent = "-"), 900);
      }
    });
    ui.p2pCloseBtn?.addEventListener("click", () => {
      p2p.close();
      if (ui.p2pOffer) ui.p2pOffer.value = "";
      if (ui.p2pAnswer) ui.p2pAnswer.value = "";
      refreshSideSquadUi();
      sfx.play("click");
    });

    window.addEventListener("keydown", (e) => {
      if (e.code === "KeyM") {
        if (ui.sidePanel?.classList.contains("hidden")) openSidePanel("home");
        else closeSidePanel();
      }
    });

    // catalog tabs click
    ui.catalogTabs?.addEventListener("click", (e) => {
      const btn = e.target?.closest?.(".tab");
      if (!btn) return;
      const tab = btn.dataset.tab;
      if (!tab) return;
      state.catalogTab = tab;
      sfx.play("click");
      refreshSideAvatarUi();
    });

    // controls
    window.addEventListener("resize", () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    window.addEventListener("keydown", (e) => {
      state.keys.add(e.code);
      if (e.code === "KeyR" && profile.gameMode === "gunfight" && mode.gunfight.phase === "matchOver") {
        enterGame({ load: false, lock: true });
      }
      if (e.code === "KeyV") {
        // 循環視角
        profile.camMode = profile.camMode === "third" ? "first" : profile.camMode === "first" ? "top" : "third";
        saveProfile(profile);
        if (ui.camModeText) ui.camModeText.textContent = profile.camMode === "first" ? "第一人稱" : profile.camMode === "top" ? "俯視" : "第三人稱";
      }
      if (e.code.startsWith("Digit")) {
        const n = Number(e.code.slice(5));
        if (n >= 1 && n <= 5) setSelected(n - 1);
      }
    });
    window.addEventListener("keyup", (e) => state.keys.delete(e.code));

    ui.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    ui.canvas.addEventListener("mousedown", (e) => {
      if (state.pointerLocked) {
        const isCombatMode = profile.gameMode === "gunfight" || profile.gameMode === "forest99";
        if (isCombatMode) {
          if (e.button === 0) {
            state.wantShoot = true;
            state.triggerShoot = true;
          }
        } else {
          if (e.button === 0) state.wantBreak = true;
          if (e.button === 2) state.wantPlace = true;
        }
        return;
      }
      // 沒有鎖定滑鼠時：按住右鍵拖曳轉視角（類 Roblox）
      if (e.button === 2) {
        state.dragLook = true;
        state.lastMouseX = e.clientX;
        state.lastMouseY = e.clientY;
      }
    });
    window.addEventListener("mouseup", () => {
      state.wantBreak = false;
      state.wantPlace = false;
      state.wantShoot = false;
      state.triggerShoot = false;
      state.dragLook = false;
    });

    document.addEventListener("pointerlockchange", () => {
      state.pointerLocked = document.pointerLockElement === ui.canvas;
      ui.hintText.textContent = state.pointerLocked ? "已鎖定滑鼠" : "按開始進入";
    });

    window.addEventListener("mousemove", (e) => {
      if (!state.running) return;

      if (state.pointerLocked) {
        applyLookDelta(e.movementX, e.movementY);
        return;
      }
      if (state.dragLook) {
        const dx = e.clientX - state.lastMouseX;
        const dy = e.clientY - state.lastMouseY;
        state.lastMouseX = e.clientX;
        state.lastMouseY = e.clientY;
        applyLookDelta(dx, dy);
      }
    });

    ui.canvas.addEventListener("click", () => {
      if (!state.running) return;
      if (!state.pointerLocked) ui.canvas.requestPointerLock();
    });

    refreshAvatarUi();
    enforceVipEconomy();
    refreshCosmeticsUi();
    applyCosmetic(profile.equipped);

    ui.blockName.textContent = BLOCKS[0].name;
    ui.hintText.textContent = "-";
    if (ui.gameModeText) {
      ui.gameModeText.textContent =
        profile.gameMode === "coins"
          ? "金幣收集"
          : profile.gameMode === "obby"
            ? "跑酷"
            : profile.gameMode === "gunfight"
              ? "槍戰"
              : profile.gameMode === "forest99"
                ? "九十九夜"
                : "沙盒";
    }
    if (ui.camModeText) ui.camModeText.textContent = profile.camMode === "first" ? "第一人稱" : profile.camMode === "top" ? "俯視" : "第三人稱";
    if (ui.progressText) ui.progressText.textContent = "-";

    refreshSfxUi();
    refreshExperienceUi();
    initCustomThumbs();

    // menu camera buttons
    const refreshModeCamBtns = () => {
      ui.modeSandboxBtn?.classList.toggle("active", profile.gameMode === "sandbox");
      ui.modeCoinsBtn?.classList.toggle("active", profile.gameMode === "coins");
      ui.modeObbyBtn?.classList.toggle("active", profile.gameMode === "obby");
      ui.camThirdBtn?.classList.toggle("active", profile.camMode === "third");
      ui.camFirstBtn?.classList.toggle("active", profile.camMode === "first");
      ui.camTopBtn?.classList.toggle("active", profile.camMode === "top");
      if (ui.modeHint) {
        ui.modeHint.textContent =
          profile.gameMode === "coins"
            ? "金幣收集：撿完所有金幣計時。"
            : profile.gameMode === "obby"
              ? "跑酷：掉下去會回到檢查點。"
              : "沙盒：自由放置/破壞方塊。";
      }
    };
    ui.modeSandboxBtn?.addEventListener("click", () => {
      profile.gameMode = "sandbox";
      saveProfile(profile);
      if (ui.gameModeText) ui.gameModeText.textContent = "沙盒";
      refreshModeCamBtns();
    });
    ui.modeCoinsBtn?.addEventListener("click", () => {
      profile.gameMode = "coins";
      saveProfile(profile);
      if (ui.gameModeText) ui.gameModeText.textContent = "金幣收集";
      refreshModeCamBtns();
    });
    ui.modeObbyBtn?.addEventListener("click", () => {
      profile.gameMode = "obby";
      saveProfile(profile);
      if (ui.gameModeText) ui.gameModeText.textContent = "跑酷";
      refreshModeCamBtns();
    });
    ui.camThirdBtn?.addEventListener("click", () => {
      profile.camMode = "third";
      saveProfile(profile);
      if (ui.camModeText) ui.camModeText.textContent = "第三人稱";
      refreshModeCamBtns();
    });
    ui.camFirstBtn?.addEventListener("click", () => {
      profile.camMode = "first";
      saveProfile(profile);
      if (ui.camModeText) ui.camModeText.textContent = "第一人稱";
      refreshModeCamBtns();
    });
    ui.camTopBtn?.addEventListener("click", () => {
      profile.camMode = "top";
      saveProfile(profile);
      if (ui.camModeText) ui.camModeText.textContent = "俯視";
      refreshModeCamBtns();
    });
    refreshModeCamBtns();

    window.__BOUND_BOOT_OK = true;
    setBootMsg("就緒。");

    // 一開網頁就「進到遊戲」並直接看到列表（不必按開始、不必先滑主選單）
    // - 不先鎖定滑鼠：方便直接點卡片/切面板
    // - 點卡片進遊戲時才會鎖定滑鼠（enterGame({lock:true})）
    setTimeout(() => {
      try {
        enterGame({ load: false, lock: false, showList: true, panel: "home" });
      } catch {}
    }, 0);
  } catch (e) {
    setBootMsg(`啟動失敗：${e?.message || String(e)}`);
    console.error(e);
  }
}

bootstrap();

