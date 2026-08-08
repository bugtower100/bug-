// ==UserScript==
// @name         DET简易掷骰规则
// @author       bug人@
// @version      1.0.0
// @description  基于DicEasy Trpg规则创作的快速掷骰规则
// @timestamp    20241031
// @diceRequireVer 1.0.0
// @homepageURL  https://github.com/bugtower100/bug-repository
// ==/UserScript==

//sn部分
const thedet = {
    "name": "DET",
    "fullname": "DicEasy Trpg",
    "authors": ["bug人@"],
    "version": "1.0.0",
    "updatedTime": "20241031",
    "templateVer": "1.0",

    "nameTemplate": {
        "det": {
            "template": "{$t玩家_RAW} 命运值{命运值} 生命值{hp} 精神值{精神值} ",
            "helpText": "自动设置DET名片"
        }
    },

    "defaults": {
        "命运值": 6,
    },
    "defaultsComputed": {
    },
    "alias": {
        "命运值": ["命运值"],
        "生命值": ["hp", "生命值", "HP"],
        "精神值": ["精神值"]
    },

    "attrConfig": {
        //stshow置顶内容
        "top": ['命运值', '生命值', '精神值'],
        "sortBy": "name",
        "ignores": [],
        "showAs": {
            "命运值": "{命运值}", " 生命值": "{hp}", "精神值": "{精神值}"
        },
        "setter": null,
    },


    "setConfig": {
        "diceSides": 6,
        "enableTip": "已切换至6面骰，并自动开启DET规则。详情通过.det help查看。",
        "keys": ["det"],
        "relatedExt": ["det", "coc7"],
    },

    "textMap": {
        "trpg-test": {
            "设置测试_成功": [
                ["设置完成", 1]
            ]
        }
    },
    "textMapHelpInfo": null
}

try {
    seal.gameSystem.newTemplate(JSON.stringify(thedet))
} catch (e) {
    // 如果扩展已存在，或加载失败，那么会走到这里
    console.log(e)
}

//掷骰部分

//判定部分
var exti = seal.ext.find('diceasy');
if (!seal.ext.find('diceasy')) {
    //检查扩展不存在
    exti = seal.ext.new('diceasy', 'bug人@', '1.0.0');//建立新扩展
    seal.ext.register(exti);
}
let cmdet = seal.ext.newCmdItemInfo();
cmdet.name = 'det';//指令名
cmdet.help = 'DicEasy Trpg 掷骰辅助：\n\n' +
    `.set det//设置当前骰子为6面骰，并开启DET规则\n` +
    `.sn det//设置DET名片格式\n` +
    `.det（补正值）//进行一次快速检定（特殊判定会自动进行）\n` +
    `.detx<数目>//快速生成角色基础值数目\n` +
    `.dety<数目>//快速生成儿童角色基础值数目\n` +
    `.dep//自动进行透支代价抽取和保存，使用.dep help查看详情\n\n` +
    `另：崩坏与疯狂抽取请GM根据需要使用draw指令抽取\n  .draw det可选症状\n  .draw det现代症状\n  .draw det儿童症状\n  .draw det受伤症状\n（*虽然为模组《Nyanya Purrpurr Cat》限定，主要面向“曾经受了伤，并有一定后遗症”的PC。但因为具有一定泛用性，因此还是放入以供选择。）`;

