// ==UserScript==
// @name         狩魂者骰子插件
// @author       bug
// @version      2.1.0
// @description  狩魂者TRPG骰子系统插件，使用.sh help 查看帮助。改编自Desom-fu大佬（121096913）的狩魂者插件，特别鸣谢Desom-fu大佬的无私分享！
// @timestamp    1754370401
// @homepageURL  https://github.com/bugtower100/bug-repository
// ==/UserScript==

// 狩魂者游戏系统模板
const shouhunTemplate = {
    "name": "狩魂者",
    "fullname": "狩魂者TRPG",
    "authors": ["bug"],
    "version": "2.1.0",
    "updatedTime": "20250805",

    "nameTemplate": {
        "sh": {
            "template": "{$t玩家_RAW} HP{HP}/{HPMAX} MP{MP}/{MPMAX} SHM{SHM}/{SHMMAX}",
            "helpText": "自动设置狩魂者名片"
        }
    },
    "defaults": {
        "道具点": 3,
        "运动": 0,
        "操作": 0,
        "隐秘": 0,
        "调查": 0,
        "洞察": 0,
        "说服": 0,
        "狩魂学识": 0
    },

    "defaultsComputed": {
        "武技强度": "体魄/2",
        "术法强度": "智慧/2",
        "灵能力强度": "心魂/2"
    },

    "alias": {
        "HP": ["生命值", "HP", "生命", "体力", "HITPOINTS", "血量", "hp"],
        "HPMAX": ["生命上限", "HPMAX", "生命值上限", "hpmax"],
        "MP": ["灵力值", "MP", "灵力", "魔法", "MAGICPOINTS", "mp"],
        "MPMAX": ["灵力值上限", "MPMAX", "灵力上限", "魔法上限", "MAGICPOINTSMAX", "mpmax"],
        "SHM": ["SHM", "时髦值", "时髦", "shm"],
        "SHMMAX": ["SHMMAX", "时髦值上限", "时髦上限", "shmmax"],
        "EXP": ["经验", "EXP", "exp"],
        "武技强度": ["武技强度", "武技"],
        "术法强度": ["术法强度", "术法"],
        "灵能力强度": ["灵能力强度", "灵能力"],
        "体魄": ["体魄"],
        "智慧": ["智慧"],
        "心魂": ["心魂"],
        "运动": ["运动"],
        "操作": ["操作"],
        "隐秘": ["隐秘"],
        "调查": ["调查", "侦查", "侦察"],
        "洞察": ["洞察", "感知", "心理学"],
        "说服": ["说服"],
        "狩魂学识": ["狩魂学识"],
        "警告符咒": ["警告符咒", "警告"],
        "斗法符咒": ["斗法符咒", "斗法"],
        "斗法符咒二": ["斗法符咒二", "斗法二"],
        "任务符咒": ["任务符咒", "任务"],
        "事件符咒": ["事件符咒", "事件"]
    },

    "attrConfig": {
        "top": ['HP', 'MP', 'SHM', '体质', '智慧', '魂力'],
        "sortBy": "name",
        "ignores": [],
        "showAs": {
            "HP": "{HP}/{HPMAX}",
            "MP": "{MP}/{MPMAX}",
            "SHM": "{SHM}/{SHMMAX}"
        }
    },

    "setConfig": {
        "diceSides": 20,
        "enableTip": "已切换至20面骰，并自动开启狩魂者规则。详情通过.sh help查看。",
        "keys": ["sh", "shouhun", "狩魂者"],
        "relatedExt": ["shouhun", "coc7"]
    }
};

// 注册游戏系统模板
try {
    // 使用正确的方式注册模板
    seal.gameSystem.newTemplate(JSON.stringify(shouhunTemplate));
    console.log('狩魂者模板注册成功');
} catch (e) {
    console.log('狩魂者模板注册失败:', e);
    // 如果是因为已存在而失败，这是正常的
    if (e.message && e.message.includes('已存在')) {
        console.log('狩魂者模板已存在，这是正常的');
    }
}

let ext = seal.ext.find('狩魂者');
if (!ext) {
    ext = seal.ext.new('狩魂者', 'bug', '2.0.2');
}

// 技能别名映射表 - 与海豹自带属性名称保持一致
const SKILL_ALIASES = {
    // 生命力系统
    '生命值': ['生命值', 'HP', '生命', '体力', '血量', 'hp'],
    '生命值max': ['生命值max', '生命值上限', 'HPMAX', '最大生命值', 'hpmax'],
    '魔力值': ['魔力值', 'MP', '灵力', '法力', 'mp'],
    '魔力值max': ['魔力值max', '魔力值上限', 'MPMAX', '最大魔力值', 'mpmax'],
    '狩魂值': ['狩魂值', 'SHM', '时髦值', 'shm'],
    '狩魂值max': ['狩魂值max', '狩魂值上限', 'SHMMAX', '最大狩魂值', 'shmmax'],

    // 核心属性
    '体质': ['体质', '体魄', 'CON', 'con'],
    '智慧': ['智慧', '智力', 'INT', 'int'],
    '魂力': ['魂力', '心魂', '精神', 'SOU', 'sou'],

    // 衍生属性
    '力量': ['力量', 'STR', 'str'],
    '敏捷': ['敏捷', 'DEX', 'dex'],
    '意志': ['意志', 'WIL', 'wil'],

    // 基础技能
    '格斗': ['格斗', '近战', '武技'],
    '射击': ['射击', '远程', '射术'],
    '潜行': ['潜行', '隐秘', '隐蔽'],
    '运动': ['运动', '体育', '攀爬', '体能'],
    '学识': ['学识', '知识', '狩魂学识'],
    '调查': ['调查', '侦查', '侦察', '搜索'],
    '交涉': ['交涉', '说服', '欺骗', '威吓', '社交'],
    '感知': ['感知', '洞察', 'PER', 'per'],

    // 符咒技能
    '护身符制作': ['护身符制作', '制符', '符咒制作'],
    '护身符激活': ['护身符激活', '激符', '符咒激活'],
    '灵魂感知': ['灵魂感知', '感魂', '灵感'],
    '灵魂操控': ['灵魂操控', '控魂', '操控'],
    '灵魂净化': ['灵魂净化', '净魂', '净化'],

    // 新增属性
    '武技强度': ['武技强度', '武技'],
    '术法强度': ['术法强度', '术法'],
    '灵能力强度': ['灵能力强度', '灵能力'],
    '道具点': ['道具点'],
    '操作': ['操作'],
    '隐秘': ['隐秘'],
    '洞察': ['洞察'],
    '说服': ['说服'],
    '狩魂学识': ['狩魂学识']
};

