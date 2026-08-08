// ==UserScript==
// @name         绿色三角洲规则
// @author       狼, bug
// @version      1.0.1
// @description  绿色三角洲TRPG规则插件，支持完整的角色卡、检定、理智检定等功能，使用 .DGhelp 获取帮助 
// @timestamp    1759931652
// @homepageURL  https://github.com/sealdice/sealdice-dg
// ==/UserScript==

(() => {
  // src/data.ts
  var dgTemplate = {
    "name": "DG",
    "fullName": "绿色三角洲规则",
    "authors": ["狼", "bug"],
    "version": "1.0.1",
    "updatedTime": "20251008",
    "templateVer": "1.0.1",
    "setConfig": {
      "diceSides": 100,
      "enableTip": "已切换至百分骰(d100),进入绿色三角洲模式",
      "keys": ["dg", "绿色三角洲"],
      "relatedExt": ["coc7", "dg"]
    },
    "nameTemplate": {
      "dg": {
        "template": "{$t玩家_RAW} HP{体力}/{体力上限} SAN{理智}/{理智上限} DEX{敏捷}",
        "helpText": "绿色三角洲人物卡"
      }
    },
    "attrConfig": {
      "top": ["力量", "体质", "敏捷", "智力", "意志", "魅力", "体力", "理智", "毅力", "崩溃点"],
      "showAs": {
        "HP": "{体力}/{体力上限}",
        "SAN": "{理智}/{理智上限}",
        "BP": "{崩溃点}",
        "WP": "{毅力}"
      }
    },
    "defaults": {
      "会计学": 10,
      "警觉": 20,
      "运动": 30,
      "行政": 10,
      "犯罪学": 10,
      "乔装": 10,
      "闪避": 30,
      "机动车驾驶": 20,
      "射击": 20,
      "急救": 10,
      "重型机械": 10,
      "历史": 10,
      "人源情报": 10,
      "近战武器": 30,
      "导航": 10,
      "神秘学": 10,
      "说服": 20,
      "精神治疗": 10,
      "骑术": 10,
      "搜寻": 20,
      "潜藏": 10,
      "生存": 10,
      "游泳": 20,
      "徒手搏斗": 40
    },
    "defaultsComputed": {
      "体力上限": "((力量 + 体质 + 9) / 10) | 0",
      "理智上限": "意志",
      "毅力": "意志 / 5",
      "崩溃点": "理智上限 - 意志"
    },
    "alias": {
      "力量": ["str", "STR"],
      "体质": ["con", "CON"],
      "敏捷": ["dex", "DEX"],
      "智力": ["int", "INT"],
      "意志": ["pow", "POW"],
      "魅力": ["cha", "CHA"],
      "理智": ["san", "SAN"],
      "毅力": ["wp", "WP"],
      "体力": ["hp", "HP"],
      "崩溃点": ["bp", "BP"],
      "会计学": ["会计", "會計學"],
      "警觉": ["警覺"],
      "人类学": ["人類學"],
      "考古学": ["考古學"],
      "艺术（专攻）": [""],
      "炮术": ["砲術"],
      "运动": ["運動"],
      "计算机科学": ["计算机", "計算機科學"],
      "犯罪学": ["犯罪", "犯罪學"],
      "乔装": ["喬裝"],
      "闪避": ["躲避", "閃避"],
      "机动车驾驶": ["驾驶", "机动车", "機動車駕駛"],
      "射击": ["射擊"],
      "急救": [""],
      "外语（专攻）": [""],
      "法证学": ["法证"],
      "重型机械": ["机械"],
      "重型武器": [""],
      "人源情报": ["HUMINT", "humint", "human intelligence", "人力情报", "人源", "人力", "人源情報"],
      "法律": [""],
      "历史": ["曆史"],
      "医学": ["醫學"],
      "近战武器": ["近戰武器"],
      "导航": ["導航"],
      "神秘学": [""],
      "说服": ["説服"],
      "药学": ["藥學"],
      "搜寻": ["蒐尋"],
      "信号情报": ["SIGINT", "sigint", "signals intelligence", "信号", "信號情報"],
      "潜藏": ["隐藏"],
      "手术": ["手術"],
      "生存": [""],
      "游泳": ["遊泳"],
      "徒手搏斗": ["搏斗", "非自然知識"],
      "非自然知识": ["非自然"],
      "特种载具（专攻）": [""],
      "精神治疗": ["精神治療"],
      "骑术": ["騎術"]
    },
    "textMap": {
      "trpg-test": {
        "设置测试_成功": [
          ["设置完成", 1]
        ]
      }
    },
    "textMapHelpInfo": null
  };
  var helpTexts = {
    main: `绿色三角洲TRPG相应指令
使用 .set dg 切换角色卡模版
使用 .sn dg 做成绿色三角洲名片
使用 .ra <属性/技能> 进行检定
使用 .dg <数量> 生成绿色三角洲角色（默认1次,最多10次）
使用 .scdg <属性/技能> 进行理智检定并检查崩溃点
使用 .sp 抑制疯狂（消耗1d4毅力降低理智损失）
使用 .pj 进行投射（消耗1d4毅力抑制临时疯狂或精神疾病）
均可使用@进行代骰检定

详细帮助请使用：
.ra help // 查看检定详细说明
.dg help // 查看制卡详细说明
.scdg help // 查看理智检定详细说明
.sp help // 查看抑制疯狂详细说明
.pj help // 查看投射详细说明`,
    ra: `绿色三角洲检定指令：
.ra [属性/技能] // 进行检定
.ra n# [属性/技能] // 进行n次检定（最多20次，请注意空格的使用）
`,
    dg: `绿色三角洲制卡：
.dg [次数] // 生成角色（默认1次,最多10次）
示例：
  .dg // 生成1组角色
  .dg 3 // 生成3组角色`,
    scdg: `绿色三角洲理智检定：
.scdg <成功时掉san>/<失败时掉san> // 对理智进行检定，根据结果扣除理智
.scdg <失败时掉san> // 简易写法，成功时不扣san
.scdg b <成功时掉san>/<失败时掉san> // 奖励骰检定
.scdg p <成功时掉san>/<失败时掉san> // 惩罚骰检定
示例：
  .scdg 1/1d6 // 成功扣1点，失败扣1d6点
  .scdg 1d4 // 简化写法，失败扣1d4点
  .scdg b 0/1d10 // 奖励骰检定
  .scdg p 1/1d6 // 惩罚骰检定`,
    sp: `抑制疯狂：
.sp [理智损失] // 消耗1d4毅力来降低理智损失
说明：
  - 当特工损失理智时,可以通过消耗毅力来降低理智损失
  - 消耗的毅力数量为1D4
  - 消耗毅力后,必须仍有至少1点毅力才能生效
  - 降低的理智损失等于消耗的毅力数量,最低降至0
示例：
  .sp 8 // 抑制8点理智损失`,
    pj: `投射：
.pj // 消耗1d4毅力来尝试抑制临时疯狂或精神疾病
说明：
  - 从重要关系中汲取力量,帮助应对精神创伤
  - 消耗的毅力数量为1D4
  - 用于抑制临时疯狂或精神疾病的急性发作
  - 需要至少1点毅力才能使用
示例：
  .pj // 进行投射`
  };

  // src/dg-utils.ts
  function isCriticalSuccess(dice, check) {
    if (dice === 1) return true;
    const tens = Math.floor(dice / 10);
    const ones = dice % 10;
    if (tens === ones && dice <= check) {
      return true;
    }
    return false;
  }
  function isCriticalFailure(dice, check) {
    if (dice === 100 || dice === 0) return true;
    const tens = Math.floor(dice / 10);
    const ones = dice % 10;
    if (tens === ones && dice > check) {
      return true;
    }
    return false;
  }
  function makeCheck(ctx, value, dice) {
    if (!ctx || value === void 0 || dice === void 0) {
      return "检定参数错误";
    }
    const check = value;
    const formattedValue = seal.format(ctx, `${value}`);
    let text0 = `${dice}/${formattedValue || value}`;
    let text = "";
    if (isCriticalSuccess(dice, check)) {
      text = seal.formatTmpl(ctx, "COC:判定_大成功");
    } else if (isCriticalFailure(dice, check)) {
      text = seal.formatTmpl(ctx, "COC:判定_大失败");
    } else if (dice <= check) {
      text = seal.formatTmpl(ctx, "COC:判定_成功_普通");
    } else {
      text = seal.formatTmpl(ctx, "COC:判定_失败");
    }
    text0 += " " + text;
    return text0;
  }
  function roll4d6DropLowest(ctx) {
    const rolls = [];
    for (let i = 0; i < 4; i++) {
      rolls.push(parseInt(seal.format(ctx, "{1d6}")));
    }
    rolls.sort((a, b) => a - b);
    rolls.shift();
    return rolls.reduce((a, b) => a + b, 0);
  }

  // src/index.ts
  function main() {
    try {
      seal.gameSystem.newTemplate(JSON.stringify(dgTemplate));
    } catch (e) {
      console.log("注册游戏系统模板失败:", e);
    }
    let ext = seal.ext.find("绿色三角洲");
    if (!ext) {
      ext = seal.ext.new("绿色三角洲", "狼,bug人", "1.0.1");
      seal.ext.register(ext);
    }
    const cmdDGHelp = seal.ext.newCmdItemInfo();
    cmdDGHelp.name = "dghelp";
    cmdDGHelp.help = helpTexts.main;
    cmdDGHelp.solve = (ctx, msg, cmdArgs) => {
      const val = cmdArgs.getArgN(1);
      switch (val) {
        default: {
          seal.replyToSender(ctx, msg, helpTexts.main);
          return seal.ext.newCmdExecuteResult(true);
        }
      }
    };
    const cmdRa = seal.ext.newCmdItemInfo();
    cmdRa.name = "ra";
    cmdRa.help = helpTexts.ra;
    cmdRa.allowDelegate = true;
    cmdRa.solve = (ctx, msg, cmdArgs) => {
      const mctx = seal.getCtxProxyFirst(ctx, cmdArgs);
      const currentSystem = seal.vars.strGet(mctx, "$t游戏模式")[0];
      if (currentSystem !== "DG") {
        return seal.ext.newCmdExecuteResult(false);
      }
      const val = cmdArgs.getArgN(1);
      switch (val) {
        case "":
        case "help": {
          const ret = seal.ext.newCmdExecuteResult(true);
          ret.showHelp = true;
          return ret;
        }
        default: {
          const multiRollMatch = val.match(/^(\d+)#$/);
          if (multiRollMatch) {
            const rollCount = parseInt(multiRollMatch[1]);
            if (rollCount > 20) {
              seal.replyToSender(ctx, msg, "掷骰次数不能超过20次！！");
              return seal.ext.newCmdExecuteResult(true);
            }
            if (rollCount < 1) {
              seal.replyToSender(ctx, msg, "掷骰次数必须大于0");
              return seal.ext.newCmdExecuteResult(true);
            }
            const skillVal = cmdArgs.getArgN(2);
            if (!skillVal) {
              seal.replyToSender(ctx, msg, "请指定技能名称或数值，格式：.ra n# <技能/数值>");
              return seal.ext.newCmdExecuteResult(true);
            }
            let check2 = 0;
            if (!parseInt(skillVal)) {
              if (parseInt(cmdArgs.getArgN(3))) {
                check2 = parseInt(cmdArgs.getArgN(3));
              } else {
                check2 = parseInt(seal.format(mctx, `{${skillVal}}`));
              }
            } else {
              check2 = parseInt(skillVal);
            }
            const playerName = seal.format(mctx, "{$t玩家}");
            let output = `${playerName} 进行${rollCount}次检定：
`;
            for (let i = 1; i <= rollCount; i++) {
              const diceResult2 = parseInt(seal.format(mctx, "{1d100}"));
              let resultText = "";
              if (diceResult2 === 1) {
                resultText = seal.formatTmpl(ctx, "COC:判定_简短_大成功");
              } else if (diceResult2 === 100) {
                resultText = seal.formatTmpl(ctx, "COC:判定_简短_大失败");
              } else if (diceResult2 <= check2) {
                const tens = Math.floor(diceResult2 / 10);
                const ones = diceResult2 % 10;
                if (tens === ones && tens !== 0) {
                  resultText = seal.formatTmpl(ctx, "COC:判定_简短_大成功");
                } else {
                  resultText = seal.formatTmpl(ctx, "COC:判定_简短_成功_普通");
                }
              } else {
                const tens = Math.floor(diceResult2 / 10);
                const ones = diceResult2 % 10;
                if (tens === ones && tens !== 0) {
                  resultText = seal.formatTmpl(ctx, "COC:判定_简短_大失败");
                } else {
                  resultText = seal.formatTmpl(ctx, "COC:判定_简短_失败");
                }
              }
              output += `第${i}次：1D100=${diceResult2}/${check2} ${resultText}
`;
            }
            seal.replyToSender(ctx, msg, output);
            return seal.ext.newCmdExecuteResult(true);
          }
          let check = 0;
          if (!parseInt(val)) {
            if (parseInt(cmdArgs.getArgN(2))) {
              check = parseInt(cmdArgs.getArgN(2));
            } else {
              check = parseInt(seal.format(mctx, `{${val}}`));
            }
          } else {
            check = parseInt(val);
          }
          const diceResult = parseInt(seal.format(mctx, "{1d100}"));
          const result = makeCheck(mctx, check, diceResult);
          seal.replyToSender(ctx, msg, `${seal.format(mctx, "{$t玩家}")}：${result}`);
          return seal.ext.newCmdExecuteResult(true);
        }
      }
    };
    const cmdDG = seal.ext.newCmdItemInfo();
    cmdDG.name = "dg";
    cmdDG.help = helpTexts.dg;
    cmdDG.solve = (ctx, msg, cmdArgs) => {
      const sub = cmdArgs.getArgN(1);
      let times = 1;
      if (sub && sub !== "") {
        const parsed = parseInt(sub);
        if (!isNaN(parsed) && parsed > 0) {
          times = parsed;
        } else {
          seal.replyToSender(ctx, msg, "参数错误：次数必须为正整数！");
          return seal.ext.newCmdExecuteResult(true);
        }
      }
      if (times > 10) {
        seal.replyToSender(ctx, msg, "最多只能生成10次");
        return seal.ext.newCmdExecuteResult(true);
      }
      const results = [];
      for (let i = 0; i < times; i++) {
        const stats = [];
        for (let j = 0; j < 6; j++) {
          stats.push(roll4d6DropLowest(ctx));
        }
        results.push(`第${i + 1}组：${stats.join(", ")}`);
      }
      const playerName = seal.format(ctx, "{$t玩家}");
      const finalMessage = `${playerName} 的绿色三角洲角色生成：
${results.join("\n")}

请将这六个数值任意分配给：STR、CON、DEX、INT、POW、CHA`;
      seal.replyToSender(ctx, msg, finalMessage);
      return seal.ext.newCmdExecuteResult(true);
    };
    const cmdSp = seal.ext.newCmdItemInfo();
    cmdSp.name = "sp";
    cmdSp.help = helpTexts.sp;
    cmdSp.allowDelegate = true;
    cmdSp.solve = (ctx, msg, cmdArgs) => {
      const mctx = seal.getCtxProxyFirst(ctx, cmdArgs);
      const sanLossArg = cmdArgs.getArgN(1);
      if (!sanLossArg || sanLossArg === "" || sanLossArg === "help") {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
      }
      const sanLoss = parseInt(sanLossArg);
      if (isNaN(sanLoss) || sanLoss < 0) {
        seal.replyToSender(ctx, msg, "参数错误：理智损失必须为非负整数！");
        return seal.ext.newCmdExecuteResult(true);
      }
      const currentWP = parseInt(seal.format(mctx, "{毅力}"));
      if (isNaN(currentWP) || currentWP <= 0) {
        seal.replyToSender(ctx, msg, "毅力不足呢...没办法抑制疯狂！");
        return seal.ext.newCmdExecuteResult(true);
      }
      const wpCost = parseInt(seal.format(mctx, "{1d4}"));
      const newWP = currentWP - wpCost;
      if (newWP < 1) {
        seal.replyToSender(ctx, msg, `消耗毅力${wpCost}点后,毅力将会低于1点,，会无法抑制疯狂哦！`);
        return seal.ext.newCmdExecuteResult(true);
      }
      const reducedSanLoss = Math.max(0, sanLoss - wpCost);
      seal.vars.intSet(mctx, "毅力", newWP);
      const playerName = seal.format(mctx, "{$t玩家}");
      seal.replyToSender(
        ctx,
        msg,
        `${playerName} 抑制疯狂：
消耗毅力 ${wpCost} 点（剩余 ${newWP} 点）
理智损失从 ${sanLoss} 降低至 ${reducedSanLoss}`
      );
      return seal.ext.newCmdExecuteResult(true);
    };
    const cmdPj = seal.ext.newCmdItemInfo();
    cmdPj.name = "pj";
    cmdPj.help = helpTexts.pj;
    cmdPj.allowDelegate = true;
    cmdPj.solve = (ctx, msg, cmdArgs) => {
      const mctx = seal.getCtxProxyFirst(ctx, cmdArgs);
      const val = cmdArgs.getArgN(1);
      if (val === "help") {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
      }
      const currentWP = parseInt(seal.format(mctx, "{毅力}"));
      if (isNaN(currentWP) || currentWP <= 0) {
        seal.replyToSender(ctx, msg, "嗯...毅力不足呢,无法进行投射！");
        return seal.ext.newCmdExecuteResult(true);
      }
      const wpCost = parseInt(seal.format(mctx, "{1d4}"));
      const newWP = Math.max(0, currentWP - wpCost);
      seal.vars.intSet(mctx, "毅力", newWP);
      const playerName = seal.format(mctx, "{$t玩家}");
      seal.replyToSender(
        ctx,
        msg,
        `${playerName} 进行投射：
消耗毅力 ${wpCost} 点（剩余 ${newWP} 点）
尝试抑制临时疯狂或精神疾病的急性发作`
      );
      return seal.ext.newCmdExecuteResult(true);
    };
    const cmdSn = seal.ext.newCmdItemInfo();
    cmdSn.name = "sn";
    cmdSn.help = "设置群名片，使用 .sn dg 设置绿色三角洲名片";
    cmdSn.allowDelegate = true;
    cmdSn.solve = (ctx, msg, cmdArgs) => {
      const mctx = seal.getCtxProxyFirst(ctx, cmdArgs);
      const val = cmdArgs.getArgN(1);
      switch (val) {
        case "":
        case "help": {
          const ret = seal.ext.newCmdExecuteResult(true);
          ret.showHelp = true;
          return ret;
        }
        case "dg":
        case "绿色三角洲": {
          const template = dgTemplate.nameTemplate.dg.template;
          const result = seal.format(mctx, template);
          seal.setPlayerGroupCard(mctx, result);
          seal.replyToSender(mctx, msg, `已设置绿色三角洲名片：${result}`);
          return seal.ext.newCmdExecuteResult(true);
        }
        default: {
          seal.replyToSender(mctx, msg, "未知的名片模板，请使用 .sn dg 设置绿色三角洲名片");
          return seal.ext.newCmdExecuteResult(true);
        }
      }
    };
    const cmdScdg = seal.ext.newCmdItemInfo();
    cmdScdg.name = "scdg";
    cmdScdg.help = helpTexts.scdg;
    cmdScdg.allowDelegate = true;
    cmdScdg.solve = (ctx, msg, cmdArgs) => {
      const mctx = seal.getCtxProxyFirst(ctx, cmdArgs);
      const val = cmdArgs.getArgN(1);
      if (val === "" || val === "help") {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
      }
      let argText = cmdArgs.cleanArgs.trim();
      let diceExpr = "1d100";
      if (argText.startsWith("b ") || argText.startsWith("B ")) {
        diceExpr = "1d100b";
        argText = argText.substring(2).trim();
      } else if (argText.startsWith("p ") || argText.startsWith("P ")) {
        diceExpr = "1d100p";
        argText = argText.substring(2).trim();
      }
      let lossSucc = "0";
      let lossFail = "";
      if (argText.includes("/")) {
        const parts = argText.split("/");
        lossSucc = parts[0].trim();
        lossFail = parts[1].trim();
      } else {
        lossFail = argText.trim();
      }
      if (!lossFail) {
        seal.replyToSender(ctx, msg, "理智检定格式错误！\n正确格式：.scdg X/1dX 或 .scdg 1dX");
        return seal.ext.newCmdExecuteResult(true);
      }
      const san = parseInt(seal.format(mctx, "{理智}"));
      if (isNaN(san) || san <= 0) {
        seal.replyToSender(ctx, msg, "呜哇...无法读取理智值，也可能理智值归零了！");
        return seal.ext.newCmdExecuteResult(true);
      }
      let d100 = parseInt(seal.format(mctx, `{${diceExpr}}`));
      if (isNaN(d100)) {
        d100 = parseInt(seal.format(mctx, "{1d100}"));
      }
      let successRank = 0;
      let resultText = "";
      if (isCriticalSuccess(d100, san)) {
        successRank = 4;
        resultText = seal.formatTmpl(ctx, "COC:判定_大成功");
      } else if (isCriticalFailure(d100, san)) {
        successRank = -2;
        resultText = seal.formatTmpl(ctx, "COC:判定_大失败");
      } else if (d100 <= san) {
        successRank = 1;
        resultText = seal.formatTmpl(ctx, "COC:判定_成功_普通");
      } else {
        successRank = -1;
        resultText = seal.formatTmpl(ctx, "COC:判定_失败");
      }
      const lossExpr = successRank > 0 ? lossSucc : lossFail;
      let sanLoss = 0;
      if (lossExpr.toLowerCase().includes("d")) {
        sanLoss = parseInt(seal.format(mctx, `{${lossExpr}}`));
      } else {
        sanLoss = parseInt(lossExpr) || 0;
      }
      const sanNew = Math.max(0, san - sanLoss);
      seal.vars.intSet(mctx, "理智", sanNew);
      let crazyTip = "";
      if (sanNew === 0) {
        crazyTip = "\n" + seal.formatTmpl(ctx, "COC:提示_永久疯狂");
      } else if (sanLoss >= 5) {
        crazyTip = "\n" + seal.formatTmpl(ctx, "COC:提示_临时疯狂");
      }
      const currentBP = parseInt(seal.format(mctx, "{崩溃点}")) || 0;
      const powValue = parseInt(seal.format(mctx, "{意志}")) || 0;
      const fixedPOW = powValue / 5;
      let bpTip = "";
      if (sanNew <= currentBP) {
        let newBP = sanNew - fixedPOW;
        if (newBP < 0) newBP = 0;
        seal.vars.intSet(mctx, "崩溃点", newBP);
        if (san > currentBP) {
          bpTip = `
崩溃！理智值跌破崩溃点！`;
          bpTip += `崩溃点重置：${currentBP} → ${newBP}`;
          bpTip += `当前理智${sanNew} - 意志${fixedPOW}`;
        } else {
          bpTip = `
再次崩溃！理智继续下降`;
          bpTip += `崩溃点更新：${currentBP} → ${newBP}`;
        }
      }
      const playerName = seal.format(mctx, "{$t玩家}");
      let output = `${playerName} 理智检定：
`;
      output += `1D100=${d100}/${san} ${resultText}
`;
      output += `理智损失：${lossExpr}=${sanLoss}，理智值：${san} → ${sanNew}`;
      output += crazyTip;
      output += bpTip;
      seal.replyToSender(ctx, msg, output);
      return seal.ext.newCmdExecuteResult(true);
    };
    ext.cmdMap["scdg"] = cmdScdg;
    ext.cmdMap["理智检定"] = cmdScdg;
    ext.cmdMap["dg"] = cmdDG;
    ext.cmdMap["绿色三角洲"] = cmdDG;
    ext.cmdMap["ra"] = cmdRa;
    ext.cmdMap["sp"] = cmdSp;
    ext.cmdMap["抑制疯狂"] = cmdSp;
    ext.cmdMap["pj"] = cmdPj;
    ext.cmdMap["投射"] = cmdPj;
    ext.cmdMap["sn"] = cmdSn;
    ext.cmdMap["dghelp"] = cmdDGHelp;
    ext.cmdMap["绿色三角洲帮助"] = cmdDGHelp;
  }
  main();
})();
