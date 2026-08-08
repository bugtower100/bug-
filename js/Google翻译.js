// ==UserScript==
// @name         翻译
// @author       bug人@
// @version      1.0.0
// @description  调用Google翻译api，可支持多种语言翻译，详情请用.翻译help查看。第一次写插件有bug请及时和我反馈。
// @timestamp    2024-04-09
// @homepageURL  https://github.com/sealdice/javascript
// ==/UserScript==
if (!seal.ext.find("翻译")) {
  const ext = seal.ext.new("翻译", "bug人", "1.0.0");
  seal.ext.register(ext);
  const cmdapi = seal.ext.newCmdItemInfo();
  cmdapi.name = "翻译";
  cmdapi.help = "//多语言单词（句子）翻译//\n\n使用.翻译<需要翻译的语句><目标语言>。\n例：.翻译 你好 ja（即将中文翻译为日文）\n\n特别注意的是，当目标语言为空时，将会识别目标语言并翻译为中文，中文则会翻译为英文。\n\n还需要注意，带空格的句子不能被翻译（如英文法文句子等），但中文日文句子等可以正常翻译。\n（暂时没有修复的计划）\n\n//常见目标语言对应字符//\n中文<zh>英文<en>法语<fr>\n日语<ja>韩语<ko>俄语<ru>\n意大利语<it>西班牙语<es>\n其他不常用语言请自行查找谷歌“语言代码表”";
  cmdapi.solve = (ctx, msg, cmdArgs) => {
    let text = cmdArgs.getArgN(2)
    let val = cmdArgs.getArgN(1)
    switch (val) {
     case "help": {
       const ret = seal.ext.newCmdExecuteResult(true);
      ret.showHelp = true;
  return ret;
  }
  default: {
  if (!val) {seal.replyToSender(ctx, msg, `哦呀，你还什么都没有写哦。获取帮助请使用.翻译 help。`)};
      let setence = val
      let language = text
      const url = 'https://findmyip.net/api/translate.php?text='+setence+'&target_lang='+language;
      if (text){
      }
      fetch(url)
          .then((response) => {
            // 判断响应状态码是否为 200
            if (response.ok) {
              // 判断返回值是不是200
              response.json().then(data=>{
                if (data.code === 200) {
                  // 确保响应体中的 code 为 200，然后取出请求体的 data
                  const responseData = data.data;
                  // 现在你可以使用 responseData 变量来访问请求体中的数据
                  console.log(responseData);
                  seal.replyToSender(ctx,msg,responseData.translate_result)
            } else {
            // 如果 code 不为 200，输出错误消息  
                console.log("请求出错：" + data.message);
            }
          }).catch(error => {
            // 捕获解析 JSON 数据出错的情况
            console.error("解析响应数据时出错：" + error);
        });
            } else {
              console.log("api失效，请联系作者");
            }
          })
          .catch((error) => {
            console.log("api请求错误！错误原因：" + error);
          });
        return seal.ext.newCmdExecuteResult(true);
      }
    }
  }
  ext.cmdMap['翻译'] = cmdapi;
}
