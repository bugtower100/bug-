// ==UserScript==
// @name         我的农田（重构版）
// @author       bug人@
// @version      2.0.0
// @description  我的农田重置版，拥有农田、商店、钓鱼、远航与金手指管理插件；增加了新的功能同时兼容了原先数据。使用 .农场指令 查看系列指令\n感谢小绿老板的支持，让主播能够有动力重置着一坨插件！希望大家玩的开心\n自定义商品、鱼塘请使用配套的 我的农田_配置编辑器.html
// @timestamp    2026-03-10
// @homepageURL  https://github.com/bugtower100/bug-repository
// ==/UserScript==

(() => {
  const EXT_NAME = "我的农田插件";
  const STORAGE_VOYAGE_TASKS = "VoyageTasks";
  const STORAGE_TASK_ID = "taskId";
  const STORAGE_WEATHER = "GlobalWeather";
  const STORAGE_ADMIN_LOG = "AdminOpsLog";
  const WEATHER_TYPES = ["晴天", "雨天", "多云", "大风"];
  const MAX_LEVEL = 20;
  const MAX_FIELDS = 30;
  const BASE_STEAL_COOLDOWN = 60000;
  const DOG_STEAL_FAIL_RATE = 0.5;
  const SHIPWRECK_CONFIG = {
    "近海远航": { chance: 0.2, alertDelayMs: 20 * 60 * 1000 },
    "深海远航": { chance: 0.25, alertDelayMs: 40 * 60 * 1000 },
    "远洋远航": { chance: 0.3, alertDelayMs: 60 * 60 * 1000 }
  };
  const FINGER_FIELD_ALIASES = {
    "money": "money",
    "金币": "money",
    "玩家金币": "money",
    "level": "level",
    "等级": "level",
    "experience": "experience",
    "经验": "experience",
    "fields": "fields",
    "田地": "fields",
    "田地数": "fields",
    "fishPond": "fishPond",
    "鱼塘": "fishPond",
    "lastSignInDate": "lastSignInDate",
    "签到日期": "lastSignInDate",
    "lastStealTime": "lastStealTime",
    "偷窃时间": "lastStealTime",
    "weather": "weather",
    "天气": "weather"
  };
  const FINGER_ALLOWED_FIELDS = ["money", "level", "experience", "fields", "fishPond", "lastSignInDate", "lastStealTime", "weather"];
  const NUMERIC_FIELDS = ["money", "level", "experience", "fields", "fishPond", "lastStealTime"];
  const VOYAGE_TYPES = {
    "近海远航": { duration: 30 * 60 * 1000, cost: 50, moneyMin: 80, moneyMax: 160, expMin: 20, expMax: 40, baitMin: 0, baitMax: 2 },
    "深海远航": { duration: 60 * 60 * 1000, cost: 100, moneyMin: 180, moneyMax: 320, expMin: 35, expMax: 80, baitMin: 1, baitMax: 3 },
    "远洋远航": { duration: 120 * 60 * 1000, cost: 150, moneyMin: 320, moneyMax: 560, expMin: 60, expMax: 120, baitMin: 2, baitMax: 5 }
  };
  const STORE = {
    "防风草种子": { price: 50, level: 1, type: "seed" },
    "胡萝卜种子": { price: 60, level: 1, type: "seed" },
    "白萝卜种子": { price: 70, level: 2, type: "seed" },
    "花椰菜种子": { price: 70, level: 2, type: "seed" },
    "小白菜种子": { price: 70, level: 2, type: "seed" },
    "青豆种子": { price: 70, level: 2, type: "seed" },
    "肥料": { price: 100, level: 2, type: "tool" },
    "土豆种子": { price: 75, level: 3, type: "seed" },
    "大黄种子": { price: 80, level: 3, type: "seed" },
    "甘蓝菜种子": { price: 80, level: 3, type: "seed" },
    "葡萄种子": { price: 80, level: 3, type: "seed" },
    "向日葵种子": { price: 90, level: 3, type: "seed" },
    "玫瑰花种子": { price: 90, level: 3, type: "seed" },
    "扩容田地": { price: 500, level: 3, type: "expand" },
    "土狗": { price: 1000, level: 3, type: "dog" },
    "草莓种子": { price: 100, level: 4, type: "seed" },
    "辣椒种子": { price: 100, level: 4, type: "seed" },
    "甜瓜种子": { price: 105, level: 4, type: "seed" },
    "红叶卷心菜种子": { price: 105, level: 4, type: "seed" },
    "杨桃种子": { price: 110, level: 4, type: "seed" },
    "郁金香种子": { price: 105, level: 4, type: "seed" },
    "玫瑰仙子种子": { price: 110, level: 4, type: "seed" },
    "鱼饵": { price: 20, level: 4, type: "tool" },
    "茄子种子": { price: 110, level: 5, type: "seed" },
    "苋菜种子": { price: 110, level: 5, type: "seed" },
    "山药种子": { price: 110, level: 5, type: "seed" },
    "夏季亮片种子": { price: 120, level: 5, type: "seed" },
    "虞美人种子": { price: 150, level: 5, type: "seed" },
    "桃树种子": { price: 120, level: 5, type: "seed" },
    "苹果树种子": { price: 120, level: 5, type: "seed" },
    "香蕉树种子": { price: 150, level: 5, type: "seed" },
    "宝石甜莓种子": { price: 200, level: 5, type: "seed" },
    "扩容田地ii": { price: 1000, level: 5, type: "expand" }
  };
  const FISH_PRICES = {
    "鲤鱼": 20, "鲱鱼": 30, "小嘴鲈鱼": 30, "太阳鱼": 45, "鳀鱼": 45,
    "沙丁鱼": 45, "河鲈": 50, "鲢鱼": 50, "鲷鱼": 50, "红鲷鱼": 55, "海参": 55, "虹鳟鱼": 55,
    "大眼鱼": 60, "西鲱": 60, "大头鱼": 60, "大嘴鲈鱼": 60, "鲑鱼": 60, "鬼鱼": 65,
    "罗非鱼": 65, "木跃鱼": 65, "狮子鱼": 65, "比目鱼": 70, "大比目鱼": 70, "午夜鲤鱼": 70,
    "史莱姆鱼": 70, "虾虎鱼": 70, "红鲻鱼": 75, "青花鱼": 75, "狗鱼": 75, "虎纹鳟鱼": 75,
    "蓝铁饼鱼": 75, "沙鱼": 75
  };
  const FISH_POOL_LV4 = ["鲤鱼", "鲱鱼", "小嘴鲈鱼", "太阳鱼", "鳀鱼"];
  const FISH_POOL_LV5 = FISH_POOL_LV4.concat(["沙丁鱼", "河鲈", "鲢鱼", "鲷鱼", "红鲷鱼", "海参", "虹鳟鱼"]);
  const FISH_POOL_LV6 = FISH_POOL_LV5.concat(["大眼鱼", "西鲱", "大头鱼", "大嘴鲈鱼", "鲑鱼", "鬼鱼"]);
  const FISH_POOL_LV7 = FISH_POOL_LV6.concat(["罗非鱼", "木跃鱼", "狮子鱼", "比目鱼", "大比目鱼", "午夜鲤鱼"]);
  const FISH_POOL_ALL = Object.keys(FISH_PRICES);
  const FISH_LEVEL_REQUIREMENTS = {};
  for (const fish of FISH_POOL_ALL) FISH_LEVEL_REQUIREMENTS[fish] = 8;
  for (const fish of FISH_POOL_LV7) FISH_LEVEL_REQUIREMENTS[fish] = Math.min(Number(FISH_LEVEL_REQUIREMENTS[fish] || 8), 7);
  for (const fish of FISH_POOL_LV6) FISH_LEVEL_REQUIREMENTS[fish] = Math.min(Number(FISH_LEVEL_REQUIREMENTS[fish] || 8), 6);
  for (const fish of FISH_POOL_LV5) FISH_LEVEL_REQUIREMENTS[fish] = Math.min(Number(FISH_LEVEL_REQUIREMENTS[fish] || 8), 5);
  for (const fish of FISH_POOL_LV4) FISH_LEVEL_REQUIREMENTS[fish] = Math.min(Number(FISH_LEVEL_REQUIREMENTS[fish] || 8), 4);
  const WEATHER_GROWTH_FACTOR = { "晴天": 1, "雨天": 1.1, "多云": 0.95, "大风": 1.2 };
  const PLANT_EVENTS = ["小精灵催熟", "女巫药水致死", "狗熊压坏作物"];

  function parseJson(raw, fallback) {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function nowDateStr() {
    return new Date().toDateString();
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function toNonNegativeNumber(v, dft) {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) return dft;
    return n;
  }

  function parsePositiveIntArg(raw, defaultValue = null) {
    const txt = String(raw ?? "").trim();
    if (!txt) return defaultValue;
    if (!/^[1-9]\d*$/.test(txt)) return null;
    return Number(txt);
  }

  function parseNonNegativeIntArg(raw, defaultValue = null) {
    const txt = String(raw ?? "").trim();
    if (!txt) return defaultValue;
    if (!/^\d+$/.test(txt)) return null;
    return Number(txt);
  }

  function normalizeWarehouse(warehouse) {
    const ret = {};
    if (!warehouse || typeof warehouse !== "object") return ret;
    for (const k of Object.keys(warehouse)) {
      const v = Number(warehouse[k]);
      if (Number.isFinite(v) && v > 0) ret[k] = v;
    }
    return ret;
  }

  function normalizeCrops(crops) {
    const ret = {};
    if (!crops || typeof crops !== "object") return ret;
    for (const fieldName of Object.keys(crops)) {
      const slot = crops[fieldName];
      if (!slot || typeof slot !== "object") continue;
      const seed = String(slot.seed || "");
      const harvestTime = Number(slot.harvestTime);
      const stolen = !!slot.stolen;
      if (!seed || !Number.isFinite(harvestTime)) continue;
      ret[fieldName] = { seed, harvestTime, stolen };
    }
    return ret;
  }

  function createDefaultUser(userId, userName) {
    return {
      id: userId,
      name: userName || "农夫",
      fields: 6,
      money: 200,
      level: 1,
      experience: 0,
      crops: {},
      warehouse: { "防风草种子": 6 },
      lastStealTime: 0,
      lastSignInDate: "",
      purchasedFields: {},
      stealCooldown: BASE_STEAL_COOLDOWN,
      fishPond: 0,
      lastFishPondRefresh: "",
      wormCatchCount: 0,
      lastWormCatchDate: "",
      dogBiteFailStreak: 0,
      hasDog: false,
      explorationType: null,
      explorationStartTime: null
    };
  }

  function normalizeUserData(raw, userId, userName) {
    const base = createDefaultUser(userId, userName);
    const src = raw && typeof raw === "object" ? raw : {};
    const user = {
      id: String(src.id ?? base.id),
      name: String(src.name ?? base.name),
      fields: toNonNegativeNumber(src.fields ?? base.fields, base.fields),
      money: toNonNegativeNumber(src.money ?? base.money, base.money),
      level: toNonNegativeNumber(src.level ?? base.level, base.level),
      experience: toNonNegativeNumber(src.experience ?? base.experience, base.experience),
      crops: normalizeCrops(src.crops ?? base.crops),
      warehouse: normalizeWarehouse(src.warehouse ?? base.warehouse),
      lastStealTime: toNonNegativeNumber(src.lastStealTime ?? base.lastStealTime, base.lastStealTime),
      lastSignInDate: String(src.lastSignInDate ?? base.lastSignInDate),
      purchasedFields: src.purchasedFields && typeof src.purchasedFields === "object" ? src.purchasedFields : {},
      stealCooldown: toNonNegativeNumber(src.stealCooldown ?? base.stealCooldown, base.stealCooldown),
      fishPond: toNonNegativeNumber(src.fishPond ?? base.fishPond, base.fishPond),
      lastFishPondRefresh: String(src.lastFishPondRefresh ?? base.lastFishPondRefresh),
      wormCatchCount: toNonNegativeNumber(src.wormCatchCount ?? base.wormCatchCount, base.wormCatchCount),
      lastWormCatchDate: String(src.lastWormCatchDate ?? base.lastWormCatchDate),
      dogBiteFailStreak: toNonNegativeNumber(src.dogBiteFailStreak ?? base.dogBiteFailStreak, base.dogBiteFailStreak),
      hasDog: !!(src.hasDog ?? base.hasDog),
      explorationType: src.explorationType ?? base.explorationType,
      explorationStartTime: src.explorationStartTime ?? base.explorationStartTime
    };
    if (!user.id) user.id = userId;
    if (!user.name) user.name = userName || base.name;
    if (user.fields < 1) user.fields = 1;
    if (user.fields > MAX_FIELDS) user.fields = MAX_FIELDS;
    if (user.level < 1) user.level = 1;
    if (user.level > MAX_LEVEL) user.level = MAX_LEVEL;
    user.dogBiteFailStreak = Math.floor(user.dogBiteFailStreak);
    if (!Number.isFinite(Number(user.explorationStartTime))) {
      user.explorationStartTime = null;
    } else {
      user.explorationStartTime = Number(user.explorationStartTime);
    }
    if (user.explorationType !== null) user.explorationType = String(user.explorationType);
    return user;
  }

  function getUserKeyByCtx(ctx) {
    return String(ctx.player.userId);
  }

  function loadUser(ext, userId, userName) {
    const raw = parseJson(ext.storageGet(userId), null);
    if (!raw) return null;
    const normalized = normalizeUserData(raw, userId, userName);
    return normalized;
  }

  function saveUser(ext, user) {
    ext.storageSet(String(user.id), JSON.stringify(user));
  }

  function requireUser(ext, ctx, msg) {
    const userId = getUserKeyByCtx(ctx);
    const user = loadUser(ext, userId, ctx.player.name);
    if (!user) {
      seal.replyToSender(ctx, msg, "你还不是农夫，请先使用 .成为农夫");
      return null;
    }
    if (user.name !== ctx.player.name && ctx.player.name) {
      user.name = ctx.player.name;
      saveUser(ext, user);
    }
    return user;
  }

  function getTargetCtxOrSelf(ctx, cmdArgs) {
    if (cmdArgs.at && cmdArgs.at.length > 0) {
      const targetCtx = seal.getCtxProxyFirst(ctx, cmdArgs);
      if (targetCtx && targetCtx.player && targetCtx.player.userId) {
        return targetCtx;
      }
    }
    return ctx;
  }

  function addWarehouseItem(user, item, amount) {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return;
    const oldVal = Number(user.warehouse[item] ?? 0);
    user.warehouse[item] = oldVal + n;
  }

  function removeWarehouseItem(user, item, amount) {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return false;
    const oldVal = Number(user.warehouse[item] ?? 0);
    if (oldVal < n) return false;
    const next = oldVal - n;
    if (next <= 0) {
      delete user.warehouse[item];
    } else {
      user.warehouse[item] = next;
    }
    return true;
  }

  function getWeather(ext) {
    const data = parseJson(ext.storageGet(STORAGE_WEATHER), {});
    const today = nowDateStr();
    if (data.date === today && WEATHER_TYPES.includes(data.weather)) {
      return data.weather;
    }
    const weather = WEATHER_TYPES[randomInt(0, WEATHER_TYPES.length - 1)];
    ext.storageSet(STORAGE_WEATHER, JSON.stringify({ date: today, weather }));
    return weather;
  }

  function setWeather(ext, weather) {
    ext.storageSet(STORAGE_WEATHER, JSON.stringify({ date: nowDateStr(), weather }));
  }

  function normalizeFingerField(fieldRaw) {
    const key = String(fieldRaw || "").trim();
    if (!key) return "";
    return FINGER_FIELD_ALIASES[key] || "";
  }

  function parseFingerFieldAndValue(cmdArgs) {
    let fieldRaw = String(cmdArgs.getArgN(2) || "").trim();
    let valueToken = String(cmdArgs.getArgN(3) || "").trim();
    if (!fieldRaw) return { fieldRaw: "", valueToken: "" };
    if (!valueToken) {
      const aliases = Object.keys(FINGER_FIELD_ALIASES).sort((a, b) => b.length - a.length);
      for (const alias of aliases) {
        if (fieldRaw.startsWith(alias) && fieldRaw.length > alias.length) {
          return { fieldRaw: alias, valueToken: fieldRaw.slice(alias.length) };
        }
      }
    }
    return { fieldRaw, valueToken };
  }

  function isFingerAllowedWarehouseItem(item) {
    if (STORE[item]) return true;
    if (FISH_PRICES[item] !== undefined) return true;
    if (STORE[`${item}种子`]) return true;
    return false;
  }

  function refreshFishPondDaily(user) {
    const today = nowDateStr();
    if (user.lastFishPondRefresh !== today) {
      user.lastFishPondRefresh = today;
      user.fishPond = randomInt(15, 25);
    }
  }

  function getFishPoolByLevel(level) {
    const raw = Math.floor(Number(level));
    const effectiveLevel = Number.isFinite(raw) ? Math.max(4, raw) : 4;
    const ret = [];
    for (const fish of FISH_POOL_ALL) {
      const needLv = Number(FISH_LEVEL_REQUIREMENTS[fish] ?? 8);
      if (needLv <= effectiveLevel) ret.push(fish);
    }
    if (!ret.length) return FISH_POOL_LV4;
    return ret;
  }

  function cropOutput(seedName) {
    if (!seedName.endsWith("种子")) return seedName;
    return seedName.slice(0, -2);
  }

  function seedGrowMs(seedName) {
    const info = STORE[seedName];
    const level = info ? info.level : 1;
    return (30 + level * 30) * 60 * 1000;
  }

  function getFieldName(index) {
    return `田地${index}`;
  }

  function findEmptyFields(user) {
    const ret = [];
    for (let i = 1; i <= user.fields; i += 1) {
      const fieldName = getFieldName(i);
      if (!user.crops[fieldName]) ret.push(fieldName);
    }
    return ret;
  }

  function getRandomSeedBaseHours() {
    return Math.random() * 3.5 + 0.5;
  }

  function formatHoursText(hours) {
    return formatDurationMs(hours * 60 * 60 * 1000);
  }

  function formatDurationMs(ms) {
    const totalMinutes = Math.max(0, Math.ceil(Number(ms) / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours <= 0) return `${minutes}分钟`;
    if (minutes <= 0) return `${hours}小时`;
    return `${hours}小时${minutes}分钟`;
  }

  function expRequiredForThisLevel(level) {
    const lv = Math.max(1, Math.floor(Number(level) || 1));
    return lv * 500;
  }

  function totalExpToReachLevel(level) {
    const lv = Math.max(1, Math.floor(Number(level) || 1));
    let total = 0;
    for (let i = 1; i < lv; i += 1) {
      total += expRequiredForThisLevel(i);
    }
    return total;
  }

  function syncLevelByExperience(user) {
    let upgraded = 0;
    while (user.level < MAX_LEVEL) {
      const needTotal = totalExpToReachLevel(user.level + 1);
      if (user.experience < needTotal) break;
      user.level += 1;
      upgraded += 1;
    }
    return upgraded;
  }

  function expToNextLevel(user) {
    if (user.level >= MAX_LEVEL) return 0;
    const needTotal = totalExpToReachLevel(user.level + 1);
    return Math.max(0, needTotal - Number(user.experience || 0));
  }

  function buildGroupMentionText(replyCtx, task, user) {
    const isPrivate = !!replyCtx[4];
    if (isPrivate) return "";
    const rawId = String((task && task.senderUserId) || replyCtx[3] || "");
    const qqMatch = rawId.match(/(\d{5,})$/);
    if (qqMatch) return `[CQ:at,qq=${qqMatch[1]}] `;
    const displayName = String((task && task.senderName) || (user && user.name) || "").trim();
    if (displayName) return `@${displayName} `;
    return "";
  }

  function getGrowthFactorByWeather(weather) {
    return WEATHER_GROWTH_FACTOR[weather] ?? 1;
  }

  function applyExpandFields(user, itemName, quantity, totalPrice, markKey) {
    const q = Math.max(0, Math.floor(Number(quantity) || 0));
    if (q <= 0) return `扩容数量无效。`;
    if (user.fields + q > MAX_FIELDS) return `你已达到田地持有上限(${MAX_FIELDS})，无法继续购买田地。`;
    if (user.money < totalPrice) return `金币不足，需要${totalPrice}，你当前${user.money}。`;
    user.fields += q;
    user.purchasedFields[markKey] = true;
    user.money -= totalPrice;
    return `铛铛——成功购买${itemName}${q}个。`;
  }

  function isExpandType(type) {
    return type === "expand" || type === "expandLv" || type === "expandPlus";
  }

  function handlePlantingEvents(user, seedName, quantity, baseHours, growthFactor) {
    if (Math.random() > 0.2) return null;
    const eventType = PLANT_EVENTS[randomInt(0, PLANT_EVENTS.length - 1)];
    if (eventType === "小精灵催熟" && user.level >= 3) {
      const emptyFields = findEmptyFields(user);
      if (emptyFields.length < quantity) return null;
      if (!removeWarehouseItem(user, seedName, quantity)) return null;
      const harvestTime = Date.now() + baseHours * 0.8 * 60 * 60 * 1000 * growthFactor;
      for (let i = 0; i < quantity; i += 1) {
        const fieldName = emptyFields[i];
        user.crops[fieldName] = { seed: seedName, harvestTime, stolen: false };
      }
      return `哦哇，你的田地吸引到小精灵了。\n成功种植${quantity}块${seedName}，成熟时间为${formatHoursText(baseHours * 0.8)}。`;
    }
    if (eventType === "女巫药水致死") {
      removeWarehouseItem(user, seedName, quantity);
      user.crops = {};
      const compensation = randomInt(50, 100);
      const fertilizer = randomInt(3, 6);
      user.money += compensation;
      addWarehouseItem(user, "肥料", fertilizer);
      return `呜哇！路过的实习女巫把药水洒到了田里，作物全没了。\n获得补偿：${compensation}金币、肥料x${fertilizer}。`;
    }
    if (eventType === "狗熊压坏作物" && quantity > 2) {
      const emptyFields = findEmptyFields(user);
      if (emptyFields.length < quantity) return null;
      if (!removeWarehouseItem(user, seedName, quantity)) return null;
      const harvestTime = Date.now() + baseHours * 60 * 60 * 1000 * growthFactor;
      const plantedFields = [];
      for (let i = 0; i < quantity; i += 1) {
        const fieldName = emptyFields[i];
        user.crops[fieldName] = { seed: seedName, harvestTime, stolen: false };
        plantedFields.push(fieldName);
      }
      const destroyed = Math.min(randomInt(3, 5), quantity);
      for (let i = plantedFields.length - 1; i > 0; i -= 1) {
        const j = randomInt(0, i);
        const temp = plantedFields[i];
        plantedFields[i] = plantedFields[j];
        plantedFields[j] = temp;
      }
      for (let i = 0; i < destroyed; i += 1) {
        delete user.crops[plantedFields[i]];
      }
      return `不好了，一只路过的狗熊在你的田地里睡了一觉，压坏了${destroyed}块作物...`;
    }
    return null;
  }

  function handleAdventurerEvent(user) {
    if (Math.random() >= 0.05) return null;
    const now = Date.now();
    const matureFields = [];
    for (let i = 1; i <= user.fields; i += 1) {
      const fieldName = getFieldName(i);
      const slot = user.crops[fieldName];
      if (!slot) continue;
      if (slot.harvestTime <= now && !slot.stolen) matureFields.push(fieldName);
    }
    if (!matureFields.length) return null;
    const stealCount = Math.min(randomInt(1, 2), matureFields.length);
    for (let i = matureFields.length - 1; i > 0; i -= 1) {
      const j = randomInt(0, i);
      const tmp = matureFields[i];
      matureFields[i] = matureFields[j];
      matureFields[j] = tmp;
    }
    for (let i = 0; i < stealCount; i += 1) {
      delete user.crops[matureFields[i]];
    }
    const compensation = randomInt(50, 100);
    const seedNames = Object.keys(STORE).filter((item) => item.endsWith("种子"));
    if (!seedNames.length) return null;
    const seedName = seedNames[randomInt(0, seedNames.length - 1)];
    const seedAmount = randomInt(3, 5);
    user.money += compensation;
    addWarehouseItem(user, seedName, seedAmount);
    return `路过的冒险者采走了你田地里的部分作物。\n获得补偿：${compensation}金币、${seedName}x${seedAmount}。`;
  }

  function summarizeFarm(ext, user) {
    const weather = getWeather(ext);
    const now = Date.now();
    const lines = [];
    lines.push(`农夫：${user.name}`);
    lines.push(`日期：${new Date().toLocaleDateString()}`);
    lines.push(`天气：${weather}`);
    lines.push(`等级：${user.level} 经验：${user.experience}`);
    if (user.level >= MAX_LEVEL) lines.push("升级进度：已满级");
    else lines.push(`升级进度：还需${expToNextLevel(user)}经验升到${user.level + 1}级`);
    lines.push(`金币：${user.money}`);
    lines.push(`田地：${user.fields}`);
    lines.push(`土狗：${user.hasDog ? "已拥有（看守田地）" : "未拥有"}`);
    for (let i = 1; i <= user.fields; i += 1) {
      const fieldName = getFieldName(i);
      const slot = user.crops[fieldName];
      if (!slot) {
        lines.push(`${fieldName}：空`);
        continue;
      }
      const remain = slot.harvestTime - now;
      if (remain <= 0) {
        lines.push(`${fieldName}：${slot.seed}（成熟${slot.stolen ? "，已被偷过" : ""}）`);
      } else {
        lines.push(`${fieldName}：${slot.seed}（剩余${formatDurationMs(remain)}）`);
      }
    }
    return lines.join("\n");
  }

  function getVoyageTasks(ext) {
    const tasks = parseJson(ext.storageGet(STORAGE_VOYAGE_TASKS), []);
    return Array.isArray(tasks) ? tasks : [];
  }

  function saveVoyageTasks(ext, tasks) {
    ext.storageSet(STORAGE_VOYAGE_TASKS, JSON.stringify(tasks));
  }

  function buildReplyCtxTuple(ctx, msg) {
    const epId = String((ctx.endPoint && ctx.endPoint.id) || "");
    const guildId = String(msg.guildId || "");
    const groupId = String(msg.groupId || "");
    const senderId = String((msg.sender && msg.sender.userId) || ctx.player.userId || "");
    const isPrivate = !!ctx.isPrivate;
    return [epId, guildId, groupId, senderId, isPrivate];
  }

  function createTempContext(replyCtx) {
    const epId = replyCtx[0];
    const guildId = replyCtx[1];
    const groupId = replyCtx[2];
    const senderId = replyCtx[3];
    const isPrivate = !!replyCtx[4];
    const endpoints = seal.getEndPoints();
    if (!endpoints || !endpoints.length) return null;
    let endpoint = null;
    for (let i = 0; i < endpoints.length; i += 1) {
      if (String(endpoints[i].id) === String(epId)) {
        endpoint = endpoints[i];
        break;
      }
    }
    if (!endpoint) return null;
    const tempMsg = seal.newMessage();
    tempMsg.messageType = isPrivate ? "private" : "group";
    tempMsg.MessageType = tempMsg.messageType;
    tempMsg.groupId = groupId || "";
    tempMsg.guildId = guildId || "";
    tempMsg.platform = endpoint.platform || "";
    tempMsg.sender = { userId: senderId || "", nickname: "" };
    tempMsg.Sender = { UserId: senderId || "", Nickname: "" };
    const tempCtx = seal.createTempCtx(endpoint, tempMsg);
    return { tempCtx, tempMsg };
  }

  function appendAdminLog(ext, entry) {
    const logs = parseJson(ext.storageGet(STORAGE_ADMIN_LOG), []);
    const arr = Array.isArray(logs) ? logs : [];
    arr.push(entry);
    while (arr.length > 200) arr.shift();
    ext.storageSet(STORAGE_ADMIN_LOG, JSON.stringify(arr));
  }

  function checkAdmin(ctx) {
    return Number(ctx.privilegeLevel) === 100;
  }

  function ensureVoyageTaskId(ext) {
    const oldVal = ext.storageGet(STORAGE_TASK_ID);
    if (oldVal) return oldVal;
    const v = String(Date.now());
    ext.storageSet(STORAGE_TASK_ID, v);
    return v;
  }

  function grantVoyageReward(user, voyageType) {
    const cfg = VOYAGE_TYPES[voyageType] || VOYAGE_TYPES["近海远航"];
    const money = randomInt(cfg.moneyMin, cfg.moneyMax);
    const exp = randomInt(cfg.expMin, cfg.expMax);
    const bait = randomInt(cfg.baitMin, cfg.baitMax);
    user.money += money;
    user.experience += exp;
    if (bait > 0) addWarehouseItem(user, "鱼饵", bait);
    const levelUps = syncLevelByExperience(user);
    const text = [`你的${voyageType}已完成`, `金币+${money}`, `经验+${exp}`];
    if (bait > 0) text.push(`鱼饵+${bait}`);
    if (levelUps > 0) text.push(`升级至${user.level}级`);
    return text.join("，");
  }

  function processVoyageTasks(ext) {
    const tasks = getVoyageTasks(ext);
    if (!tasks.length) return;
    const now = Date.now();
    const remain = [];
    for (const task of tasks) {
      if (!task || typeof task !== "object") continue;
      const reachTime = Number(task.reachTime);
      const userId = String(task.userId || "");
      const replyCtx = task.replyCtx;
      if (!userId || !Number.isFinite(reachTime)) continue;
      if (task.hasShipwreckEvent) {
        const alertReachTime = Number(task.shipwreckAlertReachTime);
        const alerted = !!task.shipwreckAlerted;
        if (!alerted && Number.isFinite(alertReachTime) && now >= alertReachTime) {
          const user = loadUser(ext, userId, "");
          task.shipwreckAlerted = true;
          if (user && user.explorationType && user.explorationStartTime) {
            const endedType = user.explorationType;
            user.explorationType = null;
            user.explorationStartTime = null;
            saveUser(ext, user);
            if (Array.isArray(replyCtx) && replyCtx.length === 5) {
              const builtAlert = createTempContext(replyCtx);
              if (builtAlert && builtAlert.tempCtx && builtAlert.tempMsg) {
                const mention = buildGroupMentionText(replyCtx, task, user);
                seal.replyToSender(builtAlert.tempCtx, builtAlert.tempMsg, `${mention}${endedType}因沉船事故提前结束，本次远航无收益。`);
              }
            }
          }
          continue;
        }
        if (alerted) {
          continue;
        }
      }
      if (reachTime > now) {
        remain.push(task);
        continue;
      }
      const user = loadUser(ext, userId, "");
      if (!user) continue;
      if (!user.explorationType || !user.explorationStartTime) continue;
      let summary = "";
      if (task.hasShipwreckEvent) {
        summary = `${user.explorationType}结束：因沉船事故，本次远航无收益。`;
      } else {
        summary = grantVoyageReward(user, user.explorationType);
      }
      user.explorationType = null;
      user.explorationStartTime = null;
      saveUser(ext, user);
      if (Array.isArray(replyCtx) && replyCtx.length === 5) {
        const built = createTempContext(replyCtx);
        if (built && built.tempCtx && built.tempMsg) {
          const mention = buildGroupMentionText(replyCtx, task, user);
          seal.replyToSender(built.tempCtx, built.tempMsg, `${mention}${summary}`);
        }
      }
    }
    saveVoyageTasks(ext, remain);
  }

  let ext = seal.ext.find(EXT_NAME);
  if (!ext) {
    ext = seal.ext.new(EXT_NAME, "bug人@", "2.0.0");

    const cmdBecome = seal.ext.newCmdItemInfo();
    cmdBecome.name = "成为农夫";
    cmdBecome.help = ".成为农夫 创建农场";
    cmdBecome.solve = (ctx, msg) => {
      const userId = getUserKeyByCtx(ctx);
      const existed = loadUser(ext, userId, ctx.player.name);
      if (existed) {
        seal.replyToSender(ctx, msg, "你已经是农夫了。");
        return seal.ext.newCmdExecuteResult(true);
      }
      const user = createDefaultUser(userId, ctx.player.name);
      saveUser(ext, user);
      seal.replyToSender(ctx, msg, "欢迎成为农夫！已获得6块田地、200金币、防风草种子×6。");
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdHelp = seal.ext.newCmdItemInfo();
    cmdHelp.name = "农场指令";
    cmdHelp.help = ".农场指令 查看命令列表";
    cmdHelp.solve = (ctx, msg) => {
      const text = [
        "农场指令列表：",
        ".成为农夫",
        ".农场指令",
        ".我的农田",
        ".种植 <种子名> <数量>",
        ".农田商店",
        ".购买 <商品名> (数量)",
        ".出售 <商品名> (数量)",
        ".好友信息 <@其他人>",
        ".我的仓库",
        ".铲除农田 <田地序号>",
        ".偷窃 <@其他人>",
        ".收获",
        ".丢弃 <物品名> (数量)",
        ".修改农夫名 <新用户名>",
        ".使用肥料 <田地序号>",
        ".签到",
        ".钓鱼",
        ".抓蚯蚓",
        ".远航 / .远航 <探索类型>",
        ".金手指 ...（管理员）"
      ].join("\n");
      seal.replyToSender(ctx, msg, text);
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdMyFarm = seal.ext.newCmdItemInfo();
    cmdMyFarm.name = "我的农田";
    cmdMyFarm.help = ".我的农田 查看个人农田";
    cmdMyFarm.solve = (ctx, msg) => {
      const user = requireUser(ext, ctx, msg);
      if (!user) return seal.ext.newCmdExecuteResult(true);
      syncLevelByExperience(user);
      saveUser(ext, user);
      seal.replyToSender(ctx, msg, summarizeFarm(ext, user));
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdPlant = seal.ext.newCmdItemInfo();
    cmdPlant.name = "种植";
    cmdPlant.help = ".种植 <种子名> <数量>";
    cmdPlant.solve = (ctx, msg, cmdArgs) => {
      const user = requireUser(ext, ctx, msg);
      if (!user) return seal.ext.newCmdExecuteResult(true);
      const seedName = String(cmdArgs.getArgN(1) || "").trim();
      const amount = parsePositiveIntArg(cmdArgs.getArgN(2), null);
      if (!seedName || amount === null) {
        seal.replyToSender(ctx, msg, "格式：.种植 <种子名> <数量>");
        return seal.ext.newCmdExecuteResult(true);
      }
      const item = STORE[seedName];
      if (!item || item.type !== "seed") {
        seal.replyToSender(ctx, msg, "只能种植商店中的种子。");
        return seal.ext.newCmdExecuteResult(true);
      }
      const haveSeed = Number(user.warehouse[seedName] ?? 0);
      if (haveSeed < amount) {
        seal.replyToSender(ctx, msg, `${seedName}不足，当前仅有${haveSeed}。`);
        return seal.ext.newCmdExecuteResult(true);
      }
      const emptyFields = findEmptyFields(user);
      if (emptyFields.length < amount) {
        seal.replyToSender(ctx, msg, `空田不足，当前空田${emptyFields.length}块。`);
        return seal.ext.newCmdExecuteResult(true);
      }
      const weather = getWeather(ext);
      const growthFactor = getGrowthFactorByWeather(weather);
      const baseHours = getRandomSeedBaseHours();
      const eventResult = handlePlantingEvents(user, seedName, amount, baseHours, growthFactor);
      if (eventResult) {
        saveUser(ext, user);
        seal.replyToSender(ctx, msg, eventResult);
        return seal.ext.newCmdExecuteResult(true);
      }
      removeWarehouseItem(user, seedName, amount);
      const harvestTime = Date.now() + baseHours * 60 * 60 * 1000 * growthFactor;
      for (let i = 0; i < amount; i += 1) {
        const fieldName = emptyFields[i];
        user.crops[fieldName] = { seed: seedName, harvestTime, stolen: false };
      }
      saveUser(ext, user);
      seal.replyToSender(ctx, msg, `已在${amount}块田地种植${seedName}，成熟时间约${formatHoursText(baseHours * growthFactor)}。`);
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdStore = seal.ext.newCmdItemInfo();
    cmdStore.name = "农田商店";
    cmdStore.help = ".农田商店 查看商品";
    cmdStore.solve = (ctx, msg) => {
      const user = requireUser(ext, ctx, msg);
      if (!user) return seal.ext.newCmdExecuteResult(true);
      const lines = ["农田商店："];
      for (const itemName of Object.keys(STORE)) {
        const item = STORE[itemName];
        const lvLimit = item.level;
        if (lvLimit > user.level) continue;
        if (isExpandType(item.type) && user.purchasedFields[itemName]) continue;
        if (itemName === "土狗" && user.hasDog) continue;
        lines.push(`${itemName} - 价格${item.price} - 等级${lvLimit}`);
      }
      if (lines.length === 1) {
        lines.push("当前等级暂无可购买商品。");
      }
      seal.replyToSender(ctx, msg, lines.join("\n"));
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdBuy = seal.ext.newCmdItemInfo();
    cmdBuy.name = "购买";
    cmdBuy.help = ".购买 <商品名> (数量)";
    cmdBuy.solve = (ctx, msg, cmdArgs) => {
      const user = requireUser(ext, ctx, msg);
      if (!user) return seal.ext.newCmdExecuteResult(true);
      const itemName = String(cmdArgs.getArgN(1) || "").trim();
      let amount = parsePositiveIntArg(cmdArgs.getArgN(2), 1);
      if (!itemName || amount === null) {
        seal.replyToSender(ctx, msg, "格式：.购买 <商品名> (数量)");
        return seal.ext.newCmdExecuteResult(true);
      }
      const item = STORE[itemName];
      if (!item) {
        seal.replyToSender(ctx, msg, "商店没有这个商品。");
        return seal.ext.newCmdExecuteResult(true);
      }
      if (user.level < item.level) {
        seal.replyToSender(ctx, msg, `等级不足，需要${item.level}级。`);
        return seal.ext.newCmdExecuteResult(true);
      }
      if (isExpandType(item.type)) {
        amount = 1;
        if (user.fields >= MAX_FIELDS) {
          seal.replyToSender(ctx, msg, `你已达到田地持有上限(${MAX_FIELDS})，无法继续购买田地。`);
          return seal.ext.newCmdExecuteResult(true);
        }
        if (user.purchasedFields[itemName]) {
          seal.replyToSender(ctx, msg, `${itemName}为一次性商品，你已购买过。`);
          return seal.ext.newCmdExecuteResult(true);
        }
      }
      if (item.type === "dog") {
        amount = 1;
        if (user.hasDog) {
          seal.replyToSender(ctx, msg, "你已经拥有土狗了，无法重复购买。");
          return seal.ext.newCmdExecuteResult(true);
        }
      }
      const needMoney = item.price * amount;
      if (user.money < needMoney) {
        seal.replyToSender(ctx, msg, `金币不足，需要${needMoney}，你当前${user.money}。`);
        return seal.ext.newCmdExecuteResult(true);
      }
      if (isExpandType(item.type)) {
        const resultText = applyExpandFields(user, itemName, 1, needMoney, itemName);
        if (!resultText.startsWith("铛铛")) {
          seal.replyToSender(ctx, msg, resultText);
          return seal.ext.newCmdExecuteResult(true);
        }
        saveUser(ext, user);
        seal.replyToSender(ctx, msg, resultText);
        return seal.ext.newCmdExecuteResult(true);
      } else if (item.type === "dog") {
        user.money -= needMoney;
        user.hasDog = true;
        saveUser(ext, user);
        seal.replyToSender(ctx, msg, "购买成功：土狗已加入你的农场，它会帮助你看守田地。");
        return seal.ext.newCmdExecuteResult(true);
      } else {
        user.money -= needMoney;
        addWarehouseItem(user, itemName, amount);
      }
      saveUser(ext, user);
      seal.replyToSender(ctx, msg, `购买成功：${itemName} x${amount}。`);
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdSell = seal.ext.newCmdItemInfo();
    cmdSell.name = "出售";
    cmdSell.help = ".出售 <商品名> (数量)";
    cmdSell.solve = (ctx, msg, cmdArgs) => {
      const user = requireUser(ext, ctx, msg);
      if (!user) return seal.ext.newCmdExecuteResult(true);
      const itemName = String(cmdArgs.getArgN(1) || "").trim();
      let amount = parsePositiveIntArg(cmdArgs.getArgN(2), 1);
      if (!itemName || amount === null) {
        seal.replyToSender(ctx, msg, "出售数量必须是正整数。格式：.出售 <商品名> (数量)");
        return seal.ext.newCmdExecuteResult(true);
      }
      if (itemName === "肥料") {
        seal.replyToSender(ctx, msg, "肥料不可出售。");
        return seal.ext.newCmdExecuteResult(true);
      }
      const have = Number(user.warehouse[itemName] ?? 0);
      if (have < amount) {
        seal.replyToSender(ctx, msg, `${itemName}不足，当前仅有${have}。`);
        return seal.ext.newCmdExecuteResult(true);
      }
      let unitPrice = 0;
      const storeItem = STORE[itemName];
      if (storeItem && storeItem.type === "seed") {
        unitPrice = Math.floor(storeItem.price * 0.8);
      } else if (itemName === "鱼饵") {
        unitPrice = Math.floor((STORE["鱼饵"]?.price || 0) * 0.5);
      } else if (FISH_PRICES[itemName] !== undefined) {
        unitPrice = FISH_PRICES[itemName];
      } else {
        const seedName = `${itemName}种子`;
        const seedInfo = STORE[seedName];
        if (!seedInfo) {
          seal.replyToSender(ctx, msg, "该物品无可出售价格定义。");
          return seal.ext.newCmdExecuteResult(true);
        }
        unitPrice = Math.floor(seedInfo.price * 1.25);
      }
      removeWarehouseItem(user, itemName, amount);
      const income = unitPrice * amount;
      user.money += income;
      saveUser(ext, user);
      seal.replyToSender(ctx, msg, `出售成功：${itemName} x${amount}，获得${income}金币。`);
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdFriend = seal.ext.newCmdItemInfo();
    cmdFriend.name = "好友信息";
    cmdFriend.help = ".好友信息 <@其他人>";
    cmdFriend.allowDelegate = true;
    cmdFriend.solve = (ctx, msg, cmdArgs) => {
      if (!cmdArgs.at || cmdArgs.at.length === 0) {
        seal.replyToSender(ctx, msg, "请@一位玩家。");
        return seal.ext.newCmdExecuteResult(true);
      }
      const targetCtx = getTargetCtxOrSelf(ctx, cmdArgs);
      const userId = String(targetCtx.player.userId);
      const user = loadUser(ext, userId, targetCtx.player.name);
      if (!user) {
        seal.replyToSender(ctx, msg, "目标玩家还不是农夫。");
        return seal.ext.newCmdExecuteResult(true);
      }
      seal.replyToSender(ctx, msg, summarizeFarm(ext, user));
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdWarehouse = seal.ext.newCmdItemInfo();
    cmdWarehouse.name = "我的仓库";
    cmdWarehouse.help = ".我的仓库";
    cmdWarehouse.solve = (ctx, msg) => {
      const user = requireUser(ext, ctx, msg);
      if (!user) return seal.ext.newCmdExecuteResult(true);
      const items = Object.keys(user.warehouse);
      if (!items.length) {
        seal.replyToSender(ctx, msg, "仓库空空如也。");
        return seal.ext.newCmdExecuteResult(true);
      }
      const lines = ["我的仓库："];
      for (const k of items) {
        lines.push(`${k} x${user.warehouse[k]}`);
      }
      seal.replyToSender(ctx, msg, lines.join("\n"));
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdClearField = seal.ext.newCmdItemInfo();
    cmdClearField.name = "铲除农田";
    cmdClearField.help = ".铲除农田 <田地序号>";
    cmdClearField.solve = (ctx, msg, cmdArgs) => {
      const user = requireUser(ext, ctx, msg);
      if (!user) return seal.ext.newCmdExecuteResult(true);
      const index = Math.floor(Number(cmdArgs.getArgN(1)));
      if (!Number.isFinite(index) || index < 1 || index > user.fields) {
        seal.replyToSender(ctx, msg, "田地序号无效。");
        return seal.ext.newCmdExecuteResult(true);
      }
      const fieldName = getFieldName(index);
      if (!user.crops[fieldName]) {
        seal.replyToSender(ctx, msg, "该田地为空。");
        return seal.ext.newCmdExecuteResult(true);
      }
      delete user.crops[fieldName];
      saveUser(ext, user);
      seal.replyToSender(ctx, msg, `${fieldName}已铲除。`);
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdSteal = seal.ext.newCmdItemInfo();
    cmdSteal.name = "偷窃";
    cmdSteal.help = ".偷窃 <@其他人>";
    cmdSteal.allowDelegate = true;
    cmdSteal.solve = (ctx, msg, cmdArgs) => {
      const user = requireUser(ext, ctx, msg);
      if (!user) return seal.ext.newCmdExecuteResult(true);
      if (!cmdArgs.at || cmdArgs.at.length === 0) {
        seal.replyToSender(ctx, msg, "请@目标玩家。");
        return seal.ext.newCmdExecuteResult(true);
      }
      const now = Date.now();
      if (now - user.lastStealTime < user.stealCooldown) {
        const remain = Math.ceil((user.stealCooldown - (now - user.lastStealTime)) / 1000);
        seal.replyToSender(ctx, msg, `冷却中，请${remain}秒后再试。`);
        return seal.ext.newCmdExecuteResult(true);
      }
      const targetCtx = getTargetCtxOrSelf(ctx, cmdArgs);
      const targetId = String(targetCtx.player.userId);
      if (targetId === user.id) {
        seal.replyToSender(ctx, msg, "不能偷自己。");
        return seal.ext.newCmdExecuteResult(true);
      }
      const target = loadUser(ext, targetId, targetCtx.player.name);
      if (!target) {
        seal.replyToSender(ctx, msg, "目标玩家还不是农夫。");
        return seal.ext.newCmdExecuteResult(true);
      }
      const matureFields = [];
      for (let i = 1; i <= target.fields; i += 1) {
        const fieldName = getFieldName(i);
        const slot = target.crops[fieldName];
        if (!slot) continue;
        if (slot.harvestTime <= now && !slot.stolen) matureFields.push(fieldName);
      }
      if (!matureFields.length) {
        seal.replyToSender(ctx, msg, "目标没有可偷的成熟作物。");
        return seal.ext.newCmdExecuteResult(true);
      }
      if (target.hasDog && Math.random() < DOG_STEAL_FAIL_RATE) {
        user.dogBiteFailStreak = Number(user.dogBiteFailStreak || 0) + 1;
        if (user.dogBiteFailStreak >= 3) {
          user.lastStealTime = now;
          user.dogBiteFailStreak = 0;
          saveUser(ext, user);
          seal.replyToSender(ctx, msg, "偷窃失败：你连续被土狗咬了3次，已进入1分钟冷却。");
          return seal.ext.newCmdExecuteResult(true);
        }
        saveUser(ext, user);
        seal.replyToSender(ctx, msg, `偷窃失败：你被目标农场的土狗咬了。再被咬${3 - user.dogBiteFailStreak}次将进入1分钟冷却。`);
        return seal.ext.newCmdExecuteResult(true);
      }
      const targetField = matureFields[0];
      const slot = target.crops[targetField];
      const product = cropOutput(slot.seed);
      addWarehouseItem(user, product, 1);
      delete target.crops[targetField];
      user.lastStealTime = now;
      user.dogBiteFailStreak = 0;
      saveUser(ext, user);
      saveUser(ext, target);
      seal.replyToSender(ctx, msg, `偷窃成功：从${target.name}的${targetField}偷到了${product}。`);
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdHarvest = seal.ext.newCmdItemInfo();
    cmdHarvest.name = "收获";
    cmdHarvest.help = ".收获 一键收获成熟作物";
    cmdHarvest.solve = (ctx, msg) => {
      const user = requireUser(ext, ctx, msg);
      if (!user) return seal.ext.newCmdExecuteResult(true);
      const now = Date.now();
      const adventurerEvent = handleAdventurerEvent(user);
      if (adventurerEvent) {
        saveUser(ext, user);
        seal.replyToSender(ctx, msg, adventurerEvent);
        return seal.ext.newCmdExecuteResult(true);
      }
      let count = 0;
      const products = {};
      for (let i = 1; i <= user.fields; i += 1) {
        const fieldName = getFieldName(i);
        const slot = user.crops[fieldName];
        if (!slot) continue;
        if (slot.harvestTime > now) continue;
        const product = cropOutput(slot.seed);
        products[product] = Number(products[product] || 0) + 1;
        count += 1;
        delete user.crops[fieldName];
      }
      if (!count) {
        seal.replyToSender(ctx, msg, "当前没有成熟作物。");
        return seal.ext.newCmdExecuteResult(true);
      }
      for (const k of Object.keys(products)) {
        addWarehouseItem(user, k, products[k]);
      }
      const gainExp = randomInt(100, 200);
      user.experience += gainExp;
      const levelUps = syncLevelByExperience(user);
      saveUser(ext, user);
      const details = Object.keys(products).map((k) => `${k}x${products[k]}`).join("、");
      const levelText = levelUps > 0 ? `，升级至${user.level}级` : "";
      seal.replyToSender(ctx, msg, `收获完成：${details}。经验+${gainExp}${levelText}`);
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdDrop = seal.ext.newCmdItemInfo();
    cmdDrop.name = "丢弃";
    cmdDrop.help = ".丢弃 <物品名> (数量)";
    cmdDrop.solve = (ctx, msg, cmdArgs) => {
      const user = requireUser(ext, ctx, msg);
      if (!user) return seal.ext.newCmdExecuteResult(true);
      const itemName = String(cmdArgs.getArgN(1) || "").trim();
      const amount = parsePositiveIntArg(cmdArgs.getArgN(2), 1);
      if (!itemName || amount === null) {
        seal.replyToSender(ctx, msg, "格式：.丢弃 <物品名> (数量)");
        return seal.ext.newCmdExecuteResult(true);
      }
      if (!removeWarehouseItem(user, itemName, amount)) {
        seal.replyToSender(ctx, msg, "仓库数量不足。");
        return seal.ext.newCmdExecuteResult(true);
      }
      saveUser(ext, user);
      seal.replyToSender(ctx, msg, `已丢弃：${itemName} x${amount}`);
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdRename = seal.ext.newCmdItemInfo();
    cmdRename.name = "修改农夫名";
    cmdRename.help = ".修改农夫名 <新用户名>";
    cmdRename.solve = (ctx, msg, cmdArgs) => {
      const user = requireUser(ext, ctx, msg);
      if (!user) return seal.ext.newCmdExecuteResult(true);
      const newName = String(cmdArgs.getRestArgsFrom(1) || "").trim();
      if (!newName) {
        seal.replyToSender(ctx, msg, "请输入新用户名。");
        return seal.ext.newCmdExecuteResult(true);
      }
      user.name = newName;
      saveUser(ext, user);
      seal.replyToSender(ctx, msg, `农夫名已修改为：${newName}`);
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdFertilize = seal.ext.newCmdItemInfo();
    cmdFertilize.name = "使用肥料";
    cmdFertilize.help = ".使用肥料 <田地序号>";
    cmdFertilize.solve = (ctx, msg, cmdArgs) => {
      const user = requireUser(ext, ctx, msg);
      if (!user) return seal.ext.newCmdExecuteResult(true);
      const index = Math.floor(Number(cmdArgs.getArgN(1)));
      if (!Number.isFinite(index) || index < 1 || index > user.fields) {
        seal.replyToSender(ctx, msg, "田地序号无效。");
        return seal.ext.newCmdExecuteResult(true);
      }
      if (!removeWarehouseItem(user, "肥料", 1)) {
        seal.replyToSender(ctx, msg, "肥料不足。");
        return seal.ext.newCmdExecuteResult(true);
      }
      const fieldName = getFieldName(index);
      const slot = user.crops[fieldName];
      if (!slot) {
        addWarehouseItem(user, "肥料", 1);
        seal.replyToSender(ctx, msg, "该田地为空。");
        return seal.ext.newCmdExecuteResult(true);
      }
      const now = Date.now();
      const remain = Math.max(0, slot.harvestTime - now);
      slot.harvestTime = now + Math.ceil(remain / 2);
      saveUser(ext, user);
      seal.replyToSender(ctx, msg, `${fieldName}已施肥，剩余时间减半。`);
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdSignIn = seal.ext.newCmdItemInfo();
    cmdSignIn.name = "签到";
    cmdSignIn.help = ".签到 每日奖励";
    cmdSignIn.solve = (ctx, msg) => {
      const user = requireUser(ext, ctx, msg);
      if (!user) return seal.ext.newCmdExecuteResult(true);
      const today = nowDateStr();
      const weather = getWeather(ext);
      if (user.lastSignInDate === today) {
        seal.replyToSender(ctx, msg, `你今天已经签到过了。今日天气：${weather}`);
        return seal.ext.newCmdExecuteResult(true);
      }
      const reward = randomInt(60, 140);
      user.money += reward;
      user.lastSignInDate = today;
      saveUser(ext, user);
      seal.replyToSender(ctx, msg, `签到成功，获得${reward}金币。今日天气：${weather}`);
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdFish = seal.ext.newCmdItemInfo();
    cmdFish.name = "钓鱼";
    cmdFish.help = ".钓鱼 消耗鱼饵钓鱼";
    cmdFish.solve = (ctx, msg) => {
      const user = requireUser(ext, ctx, msg);
      if (!user) return seal.ext.newCmdExecuteResult(true);
      refreshFishPondDaily(user);
      if ((user.warehouse["鱼饵"] ?? 0) < 1) {
        saveUser(ext, user);
        seal.replyToSender(ctx, msg, "鱼饵不足，无法钓鱼。");
        return seal.ext.newCmdExecuteResult(true);
      }
      if (user.fishPond <= 0) {
        saveUser(ext, user);
        seal.replyToSender(ctx, msg, "鱼塘资源不足，明天再来。");
        return seal.ext.newCmdExecuteResult(true);
      }
      removeWarehouseItem(user, "鱼饵", 1);
      const success = Math.random() < 0.55;
      if (!success) {
        user.fishPond = Math.max(0, user.fishPond - 0.5);
        saveUser(ext, user);
        seal.replyToSender(ctx, msg, `这次没钓到鱼。鱼塘剩余：${user.fishPond}`);
        return seal.ext.newCmdExecuteResult(true);
      }
      user.fishPond = Math.max(0, user.fishPond - 1);
      const pool = getFishPoolByLevel(user.level);
      const fish = pool[randomInt(0, pool.length - 1)];
      addWarehouseItem(user, fish, 1);
      saveUser(ext, user);
      seal.replyToSender(ctx, msg, `钓鱼成功，获得${fish}。鱼塘剩余：${user.fishPond}`);
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdWorm = seal.ext.newCmdItemInfo();
    cmdWorm.name = "抓蚯蚓";
    cmdWorm.help = ".抓蚯蚓 雨天抓取鱼饵";
    cmdWorm.solve = (ctx, msg) => {
      const user = requireUser(ext, ctx, msg);
      if (!user) return seal.ext.newCmdExecuteResult(true);
      if (user.level < 4) {
        seal.replyToSender(ctx, msg, "等级不足，需达到4级。");
        return seal.ext.newCmdExecuteResult(true);
      }
      const weather = getWeather(ext);
      if (weather !== "雨天") {
        seal.replyToSender(ctx, msg, "只有雨天才能抓蚯蚓。");
        return seal.ext.newCmdExecuteResult(true);
      }
      const today = nowDateStr();
      if (user.lastWormCatchDate !== today) {
        user.lastWormCatchDate = today;
        user.wormCatchCount = 0;
      }
      if (user.wormCatchCount >= 7) {
        saveUser(ext, user);
        seal.replyToSender(ctx, msg, "今天抓蚯蚓次数已达上限（7次）。");
        return seal.ext.newCmdExecuteResult(true);
      }
      user.wormCatchCount += 1;
      const success = Math.random() < 0.7;
      if (success) {
        addWarehouseItem(user, "鱼饵", 1);
        saveUser(ext, user);
        seal.replyToSender(ctx, msg, `抓蚯蚓成功，获得鱼饵x1。今日第${user.wormCatchCount}次。`);
        return seal.ext.newCmdExecuteResult(true);
      }
      saveUser(ext, user);
      seal.replyToSender(ctx, msg, `这次没有抓到。今日第${user.wormCatchCount}次。`);
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdVoyage = seal.ext.newCmdItemInfo();
    cmdVoyage.name = "远航";
    cmdVoyage.help = ".远航 / .远航 <探索类型>";
    cmdVoyage.solve = (ctx, msg, cmdArgs) => {
      const user = requireUser(ext, ctx, msg);
      if (!user) return seal.ext.newCmdExecuteResult(true);
      const type = String(cmdArgs.getRestArgsFrom(1) || "").trim();
      if (!type) {
        const menu = ["远航菜单："];
        for (const k of Object.keys(VOYAGE_TYPES)) {
          const cfg = VOYAGE_TYPES[k];
          const wreck = SHIPWRECK_CONFIG[k];
          const chanceText = wreck ? `${Math.round(wreck.chance * 100)}%` : "30%";
          menu.push(`${k} - 花费${cfg.cost || 0}金币 - 耗时${Math.floor(cfg.duration / 60000)}分钟 - 沉船概率${chanceText}`);
        }
        seal.replyToSender(ctx, msg, menu.join("\n"));
        return seal.ext.newCmdExecuteResult(true);
      }
      if (user.explorationType && user.explorationStartTime) {
        const cfg = VOYAGE_TYPES[user.explorationType] || VOYAGE_TYPES["近海远航"];
        const reachTime = Number(user.explorationStartTime) + cfg.duration;
        const remainMs = reachTime - Date.now();
        if (remainMs > 0) {
          seal.replyToSender(ctx, msg, `你正在${user.explorationType}中，剩余${formatDurationMs(remainMs)}。`);
          return seal.ext.newCmdExecuteResult(true);
        }
      }
      const cfg = VOYAGE_TYPES[type];
      if (!cfg) {
        seal.replyToSender(ctx, msg, "探索类型不存在，请先使用 .远航 查看菜单。");
        return seal.ext.newCmdExecuteResult(true);
      }
      const cost = Number(cfg.cost || 0);
      if (user.money < cost) {
        seal.replyToSender(ctx, msg, `金币不足，开启${type}需要${cost}金币，你当前${user.money}。`);
        return seal.ext.newCmdExecuteResult(true);
      }
      const shipwreckCfg = SHIPWRECK_CONFIG[type] || { chance: 0.3, alertDelayMs: 60 * 60 * 1000 };
      const hasShipwreckEvent = Math.random() < shipwreckCfg.chance;
      user.money -= cost;
      user.explorationType = type;
      user.explorationStartTime = Date.now();
      saveUser(ext, user);
      const tasks = getVoyageTasks(ext);
      tasks.push({
        reachTime: user.explorationStartTime + cfg.duration,
        userId: user.id,
        senderUserId: String(ctx.player.userId || ""),
        senderName: String(ctx.player.name || ""),
        replyCtx: buildReplyCtxTuple(ctx, msg),
        voyageType: type,
        hasShipwreckEvent,
        shipwreckAlertReachTime: user.explorationStartTime + shipwreckCfg.alertDelayMs,
        shipwreckAlerted: false
      });
      saveVoyageTasks(ext, tasks);
      seal.replyToSender(ctx, msg, `已开启${type}（花费${cost}金币），预计${Math.floor(cfg.duration / 60000)}分钟后完成。`);
      return seal.ext.newCmdExecuteResult(true);
    };

    const cmdFinger = seal.ext.newCmdItemInfo();
    cmdFinger.name = "金手指";
    cmdFinger.help = ".金手指 help\n.金手指 查看 [@玩家]\n.金手指 设置 <字段> <值> [@玩家]\n.金手指 增减 <字段> <delta> [@玩家]\n.金手指 仓库设置 <物品名> <数量> [@玩家]\n.金手指 作物时间 <分钟> [@玩家]\n.金手指 远航时间 <分钟> [@玩家]";
    cmdFinger.allowDelegate = true;
    cmdFinger.solve = (ctx, msg, cmdArgs) => {
      if (!checkAdmin(ctx)) {
        seal.replyToSender(ctx, msg, "仅骰主(master)可使用金手指。");
        return seal.ext.newCmdExecuteResult(true);
      }
      const op = String(cmdArgs.getArgN(1) || "").trim();
      if (!op || op === "help" || op === "帮助") {
        seal.replyToSender(ctx, msg, cmdFinger.help);
        return seal.ext.newCmdExecuteResult(true);
      }
      if (op === "设置") {
        const parsed = parseFingerFieldAndValue(cmdArgs);
        const field = normalizeFingerField(parsed.fieldRaw);
        if (!field || !FINGER_ALLOWED_FIELDS.includes(field)) {
          seal.replyToSender(ctx, msg, "字段不允许修改。可用字段：金币/等级/经验/田地/鱼塘/签到日期/偷窃时间/天气");
          return seal.ext.newCmdExecuteResult(true);
        }
        if (!parsed.valueToken) {
          seal.replyToSender(ctx, msg, "请提供设置值。");
          return seal.ext.newCmdExecuteResult(true);
        }
        if (field === "weather") {
          const weatherValue = parsed.valueToken;
          if (!WEATHER_TYPES.includes(weatherValue)) {
            seal.replyToSender(ctx, msg, `天气仅支持：${WEATHER_TYPES.join("、")}`);
            return seal.ext.newCmdExecuteResult(true);
          }
          const before = getWeather(ext);
          setWeather(ext, weatherValue);
          appendAdminLog(ext, { at: Date.now(), operatorId: ctx.player.userId, targetId: "GLOBAL", action: "设置:weather", before, after: weatherValue });
          seal.replyToSender(ctx, msg, `设置成功：weather ${before} -> ${weatherValue}`);
          return seal.ext.newCmdExecuteResult(true);
        }
        const targetCtx = getTargetCtxOrSelf(ctx, cmdArgs);
        const targetId = String(targetCtx.player.userId);
        const targetName = targetCtx.player.name;
        const user = loadUser(ext, targetId, targetName);
        if (!user) {
          seal.replyToSender(ctx, msg, "目标玩家还不是农夫。");
          return seal.ext.newCmdExecuteResult(true);
        }
        const before = user[field];
        if (NUMERIC_FIELDS.includes(field)) {
          const n = Number(parsed.valueToken);
          if (!Number.isFinite(n)) {
            seal.replyToSender(ctx, msg, "该字段需要数值。");
            return seal.ext.newCmdExecuteResult(true);
          }
          let next = n;
          if (["money", "experience", "fields", "fishPond", "lastStealTime"].includes(field)) next = Math.max(0, next);
          if (field === "level") next = Math.min(MAX_LEVEL, Math.max(1, Math.floor(next)));
          if (field === "fields") next = Math.min(MAX_FIELDS, Math.max(1, Math.floor(next)));
          user[field] = next;
        } else {
          const rawVal = String(cmdArgs.getRestArgsFrom(3) || "").trim() || parsed.valueToken;
          user[field] = rawVal;
        }
        const after = user[field];
        saveUser(ext, user);
        appendAdminLog(ext, { at: Date.now(), operatorId: ctx.player.userId, targetId: user.id, action: `设置:${field}`, before, after });
        seal.replyToSender(ctx, msg, `设置成功：${field} ${before} -> ${after}`);
        return seal.ext.newCmdExecuteResult(true);
      }
      const targetCtx = getTargetCtxOrSelf(ctx, cmdArgs);
      const targetId = String(targetCtx.player.userId);
      const targetName = targetCtx.player.name;
      const user = loadUser(ext, targetId, targetName);
      if (!user) {
        seal.replyToSender(ctx, msg, "目标玩家还不是农夫。");
        return seal.ext.newCmdExecuteResult(true);
      }
      if (op === "查看") {
        const text = [
          `目标：${user.name}(${user.id})`,
          `money=${user.money}`,
          `level=${user.level}`,
          `experience=${user.experience}`,
          `fields=${user.fields}`,
          `fishPond=${user.fishPond}`,
          `lastSignInDate=${user.lastSignInDate}`,
          `lastStealTime=${user.lastStealTime}`,
          `crops=${Object.keys(user.crops).length}块`,
          `warehouseItems=${Object.keys(user.warehouse).length}种`
        ].join("\n");
        seal.replyToSender(ctx, msg, text);
        return seal.ext.newCmdExecuteResult(true);
      }
      if (op === "增减") {
        const field = normalizeFingerField(cmdArgs.getArgN(2));
        const delta = Number(cmdArgs.getArgN(3));
        if (!FINGER_ALLOWED_FIELDS.includes(field) || !NUMERIC_FIELDS.includes(field)) {
          seal.replyToSender(ctx, msg, "该字段不支持增减。");
          return seal.ext.newCmdExecuteResult(true);
        }
        if (!Number.isFinite(delta)) {
          seal.replyToSender(ctx, msg, "delta必须是数值。");
          return seal.ext.newCmdExecuteResult(true);
        }
        const before = Number(user[field] ?? 0);
        let after = before + delta;
        if (["money", "experience", "fields", "fishPond", "lastStealTime"].includes(field)) after = Math.max(0, after);
        if (field === "level") after = Math.min(MAX_LEVEL, Math.max(1, Math.floor(after)));
        if (field === "fields") after = Math.min(MAX_FIELDS, Math.max(1, Math.floor(after)));
        user[field] = after;
        saveUser(ext, user);
        appendAdminLog(ext, { at: Date.now(), operatorId: ctx.player.userId, targetId: user.id, action: `增减:${field}`, before, after });
        seal.replyToSender(ctx, msg, `修改成功：${field} ${before} -> ${after}`);
        return seal.ext.newCmdExecuteResult(true);
      }
      if (op === "仓库设置") {
        const item = String(cmdArgs.getArgN(2) || "").trim();
        const count = parseNonNegativeIntArg(cmdArgs.getArgN(3), null);
        if (!item || count === null) {
          seal.replyToSender(ctx, msg, "格式：.金手指 仓库设置 <物品名> <数量> [@玩家]");
          return seal.ext.newCmdExecuteResult(true);
        }
        if (!isFingerAllowedWarehouseItem(item)) {
          seal.replyToSender(ctx, msg, "该物品不在可购买/可出售范围内，禁止设置。");
          return seal.ext.newCmdExecuteResult(true);
        }
        const before = Number(user.warehouse[item] ?? 0);
        if (count === 0) {
          delete user.warehouse[item];
        } else {
          user.warehouse[item] = count;
        }
        const after = Number(user.warehouse[item] ?? 0);
        saveUser(ext, user);
        appendAdminLog(ext, { at: Date.now(), operatorId: ctx.player.userId, targetId: user.id, action: `仓库设置:${item}`, before, after });
        seal.replyToSender(ctx, msg, `仓库设置成功：${item} ${before} -> ${after}`);
        return seal.ext.newCmdExecuteResult(true);
      }
      if (op === "作物时间" || op === "作物清空") {
        const minutes = parsePositiveIntArg(cmdArgs.getArgN(2), null);
        if (minutes === null) {
          seal.replyToSender(ctx, msg, "格式：.金手指 作物时间 <分钟> [@玩家]");
          return seal.ext.newCmdExecuteResult(true);
        }
        const shortenMs = minutes * 60 * 1000;
        const now = Date.now();
        let changed = 0;
        for (const fieldName of Object.keys(user.crops)) {
          const slot = user.crops[fieldName];
          if (!slot) continue;
          const beforeTime = Number(slot.harvestTime);
          if (!Number.isFinite(beforeTime) || beforeTime <= now) continue;
          slot.harvestTime = Math.max(now, beforeTime - shortenMs);
          changed += 1;
        }
        saveUser(ext, user);
        appendAdminLog(ext, { at: Date.now(), operatorId: ctx.player.userId, targetId: user.id, action: "作物时间", before: minutes, after: changed });
        seal.replyToSender(ctx, msg, `已将${user.name}的作物成熟时间缩短${minutes}分钟，影响${changed}块田地。`);
        return seal.ext.newCmdExecuteResult(true);
      }
      if (op === "远航时间" || op === "远航重置") {
        const minutes = parsePositiveIntArg(cmdArgs.getArgN(2), null);
        if (minutes === null) {
          seal.replyToSender(ctx, msg, "格式：.金手指 远航时间 <分钟> [@玩家]");
          return seal.ext.newCmdExecuteResult(true);
        }
        if (!user.explorationType || !user.explorationStartTime) {
          seal.replyToSender(ctx, msg, "目标当前没有进行中的远航。");
          return seal.ext.newCmdExecuteResult(true);
        }
        const cfg = VOYAGE_TYPES[user.explorationType] || VOYAGE_TYPES["近海远航"];
        const now = Date.now();
        const oldReachTime = Number(user.explorationStartTime) + cfg.duration;
        const newReachTime = Math.max(now, oldReachTime - minutes * 60 * 1000);
        const newStartTime = newReachTime - cfg.duration;
        const before = { explorationType: user.explorationType, explorationStartTime: user.explorationStartTime, reachTime: oldReachTime };
        user.explorationStartTime = newStartTime;
        saveUser(ext, user);
        const tasks = getVoyageTasks(ext);
        for (const it of tasks) {
          if (String(it.userId || "") === user.id) {
            it.reachTime = newReachTime;
          }
        }
        saveVoyageTasks(ext, tasks);
        appendAdminLog(ext, { at: Date.now(), operatorId: ctx.player.userId, targetId: user.id, action: "远航时间", before, after: { explorationStartTime: user.explorationStartTime, reachTime: newReachTime } });
        processVoyageTasks(ext);
        const remain = Math.max(0, Math.ceil((newReachTime - now) / 60000));
        seal.replyToSender(ctx, msg, `已将${user.name}的远航时间缩短${minutes}分钟，当前预计剩余${remain}分钟。`);
        return seal.ext.newCmdExecuteResult(true);
      }
      seal.replyToSender(ctx, msg, "未知子命令，请查看帮助。");
      return seal.ext.newCmdExecuteResult(true);
    };

    ext.cmdMap["成为农夫"] = cmdBecome;
    ext.cmdMap["农场指令"] = cmdHelp;
    ext.cmdMap["我的农田"] = cmdMyFarm;
    ext.cmdMap["种植"] = cmdPlant;
    ext.cmdMap["农田商店"] = cmdStore;
    ext.cmdMap["购买"] = cmdBuy;
    ext.cmdMap["出售"] = cmdSell;
    ext.cmdMap["好友信息"] = cmdFriend;
    ext.cmdMap["我的仓库"] = cmdWarehouse;
    ext.cmdMap["铲除农田"] = cmdClearField;
    ext.cmdMap["偷窃"] = cmdSteal;
    ext.cmdMap["收获"] = cmdHarvest;
    ext.cmdMap["丢弃"] = cmdDrop;
    ext.cmdMap["修改农夫名"] = cmdRename;
    ext.cmdMap["使用肥料"] = cmdFertilize;
    ext.cmdMap["签到"] = cmdSignIn;
    ext.cmdMap["钓鱼"] = cmdFish;
    ext.cmdMap["抓蚯蚓"] = cmdWorm;
    ext.cmdMap["远航"] = cmdVoyage;
    ext.cmdMap["金手指"] = cmdFinger;

    seal.ext.register(ext);
    ensureVoyageTaskId(ext);
    setInterval(() => {
      processVoyageTasks(ext);
    }, 15000);
  }
})();
