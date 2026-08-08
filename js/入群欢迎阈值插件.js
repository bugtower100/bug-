// ==UserScript==
// @name         入群人数阈值回复(ws版本，内置可用)
// @author       bug人@
// @version      1.0.0
// @description  新成员入群时，通过OneBot正向WS获取群信息(member_count)并按阈值发送不同回复，不要拉太快，至少隔12s拉人。\n开启/关闭使用:.入群回复 on/off 进行控制。\n该插件为付费委托插件公开，感谢程尹，因为他的社恐，让骰主想要做这个插件！
// @timestamp    2026-03-07
// @homepageURL  https://github.com/bugtower100/bug-repository
// ==/UserScript==

let ext = seal.ext.find("欢迎致辞阈值");
if (!ext) {
  ext = seal.ext.new("欢迎致辞阈值", "bug人@", "1.0.0");
}

try {
  seal.ext.register(ext);
} catch (_) {}

try {
  seal.ext.registerStringConfig(ext, "ws地址", "ws://127.0.0.1:8081");
} catch (_) {}
try {
  seal.ext.registerBoolConfig(ext, "默认开启", false);
} catch (_) {}
try {
  seal.ext.registerTemplateConfig(ext, "人数阈值", ["7", "50"]);
} catch (_) {}
try {
  seal.ext.registerTemplateConfig(ext, "回复文本", [
    "欢迎加入！当前群人数{count}",
    "欢迎新朋友~ 现在{count}人啦",
  ]);
} catch (_) {}
try {
  seal.ext.registerStringConfig(ext, "默认回复", "");
} catch (_) {}