// 显示名称映射
const DISPLAY_NAMES = {
    'HP': '生命值',
    'HPMAX': '生命值上限',
    'MP': '灵力值',
    'MPMAX': '灵力值上限',
    'SHM': '时髦值',
    'SHMMAX': '时髦值上限'
};

// 获取技能的标准名称
function resolveSkillName(inputName) {
    const upperInput = inputName.toUpperCase();
    for (const [canonicalName, aliases] of Object.entries(SKILL_ALIASES)) {
        if (aliases.some(alias => alias.toUpperCase() === upperInput)) {
            return canonicalName;
        }
    }
    return inputName;
}

// 技能解析函数 - 从海豹角色卡读取属性
function resolveSkill(skillName, ctx) {
    // 直接匹配
    if (SKILL_ALIASES[skillName]) {
        return getAttributeValue(skillName, ctx);
    }

    // 别名匹配
    for (const [mainSkill, aliases] of Object.entries(SKILL_ALIASES)) {
        if (aliases.includes(skillName)) {
            return getAttributeValue(mainSkill, ctx);
        }
    }

    // 如果都没匹配到，尝试直接获取
    const value = getAttributeValue(skillName, ctx);
    return value !== 0 ? value : 0;
}

// 从海豹角色卡获取属性值
function getAttributeValue(attrName, ctx) {
    try {
        // 使用 seal.format 获取属性值，这是正确的方法
        const result = seal.format(ctx, `{${attrName}}`);
        const value = parseInt(result);

        if (!isNaN(value)) {
            return value;
        }

        // 如果解析失败，返回0
        return 0;
    } catch (error) {
        return 0;
    }
}

// 获取显示名称
function getDisplayName(internalName) {
    return DISPLAY_NAMES[internalName] || internalName;
}

// 检查边界是否有效
function isValidBoundary(expression, pos) {
    if (pos >= expression.length) {
        return true; // 字符串结束
    }
    const nextChar = expression[pos];
    return !(/[a-zA-Z\u4e00-\u9fa5]/.test(nextChar)) || nextChar.toUpperCase() === 'D';
}

// 贪婪匹配技能替换
function replaceSkillsGreedy(expression, skillDict, ctx) {
    // 获取所有可能的技能名（包括别名）
    const allSkills = [];
    for (const [canonicalName, aliases] of Object.entries(SKILL_ALIASES)) {
        for (const alias of aliases) {
            allSkills.push({ name: alias, canonical: canonicalName });
        }
    }

    // 按长度降序排序
    allSkills.sort((a, b) => b.name.length - a.name.length);

    let result = "";
    let i = 0;

    while (i < expression.length) {
        let matched = false;

        // 首先尝试直接从角色卡读取属性（优先级最高）
        let attrName = "";
        let j = i;
        while (j < expression.length) {
            const char = expression[j];
            if (/[\u4e00-\u9fa5a-zA-Z0-9]/.test(char)) {
                attrName += char;
                j++;
            } else {
                break;
            }
        }
        
        // 只有当属性名不包含骰子表达式（如"d"字符）且是有效边界时才尝试读取
        if (attrName.length > 0 && !attrName.toLowerCase().includes('d') && isValidBoundary(expression, i + attrName.length)) {
            // 尝试从角色卡直接读取属性值
            const attrValue = seal.format(ctx, `{${attrName}}`);
            const numValue = parseInt(attrValue);
            if (!isNaN(numValue)) {
                result += numValue.toString();
                i += attrName.length;
                matched = true;
            }
        }

        // 如果直接读取失败，再尝试匹配预定义技能
        if (!matched) {
            for (const skill of allSkills) {
                const skillName = skill.name;
                if (expression.substring(i).toUpperCase().startsWith(skillName.toUpperCase())) {
                    const nextPos = i + skillName.length;
                    if (isValidBoundary(expression, nextPos)) {
                        const canonicalName = skill.canonical;
                        const skillValue = skillDict[canonicalName];
                        if (skillValue !== undefined) {
                            result += skillValue.toString();
                            i = nextPos;
                            matched = true;
                            break;
                        }
                    }
                }
            }
        }

        if (!matched) {
            result += expression[i];
            i++;
        }
    }

    return result;
}

// 计算D20特殊效果
function calculateD20Effect(d20Results, isOpponent = false) {
    let effect = 0;

    if (!Array.isArray(d20Results)) {
        return effect;
    }

    for (const result of d20Results) {
        if (result === 20) {
            effect += isOpponent ? -1 : 1; // 自己的20加1，对手的20减1
        } else if (result === 1) {
            effect += isOpponent ? 1 : -1; // 自己的1减1，对手的1加1
        }
    }

    return effect;
}

// 解析骰子表达式并计算结果
function rollDiceExpression(ctx, expression) {
    try {
        const result = seal.format(ctx, `{${expression}}`);
        const match = result.match(/=(\d+)/);
        if (match) {
            return parseInt(match[1]);
        }
        return parseInt(result) || 0;
    } catch (e) {
        return 0;
    }
}

