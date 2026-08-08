// ==UserScript==
// @name         忍神【忍术战斗RPG】
// @author       bug人@
// @version      1.0.0
// @description  非常简易的忍神检定骰点，使用.rnj help查看说明（因为本人没玩过忍神所以可能理解有偏差，烦请各位指出）
// @timestamp    20240708
// @diceRequireVer 1.0.0
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

//sn部分
const theninja = {
    "name":"ninja",
    "fullname":"忍神",
    "authors": ["bug人@"],
    "version": "1.0.0",
    "updatedTime": "20240708",
    "templateVer": "1.0",

    "nameTemplate":{
        "ninja":{
            "template":"{$t玩家_RAW}|生命力{生命力}|谋位值{谋位值}",
            "helpText": "自动设置忍神名片"
        }
    },

    "attrConfig":{
        //stshow置顶内容
        "top":['生命力', '谋位值'],
        "sortBy":"name",
        "ignores":[],
        "showAs":{
             "生命力":"{生命力}","谋位值":"{谋位值}"
        },
        "setter":null,
    },


    "setConfig":{
        "diceSides": 6,
        "enableTip": "已切换至6面骰，并自动开启忍神规则。详情通过.rnj help查看。",
        "keys": ["ninja"],
        "relatedExt": ["ninja", "coc7"],
    },

    "defaults":{
    },
    "defaultsComputed":{
    },
    "alias":{
      "生命力": ["生命"],
      "谋位值": ["谋位"]
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
    seal.gameSystem.newTemplate(JSON.stringify(ninja))
} catch (e) {
    // 如果扩展已存在，或加载失败，那么会走到这里
    console.log(e)
}

// 首先检查是否已经存在
var exti=seal.ext.find('ninja');
if (!seal.ext.find('ninja')){
    //检查扩展不存在
    exti=seal.ext.new('ninja','bug人@','1.0.0');//建立新扩展
    seal.ext.register(exti);
}

let ninja =seal.ext.newCmdItemInfo();
ninja.name='rnj';//指令名
ninja.help='.rnj <目标值>（修正值）//掷2d6面骰进行检定，默认修正值为0，注意指令格式\n使用sn ninja可自动设置名片（生命力&谋位值）';//帮助内容

//判定部分

ninja.solve=(ctx,msg,cmdArgs)=>{
    let name=seal.format(ctx,"{$t玩家}");
    switch(cmdArgs.getArgN(1)){
        case"":
        case"help":{
            const ret = seal.ext.newCmdExecuteResult(true);
            ret.showHelp = true;
            return ret;}

    //第一个参数为不为空或者help时进行判定
    default:{
        //判断第二个参数
        switch(cmdArgs.getArgN(2)){
            //第二个参数为空时，不进行判定并给出提示
            case "":{
                let judge=Number(seal.format(ctx,cmdArgs.getArgN(1)));//获取判定
                let attribute0=0;//修正值为0
            }
            //第二个参数不为空时，进行判定
            default:{
                let judge=Number(seal.format(ctx,cmdArgs.getArgN(1)));//获取判定值
                let attribute0=Number(seal.format(ctx,cmdArgs.getArgN(2)));//获取修正值

                //checkit
                var dice = Number(seal.format(ctx, '{2d6}'));
                //投掷两个6面骰
                let result = dice + attribute0

                if (dice==12){
                seal.replyToSender(ctx,msg,`${name}掷出的结果为：${dice}+${attribute0}=${result}（大成功）`)
                        return seal.ext.newCmdExecuteResult(true);}
                //12为大成功
                else if(dice<2){
                seal.replyToSender(ctx,msg,`${name}掷出的结果为：${dice}+${attribute0}=${result}（大失败）请dm投d6通过【大失败表】决定额外效果`)
                        return seal.ext.newCmdExecuteResult(true);
                }
                else if (result>=judge){
                    seal.replyToSender(ctx,msg,`${name}掷出的结果为：${dice}+${attribute0}=${result}(成功)`)
                    return seal.ext.newCmdExecuteResult(true);
                }
                else{
                    seal.replyToSender(ctx,msg,`${name}掷出的结果为：${dice}+${attribute0}=${result}(失败)`)
                    return seal.ext.newCmdExecuteResult(true)
                }
                }
            }
        }
    }
};
// 将命令注册到扩展中
exti.cmdMap['rnj'] = ninja;
