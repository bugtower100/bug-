// ==UserScript==
// @name         天气预报播报与查询
// @author       bug人@
// @version      3.0.0
// @description  支持开关控制的定时天气播报系统（数据来源tx天气）
// @timestamp    2024-10-16
// ==/UserScript==

//const qqs = ['QQ:2068281904', 'QQ:920868587', 'QQ:2700037224'];
const host = 'http://localhost:9000';
const BasicTimeSpace = 5000;
const CITY_API = 'https://wis.qq.com/city/like';
const WEATHER_API = 'https://wis.qq.com/weather/common';

// **************** 核心功能模块 ****************
class WeatherTimer {
    static instance = null;
    interval = null;
    running = false;

    constructor(ext) {
        if (!WeatherTimer.instance) {
            this.ext = ext;
            this.config = this.getConfig();
            this.running = this.loadRunningState();
            // console.log(`[构造函数] 加载配置完成，任务数量: ${this.config.tasks.length}, 运行状态: ${this.running}`);
            this.initTimer();
            WeatherTimer.instance = this;
        }
        return WeatherTimer.instance;
    }

    // 初始化定时器
    initTimer() {
        // console.log(`[系统初始化] 播报系统状态: ${this.running ? '运行中' : '已停止'}`);
        if (this.running) {
            // console.log('[系统初始化] 开始调度任务检查');
            this.scheduleNextCheck();
        } else {
            // console.log('[系统初始化] 系统未运行，跳过调度');
        }
    }

    // 加载运行状态
    loadRunningState() {
        const stored = this.ext.storageGet('weather_running');
        if (stored === null || stored === undefined) {
            return false;
        }
        return stored === 'true';
    }

    // 保存运行状态
    saveRunningState() {
        this.ext.storageSet('weather_running', this.running.toString());
    }

    // 获取配置
    getConfig() {
        const stored = this.ext.storageGet('weather_config');
        return stored ? JSON.parse(stored) : {
            tasks: [],
            time: 3600000,
            nextTime: Date.now() + BasicTimeSpace
        };
    };

    // 保存配置
    saveConfig() {
        // console.log(JSON.stringify(this.config))
        this.ext.storageSet('weather_config', JSON.stringify(this.config));
    }

    // 添加任务
    addTask(epId, guildId, groupId, userId, isPrivate, time, city, province) {
        // if (this.config.tasks.some(t => t.groupId === groupId)) return;
        // console.log(epId, guildId, groupId, userId, isPrivate, time, city, province)
        // console.log(time, 32423)
        const newTask = {
            epId, guildId, groupId, userId, isPrivate,
            time: time, // 保存原始时间字符串
            timeStamp: new Date(time).getTime(), // 保存时间戳用于其他用途
            city, province,
            nextTrigger: this.calculateNextTrigger(time)
        };

        this.config.tasks.push(newTask);
        this.saveConfig();
    }

    // 计算下次触发时间
    calculateNextTrigger(timeStr) {
        let hours, minutes;
        if (typeof timeStr === 'string' && timeStr.includes(':')) {
            [hours, minutes] = timeStr.split(':').map(Number);
        } else {
            const timeObj = new Date(timeStr);
            hours = timeObj.getHours();
            minutes = timeObj.getMinutes();
        }
        
        const nextDate = new Date();
        nextDate.setHours(hours, minutes, 0, 0);
        
        // 如果设定时间已过，则设为明天同一时间
        if (nextDate.getTime() <= Date.now()) {
            nextDate.setDate(nextDate.getDate() + 1);
        }
        
        // console.log(`[定时器] 下次触发时间: ${nextDate.toLocaleString()}`);
        return nextDate.getTime();
    }

    // 安排下次检查
    scheduleNextCheck() {
        if (!this.running) {
            // console.log('[定时器] 系统未运行，停止调度');
            return;
        }
        
        if (this.interval) {
            clearTimeout(this.interval);
            this.interval = null;
        }

        this.interval = setTimeout(() => {
            if (this.running) {
                this.checkTasks();
                this.scheduleNextCheck();
            }
        }, BasicTimeSpace);
        
        // console.log(`[定时器] 已安排下次检查，间隔: ${BasicTimeSpace}ms`);
    }

