// ==UserScript==
// @name         动物拓展试做
// @author       bug人@
// @version      1.0.0
// @description  动物拓展人物作成，基于szz的ark人物卡作成修改而成，使用方式 .动物拓展，查看对应动物类型指令
// @timestamp    2024-04-30
// @homepageURL  https://github.com/Szzrain
// ==/UserScript==
if (!seal.ext.find('动物拓展制卡')) {
    const ext = seal.ext.new('动物拓展', 'bug人@', '1.0.0');
    // 创建一个命令
    const cmdanimal = seal.ext.newCmdItemInfo();
    cmdanimal.name = '动物拓展';
    cmdanimal.solve = (ctx, msg, cmdArgs) => {
    let val = cmdArgs.getArgN(1)
        switch (val) {
            default: {
                help = '动物类型及对应指令:\n＞.小型犬 (<数量>)\n＞.大型犬 (<数量>)\n＞.猫 (<数量>)\n＞.小型鸟 (<数量>)\n＞.大型鸟(<数量>)\n＞.狼(<数量>)\n＞.蛇 (<数量>)\n＞.大型蛇 (<数量>)\n//制卡指令，返回<数量>组人物属性'
                seal.replyToSender(ctx, msg, help) 
            }
        }
        return seal.ext.newCmdExecuteResult(true);
    }
    
    const cmddogs = seal.ext.newCmdItemInfo();
    cmddogs.name = '小型犬';
    cmddogs.solve = (ctx, msg, cmdArgs) => {
        let val = cmdArgs.getArgN(1)||1
        switch (val) {
            default: {
                let times = parseInt(val)
                let result = seal.format(ctx,"{$t玩家_RAW}的动物拓展小型犬作成:\n")
                let split = seal.formatTmpl(ctx, "COC:制卡_分隔符")
                if (!parseInt(val) || parseInt(val) == 0) {
                    const ret = seal.ext.newCmdExecuteResult(true);
                    ret.showHelp = true;
                    return ret;
                }
                if (times >= 10) {
                    result += "制卡次数过多，请输入不大于10的数字"
                    seal.replyToSender(ctx, msg, result)
                    return seal.ext.newCmdExecuteResult(true);
                }
                for (let i = 0; i < times; i++) {
                    let ret = seal.format(ctx,
                        "力量:{$t力量=2d6*5+5} 体质:{$t体质=2d6*5} 体型:{$t体型=d8*5}\n" +
                        "敏捷:{$t敏捷=3d6*5} 智力:{$t智力=2d6*5} 意志:{$t意志=2d6*5}\n" +
                        "HP:{$tHP=($t体质+$t体型)/5} 总和:{$t总和=$t力量+$t体质+$t体型+$t敏捷+$t智力+$t意志} \n"
                        )
                    result = result + ret + split
                    another = "格斗 40%（25/10）,造成 1D4 +DB 点伤害，极难成功可以造成穿透。\n"+
                    "护甲：无\n技能：聆听65侦察70魅惑 40恐吓20闪避35追踪 80跳跃35潜行45攀爬15领航10心理学15精神分析20生存5游泳20"
                }

                seal.vars.strSet(ctx, "$t制卡结果文本", result)
                seal.replyToSender(ctx, msg, result+another)
            }
        }
        return seal.ext.newCmdExecuteResult(true);
    }

    const cmddogl = seal.ext.newCmdItemInfo();
    cmddogl.name = '大型犬';
    cmddogl.solve = (ctx, msg, cmdArgs) => {
        let val = cmdArgs.getArgN(1)||1
        switch (val) {
            default: {
                let times = parseInt(val)
                let result = seal.format(ctx,"{$t玩家_RAW}的动物拓展大型犬作成:\n")
                let split = seal.formatTmpl(ctx, "COC:制卡_分隔符")
                if (!parseInt(val) || parseInt(val) == 0) {
                    const ret = seal.ext.newCmdExecuteResult(true);
                    ret.showHelp = true;
                    return ret;
                }
                if (times >= 10) {
                    result += "制卡次数过多，请输入不大于10的数字"
                    seal.replyToSender(ctx, msg, result)
                    return seal.ext.newCmdExecuteResult(true);
                }
                for (let i = 0; i < times; i++) {
                    let ret = seal.format(ctx,
                        "力量:{$t力量=2d6*5+30} 体质:{$t体质=3d6*5} 体型:{$t体型=2d6*5+5}\n" +
                        "敏捷:{$t敏捷=2d6*5+30} 智力:{$t智力=2d6*5-5} 意志:{$t意志=3d6*5}\n" +
                        "HP:{$tHP=($t体质+$t体型)/5} 总和:{$t总和=$t力量+$t体质+$t体型+$t敏捷+$t智力+$t意志} \n"
                        )
                    result = result + ret + split
                    another = "格斗 50%（25/10），造成 1D8 点伤害+伤害加成，极难可以穿透\n"+
                    "护甲：1 点毛皮\n技能：聆听65侦察 70魅惑10恐吓45闪避35追踪90跳跃50潜行50攀爬25领航30心理学20精神分析10生存55游泳20"
                }

                seal.vars.strSet(ctx, "$t制卡结果文本", result)
                seal.replyToSender(ctx, msg, result+another)
            }
        }
        return seal.ext.newCmdExecuteResult(true);
    }

    const cmdcat = seal.ext.newCmdItemInfo();
    cmdcat.name = '猫';
    cmdcat.solve = (ctx, msg, cmdArgs) => {
        let val = cmdArgs.getArgN(1)||1
        switch (val) {
            default: {
                let times = parseInt(val)
                let result = seal.format(ctx,"{$t玩家_RAW}的动物拓展猫作成:\n")
                let split = seal.formatTmpl(ctx, "COC:制卡_分隔符")
                if (!parseInt(val) || parseInt(val) == 0) {
                    const ret = seal.ext.newCmdExecuteResult(true);
                    ret.showHelp = true;
                    return ret;
                }
                if (times >= 10) {
                    result += "制卡次数过多，请输入不大于10的数字"
                    seal.replyToSender(ctx, msg, result)
                    return seal.ext.newCmdExecuteResult(true);
                }
                for (let i = 0; i < times; i++) {
                    let ret = seal.format(ctx,
                        "力量:{$t力量=d6*5+5} 体质:{$t体质=2d6*5} 体型:{$t体型=d4*5+5}\n" +
                        "敏捷:{$t敏捷=4d6*5+15} 智力:{$t智力=d6*5+15} 意志:{$t意志=2d6*5}\n" +
                        "HP:{$tHP=($t体质+$t体型)/5} 总和:{$t总和=$t力量+$t体质+$t体型+$t敏捷+$t智力+$t意志} \n"
                        )
                    result = result + ret + split
                    another = "格斗 50%（25/10），造成 1D8 点伤害+伤害加成，极难可以穿透\n"+
                    "护甲：无\n技能：聆听45侦察55魅惑50恐吓25闪避45追踪25跳跃45潜行65攀爬70领航10心理学5精神分析20生存5游泳5"
                }

                seal.vars.strSet(ctx, "$t制卡结果文本", result)
                seal.replyToSender(ctx, msg, result+another)
            }
        }
        return seal.ext.newCmdExecuteResult(true);
    }


    const cmdbirds = seal.ext.newCmdItemInfo();
    cmdbirds.name = '小型鸟';
    cmdbirds.solve = (ctx, msg, cmdArgs) => {
        let val = cmdArgs.getArgN(1)||1
        switch (val) {
            default: {
                let times = parseInt(val)
                let result = seal.format(ctx,"{$t玩家_RAW}的动物拓展小型鸟作成:\n")
                let split = seal.formatTmpl(ctx, "COC:制卡_分隔符")
                if (!parseInt(val) || parseInt(val) == 0) {
                    const ret = seal.ext.newCmdExecuteResult(true);
                    ret.showHelp = true;
                    return ret;
                }
                if (times >= 10) {
                    result += "制卡次数过多，请输入不大于10的数字"
                    seal.replyToSender(ctx, msg, result)
                    return seal.ext.newCmdExecuteResult(true);
                }
                for (let i = 0; i < times; i++) {
                    let ret = seal.format(ctx,
                        "力量:{$t力量=2d4*5} 体质:{$t体质=2d6*5} 体型:{$t体型=d6*5}\n" +
                        "敏捷:{$t敏捷=3d6*5+45} 智力:{$t智力=d6*5} 意志:{$t意志=2d6*5+30}\n" +
                        "HP:{$tHP=($t体质+$t体型)/5} 总和:{$t总和=$t力量+$t体质+$t体型+$t敏捷+$t智力+$t意志} \n"
                        )
                    result = result + ret + split
                    another = "技能：聆听75侦察65魅惑 35恐吓1闪避 75追踪40潜行25领航90心理学 15%，精神分析10生存25\n"+
                    "作为食材美味度：90"
                }

                seal.vars.strSet(ctx, "$t制卡结果文本", result)
                seal.replyToSender(ctx, msg, result+another)
            }
        }
        return seal.ext.newCmdExecuteResult(true);
    }

    const cmdbirdl = seal.ext.newCmdItemInfo();
    cmdbirdl.name = '大型鸟';
    cmdbirdl.solve = (ctx, msg, cmdArgs) => {
        let val = cmdArgs.getArgN(1)||1
        switch (val) {
            default: {
                let times = parseInt(val)
                let result = seal.format(ctx,"{$t玩家_RAW}的动物拓展大型鸟作成:\n")
                let split = seal.formatTmpl(ctx, "COC:制卡_分隔符")
                if (!parseInt(val) || parseInt(val) == 0) {
                    const ret = seal.ext.newCmdExecuteResult(true);
                    ret.showHelp = true;
                    return ret;
                }
                if (times >= 10) {
                    result += "制卡次数过多，请输入不大于10的数字"
                    seal.replyToSender(ctx, msg, result)
                    return seal.ext.newCmdExecuteResult(true);
                }
                for (let i = 0; i < times; i++) {
                    let ret = seal.format(ctx,
                        "力量:{$t力量=3d6*5+60} 体质:{$t体质=3d6*5} 体型:{$t体型=3d6*5+30}\n" +
                        "敏捷:{$t敏捷=2d6*5+60} 智力:{$t智力=d8*5} 意志:{$t意志=2d6*5+30}\n" +
                        "HP:{$tHP=($t体质+$t体型)/5} 总和:{$t总和=$t力量+$t体质+$t体型+$t敏捷+$t智力+$t意志} \n"
                        )
                    result = result + ret + split
                    another = "战斗方式：格斗 45（22/9）造成 1D6+DB 的伤害\n"+
                    "护甲：1\n技能：聆听65侦察90魅惑15恐吓35闪避70追踪75潜行25领航75心理学25精神分析10生存 65"
                }

                seal.vars.strSet(ctx, "$t制卡结果文本", result)
                seal.replyToSender(ctx, msg, result+another)
            }
        }
        return seal.ext.newCmdExecuteResult(true);
    }


    const cmdwolfl = seal.ext.newCmdItemInfo();
    cmdwolfl.name = '狼';
    cmdwolfl.solve = (ctx, msg, cmdArgs) => {
        let val = cmdArgs.getArgN(1)||1
        switch (val) {
            default: {
                let times = parseInt(val)
                let result = seal.format(ctx,"{$t玩家_RAW}的动物拓展狼作成:\n")
                let split = seal.formatTmpl(ctx, "COC:制卡_分隔符")
                if (!parseInt(val) || parseInt(val) == 0) {
                    const ret = seal.ext.newCmdExecuteResult(true);
                    ret.showHelp = true;
                    return ret;
                }
                if (times >= 10) {
                    result += "制卡次数过多，请输入不大于10的数字"
                    seal.replyToSender(ctx, msg, result)
                    return seal.ext.newCmdExecuteResult(true);
                }
                for (let i = 0; i < times; i++) {
                    let ret = seal.format(ctx,
                        "力量:{$t力量=2d6*5+30} 体质:{$t体质=3d6*5} 体型:{$t体型=2d6*5+5}\n" +
                        "敏捷:{$t敏捷=2d6*5+30} 智力:{$t智力=2d6*5-5} 意志:{$t意志=3d6*5}\n" +
                        "HP:{$tHP=($t体质+$t体型)/5} 总和:{$t总和=$t力量+$t体质+$t体型+$t敏捷+$t智力+$t意志} \n"
                        )
                    result = result + ret + split
                    another = "格斗 50%（25/10），造成 1D8 点伤害+伤害加成，极难可以穿透\n"+
                    "护甲：1 点毛皮\n技能：聆听65侦察 70魅惑10恐吓45闪避35追踪90跳跃50潜行50攀爬25领航30心理学20精神分析10生存55游泳20"
                }

                seal.vars.strSet(ctx, "$t制卡结果文本", result)
                seal.replyToSender(ctx, msg, result+another)
            }
        }
        return seal.ext.newCmdExecuteResult(true);
    }    

    const cmdsnake = seal.ext.newCmdItemInfo();
    cmdsnake.name = '蛇';
    cmdsnake.solve = (ctx, msg, cmdArgs) => {
        let val = cmdArgs.getArgN(1)||1
        switch (val) {
            default: {
                let times = parseInt(val)
                let result = seal.format(ctx,"{$t玩家_RAW}的动物拓展蛇作成:\n")
                let split = seal.formatTmpl(ctx, "COC:制卡_分隔符")
                if (!parseInt(val) || parseInt(val) == 0) {
                    const ret = seal.ext.newCmdExecuteResult(true);
                    ret.showHelp = true;
                    return ret;
                }
                if (times >= 10) {
                    result += "制卡次数过多，请输入不大于10的数字"
                    seal.replyToSender(ctx, msg, result)
                    return seal.ext.newCmdExecuteResult(true);
                }
                for (let i = 0; i < times; i++) {
                    let ret = seal.format(ctx,
                        "力量:{$t力量=2d6*5} 体质:{$t体质=2d6*5} 体型:{$t体型=d6*5}\n" +
                        "敏捷:{$t敏捷=5d6*5} 智力:{$t智力=2d6*5-5} 意志:{$t意志=3d6*5}\n" +
                        "HP:{$tHP=($t体质+$t体型)/5} 总和:{$t总和=$t力量+$t体质+$t体型+$t敏捷+$t智力+$t意志} \n"
                        )
                    result = result + ret + split
                    another = "战斗方式：撕咬。蛇毒具有不同的性质。受害者必须进行极限 CON 检定以抵抗蛇毒的完全效果。成功的检定可以削弱效果。若不能在数小时内找到抗毒血清或者其他合适的医药治疗方式，被咬的受害者可能会死。\n"+
                    "格斗 40%（20/8），造成 1D4 点伤害+伤害加成+ 蛇毒效果\n"+
                    "技能：侦察65魅惑5恐吓75闪避45追踪 35潜行90攀爬70领航20心理学40精神分析5生存55游泳20"
                }

                seal.vars.strSet(ctx, "$t制卡结果文本", result)
                seal.replyToSender(ctx, msg, result+another)
            }
        }
        return seal.ext.newCmdExecuteResult(true);
    }    

    const cmdsnakel = seal.ext.newCmdItemInfo();
    cmdsnakel.name = '大型蛇';
    cmdsnakel.solve = (ctx, msg, cmdArgs) => {
        let val = cmdArgs.getArgN(1)||1
        switch (val) {
            default: {
                let times = parseInt(val)
                let result = seal.format(ctx,"{$t玩家_RAW}的动物拓展大型蛇作成:\n")
                let split = seal.formatTmpl(ctx, "COC:制卡_分隔符")
                if (!parseInt(val) || parseInt(val) == 0) {
                    const ret = seal.ext.newCmdExecuteResult(true);
                    ret.showHelp = true;
                    return ret;
                }
                if (times >= 10) {
                    result += "制卡次数过多，请输入不大于10的数字"
                    seal.replyToSender(ctx, msg, result)
                    return seal.ext.newCmdExecuteResult(true);
                }
                for (let i = 0; i < times; i++) {
                    let ret = seal.format(ctx,
                        "力量:{$t力量=3d6*5+60} 体质:{$t体质=2d6*5+30} 体型:{$t体型=4d6*5+15}\n" +
                        "敏捷:{$t敏捷=2d6*5+30} 智力:{$t智力=d10*5} 意志:{$t意志=2d6*5+30}\n" +
                        "HP:{$tHP=($t体质+$t体型)/5} 总和:{$t总和=$t力量+$t体质+$t体型+$t敏捷+$t智力+$t意志} \n"
                        )
                    result = result + ret + split
                    another = "战斗方式： 格斗 40%（20/8），造成 1D3 点伤害\n"+
                    "护甲：3\n技能：侦察65魅惑5恐吓80闪避20追踪30潜行90攀爬70领航20心理学35精神分析5生存75游泳55"
                }

                seal.vars.strSet(ctx, "$t制卡结果文本", result)
                seal.replyToSender(ctx, msg, result+another)
            }
        }
        return seal.ext.newCmdExecuteResult(true);
    }   
 
    // 注册命令
    ext.cmdMap['动物拓展'] = cmdanimal;
    ext.cmdMap['小型犬'] = cmddogs;
    ext.cmdMap['大型犬'] = cmddogl;
    ext.cmdMap['猫'] = cmdcat;
    ext.cmdMap['小型鸟'] = cmdbirds;
    ext.cmdMap['大型鸟'] = cmdbirdl;
    ext.cmdMap['狼'] = cmdwolfl;
    ext.cmdMap['蛇'] = cmdsnake;
    ext.cmdMap['大型蛇'] = cmdsnakel;

    // 注册扩展
    seal.ext.register(ext);
}
