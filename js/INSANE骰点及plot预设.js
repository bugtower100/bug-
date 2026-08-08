// ==UserScript==
// @name         INSANE骰点及plot预设
// @author       bug人@
// @version      1.0.0
// @description  INSANE骰点及plot预设，使用ins help查看详情
// @timestamp    20240714
// @diceRequireVer 1.0.0
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==

//sn部分
const theins = {
    "name":"ins",
    "fullname":"insane",
    "authors": ["bug人@"],
    "version": "1.0.0",
    "updatedTime": "20240708",
    "templateVer": "1.0",

    "nameTemplate":{
        "ins":{
            "template":"{$t玩家_RAW}|生命力{hp}/{hpmax}|正气值{正气值}/{正气值max}",
            "helpText": "自动设置insane名片"
        }
    },

    "defaults":{
        "生命力":6,"生命力max":6,"正气值":6,"正气值max":6,
        "hp":6,"hp":6,"hpmax":6,"HPmax":6,
    },
    "defaultsComputed":{
    },
    "alias":{
      "生命力": ["生命力"],
      "生命力max": ["生命力max","hpmax","HPmax"],
      "正气值": ["正气值"]
    },
   
    "attrConfig":{
        //stshow置顶内容
        "top":['生命力', '正气值'],
        "sortBy":"name",
        "ignores":[],
        "showAs":{
             "生命力":"{生命力}","正气值":"{正气值}"
        },
        "setter":null,
    },


    "setConfig":{
        "diceSides": 6,
        "enableTip": "已切换至6面骰，并自动开启insane规则。详情通过.ins help查看。",
        "keys": ["ins"],
        "relatedExt": ["insane", "coc7"],
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
    seal.gameSystem.newTemplate(JSON.stringify(theins))
} catch (e) {
    // 如果扩展已存在，或加载失败，那么会走到这里
    console.log(e)
}

//判定部分
var exti=seal.ext.find('insane');
if (!seal.ext.find('insane')){
    //检查扩展不存在
    exti=seal.ext.new('insane','bug人@','1.0.0');//建立新扩展
    seal.ext.register(exti);
}

let cmdin =seal.ext.newCmdItemInfo();
cmdin.name='ins';//指令名
cmdin.help='使用说明：\n.set ins//开启insane拓展规则\n.sn ins//自动修改群名片，使用前请set ins\n.ins(目标修正值) //进行检定，注意指令格式//修正值不填默认为0，目标值默认为5\n.plot help//设置预设内容，help查看详情';//帮助内容

cmdin.solve=(ctx,msg,cmdArgs)=>{
    let name=seal.format(ctx,"{$t玩家}");
    switch(cmdArgs.getArgN(1)){
        case"help":{
            const ret = seal.ext.newCmdExecuteResult(true);
            ret.showHelp = true;
            return ret;
        }
    //第一个参数为help和name时进行一层判定

    default:{
        let judge=Number(seal.format(ctx,cmdArgs.getArgN(1)));//获取判定值
        var dice = Number(seal.format(ctx, '{2d6}'));
        //投掷两个6面骰
        let result = 5+judge
        if (dice==12){
            seal.replyToSender(ctx,msg,`${name}掷出的结果为：2D6=${dice}/${result}（大成功）`)
                    return seal.ext.newCmdExecuteResult(true);}
            //12为大成功
            else if(dice<2){
            seal.replyToSender(ctx,msg,`${name}掷出的结果为：2D6=${dice}/${result}（大失败）`)
                    return seal.ext.newCmdExecuteResult(true);
            }
            else if (dice>=result){
                seal.replyToSender(ctx,msg,`${name}掷出的结果为：2D6=${dice}/${result}(成功)`)
                return seal.ext.newCmdExecuteResult(true);
            }
            else{
                seal.replyToSender(ctx,msg,`${name}掷出的结果为：2D6=${dice}/${result}(失败)`)
                return seal.ext.newCmdExecuteResult(true)
            }
        }
    }
};

// 将命令注册到扩展中
exti.cmdMap['ins'] = cmdin;
let extension = seal.ext.find("plot");
if (!extension) {
    extension = seal.ext.new("plot", "檀轶步棋", "1.0.0");
    seal.ext.register(extension);
}
let cmdPlot = seal.ext.newCmdItemInfo();
cmdPlot.name = "plot";
cmdPlot.help =
    "使用说明：\n.plot <预设内容>//私聊发送，录入预设内容\n" +
        ".plot ready//对应群聊发送，将私聊内容录入群聊，即“预设完毕”\n" +
        ".plot show//展示群内各成员预设信息";
cmdPlot.solve = (ctx, msg, args) => {
    let execResult = seal.ext.newCmdExecuteResult(true);
    switch (args.getArgN(1)) {
        case "help": {
            execResult.showHelp = true;
            break;
        }
        case "ready": {
            let plot = retrievePlayerPlot(msg.sender.userId);
            if (!plot || Object.keys(plot).length == 0) {
                seal.replyToSender(ctx, msg, `玩家 ${msg.sender.nickname} 没有存入任何预设`);
                break;
            }
            let oldKeys = Object.keys(plot);
            for (let i = 0; i < oldKeys.length; i++) {
                if (oldKeys[i] != msg.sender.nickname) {
                    plot[msg.sender.nickname] = plot[oldKeys[i]];
                    delete plot[oldKeys[i]];
                }
            }
            let groupPlot = retrieveGroupPlot(msg.groupId);
            groupPlot[msg.sender.userId] = plot;
            saveGroupPlot(msg.groupId, groupPlot);
            seal.replyToSender(ctx, msg, `已经加载了 ${msg.sender.nickname} 的预设`);
            break;
        }
        case "show": {
            if (ctx.isPrivate) {
                seal.replyToSender(ctx, msg, seal.formatTmpl(ctx, "核心:提示_私聊不可用"));
                break;
            }
            let groupPlot = retrieveGroupPlot(msg.groupId);
            if (Object.keys(groupPlot).length == 0) {
                seal.replyToSender(ctx, msg, "当前群没有录入任何预设");
                break;
            }
            let records = [];
            for (let value of Object.values(groupPlot)) {
                for (let [key, plot] of Object.entries(value)) {
                    records.push(`${key}: ${plot}`);
                }
            }
            seal.replyToSender(ctx, msg, `本群的记录:\n\n${records.join("\n\n")}`);
            break;
        }
        default: {
            let content = args.getArgN(1);
            if (!content) {
                seal.replyToSender(ctx, msg, "请输入预设内容");
                break;
            }
            let curPlot = retrievePlayerPlot(msg.sender.userId);
            let save = "";
            if (Object.keys(curPlot).length != 0) {
                save = Object.values(curPlot)[0];
            }
            let name = msg.sender.nickname;
            savePlayerPlot(msg.sender.userId, name, content);
            seal.replyToSender(ctx, msg, "已经保存记录");
            if (save) {
                seal.replyToSender(ctx, msg, `已经覆盖之前的记录:\n${save}`);
            }
            break;
        }
    }
    return execResult;
};
extension.cmdMap["plot"] = cmdPlot;
function retrievePlayerPlot(userid) {
    return JSON.parse(extension.storageGet(`pplot_${userid}`) || "{}");
}
function savePlayerPlot(userid, name, content) {
    extension.storageSet(`pplot_${userid}`, `{ "${name}": "${content}" }`);
}
function retrieveGroupPlot(groupid) {
    return JSON.parse(extension.storageGet(`gplot_${groupid}`) || "{}");
}
function saveGroupPlot(groupid, content) {
    extension.storageSet(`gplot_${groupid}`, JSON.stringify(content));
}