// 获取详细的骰子投掷结果，同时记录D20原始结果
function rollDiceExpressionDetailed(ctx, expression, modifiers = null, isPureNumber = false) {
    const d20Results = [];
    
    // 如果是纯数字模式，直接返回数字=数字的格式
    if (isPureNumber) {
        const value = parseInt(expression) || 0;
        return {
            detail: `${value} = ${value}`,
            value: value,
            d20Results: []
        };
    }
    
    try {
        // 首先替换表达式中的属性值
        const skillDict = {};
        for (const [skillName, aliases] of Object.entries(SKILL_ALIASES)) {
            const value = seal.vars.intGet(ctx, skillName) || 0;
            if (value !== null) {
                skillDict[skillName] = value;
            }
        }
        expression = replaceSkillsGreedy(expression, skillDict, ctx);
        
        // 如果表达式不包含骰子，尝试通过seal.format计算
        if (!expression.includes('d')) {
            try {
                const result = seal.format(ctx, `{${expression}}`);
                const value = parseInt(result) || 0;
                return {
                    detail: `${expression} = ${value}`,
                    value: value,
                    d20Results: []
                };
            } catch (e) {
                const value = parseInt(expression) || 0;
                return {
                    detail: value.toString(),
                    value: value,
                    d20Results: []
                };
            }
        }
        
        // 查找所有骰子表达式，支持多个骰子组合，包括括号表达式
        const diceRegex = /(\([^)]+\)|（[^）]+）|\d*)d(\d+)/g;
        const matches = [...expression.matchAll(diceRegex)];
        
        if (matches.length === 0) {
            // 如果没有找到骰子表达式，使用原来的方法
            const result = seal.format(ctx, `{${expression}}`);
            const value = parseInt(result) || 0;
            return {
                detail: value.toString(),
                value: value,
                d20Results: []
            };
        }
        
        let processedExpression = expression;
        const diceDetails = [];
        const diceSums = [];
        
        // 处理每个骰子表达式
        for (const match of matches) {
            const fullMatch = match[0]; // 完整匹配，如 "3d4" 或 "（心魂/2）d4"
            let diceCountStr = match[1];
            const diceSides = parseInt(match[2]);
            
            // 计算骰子数量
            let diceCount;
            if (!diceCountStr || diceCountStr === '') {
                diceCount = 1;
            } else if ((diceCountStr.startsWith('（') && diceCountStr.endsWith('）')) || (diceCountStr.startsWith('(') && diceCountStr.endsWith(')'))) {
                // 处理括号表达式，如（心魂/2）或 (心魂/2)
                const innerExpr = diceCountStr.slice(1, -1); // 去掉括号
                try {
                    const result = seal.format(ctx, `{${innerExpr}}`);
                    diceCount = parseInt(result) || 1;
                } catch (e) {
                    diceCount = 1;
                }
            } else {
                diceCount = parseInt(diceCountStr) || 1;
            }
            
            // 分别投掷每个骰子
            const diceResults = [];
            let diceSum = 0;
            
            for (let i = 0; i < diceCount; i++) {
                let diceValue;
                
                // 如果是D20且设置了固定值，使用固定值
                if (diceSides === 20 && modifiers && modifiers.fixedD20 !== null && modifiers.fixedD20 !== undefined) {
                    diceValue = modifiers.fixedD20;
                } else {
                    const rollResult = seal.format(ctx, `{1d${diceSides}}`);
                    diceValue = parseInt(rollResult);
                    if (isNaN(diceValue) || diceValue < 1) {
                        diceValue = 1;
                    }
                }
                
                diceResults.push(diceValue);
                diceSum += diceValue;
                
                // 如果是D20，记录原始结果
                if (diceSides === 20) {
                    d20Results.push(diceValue);
                }
            }
            
            // 构建这组骰子的详细显示
            let diceDetail;
            const hasChineseParen = diceCountStr && diceCountStr.startsWith('（') && diceCountStr.endsWith('）');
            const hasAsciiParen = diceCountStr && diceCountStr.startsWith('(') && diceCountStr.endsWith(')');
            if (hasChineseParen || hasAsciiParen) {
                // 对于括号表达式，显示计算过程和骰子结果，并沿用原括号样式
                const innerExpr = diceCountStr.slice(1, -1);
                const l = hasChineseParen ? '（' : '(';
                const r = hasChineseParen ? '）' : ')';
                diceDetail = `${l}${innerExpr}=${diceCount}${r}[${diceResults.join(',')}]`;
            } else {
                diceDetail = `[${diceResults.join(',')}]`;
            }
            diceDetails.push(diceDetail);
            diceSums.push(diceSum);
            
            // 在表达式中替换骰子为具体数值
            processedExpression = processedExpression.replace(fullMatch, diceSum.toString());
        }
        
        // 计算最终结果（包括修正值）
        let finalValue;
        try {
            // 使用更安全的表达式求值
            finalValue = Function('"use strict"; return (' + processedExpression + ')')();
            if (isNaN(finalValue)) {
                finalValue = 0;
            }
        } catch (e) {
            // 如果Function求值失败，回退到seal.format
            const finalResult = seal.format(ctx, `{${processedExpression}}`);
            finalValue = parseInt(finalResult) || 0;
        }
        
        // 构建完整的详细显示
        let detailExpression = expression;
        let detailParts = [];
        let baseValue = 0;
        
        // 计算基础值（非骰子部分）
        let baseExpression = expression;
        for (let match of matches) {
            baseExpression = baseExpression.replace(match[0], '0');
        }
        try {
            baseValue = Function('"use strict"; return (' + baseExpression + ')')() || 0;
        } catch (e) {
            baseValue = 0;
        }
        
        // 构建详细格式：表达式=基础值+{骰子结果}(小计)+{骰子结果}(小计)=总计
        let detailStr = expression + '=';
        if (baseValue !== 0) {
            detailStr += baseValue;
        }
        
        // 添加每个骰子组的详细信息
        for (let i = 0; i < diceDetails.length; i++) {
            const diceDetail = diceDetails[i];
            const diceSum = diceSums[i];
            
            if (baseValue !== 0 || i > 0) {
                detailStr += '+';
            }
            detailStr += `${diceDetail}(${diceSum})`;
        }
        
        detailStr += `=${finalValue}`;
        const detail = detailStr;
        
        return {
            detail: detail,
            value: finalValue,
            d20Results: d20Results
        };
    } catch (e) {
        return {
            detail: expression + ' = 0',
            value: 0,
            d20Results: []
        };
    }
}