cmdet.solve = (ctx, msg, cmdArgs) => {
    cmdArgs.chopPrefixToArgsWith("x")
    cmdArgs.chopPrefixToArgsWith("y")
    let name = seal.format(ctx, "{$t玩家}");
    switch (cmdArgs.getArgN(1)) {
        case "help": {
            const ret = seal.ext.newCmdExecuteResult(true);
            ret.showHelp = true;
            return ret;
        }

        case "x": {
            let val = cmdArgs.getArgN(2) || 1
            switch (val) {
                default: {
                    let times = parseInt(val)
                    let result = seal.format(ctx, "{$t玩家_RAW}的DET属性生成:\n")
                    let split = seal.format(ctx, "\n")
                    if (!parseInt(val) || parseInt(val) == 0) {
                        const ret = seal.ext.newCmdExecuteResult(true);
                        ret.showHelp = true;
                        return ret;
                    }
                    if (times > 10) {
                        result += "制卡次数过多，请输入不大于10的数字"
                        seal.replyToSender(ctx, msg, result)
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    for (let i = 0; i < times; i++) {
                        let ret = seal.format(ctx,
                            "生命值:{$t命运值=d6+6} 精神值:{$t命运值=d6+6} 命运值:{$t命运值=2d6}"
                        )
                        result = result + ret + split
                        another = "*命运值也可使用默认值6进行游戏。"
                    }

                    seal.vars.strSet(ctx, "$t制卡结果文本", result)
                    seal.replyToSender(ctx, msg, result + another)
                }
            }
            return seal.ext.newCmdExecuteResult(true);
        }
        case "y": {
            let val = cmdArgs.getArgN(2) || 1
            switch (val) {
                default: {
                    let times = parseInt(val)
                    let result = seal.format(ctx, "{$t玩家_RAW}的DET儿童属性生成:\n")
                    let split = seal.format(ctx, "\n\n")
                    if (!parseInt(val) || parseInt(val) == 0) {
                        const ret = seal.ext.newCmdExecuteResult(true);
                        ret.showHelp = true;
                        return ret;
                    }
                    if (times > 10) {
                        result += "制卡次数过多，请输入不大于10的数字"
                        seal.replyToSender(ctx, msg, result)
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    for (let i = 0; i < times; i++) {
                        let ret = seal.format(ctx,
                            "生命值:{$t命运值=(d6+6)/2} 精神值:{$t命运值=(d6+6)/2}\n命运值:{$t命运值=2d6+$t补正值}（补正{$t补正值=d6}）"
                        )
                        result = result + ret + split
                    }

                    seal.vars.strSet(ctx, "$t制卡结果文本", result)
                    seal.replyToSender(ctx, msg, result)
                }
            }
            return seal.ext.newCmdExecuteResult(true);
        }

        default: {
            let judge = cmdArgs.getArgN(1);//获取补正值
            var dice1 = Number(seal.format(ctx, '{d6}'));
            var dice2 = Number(seal.format(ctx, '{d6}'));
            //投掷两个6面骰
            if (dice1 == dice2 && dice1 == 1) {
                seal.replyToSender(ctx, msg, `${name}掷出的结果为：2D6=1+1=2 漂亮的成功。\n毫无疑问，这是最好的结果。\n${name}将获得额外的信息，并将“剧本”向好的方向推进。`)
                return seal.ext.newCmdExecuteResult(true);
            }

            else if (dice1 == dice2 && dice1 == 6) {
                seal.replyToSender(ctx, msg, `${name}掷出的结果为：2D6=6+6=12 糟糕的失败。\n毫无疑问，这是最糟的结果。\n${name}将无法顺利获得信息，甚至他会引来厄运。`)
                return seal.ext.newCmdExecuteResult(true);
            }

            else if (dice1 == dice2) {
                let moredice1 = Number(seal.format(ctx, '{d6}'));
                let moredice2 = Number(seal.format(ctx, '{d6}'));
                let access = [[dice1, dice2]]; // 初始掷骰结果
                let times = 1;

                // 记录最小结果
                let isCriticalFailure = false; // 新增标志变量
                let finalResult = dice1 + dice2; // 初始化最终结果
                let finalDice1 = dice1; // 记录最终结果对应的第一个骰子
                let finalDice2 = dice2; // 记录最终结果对应的第二个骰子

                // 初始掷骰结果
                access.push([moredice1, moredice2]);

                // 更新初始掷骰结果
                const initialResult = moredice1 + moredice2;
                if (initialResult < finalResult) {
                    finalResult = initialResult;
                    finalDice1 = moredice1;
                    finalDice2 = moredice2;
                }

                while (moredice1 == moredice2 && moredice1 != 1 && !isCriticalFailure) {
                    moredice1 = Number(seal.format(ctx, '{d6}'));
                    moredice2 = Number(seal.format(ctx, '{d6}'));
                    times += 1;
                    access.push([moredice1, moredice2]);

                    // 更新最终结果
                    const currentResult = moredice1 + moredice2;
                    if (currentResult < finalResult) {
                        finalResult = currentResult;
                        finalDice1 = moredice1;
                        finalDice2 = moredice2;
                    }

                    // 检查大成功
                    if (moredice1 == 1 && moredice2 == 1) {
                        break;
                    }

                    // 检查糟糕的失败
                    if (moredice1 == 6 && moredice2 == 6) {
                        isCriticalFailure = true;
                        break;
                    }
                }

                // 构建详细的输出结果
                let output = `${name}进行了${times + 1}次掷骰: [${access.map(d => `(${d[0]},${d[1]})`).join(' ')}]\n`;

                if (moredice1 == 1 && moredice2 == 1) {
                    output += `最终的结果为：2D6=1+1=2 漂亮的成功。\n毫无疑问，这是最好的结果。\n${name}将获得额外的信息，并将“剧本”向好的方向推进。`;
                } else {
                    if (!isNaN(judge)) {
                        judge = Number(judge)
                        finalResult = judge + finalResult
                        if (judge > 0) {
                            output += `补正值为${judge}\n最终的结果为：2D6=${finalDice1}+${finalDice2}+${judge}=${finalResult}`;
                        }
                        else if (judge === 0) {
                            output += `补正值为${judge}\n最终的结果为：2D6=${finalDice1}+${finalDice2}=${finalResult}`;
                        }
                        else {
                            output += `补正值为${judge}\n最终的结果为：2D6=${finalDice1}+${finalDice2}${judge}=${finalResult}`;
                        }
                    }
                }

                seal.replyToSender(ctx, msg, output);

                return seal.ext.newCmdExecuteResult(true);
            }

            else {
                result = dice1 + dice2
                if (!isNaN(judge)) {
                    judge = Number(judge)
                    result = judge + result
                    if (judge > 0) {
                        seal.replyToSender(ctx, msg, `${name}进行了补正值为${judge}的检定，结果为：2D6=${dice1}+${dice2}+${judge}=${result}`)
                    }
                    else if (judge === 0) {
                        seal.replyToSender(ctx, msg, `${name}进行了补正值为${judge}的检定，结果为：2D6=${dice1}+${dice2}=${result}`)
                    }
                    else {
                        seal.replyToSender(ctx, msg, `${name}进行了补正值为${judge}的检定，结果为：2D6=${dice1}+${dice2}${judge}=${result}`)
                    }
                }
                else {
                    seal.replyToSender(ctx, msg, `${name}掷出的结果为：2D6=${dice1}+${dice2}=${result}`)
                }
                return seal.ext.newCmdExecuteResult(true)
            }
        }
    }
};

// 将命令注册到扩展中
exti.cmdMap['det'] = cmdet;

class PersonalDeck {
    constructor(defaultDeck, indices = null) {
        this.defaultDeck = defaultDeck;
        this.reset(indices);
        this.drawnCards = []; // 新增属性，用于记录已抽到的卡片
    }

    reset(indices = null) {
        this.indices = indices || Array.from({ length: this.defaultDeck.length }, (_, i) => i);
        this.drawnCards = []; // 重置已抽到的卡片列表
    }

    draw() {
        if (this.indices.length === 0) {
            return { exists: false, result: "第12次透支，失去【角色简历】\n重置代价请用“.det reload”" };
        }
        let resultIndex = Math.floor(Math.random() * this.indices.length);
        let cardIndex = this.indices[resultIndex];
        this.indices.splice(resultIndex, 1);
        this.drawnCards.push(this.defaultDeck[cardIndex]); // 记录已抽到的卡片
        return { exists: true, result: this.defaultDeck[cardIndex] };
    }

    count() {
        return this.indices.length;
    }

    show() {
        return this.indices.map(index => this.defaultDeck[index]).join("\n");
    }

    see() {
        return this.drawnCards.join("\n"); // 返回已抽到的卡片列表
    }
}

if (!seal.ext.find('dep')) {
    const ext = seal.ext.new('dep', 'bug人@', '1.0.1');
    seal.ext.register(ext);

    const defaultDeck = [
        "2 失去视力：失明或直接眼球损伤。后续所有需要“眼”的技能出目+4。",
        "3 失去外貌特征：你失去了代表性的外貌，镜子中的人究竟是谁？精神值-4。",
        "4 失去听力：失聪或直接耳部损伤。后续所有需要“耳”的技能出目+4。",
        "5 失去思想信念/驱动力：你失去了支撑你的信念，你的大脑一片混沌。精神值-4。",
        "6 失去声音：失声或直接声带损伤。后续所有需要“语言”的技能出目+4。",
        "7 失去爱憎之物：你失去了爱或恨的强烈情感，你的灵魂被挖空了一块。精神值-4。",
        "8 失去双手：手部遭受重伤或知觉消失。后续所有需要“手”的技能出目+4。",
        "9 失去不可断之“联系”：你失去了重要的联系，此后这与你再无关联。精神值-4。",
        "10 失去双腿：腿部遭受重伤或知觉消失。后续所有需要“足”的技能出目+4。",
        "11 失去不可忘之“经历”：你失去了这部分记忆，你的人生究竟是什么样的？精神值-4。",
        "12 失去内脏：内脏消失了，但身体还在“剧本”的影响下可以继续行动。后续所有需要“体质”的技能出目+4。"
    ];

    // 从存储中加载数据
    let storedDecks = JSON.parse(ext.storageGet("personalDecks") || '{}');
    globalThis.personalDecks = new Map(Object.entries(storedDecks).map(([userId, data]) => [userId, new PersonalDeck(defaultDeck, data.indices)]));

    const cmdDep = seal.ext.newCmdItemInfo();
    cmdDep.name = 'dep';
    cmdDep.help = `透支代价抽取，代价抽取后会消失，对每个pl独立\n` +
        `.dep 抽取一个代价\n` +
        `.dep show 查看已获得的代价\n` +
        `.dep count 查看剩余代价数目\n` +        
        `.dep see 查看剩余代价详情\n`+
        `.dep reload 重置代价\n`+
        `*非第一次开团前请使用“dep reload”重置`;

    cmdDep.solve = (ctx, msg, cmdArgs) => {
        let userId = ctx.player.userId;

        // 确保 globalThis.personalDecks 是一个 Map
        if (!globalThis.personalDecks) {
            globalThis.personalDecks = new Map();
        }

        // 检查用户是否已经存在于 personalDecks 中
        if (!globalThis.personalDecks.has(userId)) {
            // 从存储中获取用户的抽卡状态
            let storedIndices = storedDecks[userId]?.indices;
            globalThis.personalDecks.set(userId, new PersonalDeck(defaultDeck, storedIndices));
        }

        let personalDeck = globalThis.personalDecks.get(userId);

        // 调试信息，确保 personalDeck 是 PersonalDeck 类的实例
        console.log(`personalDeck is a ${personalDeck ? personalDeck.constructor.name : 'undefined'}`);
        console.log(`personalDeck indices: ${personalDeck ? personalDeck.indices : 'undefined'}`);
        console.log(`personalDeck drawnCards: ${personalDeck ? personalDeck.drawnCards : 'undefined'}`);

        if (!(personalDeck instanceof PersonalDeck)) {
            console.error('personalDeck is not a valid PersonalDeck instance');
            seal.replyToSender(ctx, msg, '系统错误，请联系管理员');
            return seal.ext.newCmdExecuteResult(false);
        }

        let val = cmdArgs.getArgN(1);
        switch (val) {
            case 'help': {
                const ret = seal.ext.newCmdExecuteResult(true);
                ret.showHelp = true;
                return ret;
            }
            case 'count': {
                let count = personalDeck.count();
                seal.replyToSender(ctx, msg, `剩余代价数目：${count}`);
                break;
            }
            case 'see': {
                let cards = personalDeck.show();
                seal.replyToSender(ctx, msg, `剩余代价详情：\n${cards}`);
                break;
            }
            case 'reload': {
                personalDeck.reset();
                seal.replyToSender(ctx, msg, `代价已重置`);
                break;
            }
            case 'show': {
                let drawnCards = personalDeck.see();
                seal.replyToSender(ctx, msg, `已获得的代价：\n${drawnCards}`);
                break;
            }
            default: {
                let result = personalDeck.draw();
                if (result.exists) {
                    seal.replyToSender(ctx, msg, `抽取结果：\n${result.result}`);
                } else {
                    seal.replyToSender(ctx, msg, result.result);
                }
            }
        }

        // 保存数据到存储
        let decksToStore = {};
        globalThis.personalDecks.forEach((deck, userId) => {
            decksToStore[userId] = { indices: deck.indices, drawnCards: deck.drawnCards };
        });
        ext.storageSet("personalDecks", JSON.stringify(decksToStore));

        return seal.ext.newCmdExecuteResult(true);
    };

    ext.cmdMap['dep'] = cmdDep;
}
