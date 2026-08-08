// ==UserScript==
// @name         lom诡秘试做
// @author       bug人@
// @version      1.0.0
// @description  lom诡秘人物作成，改编自子良的诡秘车卡自定义回复，使用方式 .lom诡秘制卡，查看制卡类型指令\n部分制卡需要安装牌堆，请自行在群文件搜索
// @timestamp    2024-04-30
// @homepageURL  https://github.com/Szzrain
// ==/UserScript==
if (!seal.ext.find('lom诡秘制卡')) {
    const ext = seal.ext.new('lom诡秘制卡', 'bug人@', '1.0.0');
    // 创建一个命令
    const cmdguimi = seal.ext.newCmdItemInfo();
    cmdguimi.name = 'lom诡秘制卡';
    cmdguimi.solve = (ctx, msg, cmdArgs) => {
    let val = cmdArgs.getArgN(1)
        switch (val) {
            default: {
                help = '.lom诡秘<数量>//lom诡秘天命\n.lom角色<数量>//lom角色快速车卡（包含角色背景）\n注1：本天命采用《诡秘之主》跑团规则v4.0\n注2：总计属性包括灵性\n注3：因为能力低下所以没有db，请自行判断'
                seal.replyToSender(ctx, msg, help) 
            }
        }
        return seal.ext.newCmdExecuteResult(true);
    }
    
    const cmdtianming = seal.ext.newCmdItemInfo();
    cmdtianming.name = 'lom诡秘';
    cmdtianming.solve = (ctx, msg, cmdArgs) => {
        let val = cmdArgs.getArgN(1)||1
        switch (val) {
            default: {
                let times = parseInt(val)
                let result = seal.format(ctx,"{$t玩家_RAW}的V4版诡秘角色作成:\n")
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
                        "力量:{$t力量=3d6*5}  敏捷:{$t敏捷=3d6*5}  意志:{$t意志=3d6*5}\n" +
                        "体质:{$t体质=(2d6+6)*5}  外貌:{$t外貌=3d6*5}  教育:{$t教育=(2d6+6)*5} \n" +
                        "体型:{$t体型=3d6*5}  智力:{$t智力=(2d6+6)*5}  幸运:{$t幸运=3d6*5} \n"+
                        "灵性:{$t灵性=(2d6+6)*5}  消化度:{$t消化度=(d5-1)*25}\n"+
                        "HP:{$t血量=($t体质+$t体型)/10} 总计: [{$t总值1=$t力量+$t敏捷+$t意志+$t体质+$t外貌+$t教育+$t体型+$t智力}/{$t总值2=$t总值1+$t灵性}/{$t总值3=$t总值2+$t幸运}]"
                        )
                    result = result + ret + split
                }

                seal.vars.strSet(ctx, "$t制卡结果文本", result)
                seal.replyToSender(ctx, msg, result)
            }
        }
        return seal.ext.newCmdExecuteResult(true);
    }

    const cmdjuese = seal.ext.newCmdItemInfo();
    cmdjuese.name = 'lom角色';
    cmdjuese.solve = (ctx, msg, cmdArgs) => {
        let val = cmdArgs.getArgN(1)||1
        switch (val) {
            default: {
                let times = parseInt(val)
                let result = seal.format(ctx,"『LoM角色｜{$t玩家_RAW} 』:\n")
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
                const xinyang = seal.format(ctx, `#{DRAW-诡秘信仰}`);
                const jiaxiang = seal.format(ctx, `#{DRAW-诡秘家乡}`);
                const zuzhi = seal.format(ctx, `#{DRAW-诡秘组织}`);
                const tujing = seal.format(ctx, `#{DRAW-诡秘途径}`);
                const beijing = seal.format(ctx, `#{DRAW-背景}`);
                const zhiye = seal.format(ctx, `#{DRAW-职业}`);
                for (let i = 0; i < times; i++) {
                    let ret = seal.format(ctx,
                        "力量:{$t力量=3d6*5}  敏捷:{$t敏捷=3d6*5}  意志:{$t意志=3d6*5}\n" +
                        "体质:{$t体质=(2d6+6)*5}  外貌:{$t外貌=3d6*5}  教育:{$t教育=(2d6+6)*5} \n" +
                        "体型:{$t体型=3d6*5}  智力:{$t智力=(2d6+6)*5}  幸运:{$t幸运=3d6*5} \n"+
                        "灵性:{$t灵性=(2d6+6)*5}  消化度:{$t消化度=(d5-1)*25}"+
                        `\n\n信仰：${xinyang}\n故乡：${jiaxiang}\n组织：${zuzhi}\n途径：${tujing}\n`+
                        `\n\n${beijing}\n\n${zhiye}`
                        )
                    result = result + ret + split
                }

                seal.vars.strSet(ctx, "$t制卡结果文本", result)
                seal.replyToSender(ctx, msg, result)
            }
        }
        return seal.ext.newCmdExecuteResult(true);
    }
 
    // 注册命令
    ext.cmdMap['lom诡秘制卡'] = cmdguimi
    ext.cmdMap['lom诡秘'] = cmdtianming;
    ext.cmdMap['lom角色'] = cmdjuese;

    // 注册扩展
    seal.ext.register(ext);
}