// 注意：extractD20Results函数已被移除，现在直接从rollDiceExpressionDetailed获取D20结果

// 处理shm值增加的辅助函数
function processShmIncrease(ctx, shmExpression) {
    if (!shmExpression) {
        return {
            shmIncrease: 0,
            shmDetail: null,
            originalShm: 0,
            newShm: 0
        };
    }

    try {
        // 获取当前shm值，确保转换为数字
        const currentShmRaw = seal.vars.intGet(ctx, `SHM`);
        const currentShm = parseInt(currentShmRaw) || 0;
        
        // 获取技能数据用于表达式替换
        const skillDict = {};
        for (const [canonicalName] of Object.entries(SKILL_ALIASES)) {
            const valueRaw = seal.vars.intGet(ctx, canonicalName);
            const value = parseInt(valueRaw) || 0;
            skillDict[canonicalName] = value;
            const aliases = SKILL_ALIASES[canonicalName];
            if (aliases) {
                for (const alias of aliases) {
                    skillDict[alias] = value;
                }
            }
        }
        
        // 替换技能名称
        const resolvedExpression = replaceSkillsGreedy(shmExpression, skillDict, ctx);
        
        // 移除表达式中可能残留的~符号，确保rollDiceExpressionDetailed能正确处理
        const cleanExpression = resolvedExpression.replace(/~/g, '');
        
        // 计算shm增加值
        const shmRoll = rollDiceExpressionDetailed(ctx, cleanExpression, null, false);
        const shmIncrease = shmRoll.value;
        
        const newShm = currentShm + shmIncrease;
        
        // 更新shm值
        seal.vars.intSet(ctx, `SHM`, newShm);
        
        // 更新群名片
        try {
            const nameTemplate = "{$t玩家_RAW} HP{HP}/{HPMAX} MP{MP}/{MPMAX} SHM{SHM}/{SHMMAX}";
            seal.setPlayerGroupCard(ctx, nameTemplate);
        } catch (error) {
            // 名片更新失败不影响主要功能
        }
        
        return {
            shmIncrease,
            shmDetail: shmRoll.detail,
            originalShm: currentShm,
            newShm,
            resolvedExpression
        };
    } catch (error) {
        return {
            shmIncrease: 0,
            shmDetail: `计算失败: ${error.message}`,
            originalShm: 0,
            newShm: 0,
            error: error.message
        };
    }
}

