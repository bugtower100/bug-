// ==UserScript==
// @name         brp拓制卡试做
// @author       bug人@
// @version      1.0.0
// @description  brp拓制卡人物作成，基于szz的ark人物卡作成修改而成，使用方式 .brp拓制卡，查看brp及其拓展制卡指令（后面有拓展再更新）
// @timestamp    2024-04-30
// @homepageURL  https://github.com/Szzrain
// ==/UserScript==
if (!seal.ext.find('brp拓制卡')) {
    const ext = seal.ext.new('brp拓制卡', 'bug人@', '1.0.0');
    // 创建一个命令
    const cmdbrpano = seal.ext.newCmdItemInfo();
    cmdbrpano.name = 'brp拓制卡';
    cmdbrpano.solve = (ctx, msg, cmdArgs) => {
    let val = cmdArgs.getArgN(1)
        switch (val) {
            default: {
                help = '动物类型及对应指令:\n＞.brp制卡 (<数量>)\n＞.餐云 (<数量>)\n//制卡指令，返回<数量>组人物属性'
                seal.replyToSender(ctx, msg, help) 
            }
        }
        return seal.ext.newCmdExecuteResult(true);
    }
    
    const cmdcanyun = seal.ext.newCmdItemInfo();
    cmdcanyun.name = '餐云';
    cmdcanyun.solve = (ctx, msg, cmdArgs) => {
        let val = cmdArgs.getArgN(1)||1
        switch (val) {
            default: {
                let times = parseInt(val)
                let result = seal.format(ctx,"{$t玩家_RAW}的餐云卧石人物作成：\n")
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
                        "力量:{$t力=3d6*5} 意志:{$t意=3d6*5}\n" +
                        "体质:{$t体=3d6*5} 敏捷:{$t敏=3d6*5}\n" +
                        "体型:{$t型=(2d6+6)*5} 外貌:{$t魅=3d6*5}\n"+
                        "智力:{$t灵=(2d6+6)*5} 气运:{$t幸=3d6*5}\n"+
                        "基础灵力:{$tpp=2d6*5+30} [{$t不含运=$t力+$t敏+$t意+$t体+$t魅+$t灵+$tpp+$t型}/{$t含运=$t幸+$t不含运}]\n"
                        )
                    result = result + ret + split
                }

                seal.vars.strSet(ctx, "$t制卡结果文本", result)
                seal.replyToSender(ctx, msg, result)
            }
        }
        return seal.ext.newCmdExecuteResult(true);
    }

    const cmdbrpcard = seal.ext.newCmdItemInfo();
    cmdbrpcard.name = 'brp制卡';
    cmdbrpcard.solve = (ctx, msg, cmdArgs) => {
        let val = cmdArgs.getArgN(1)||1
        switch (val) {
            default: {
                let times = parseInt(val)
                let result = seal.format(ctx,"{$t玩家_RAW}的brp人物作成:\n")
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
                        "力量:{$t1力=3d6} 意志:{$t1意=3d6} 敏捷:{$t1敏=3d6}\n" +
                        "体质:{$t1体=3d6} 体型:{$t1型=2d6+6} 外貌:{$t1魅=3d6}\n" +
                        "智力:{$t1灵=2d6+6} 总点数:{$t1总点数=$t力+$t1敏+$t1意+$t1体+$t1魅+$t1型+$t1灵}\n"
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
    ext.cmdMap['brp拓制卡'] = cmdbrpano;
    ext.cmdMap['餐云'] = cmdcanyun;
    ext.cmdMap['brp制卡'] = cmdbrpcard;

    // 注册扩展
    seal.ext.register(ext);
}