    // 检查任务执行
    async checkTasks() {
        if (!this.running) {
            // console.log('[任务检查] 系统未运行，跳过检查');
            return;
        }
        
        const now = Date.now();
        // console.log(`[任务检查] 当前时间: ${new Date(now).toLocaleString()}, 任务数量: ${this.config.tasks.length}`);
        
        for (const task of this.config.tasks) {
            const triggerTime = new Date(task.nextTrigger).toLocaleString();
            // console.log(`[任务检查] 任务 ${task.city} 下次触发: ${triggerTime}`);
            
            if (now >= task.nextTrigger) {
                // console.log(`[播报执行] 开始播报 ${task.city} 天气`);
                try {
                    const report = await this.getWeatherReport(task.province, task.city);
                    this.sendMessage(task, '锵锵~现在是' + task.city + '的实时天气播报！请注意查收哦~' + report);
                    
                    // 重新计算下次触发时间 - 兼容旧版本数据
                    let timeForCalculation;
                    if (typeof task.time === 'string') {
                        // 新版本：time是字符串
                        timeForCalculation = task.time;
                    } else {
                         // 旧版本：time是时间戳，需要转换为时间字符串
                         const originalTimeStamp = task.time;
                         const timeObj = new Date(task.time);
                         timeForCalculation = timeObj.toTimeString().slice(0, 5);
                         // 更新任务结构为新版本
                         task.time = timeForCalculation;
                         task.timeStamp = originalTimeStamp; // 保存原时间戳
                     }
                    
                    task.nextTrigger = this.calculateNextTrigger(timeForCalculation);
                    this.saveConfig();
                    
                    // console.log(`[播报成功] ${task.city} 播报完成，下次播报: ${new Date(task.nextTrigger).toLocaleString()}`);
                } catch (err) {
                    console.error(`[播报失败] ${task.groupId} - ${task.city}: ${err.message}`);
                    // 播报失败时，延迟10分钟后重试
                    task.nextTrigger = now + 10 * 60 * 1000;
                    this.saveConfig();
                }
            }
        }
    }

    // 获取天气报告
    async getWeatherReport(province, city) {
        const response = await fetch(`${WEATHER_API}?source=pc&weather_type=observe%7Cforecast_1h%7Cforecast_24h%7Cindex%7Calarm%7Climit%7Ctips%7Crise&province=${encodeURIComponent(province)}&city=${encodeURIComponent(city)}`, {
            "referrer": "https://tianqi.qq.com/",
        });
        const data = await response.json();
        return this.formatWeather(data.data);
    }

    // 格式化天气信息
    formatWeather(data) {
        const observe = data.observe;
        const forecast = data.forecast_24h[0];
        const indexes = data.index;
        // console.log(JSON.stringify(indexes))
        return [
            ``,
            `🌤️ ${forecast.day_weather} ${forecast.day_wind_direction}${forecast.day_wind_power}级`,
            `📍 当前：${observe.degree}℃`,
            `🌡️ 温度：${forecast.min_degree}~${forecast.max_degree}℃`,
            `💧 湿度：${observe.humidity}%`,
            // `🌬️ 风速：${observe.wind_power}级`,
            `☔ 降水：${observe.precipitation}mm`,
            `☀️ 紫外线：${indexes.ultraviolet.info} (${indexes.ultraviolet.detail})`,
            `👕 穿衣：${indexes.clothes.info} (${indexes.clothes.detail})`,
            `🚗 洗车：${indexes.carwash.info}`,
            `💊 过敏：${indexes.allergy.info}`,
            `🌅 日出：${data.rise[0].sunrise} 日落：${data.rise[0].sunset}`
        ].join('\n');
    }

    // 发送消息
    sendMessage(task, content) {
        const ctx = this.getContext(task);
        if (ctx) seal.replyToSender(ctx[0], ctx[1], content);
    }

    // 获取上下文
    getContext(task) {
        const eps = seal.getEndPoints();
        const endpoint = eps.find(ep => ep.userId === task.epId);
        if (!endpoint) return null;

        const msg = seal.newMessage();
        msg.messageType = task.isPrivate ? "private" : "group";
        msg.groupId = task.groupId;
        msg.guildId = task.guildId;
        msg.sender.userId = task.userId;

        return [seal.createTempCtx(endpoint, msg), msg];
    }
}