if (ext) {

  const STATUS_KEY = "joinReplyStatusV1";

  function logJoin(...args) {
    try {
      console.log("[入群回复]", ...args);
    } catch (_) {}
  }

  function normalizeGroupId(val) {
    if (val === null || val === undefined) return "";
    const s = String(val);
    const ms = s.match(/\d+/g);
    if (!ms || ms.length === 0) return s;
    return ms[ms.length - 1];
  }

  function getEnabledMap() {
    try {
      const raw = ext.storageGet(STATUS_KEY) || "{}";
      const obj = JSON.parse(raw);
      if (obj && typeof obj === "object") return obj;
      return {};
    } catch (_) {
      return {};
    }
  }

  function isEnabledForGroup(groupId) {
    const gid = normalizeGroupId(groupId);
    const m = getEnabledMap();
    if (Object.prototype.hasOwnProperty.call(m, gid)) return !!m[gid];
    return !!seal.ext.getBoolConfig(ext, "默认开启");
  }

  function setEnabledForGroup(groupId, enabled) {
    const gid = normalizeGroupId(groupId);
    const m = getEnabledMap();
    m[gid] = !!enabled;
    ext.storageSet(STATUS_KEY, JSON.stringify(m));
  }

  function getRules() {
    const rules = [];
    let thresholds = [];
    let replies = [];
    try {
      thresholds = seal.ext.getTemplateConfig(ext, "人数阈值") || [];
    } catch (_) {
      thresholds = [];
    }
    try {
      replies = seal.ext.getTemplateConfig(ext, "回复文本") || [];
    } catch (_) {
      replies = [];
    }

    for (let i = 0; i < thresholds.length; i++) {
      const rawN = thresholds[i];
      const n = Number(String(rawN || "").trim());
      if (!Number.isFinite(n) || n <= 0) continue;
      const reply = replies[i] !== undefined ? String(replies[i] || "") : "";
      rules.push({ threshold: n, reply, i });
    }

    if (rules.length === 0) {
      for (let i = 1; i <= 2; i++) {
        let threshold = 0;
        let reply = "";
        try {
          threshold = seal.ext.getIntConfig(ext, `阈值${i}`);
        } catch (_) {
          threshold = 0;
        }
        try {
          reply = seal.ext.getStringConfig(ext, `回复${i}`) || "";
        } catch (_) {
          reply = "";
        }
        threshold = Number(threshold);
        if (!Number.isFinite(threshold) || threshold <= 0) continue;
        rules.push({ threshold, reply, i: 1000 + i });
      }
    }

    rules.sort((a, b) => a.threshold - b.threshold || a.i - b.i);
    return rules.map((r) => ({ threshold: r.threshold, reply: r.reply }));
  }

  function pickReplyText(count) {
    const rules = getRules();
    for (const r of rules) {
      if (count <= r.threshold) return r.reply || "";
    }
    try {
      return seal.ext.getStringConfig(ext, "默认回复") || "";
    } catch (_) {
      return "";
    }
  }

  function formatText(t, data) {
    return String(t).replace(/\{(\w+)\}/g, (_, k) => {
      if (Object.prototype.hasOwnProperty.call(data, k)) return String(data[k]);
      return `{${k}}`;
    });
  }

  const cmdToggle = seal.ext.newCmdItemInfo();
  cmdToggle.name = "入群回复";
  cmdToggle.help = "入群回复开关：.入群回复 on/off";
  cmdToggle.solve = (ctx, msg, cmdArgs) => {
    if (msg.messageType !== "group") {
      seal.replyToSender(ctx, msg, "该指令只能在群聊中使用");
      return seal.ext.newCmdExecuteResult(true);
    }
    const val = (cmdArgs.getArgN(1) || "").toLowerCase();
    const gid = normalizeGroupId(ctx.group.groupId || msg.groupId);
    switch (val) {
      case "help": {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
      }
      case "on": {
        setEnabledForGroup(gid, true);
        seal.replyToSender(ctx, msg, `已开启入群回复（群${gid}）`);
        return seal.ext.newCmdExecuteResult(true);
      }
      case "off": {
        setEnabledForGroup(gid, false);
        seal.replyToSender(ctx, msg, `已关闭入群回复（群${gid}）`);
        return seal.ext.newCmdExecuteResult(true);
      }
      default: {
        const cur = isEnabledForGroup(gid);
        seal.replyToSender(ctx, msg, `入群回复当前状态：${cur ? "开启" : "关闭"}（用 .入群回复 on/off 切换）`);
        return seal.ext.newCmdExecuteResult(true);
      }
    }
  };
  ext.cmdMap["入群回复"] = cmdToggle;

  let ws = null;
  let wsUrl = "";
  let connecting = false;
  let openWaiters = [];
  let reconnectTimer = 0;
  let echoSeq = 1;
  const pending = new Map();
  const sendQueue = [];

  function getWsUrl() {
    try {
      return seal.ext.getStringConfig(ext, "ws地址");
    } catch (_) {
      return "ws://127.0.0.1:8081";
    }
  }

  function flushSendQueue() {
    while (ws && ws.readyState === 1 && sendQueue.length > 0) {
      ws.send(sendQueue.shift());
    }
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = 0;
      connectWs();
    }, 3000);
  }

  function rejectAllPending(reason) {
    for (const [echo, p] of pending.entries()) {
      clearTimeout(p.timer);
      pending.delete(echo);
      try {
        p.reject(new Error(reason));
      } catch (_) {}
    }
  }

  function connectWs() {
    const nextUrl = getWsUrl();
    if (ws && ws.readyState === 1 && wsUrl === nextUrl) return;
    if (connecting) return;
    connecting = true;
    wsUrl = nextUrl;

    try {
      ws = new WebSocket(wsUrl);
    } catch (e) {
      connecting = false;
      rejectAllPending("WebSocket创建失败");
      scheduleReconnect();
      for (const w of openWaiters.splice(0)) w.reject(e);
      return;
    }

    ws.onopen = () => {
      connecting = false;
      flushSendQueue();
      for (const w of openWaiters.splice(0)) w.resolve();
    };

    ws.onmessage = (event) => {
      const raw = event && event.data !== undefined ? event.data : event;
      let obj = null;
      try {
        obj = JSON.parse(raw);
      } catch (_) {
        return;
      }

      if (obj && obj.echo && pending.has(String(obj.echo))) {
        const p = pending.get(String(obj.echo));
        pending.delete(String(obj.echo));
        clearTimeout(p.timer);
        p.resolve(obj);
        return;
      }

      if (
        obj &&
        (obj.post_type === "notice" || obj.postType === "notice") &&
        (obj.notice_type === "group_increase" || obj.noticeType === "group_increase")
      ) {
        const gid = normalizeGroupId(obj.group_id ?? obj.groupId);
        const uidRaw = String(obj.user_id ?? obj.userId ?? "");
        const selfRaw = String(obj.self_id ?? obj.selfId ?? "");
        const uid = normalizeGroupId(uidRaw);
        const selfId = normalizeGroupId(selfRaw);
        if (uid && selfId && uid === selfId) return;
        logJoin("收到入群事件", "groupId=", gid, "userId=", uidRaw, "selfId=", selfRaw);
        onGroupIncrease(gid, uidRaw);
        return;
      }

      if (obj && (obj.notice_type === "group_increase" || obj.noticeType === "group_increase")) {
        const gid = normalizeGroupId(obj.group_id ?? obj.groupId);
        const uidRaw = String(obj.user_id ?? obj.userId ?? "");
        const selfRaw = String(obj.self_id ?? obj.selfId ?? "");
        const uid = normalizeGroupId(uidRaw);
        const selfId = normalizeGroupId(selfRaw);
        if (uid && selfId && uid === selfId) return;
        logJoin("收到入群事件", "groupId=", gid, "userId=", uidRaw, "selfId=", selfRaw);
        onGroupIncrease(gid, uidRaw);
      }
    };

    ws.onerror = () => {
      connecting = false;
      scheduleReconnect();
    };

    ws.onclose = () => {
      connecting = false;
      ws = null;
      rejectAllPending("WebSocket已断开");
      scheduleReconnect();
      for (const w of openWaiters.splice(0)) w.reject(new Error("WebSocket已断开"));
    };
  }

  function ensureWsOpen() {
    const nextUrl = getWsUrl();
    if (ws && ws.readyState === 1 && wsUrl === nextUrl) return Promise.resolve();
    connectWs();
    return new Promise((resolve, reject) => {
      openWaiters.push({ resolve, reject });
      setTimeout(() => {
        reject(new Error("WebSocket连接超时"));
      }, 8000);
    });
  }

  async function wsCall(action, params) {
    await ensureWsOpen();
    return new Promise((resolve, reject) => {
      const echo = `jr_${Date.now()}_${echoSeq++}`;
      const payload = JSON.stringify({ action, params, echo });
      const timer = setTimeout(() => {
        pending.delete(echo);
        reject(new Error(`请求超时: ${action}`));
      }, 10000);
      pending.set(echo, { resolve, reject, timer });
      if (ws && ws.readyState === 1) {
        ws.send(payload);
      } else {
        sendQueue.push(payload);
        scheduleReconnect();
      }
    });
  }

  function sleepMs(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const groupQueue = new Map();

  function enqueueGroup(groupId, fn) {
    const gid = normalizeGroupId(groupId);
    const prev = groupQueue.get(gid) || Promise.resolve();
    const next = prev.then(fn, fn);
    groupQueue.set(gid, next);
    return next;
  }

  async function tryGetMemberListCount(gid) {
    try {
      const listResp = await wsCall("get_group_member_list", { group_id: Number(gid), no_cache: true });
      const list = listResp && Array.isArray(listResp.data) ? listResp.data : null;
      if (!list) return null;
      return list.length;
    } catch (_) {
      return null;
    }
  }

  async function tryGetGroupInfoCount(gid) {
    try {
      const infoResp = await wsCall("get_group_info", { group_id: Number(gid), no_cache: true });
      const data = infoResp && infoResp.data ? infoResp.data : null;
      const count = data && typeof data.member_count === "number" ? data.member_count : null;
      const name = data && data.group_name ? data.group_name : "";
      if (count === null) return null;
      return { count, groupName: name };
    } catch (_) {
      return null;
    }
  }

  async function getFreshMemberCount(groupId) {
    const gid = normalizeGroupId(groupId);
    if (!gid) return null;

    await sleepMs(1200);

    const maxTries = 5;
    const intervalMs = 700;
    let lastList = null;
    let lastInfo = null;
    let prevList = null;
    let prevInfo = null;
    let stableList = 0;
    let stableInfo = 0;

    for (let i = 0; i < maxTries; i++) {
      lastList = await tryGetMemberListCount(gid);
      if (typeof lastList === "number") {
        if (prevList !== null && lastList === prevList) stableList++;
        else stableList = 0;
        prevList = lastList;
      }

      lastInfo = await tryGetGroupInfoCount(gid);
      if (lastInfo && typeof lastInfo.count === "number") {
        if (prevInfo !== null && lastInfo.count === prevInfo) stableInfo++;
        else stableInfo = 0;
        prevInfo = lastInfo.count;
      }

      if (stableList >= 1) {
        return { count: lastList, groupName: (lastInfo && lastInfo.groupName) || "", source: `member_list(stable,tries=${i + 1})` };
      }
      if (stableInfo >= 1 && lastList === null) {
        return { count: lastInfo.count, groupName: lastInfo.groupName || "", source: `group_info(stable,tries=${i + 1})` };
      }

      await sleepMs(intervalMs);
    }

    if (typeof lastList === "number") {
      return { count: lastList, groupName: (lastInfo && lastInfo.groupName) || "", source: `member_list(last,tries=${maxTries})` };
    }
    if (lastInfo && typeof lastInfo.count === "number") {
      return { count: lastInfo.count, groupName: lastInfo.groupName || "", source: `group_info(last,tries=${maxTries})` };
    }
    return null;
  }

  async function onGroupIncrease(groupId, userId) {
    return enqueueGroup(groupId, async () => {
      if (!groupId) return;
      const enabled = isEnabledForGroup(groupId);
      if (!enabled) {
        logJoin("入群跳过", "groupId=", groupId, "userId=", userId, "reason=disabled");
        return;
      }

      const info = await getFreshMemberCount(groupId);
      if (!info) {
        logJoin("入群失败", "groupId=", groupId, "userId=", userId, "reason=no_member_count");
        return;
      }

      const count = info.count;
      const replyText = pickReplyText(count);
      if (!replyText || !String(replyText).trim()) {
        logJoin("入群不回复", "groupId=", groupId, "userId=", userId, "count=", count, "source=", info.source);
        return;
      }

      const message = formatText(replyText, {
        count,
        groupId,
        groupName: info.groupName,
        userId,
      });
      if (!String(message).trim()) {
        logJoin("入群不回复", "groupId=", groupId, "userId=", userId, "count=", count, "source=", info.source);
        return;
      }

      try {
        const gidNum = Number(normalizeGroupId(groupId));
        const sendResp = await wsCall("send_group_msg", { group_id: gidNum || groupId, message });
        logJoin(
          "入群已回复",
          "groupId=",
          groupId,
          "userId=",
          userId,
          "count=",
          count,
          "source=",
          info.source,
          "retcode=",
          sendResp && sendResp.retcode,
          "status=",
          sendResp && sendResp.status
        );
      } catch (e) {
        logJoin("入群异常", "groupId=", groupId, "userId=", userId, "err=", String(e && e.message ? e.message : e));
      }
    });
  }

  ext.onLoad = () => {
    connectWs();
  };

  connectWs();
}