// 狩魂者检定主函数
function performShouhunCheck(ctx, frontExpr, backExpr, modifiers, isPureNumber = false) {
    try {
        // 处理shm增加表达式
        const shmResult = processShmIncrease(ctx, modifiers.shmExpression);
        // 纯数字模式处理
        if (isPureNumber) {
            const frontValue = parseInt(frontExpr) + shmResult.shmIncrease;
            const backValue = parseInt(backExpr);
            
            // 计算基础成功等级（纯数字模式不受D20影响）
            const baseSuccess = Math.max(0, Math.floor((frontValue - backValue + 4) / 5));
            
            // 应用修正（但不包括D20效果）
            let finalSuccess = baseSuccess;
            finalSuccess += modifiers.selfBonus || 0;
            finalSuccess -= modifiers.selfPenalty || 0;
            finalSuccess -= modifiers.opponentBonus || 0;
            finalSuccess += modifiers.opponentPenalty || 0;
            finalSuccess = Math.max(0, finalSuccess);
            
            // 构建纯数字模式的成功等级计算显示
            let successCalculation = `${baseSuccess}`;
            let hasModifiers = false;
            
            // 添加修正项
            if (modifiers.selfBonus) {
                successCalculation += `+${modifiers.selfBonus}（己方奖励等级）`;
                hasModifiers = true;
            }
            if (modifiers.selfPenalty) {
                successCalculation += `-${modifiers.selfPenalty}（己方惩罚等级）`;
                hasModifiers = true;
            }
            if (modifiers.opponentBonus) {
                successCalculation += `-${modifiers.opponentBonus}（对方奖励等级）`;
                hasModifiers = true;
            }
            if (modifiers.opponentPenalty) {
                successCalculation += `+${modifiers.opponentPenalty}（对方惩罚等级）`;
                hasModifiers = true;
            }
            
            // 如果有修正项，显示等号和最终结果
            if (hasModifiers) {
                successCalculation += `=${finalSuccess}`;
            }
            
            // 如果没有修正项且基础成功等级不等于最终成功等级（由于max(0,...)的影响），显示最终结果
            if (!hasModifiers && baseSuccess !== finalSuccess) {
                successCalculation = `max(0, ${baseSuccess})=${finalSuccess}`;
            }
            
            // 构建前式详细信息，包含shm增加
            let frontDetailText = frontExpr;
            if (shmResult.shmIncrease > 0) {
                frontDetailText += `+${shmResult.shmDetail}`;
            }
            frontDetailText += `=${frontValue}`;

            return {
                frontResult: frontValue,
                backResult: backValue,
                adjustedBackResult: backValue,
                successLevel: finalSuccess,
                isSuccess: frontValue >= backValue,
                frontDetail: frontDetailText,
                backDetail: `${backExpr} = ${backValue}`,
                frontD20s: [], // 纯数字模式没有D20
                backD20s: [],
                baseSuccess,
                successCalculation,
                originalFrontExpr: frontExpr,
                originalBackExpr: backExpr,
                resolvedFrontExpr: frontExpr,
                resolvedBackExpr: backExpr,
                finalFrontExpr: frontExpr,
                finalBackExpr: backExpr,
                skillReplacementOccurred: false,
                modifiers,
                isPureNumber: true,
                shmResult // 添加shm结果信息
            };
        }
        
        // 获取角色技能数据
        const skillDict = {};

        // 从角色卡获取技能值
        for (const [canonicalName] of Object.entries(SKILL_ALIASES)) {
            const value = seal.vars.intGet(ctx, canonicalName) || 0;
            skillDict[canonicalName] = value;

            // 同时为所有别名创建映射
            const aliases = SKILL_ALIASES[canonicalName];
            if (aliases) {
                for (const alias of aliases) {
                    skillDict[alias] = value;
                }
            }
        }
        
        // 技能替换
        const frontResolved = replaceSkillsGreedy(frontExpr, skillDict, ctx);
        const backResolved = replaceSkillsGreedy(backExpr, skillDict, ctx);

        // 直接使用解析后的表达式
        let frontFinal = frontResolved;
        let backFinal = backResolved;
        
        // 为前式和后式分别创建修正器对象
        const frontModifiers = {
            ...modifiers,
            fixedD20: modifiers.frontFixedD20
        };
        const backModifiers = {
            ...modifiers,
            fixedD20: modifiers.backFixedD20
        };
        
        // 计算骰子结果
        const frontRoll = rollDiceExpressionDetailed(ctx, frontFinal, frontModifiers, false);
        const backRoll = rollDiceExpressionDetailed(ctx, backFinal, backModifiers, false);
        const frontResult = frontRoll.value + shmResult.shmIncrease;
        const backResult = backRoll.value;

        // 获取D20结果用于特殊效果计算
        const frontD20s = frontRoll.d20Results;
        const backD20s = backRoll.d20Results;

        // 计算基础成功等级
        const baseSuccess = Math.max(0, Math.floor((frontResult - backResult + 4) / 5));

        // 计算D20特殊效果
        const frontD20Bonus = calculateD20Effect(frontD20s, false);
        const backD20Bonus = calculateD20Effect(backD20s, true);

        // 计算修正
        let finalSuccess = baseSuccess;
        finalSuccess += modifiers.selfBonus || 0;
        finalSuccess -= modifiers.selfPenalty || 0;
        finalSuccess -= modifiers.opponentBonus || 0;
        finalSuccess += modifiers.opponentPenalty || 0;
        finalSuccess += frontD20Bonus + backD20Bonus;

        // 确保成功等级至少为0
        finalSuccess = Math.max(0, finalSuccess);

        // 计算修正后的挑战值（用于显示）
        let adjustedBackResult = backResult;
        // 注意：对方奖励和惩罚只影响成功等级，不影响挑战值显示
        // adjustedBackResult += modifiers.opponentBonus || 0;
        // adjustedBackResult -= modifiers.opponentPenalty || 0;

        // 构建成功等级计算过程
        const baseSuccessValue = Math.floor((frontResult - backResult + 4) / 5);
        const totalD20Bonus = frontD20Bonus + backD20Bonus;
        
        // 构建详细的成功等级计算显示 - 新格式：基础+修正项=总计
        // 基础成功等级显示为max(0, 计算值)
        const displayBaseSuccess = Math.max(0, baseSuccessValue);
        let successCalculation = `${displayBaseSuccess}`;
        let hasModifiers = false;
        
        // 添加修正项
        if (modifiers.selfBonus) {
            successCalculation += `+${modifiers.selfBonus}（己方奖励等级）`;
            hasModifiers = true;
        }
        if (modifiers.selfPenalty) {
            successCalculation += `-${modifiers.selfPenalty}（己方惩罚等级）`;
            hasModifiers = true;
        }
        if (modifiers.opponentBonus) {
            successCalculation += `-${modifiers.opponentBonus}（对方奖励等级）`;
            hasModifiers = true;
        }
        if (modifiers.opponentPenalty) {
            successCalculation += `+${modifiers.opponentPenalty}（对方惩罚等级）`;
            hasModifiers = true;
        }
        
        // 显示前式D20效果（大成功和大失败都要显示）
        if (frontD20Bonus !== 0) {
            const frontD20Text = frontD20s.includes(20) ? '大成功' : (frontD20s.includes(1) ? '大失败' : '');
            successCalculation += `${frontD20Bonus > 0 ? '+' : ''}${frontD20Bonus}（${frontD20Text}）`;
            hasModifiers = true;
        }
        
        // 如果有修正项，显示等号和最终结果
        if (hasModifiers) {
            successCalculation += `=${finalSuccess}`;
        }
        
        // 如果没有修正项且基础成功等级不等于最终成功等级（由于max(0,...)的影响），显示最终结果
        if (!hasModifiers && baseSuccessValue !== finalSuccess) {
            successCalculation = `max(0, ${baseSuccessValue})=${finalSuccess}`;
        }

        // 构建前式详细信息，包含shm增加
        let frontDetailText = frontRoll.detail;
        if (shmResult.shmIncrease > 0) {
            // 从原始detail中提取总值
            const originalTotal = frontRoll.value;
            const newTotal = frontResult;
            // 重新构建detail，显示shm增加
            frontDetailText = frontDetailText.replace(`=${originalTotal}`, `+${shmResult.shmDetail}=${newTotal}`);
        }

        const result = {
            frontResult,
            backResult,
            adjustedBackResult, // 添加修正后的挑战值
            successLevel: finalSuccess,
            isSuccess: frontResult >= backResult,
            frontDetail: frontDetailText,
            backDetail: backRoll.detail,
            frontD20s,
            backD20s,
            baseSuccess,
            successCalculation,
            // 添加技能替换信息
            originalFrontExpr: frontExpr,
            originalBackExpr: backExpr,
            resolvedFrontExpr: frontResolved,
            resolvedBackExpr: backResolved,
            finalFrontExpr: frontFinal,
            finalBackExpr: backFinal,
            skillReplacementOccurred: frontExpr !== frontResolved || backExpr !== backResolved,
            // 添加修正项信息
            modifiers,
            shmResult // 添加shm结果信息
        };
        
        return result;
    } catch (error) {
        throw new Error(`检定计算失败: ${error.message}`);
    }
}