// **************** 指令处理模块 ****************
function registerCommands(ext) {
    const cmd = seal.ext.newCmdItemInfo();
    cmd.name = 'weather';
    cmd.help = `天气预报管理系统：
.weather add <城市> <时间> // 添加定时任务（例：.weather add 北京 8:00）
.weather list // 查看所有任务
.weather del <编号> // 删除指定群内任务
.weather clear // 清除该群所有任务
.weather open/close // 启动/关闭播报系统
.weather get <城市> // 获取当前天气（支持临时查询）
.weather help // 显示帮助信息`;

    cmd.solve = (ctx, msg, cmdArgs) => {
        //if (!qqs.includes(msg.sender.userId)) {
        //    return seal.ext.newCmdExecuteResult(true);
        //}

        const timer = new WeatherTimer(ext);
        const action = cmdArgs.getArgN(1);
        // console.log(action)
        try {
            switch (action) {
                case 'add':
                    if (ctx.privilegeLevel < 50) {
                        seal.replyToSender(ctx, msg, '你没有权限执行该操作哦~（需要管理员权限）');
                        return seal.ext.newCmdExecuteResult(false);
                    }
                    handleAdd(timer, ctx, msg, cmdArgs);
                    break;
                case 'list':
                    handleList(timer, ctx, msg);
                    break;
                case 'del':
                    if (ctx.privilegeLevel < 50) {
                        seal.replyToSender(ctx, msg, '你没有权限执行该操作哦~（需要管理员权限）');
                        return seal.ext.newCmdExecuteResult(false);
                    }
                    handleDelete(timer, ctx, msg, cmdArgs);
                    break;
                case 'clear':
                    if (ctx.privilegeLevel < 50) {
                        seal.replyToSender(ctx, msg, '你没有权限执行该操作哦~（需要管理员权限）');
                        return seal.ext.newCmdExecuteResult(false);
                    }
                    handleClear(timer, ctx, msg);
                    break;
                case 'open':
                    if (ctx.privilegeLevel < 50) {
                        seal.replyToSender(ctx, msg, '你没有权限执行该操作哦~（需要管理员权限）');
                        return seal.ext.newCmdExecuteResult(false);
                    }
                    handleSwitch(timer, ctx, msg, true);
                    break;
                case 'close':
                    if (ctx.privilegeLevel < 50) {
                        seal.replyToSender(ctx, msg, '你没有权限执行该操作哦~（需要管理员权限）');
                        return seal.ext.newCmdExecuteResult(false);
                    }
                    handleSwitch(timer, ctx, msg, false);
                    break;
                case 'get':
                    handleGetWeather(ctx, msg, cmdArgs);
                    break;
                default:
                    seal.replyToSender(ctx, msg, cmd.help);
            }
        } catch (err) {
            seal.replyToSender(ctx, msg, `哎呀，操作失败了！\n ${err.message}`);
        }
        return seal.ext.newCmdExecuteResult(true);
    };

    ext.cmdMap['weather'] = cmd;
}

// **************** 指令处理函数 ****************
async function handleAdd(timer, ctx, msg, cmdArgs) {
    const cityInput = cmdArgs.getArgN(2);
    const timeStr = cmdArgs.getArgN(3);

    if (!/^\d{1,2}:\d{2}$/.test(timeStr)) {
        seal.replyToSender(ctx, msg, `指令格式错啦，给你一个示例吧！→.weather add 成都 20:20`);
        return;
    }

    // 解析时间字符串为小时和分钟
    const [hour, minute] = timeStr.split(':').map(Number);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        seal.replyToSender(ctx, msg, '唔...时间格式错了啊，你这是在考验我？');
        return;
    }

    // 获取城市信息
    let cityInfo;
    try {
        cityInfo = await getCityInfo(cityInput);
    } catch (e) {
        // console.log(e);
    }

    if (!cityInfo || !cityInfo.city || !cityInfo.province) {
        seal.replyToSender(ctx, msg, '咳咳...无法搜索到该城市，只是因为我暂时不想动了！（仅支持国内天气）');
        return;
    }

    const time = new Date(`${new Date().toDateString()} ${timeStr}`).getTime();

    // 检查是否重复（当前群、城市、时间相同）
    const isDuplicate = timer.config.tasks.some(t =>
        t.groupId === msg.groupId &&
        t.city === cityInfo.city &&
        new Date(t.time).getHours() === hour &&
        new Date(t.time).getMinutes() === minute
    );

    if (isDuplicate) {
        seal.replyToSender(ctx, msg, '哦呀，列表中已经有重复任务了，不要给我增加工作量嘛~');
        return;
    }

    // ✅ 合法，添加任务
    try {
        timer.addTask(
            ctx.endPoint.userId,
            msg.guildId,
            msg.groupId,
            msg.sender.userId,
            msg.messageType === "private",
            time,
            cityInfo.city,
            cityInfo.province
        );
    } catch (e) {
        // console.log('time', e);
    }

    seal.replyToSender(ctx, msg, `好好，这就给你添加上 ${timeStr} ${cityInput} 的天气播报`);
}

function handleList(timer, ctx, msg) {
    let filteredTasks = timer.config.tasks;

    if (msg.messageType === 'group') {
        filteredTasks = filteredTasks.filter(t => t.groupId === msg.groupId);
    }

    const tasks = filteredTasks.map((t, idx) => {
        // 处理时间显示 - 兼容字符串和时间戳两种格式
        let timeDisplay;
        if (typeof t.time === 'string' && t.time.includes(':')) {
            // 新版本：time是字符串格式（如"10:36"）
            timeDisplay = t.time;
        } else {
            // 旧版本：time是时间戳，需要转换
            const timeObj = new Date(t.time);
            timeDisplay = timeObj.toLocaleTimeString('zh', { hour12: false }).slice(0, 5);
        }
        return `${idx + 1}. 时间：${timeDisplay} | 城市：${t.city}`;
    }).join('\n');

    seal.replyToSender(ctx, msg, tasks ? '要看看这里的预报列表吗？好啊~\n' + tasks : '现在这里没有播报任务哦，有点无聊呢...');
}

function handleDelete(timer, ctx, msg, cmdArgs) {
    const indexStr = cmdArgs.getArgN(2);
    const index = parseInt(indexStr);

    if (isNaN(index) || index < 1) {
        seal.replyToSender(ctx, msg, '嗯...格式不对哦，得输入要删除的任务编号才行（例如 .weather del 2）');
        return;
    }

    const groupTasks = timer.config.tasks.filter(t => t.groupId === msg.groupId);
    if (index > groupTasks.length) {
        seal.replyToSender(ctx, msg, '我翻我翻...没有对应编号的任务啊');
        return;
    }

    // 找到要删的任务
    const targetTask = groupTasks[index - 1];
    // 删除它
    timer.config.tasks = timer.config.tasks.filter(t => t !== targetTask);
    timer.saveConfig();
    seal.replyToSender(ctx, msg, `OK~已经删除了编号为 ${index} 的任务：${targetTask.city}`);
}

function handleClear(timer, ctx, msg) {
    const before = timer.config.tasks.length;
    timer.config.tasks = timer.config.tasks.filter(t => t.groupId !== msg.groupId);
    const after = timer.config.tasks.length;
    const removed = before - after;

    timer.saveConfig();
    seal.replyToSender(ctx, msg, `好咯！已经清除了本群的所有播报任务！哈啊...我去休息了......`);
}

function handleSwitch(timer, ctx, msg, state) {
    timer.running = state;
    timer.saveRunningState();
    
    if (state) {
        timer.initTimer();
        // console.log('[系统控制] 播报系统已启动');
    } else {
        // 关闭时清理定时器
        if (timer.interval) {
            clearTimeout(timer.interval);
            timer.interval = null;
        }
        // console.log('[系统控制] 播报系统已关闭，定时器已清理');
    }
    
    seal.replyToSender(ctx, msg, `麦克风测试...麦克风测试...播报系统已${state ? '启动' : '关闭'}`);
}

async function handleGetWeather(ctx, msg, cmdArgs) {
    const cityInput = cmdArgs.getArgN(2);
    
    if (!cityInput) {
        seal.replyToSender(ctx, msg, '哎呀！是不是忘记自己要找什么了~');
        return;
    }

    let cityInfo;
    try {
        cityInfo = await getCityInfo(cityInput);
    } catch (e) {
        // console.log(e);
    }

    if (!cityInfo || !cityInfo.city || !cityInfo.province) {
        seal.replyToSender(ctx, msg, '咳咳...无法搜索到该城市，只是因为我暂时不想动了！（仅支持国内天气）');
        return;
    }

    try {
        const timer = new WeatherTimer(ext);
        const report = await timer.getWeatherReport(cityInfo.province, cityInfo.city);
        seal.replyToSender(ctx, msg, `好啦，这是${cityInfo.city}的天气播报，请查收！${report}`);
    } catch (err) {
        seal.replyToSender(ctx, msg, `哎呀，天气获取失败了：${err.message}`);
    }
}

// **************** 初始化模块 ****************
let ext = seal.ext.find('天气预报增强版');
if (!ext) {
    ext = seal.ext.new('天气预报增强版', 'bug人@', '3.0.0');
    registerCommands(ext);
    seal.ext.register(ext);

    // 初始化定时器
    new WeatherTimer(ext);
}

// **************** 工具函数 ****************
async function getCityInfo(cityName) {
    const response = await fetch(`${CITY_API}?source=pc&city=${encodeURIComponent(cityName)}`);
    const data = await response.json();
    // console.log(JSON.stringify(data))
    try {

        const [cityId, address] = Object.entries(data.data)[0];
        // console.log(JSON.stringify(cityId),JSON.stringify(address),1)
        const [province, city] = address.split(',').map(s => s.trim());
        // console.log(province,city)
        return { province, city, cityId };
    } catch (e) {
        // console.log(e)
    }
}