// 创建命令执行结果
function cmdResultRegular() {
    return seal.ext.newCmdExecuteResult(true);
}

function cmdResultHelp() {
    const result = seal.ext.newCmdExecuteResult(true);
    result.showHelp = true;
    return result;
}

// 解析狩魂者指令
function parseShouhunCommand(cmdText) {
    const modifiers = {
        isHidden: false,
        selfBonus: 0,
        selfPenalty: 0,
        opponentBonus: 0,
        opponentPenalty: 0,
        frontFixedD20: null,  // 前式固定d20出目值
        backFixedD20: null,   // 后式固定d20出目值
        removeDefaultD20: false,  // m参数：移除默认1d20
        shmExpression: null   // ~参数：增加shm值的表达式
    };

    let remaining = cmdText;

    // 首先处理~参数，因为它可能出现在表达式中间
    const shmMatch = remaining.match(/~([^#]+)/);
    if (shmMatch) {
        const shmExpr = shmMatch[1].trim();
        
        if (shmExpr) {
            modifiers.shmExpression = shmExpr;
        }
        
        // 从remaining中移除~参数部分
        remaining = remaining.replace(/~[^#]+/, '');
    }

    // 循环解析所有参数，直到没有更多参数为止
    let hasMoreParams = true;
    while (hasMoreParams) {
        hasMoreParams = false;
        
        // 检测x数字格式（控制前式d20出目）
        const fixedD20Match = remaining.match(/^x(\d+)\s*/);
        if (fixedD20Match) {
            const fixedValue = parseInt(fixedD20Match[1]);
            if (fixedValue >= 1 && fixedValue <= 20) {
                modifiers.frontFixedD20 = fixedValue;
                remaining = remaining.substring(fixedD20Match[0].length);
                hasMoreParams = true;
                continue;
            }
        }

        // 检测m参数 - 移除默认1d20
        if (remaining.startsWith('m')) {
            modifiers.removeDefaultD20 = true;
            if (remaining.startsWith('m ')) {
                // 有空格的情况：.sh m 5d6
                remaining = remaining.substring(2);
            } else if (remaining === 'm') {
                // 只有m的情况：.sh m
                remaining = remaining.substring(1);
            } else {
                // 无空格的情况：.shm5d6
                remaining = remaining.substring(1);
            }
            hasMoreParams = true;
            continue;
        }

        // 检测暗骰 - 支持.shh格式（不需要空格）
        if (remaining.startsWith('h')) {
            modifiers.isHidden = true;
            if (remaining.startsWith('h ')) {
                // 有空格的情况：.sh h 体质
                remaining = remaining.substring(2);
            } else if (remaining === 'h') {
                // 只有h的情况：.sh h
                remaining = remaining.substring(1);
            } else {
                // 无空格的情况：.shh体质
                remaining = remaining.substring(1);
            }
            hasMoreParams = true;
            continue;
        }

        // 解析奖励/惩罚
        const bpMatch = remaining.match(/^([bp])(\d+)/);
        if (bpMatch) {
            const type = bpMatch[1];
            const value = parseInt(bpMatch[2]);
            if (type === 'b') {
                modifiers.selfBonus = value;
            } else {
                modifiers.selfPenalty = value;
            }
            remaining = remaining.substring(bpMatch[0].length).trim();
            hasMoreParams = true;
            continue;
        }
    }



    // 分离前式和后式
    const parts = remaining.split('#');
    let frontExpr = parts[0].trim() || '1d20';
    let backExpr = parts[1] || '10';

    // 检测前式是否为纯数字模式或以数字开头
    const isPureNumber = frontExpr.match(/^\d+$/);
    const startsWithNumber = frontExpr.match(/^\d+/);
    
    // 如果前式不包含骰子表达式且不是纯数字且不以数字开头，自动添加1d20
    // 但如果有m参数且没有x参数（x参数为null），则不添加默认1d20
    const shouldAddDefaultD20 = !modifiers.removeDefaultD20 || modifiers.frontFixedD20 !== null;
    
    if (frontExpr && !frontExpr.includes('d') && !isPureNumber && !startsWithNumber && shouldAddDefaultD20) {
        // 如果前式以+开头，直接拼接；否则添加+号
        if (frontExpr.startsWith('+')) {
            frontExpr = '1d20' + frontExpr;
        } else {
            frontExpr = '1d20+' + frontExpr;
        }
    }

    // 解析后式的参数（x、h、b、p）
    if (parts[1]) {
        backExpr = backExpr.trim();
        
        // 循环解析后式的所有参数，直到没有更多参数为止
        let hasMoreBackParams = true;
        while (hasMoreBackParams) {
            hasMoreBackParams = false;
            
            // 检测后式的x数字格式（控制后式d20出目）
            const backFixedD20Match = backExpr.match(/^x(\d+)\s*(.*)/);
            if (backFixedD20Match) {
                const fixedValue = parseInt(backFixedD20Match[1]);
                if (fixedValue >= 1 && fixedValue <= 20) {
                    // 后式的x参数只影响后式的fixedD20
                    modifiers.backFixedD20 = fixedValue;
                    backExpr = backFixedD20Match[2].trim() || '10';
                    hasMoreBackParams = true;
                    continue;
                }
            }
            
            // 检测后式的暗骰
            if (backExpr.startsWith('h')) {
                modifiers.isHidden = true;
                if (backExpr.startsWith('h ')) {
                    backExpr = backExpr.substring(2);
                } else if (backExpr === 'h') {
                    backExpr = '10';
                } else {
                    backExpr = backExpr.substring(1);
                }
                hasMoreBackParams = true;
                continue;
            }
            
            // 解析后式的奖励/惩罚
            const backBpMatch = backExpr.match(/^([bp])(\d+)\s*(.*)/);
            if (backBpMatch) {
                const type = backBpMatch[1];
                const value = parseInt(backBpMatch[2]);
                if (type === 'b') {
                    modifiers.opponentBonus = value;
                } else {
                    modifiers.opponentPenalty = value;
                }
                backExpr = backBpMatch[3].trim() || '10';
                hasMoreBackParams = true;
                continue;
            }
        }
    }

    // 如果后式不包含骰子表达式且不是纯数字，自动添加1d20
    if (backExpr && !backExpr.includes('d') && !backExpr.match(/^\d+$/)) {
        // 如果后式以+开头，直接拼接；否则添加+号
        if (backExpr.startsWith('+')) {
            backExpr = '1d20' + backExpr;
        } else {
            backExpr = '1d20+' + backExpr;
        }
    }

    return { frontExpr, backExpr, modifiers, isPureNumber: !!isPureNumber };
}

// 狩魂者检定指令处理函数
function handleShouhunCheck(mctx, msg, cmdArgs) {
    const cmdText = cmdArgs.getRestArgsFrom(1).trim();

    // 处理help请求
    if (cmdText.toLowerCase() === 'help') {
        return cmdResultHelp();
    }

    // 处理空指令，默认进行1d20对抗挑战值10的检定
    let processedCmdText = cmdText;
    if (!cmdText) {
        processedCmdText = '1d20#10';
    } else {
        // 解析指令以检查是否需要添加默认骰和挑战值
        const tempParsed = parseShouhunCommand(cmdText);
        let frontExpr = tempParsed.frontExpr;
        let backExpr = tempParsed.backExpr;
        
        // 检查前式是否包含d20，如果没有且不是纯数字且没有m参数则添加默认骰
        const shouldAddFrontD20 = !tempParsed.modifiers.removeDefaultD20 || tempParsed.modifiers.frontFixedD20 !== null;
        if (!frontExpr.toLowerCase().includes('d20') && !tempParsed.isPureNumber && shouldAddFrontD20) {
            if (frontExpr) {
                // 如果前式以+开头，不要重复添加+号
                if (frontExpr.startsWith('+')) {
                    frontExpr = `1d20${frontExpr}`;
                } else {
                    frontExpr = `1d20+${frontExpr}`;
                }
            } else {
                frontExpr = '1d20';
            }
        }
        
        // 如果没有挑战值，添加默认挑战值10
        if (!backExpr) {
            backExpr = '10';
        } else {
            // 检查后式是否为纯数字，如果不是且不包含d20且没有m参数，则添加默认骰
            const isNumeric = /^\d+$/.test(backExpr.trim());
            const shouldAddBackD20 = !tempParsed.modifiers.removeDefaultD20 || tempParsed.modifiers.backFixedD20 !== null;
            if (!isNumeric && !backExpr.toLowerCase().includes('d20') && shouldAddBackD20) {
                // 如果后式以+开头，不要重复添加+号
                if (backExpr.startsWith('+')) {
                    backExpr = `1d20${backExpr}`;
                } else {
                    backExpr = `1d20+${backExpr}`;
                }
            }
        }
        
        // 重新构建指令文本
        let frontModifierText = '';
        if (tempParsed.modifiers.frontFixedD20 !== null) frontModifierText += `x${tempParsed.modifiers.frontFixedD20}`;
        if (tempParsed.modifiers.isHidden) frontModifierText += 'h';
        if (tempParsed.modifiers.selfBonus > 0) frontModifierText += `b${tempParsed.modifiers.selfBonus}`;
        if (tempParsed.modifiers.selfPenalty > 0) frontModifierText += `p${tempParsed.modifiers.selfPenalty}`;
        
        let backModifierText = '';
        if (tempParsed.modifiers.backFixedD20 !== null) backModifierText += `x${tempParsed.modifiers.backFixedD20}`;
        if (tempParsed.modifiers.opponentBonus > 0) backModifierText += `b${tempParsed.modifiers.opponentBonus}`;
        if (tempParsed.modifiers.opponentPenalty > 0) backModifierText += `p${tempParsed.modifiers.opponentPenalty}`;
        
        // 构建前式部分
        let frontPart = '';
        if (frontModifierText && frontExpr) {
            frontPart = `${frontModifierText} ${frontExpr}`;
        } else {
            frontPart = `${frontModifierText}${frontExpr}`;
        }
        
        // 添加SHM表达式（如果存在）
        if (tempParsed.modifiers.shmExpression) {
            frontPart += `~${tempParsed.modifiers.shmExpression}`;
        }
        
        // 构建后式部分
        let backPart = '';
        if (backModifierText && backExpr) {
            backPart = `${backModifierText} ${backExpr}`;
        } else {
            backPart = `${backModifierText}${backExpr}`;
        }
        
        processedCmdText = `${frontPart}#${backPart}`;
    }

    try {
        const { frontExpr, backExpr, modifiers, isPureNumber } = parseShouhunCommand(processedCmdText);
        const result = performShouhunCheck(mctx, frontExpr, backExpr, modifiers, isPureNumber);

        // 格式化结果消息
        let replyText = `${seal.format(mctx, '{$t玩家}') || '未知'}进行了命运的掷骰！\n--------------------\n`;
        
        // 详细出值显示格式
        function formatFrontResult() {
            let frontText = `出值：${result.frontDetail}`;
            // 不在出值行显示大成功大失败标记，只在结果行显示
            return frontText;
        }
        
        // 详细挑战值显示格式
         function formatBackResult() {
             let backText = `挑战值：${result.backDetail}`;
             // 后式大成功大失败不在挑战值行显示，只在成功等级计算中显示
             return backText;
         }
        
        replyText += `${formatFrontResult()}\n`;
        replyText += `${formatBackResult()}\n`;
        
        // 添加结果判断行（在第二个分隔线之前）
        function formatResultLine() {
            let resultText = '';
            
            // 判断主要结果类型
            if (result.frontResult <= result.backResult) {
                // 真正的失败：出值小于等于挑战值
                resultText = '（失败）唔，失败了，真是可惜呢...不过这也命运的选择不是？';
            } else if (result.successLevel === 0) {
                // 成功等级为0但出值大于挑战值
                resultText = '（成功）嗯...多多少少算是可以了，不过你只向往这种平庸的成功吗？';
            } else {
                // 正常成功：显示成功等级
                resultText = '（成功）能做到这样也是很不错了~还要继续加油呀！';
            }
            
            // 检查是否有大成功或大失败，但要考虑实际成败结果
            const hasFrontCrit = result.frontD20s.includes(20);
            const hasFrontFumble = result.frontD20s.includes(1);
            const hasBackCrit = result.backD20s.includes(20);
            const hasBackFumble = result.backD20s.includes(1);
            
            // 优先级：前式大失败 > 前式大成功 > 普通成败结果
            // 注意：挑战大成功大失败不单独显示，只影响成败判断
            if (hasFrontFumble) {
                resultText = '（大失败）诶...这可不是我的问题...！';
            } else if (hasFrontCrit) {
                resultText = '（大成功）哼哼，这也有我的一份力吧~！';
            }
            // 如果没有前式大成功大失败，则保持原有的成败判断结果
            
            return resultText;
        }
        
        replyText += `${formatResultLine()}\n`;
        replyText += `--------------------\n`;
        
        // 成功等级显示格式
        function formatSuccessLevel() {
            if (result.successCalculation && result.successCalculation.includes('=')) {
                return `成功等级：${result.successCalculation}`;
            } else {
                return `成功等级：${result.successLevel}`;
            }
        }
        
        replyText += `${formatSuccessLevel()}`;

        // 显示shm增加信息
        if (result.shmResult && result.shmResult.shmIncrease > 0) {
            replyText += `\n时髦值增加：${result.shmResult.originalShm} + ${result.shmResult.shmIncrease} = ${result.shmResult.newShm}`;
        }

        // D20特殊效果已计算在成功等级中，不再单独显示

        // 发送结果
        if (modifiers.isHidden) {
            seal.replyPerson(mctx, msg, replyText);
            seal.replyToSender(mctx, msg, `${seal.format(mctx, '{$t玩家}')} 进行了一次暗骰检定`);
        } else {
            seal.replyToSender(mctx, msg, replyText);
        }

    } catch (error) {
        console.log('狩魂者检定错误:', error);
        seal.replyToSender(mctx, msg, `检定失败：${error.message || '未知错误'}`);
    }

    return cmdResultRegular();
}

// 回复函数简化
function replyToSender(ctx, msg, text) {
    try {
        seal.replyToSender(ctx, msg, text);
    } catch (e) {
        console.log('回复失败:', e);
    }
}

function replyPerson(ctx, msg, text) {
    try {
        seal.replyPerson(ctx, msg, text);
    } catch (e) {
        console.log('私聊回复失败:', e);
    }
}

// 创建狩魂者检定指令
const cmdShouhun = seal.ext.newCmdItemInfo();
cmdShouhun.name = 'sh';
// 启用代骰功能，允许@某人时获取对方数据
cmdShouhun.allowDelegate = true;
cmdShouhun.help = `=== 狩魂者TRPG骰子插件 ===
【角色卡管理】
.set sh/狩魂者 - 切换到狩魂者游戏系统
.sn sh 自动更改狩魂者名片

【检定指令】
.sh [参数][表达式][#[参数][表达式]]
.sh @某人 [参数][表达式][#[参数][表达式]] - 代骰功能

【参数说明】
h     - 暗骰，结果私发给投掷者（前式和后式均可使用）
b数字 - 奖励成功等级（如：b2，前式增加己方奖励，后式增加对方奖励）
p数字 - 惩罚成功等级（如：p1，前式增加己方惩罚，后式增加对方惩罚）
x数字 - 控制d20出目（如：x15，固定d20出目为15，前式和后式均可使用）
m     - 移除默认1d20，完全自定义检定表达式（x参数会覆盖m参数）
~表达式 - 增加时髦值（SHM），表达式结果同时加到前式检定结果和人物卡SHM属性中
#     - 分隔前式(出值)和后式(挑战值)

【默认骰机制】
• 系统会自动为所有检定添加1d20作为默认骰
• 如果表达式中已包含d20，则不会重复添加
• 没有挑战值时，默认使用挑战值10

【示例】
如要进行一次有三个加骰和两个时髦骰的掷骰，则输入.sh3d4+2d6

如要进行一次D20的值被固定为15，有四个加骰和三个时髦骰，连续第二次进行反击的掷骰，去对抗敌人有两个加骰的攻击掷骰
则输入.shp2x15+4d4+3d6#d20+2d4

【m参数示例】
.shm5d6#10                 - 纯骰子检定，无默认D20
.shm b2+5d6+2d4#p12          - 组合参数使用，移除默认D20并添加奖励
.shmx15+5d6#10              - x参数覆盖m参数，固定D20为15并保留5d6

【~参数示例】
.sh9d4~3d6#15              - 检定并增加时髦值，3d6的结果同时加到检定和SHM属性
.sh体魄~2d4+1#12           - 体魄检定并增加时髦值
.shb1~5#10                 - 带奖励的检定并增加固定时髦值5点

【成功等级计算】
成功等级 = max(0, (出值 - 挑战值 + 4) / 5)
• D20大成功(20)：额外+1成功等级
• D20大失败(1)：额外-1成功等级
• D20特殊效果已自动计算在最终成功等级中
`;

cmdShouhun.solve = (ctx, msg, cmdArgs) => {
    // 获取代骰数据，支持@某人进行代骰
    const mctx = seal.getCtxProxyFirst(ctx, cmdArgs);
    return handleShouhunCheck(mctx, msg, cmdArgs);
};

// 注册指令
ext.cmdMap['sh'] = cmdShouhun;

// 注册扩展
seal.ext.register(ext);
