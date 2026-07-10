import type { Tool } from "@/lib/tools";

/**
 * 智能搜索引擎模块
 *
 * 支持：场景描述映射、精确/模糊/分词/拼音匹配等多维度打分，
 * 纯函数实现，不依赖任何第三方库，可在客户端直接使用。
 *
 * 典型场景：
 *   - "我想把图片变小" → 推荐图片压缩工具
 *   - "PDF转Word"      → 推荐对应转换工具
 *   - "JSON看不懂"     → 推荐JSON格式化
 */

// ============================================================
// 1. 场景描述映射表
//    key: 自然语言 / 动作描述 / 场景描述 / 需求描述 / 问题描述
//    value: 对应工具 id 数组（按推荐优先级排序）
//    覆盖全部 14 个分类：计算工具、文本工具、生成工具、转换工具、
//    生活工具、设计工具、开发工具、图片工具、PDF工具、视频音频、
//    查询工具、教育学习、金融理财、健康医疗
// ============================================================

const SCENARIO_MAP: Record<string, string[]> = {
  // ---------- 图片工具 ----------
  "图片变小": ["image-compressor"],
  "我想把图片变小": ["image-compressor"],
  "图片缩小": ["image-compressor"],
  "图片减小": ["image-compressor"],
  "缩小图片": ["image-compressor"],
  "减小图片": ["image-compressor"],
  "压缩图片": ["image-compressor"],
  "图片压缩": ["image-compressor"],
  "减小图片体积": ["image-compressor"],
  "图片太大": ["image-compressor"],
  "照片压缩": ["image-compressor"],
  "压缩照片": ["image-compressor"],
  "裁剪图片": ["image-crop"],
  "图片裁剪": ["image-crop"],
  "调整图片大小": ["image-resize"],
  "修改图片尺寸": ["image-resize"],
  "图片格式转换": ["image-converter"],
  "png转jpg": ["png-to-jpg"],
  "jpg转png": ["jpg-to-png"],
  "抠图": ["bg-remover"],
  "去除背景": ["bg-remover"],
  "图片去背景": ["bg-remover"],
  "图片加水印": ["image-watermark"],
  "给图片加水印": ["image-watermark"],
  "图片旋转": ["image-rotate"],
  "图片拼接": ["image-grid"],
  "制作长图": ["image-grid"],
  "九宫格": ["image-grid-cutter"],
  "制作表情包": ["meme-generator"],
  "生成头像": ["avatar-generator"],
  "圆形头像": ["circle-crop"],
  "图片转PDF": ["image-to-pdf"],
  "图片模糊": ["image-blur"],
  "图片打马赛克": ["image-blur"],
  "图片转svg": ["image-to-svg"],

  // ---------- PDF工具 ----------
  "PDF转Word": ["pdf-to-word"],
  "pdf转word": ["pdf-to-word"],
  "Word转PDF": ["word-to-pdf"],
  "word转pdf": ["word-to-pdf"],
  "PDF压缩": ["pdf-compressor"],
  "压缩PDF": ["pdf-compressor"],
  "PDF合并": ["pdf-merge"],
  "合并PDF": ["pdf-merge"],
  "PDF分割": ["pdf-splitter"],
  "分割PDF": ["pdf-splitter"],
  "PDF转图片": ["pdf-to-image"],
  "PDF转文本": ["pdf-to-text"],
  "提取PDF文字": ["pdf-to-text"],
  "文本转PDF": ["text-to-pdf"],
  "HTML转PDF": ["html-to-pdf"],
  "PDF加密": ["pdf-protect"],
  "PDF加密码": ["pdf-protect"],
  "PDF解锁": ["pdf-unlock"],
  "PDF去密码": ["pdf-unlock"],
  "PDF签名": ["pdf-sign"],
  "PDF电子签名": ["pdf-sign"],
  "PDF转Excel": ["pdf-to-excel"],
  "Excel转PDF": ["excel-to-pdf"],
  "PPT转PDF": ["ppt-to-pdf"],
  "PDF旋转": ["pdf-rotate"],
  "PDF提取页面": ["pdf-extract-pages"],
  "PDF重排页面": ["pdf-reorder-pages"],
  "Markdown转PDF": ["markdown-to-pdf"],

  // ---------- 转换工具 ----------
  "文档转格式": ["image-converter", "pdf-to-word", "word-to-pdf"],
  "Base64编码": ["base64"],
  "base64解码": ["base64"],
  "图片转Base64": ["image-to-base64"],
  "颜色转换": ["color-picker"],
  "URL编码": ["url-encoder", "url-encode"],
  "url解码": ["url-encoder", "url-encode"],
  "视频转GIF": ["video-to-gif"],
  "SVG转JSX": ["svg-to-jsx-converter"],
  "数字转英文": ["number-to-words"],
  "罗马数字转换": ["roman-numeral-converter"],
  "Excel转JSON": ["excel-to-json"],
  "JSON转Excel": ["json-to-excel"],

  // ---------- 生成工具 ----------
  "生成密码": ["password-generator"],
  "随机密码": ["password-generator"],
  "生成UUID": ["uuid-generator"],
  "生成二维码": ["qrcode"],
  "制作二维码": ["qrcode"],
  "扫码识别": ["qr-decoder"],
  "二维码解码": ["qr-decoder"],
  "随机数": ["random-number"],
  "生成随机数": ["random-number"],
  "幸运数字": ["lucky-number"],
  "抽奖号码": ["lucky-number"],
  "生成配色": ["color-palette-generator"],
  "配色方案": ["color-palette-generator"],
  "CSS渐变": ["gradient-generator", "css-gradient-generator"],
  "生成渐变": ["gradient-generator"],
  "随机颜色": ["random-color"],
  "CSS阴影": ["shadow-generator", "css-box-shadow"],
  "生成阴影": ["css-box-shadow"],
  "CSS圆角": ["css-border-radius"],
  "CSS布局": ["css-grid-generator", "css-flex-generator"],
  "HTML表格": ["html-table-generator"],
  "Meta标签": ["meta-tag-generator"],
  "robots.txt": ["robots-txt-generator"],
  "随机名言": ["random-quote-generator"],
  "随机姓名": ["random-name-generator"],

  // ---------- 开发工具 ----------
  "JSON看不懂": ["json-formatter"],
  "JSON格式化": ["json-formatter"],
  "美化JSON": ["json-formatter"],
  "JSON转YAML": ["json-to-yaml"],
  "YAML转JSON": ["yaml-to-json"],
  "JSON转CSV": ["json-to-csv"],
  "CSV转JSON": ["csv-to-json"],
  "JSON转XML": ["json-to-xml"],
  "XML转JSON": ["xml-to-json"],
  "XML格式化": ["xml-formatter"],
  "YAML格式化": ["yaml-formatter"],
  "SQL格式化": ["sql-formatter"],
  "美化SQL": ["sql-formatter"],
  "JavaScript格式化": ["javascript-formatter"],
  "CSS格式化": ["css-formatter"],
  "HTML格式化": ["html-formatter"],
  "HTML实体编码": ["html-entity-encode"],
  "HTML实体解码": ["html-entity-decode"],
  "文本转二进制": ["text-to-binary"],
  "二进制转文本": ["binary-to-text"],
  "正则表达式测试": ["regex-tester"],
  "测试正则": ["regex-tester"],
  "哈希计算": ["hash-generator"],
  "生成哈希": ["hash-generator"],
  "MD5": ["hash-generator"],
  "JWT解析": ["jwt-decoder"],
  "解析JWT": ["jwt-decoder"],
  "Cron表达式": ["cron-generator"],
  "生成Cron": ["cron-generator"],
  "HTML转JSX": ["html-to-jsx"],
  "JSX转HTML": ["jsx-to-html"],
  "Git命令": ["git-cheatsheet"],
  "Linux命令": ["linux-cheatsheet"],
  "HTTP状态码": ["http-status-codes"],
  "CSS压缩": ["css-minifier"],
  "HTML压缩": ["html-minifier"],
  "密码强度检测": ["password-strength-checker"],
  "正则表达式生成": ["regex-generator"],

  // ---------- 文本工具 ----------
  "字数统计": ["word-counter"],
  "统计字数": ["word-counter"],
  "大小写转换": ["case-converter"],
  "文字去重": ["text-dedup"],
  "去除重复行": ["remove-duplicate-lines"],
  "去除换行": ["remove-line-breaks"],
  "去除HTML标签": ["remove-html-tags"],
  "金额大写": ["amount-to-chinese"],
  "数字转大写": ["amount-to-chinese"],
  "文本对比": ["text-diff"],
  "对比文本": ["text-diff"],
  "繁简转换": ["traditional-simplified"],
  "繁体转简体": ["traditional-simplified"],
  "文字转拼音": ["text-to-pinyin"],
  "驼峰命名": ["camel-case"],
  "下划线命名": ["snake-case"],
  "文本反转": ["text-reverse"],
  "文本排序": ["text-sort"],
  "文本替换": ["text-replace"],
  "删除空行": ["remove-empty-lines"],
  "去除空格": ["remove-spaces"],
  "拼音输入": ["chinese-pinyin-input"],

  // ---------- 计算工具 ----------
  "房贷计算": ["mortgage-calculator"],
  "计算月供": ["mortgage-calculator"],
  "个税计算": ["tax-calculator"],
  "计算个税": ["tax-calculator"],
  "BMI计算": ["bmi-calculator"],
  "计算BMI": ["bmi-calculator"],
  "年龄计算": ["age-calculator"],
  "单位换算": ["unit-converter"],
  "进制转换": ["base-converter"],
  "科学计算器": ["calculator"],
  "复利计算": ["compound-interest"],
  "贷款计算": ["loan-calculator"],
  "折扣计算": ["discount-calculator"],
  "百分比计算": ["percentage-calculator"],

  // ---------- 生活工具 ----------
  "倒计时": ["countdown-timer"],
  "计时器": ["countdown-timer"],
  "日期计算": ["date-calculator"],
  "时间戳转换": ["timestamp"],
  "文字转语音": ["text-to-speech"],
  "语音朗读": ["text-to-speech"],
  "番茄钟": ["pomodoro-timer"],
  "秒表": ["stopwatch"],
  "纪念日计算": ["anniversary-calculator"],
  "生肖查询": ["chinese-zodiac"],

  // ---------- 设计工具 ----------
  "取色": ["color-picker-from-image", "color-palette-from-image"],
  "图片取色": ["color-palette-from-image"],
  "Tailwind调色板": ["tailwind-palette"],
  "颜色混合": ["color-mixer"],
  "色轮": ["color-wheel"],
  "颜色命名": ["color-namer"],
  "RGB转HSL": ["rgb-to-hsl"],
  "色盲模拟": ["color-blind-simulator"],
  "渐变文字": ["gradient-text-generator"],
  "字体搭配": ["font-pairing"],
  "Favicon": ["favicon-generator-pro"],

  // ---------- 视频音频 ----------
  "视频压缩": ["video-compressor"],
  "压缩视频": ["video-compressor"],
  "音频压缩": ["audio-compressor"],
  "MP4转MP3": ["mp4-to-mp3"],
  "视频提取音频": ["audio-extractor"],
  "视频裁剪": ["video-trimmer"],
  "音频裁剪": ["audio-trimmer"],
  "视频合并": ["video-merger"],
  "音频合并": ["audio-merger"],
  "视频变速": ["video-speed-changer"],
  "音频变速": ["audio-speed-changer"],
  "视频倒放": ["video-reverse"],
  "音量调整": ["volume-changer"],

  // ---------- 查询工具 ----------
  "IP查询": ["ip-lookup"],
  "查IP": ["ip-lookup"],
  "手机号归属地": ["phone-location"],
  "邮编查询": ["zip-code-query"],
  "身份证解析": ["id-card-parser"],
  "车牌查询": ["license-plate-location"],
  "区号查询": ["area-code-query"],
  "国家代码": ["country-codes"],
  "世界时钟": ["world-clocks"],
  "节假日查询": ["chinese-holiday-query"],
  "键盘键码": ["keyboard-keycodes"],

  // ---------- 教育学习 ----------
  "单词背诵": ["vocabulary-flashcard"],
  "口算练习": ["mental-math-practice"],
  "乘法口诀": ["multiplication-table"],
  "元素周期表": ["periodic-table-interactive"],
  "数学公式": ["math-formula-sheet"],
  "物理公式": ["physics-formula-sheet"],
  "化学方程式": ["chemistry-formula-sheet"],
  "英语语法": ["english-grammar"],
  "汉字笔顺": ["chinese-character-stroke"],
  "古诗词": ["poetry-recitation"],
  "打字练习": ["typing-practice"],

  // ---------- 金融理财 ----------
  "复利收益": ["compound-interest-calc"],
  "基金收益": ["fund-return-calc"],
  "股票收益": ["stock-profit-calc"],
  "退休金计算": ["retirement-calc"],
  "通胀计算": ["inflation-calc"],
  "储蓄目标": ["savings-goal-calc"],
  "信用卡还款": ["credit-card-payoff"],
  "车贷计算": ["car-loan-calc"],
  "汇率换算": ["currency-exchange-calc"],
  "黄金价格": ["gold-price-calc"],
  "税后工资": ["salary-after-tax"],

  // ---------- 健康医疗 ----------
  "卡路里计算": ["advanced-calorie-calc"],
  "运动消耗": ["exercise-calorie-burn"],
  "睡眠记录": ["sleep-quality-tracker"],
  "饮水提醒": ["water-intake-reminder"],
  "经期计算": ["menstrual-cycle-calc"],
  "身材比例": ["body-shape-calc"],
  "基础代谢": ["basal-metabolic-rate"],
  "标准体重": ["ideal-weight-range"],
  "心率区间": ["heart-rate-zones"],
};

// ============================================================
// 2. 停用词列表
// ============================================================

const STOP_WORDS = new Set<string>([
  // 常用助词/语气词
  "的", "了", "把", "我", "想", "要", "帮我", "请问", "怎么", "如何",
  "一下", "一个", "什么", "工具", "在线", "用", "使", "需要", "能不能",
  "可以", "吗", "呢", "吧", "啊", "哦", "这个", "那个", "有", "是",
  "在", "也", "都", "就", "还", "又", "且", "则", "而", "但", "但是",
  "然而", "不过", "虽然", "虽", "然", "如果", "如", "假如", "假使",
  "倘若", "倘", "若", "要是", "除非", "除", "除了", "不然", "否则",
  "不然的话", "要不然",
  // 补充常见无意义词
  "给", "和", "与", "及", "或", "以及", "并", "或者", "跟", "同",
  "给", "对", "于", "关于", "至于", "对于", "通过", "经过", "由",
  "从", "向", "往", "到", "至", "为", "为了", "因", "因为", "由于",
  "所以", "因此", "因而", "于是", "从而", "的话", "着", "过", "们",
  "你", "他", "她", "它", "您", "咱们", "我们", "你们", "他们",
  "哪", "哪些", "哪个", "怎样", "怎么样", "多少", "几", "些",
  "没", "没有", "不", "非", "未", "别", "莫", "勿", "甭",
  "很", "非常", "十分", "特别", "尤其", "最", "比较", "更", "越",
  "已经", "正在", "将", "马上", "立刻", "赶紧", "快",
  "请", "麻烦", "帮", "帮忙", "帮忙找", "找", "求", "推荐",
]);

// ============================================================
// 3. 简单拼音首字母表（覆盖常见汉字，无需第三方库）
//    仅用于：搜索词全为字母时，与工具名拼音首字母匹配
// ============================================================

const PINYIN_INITIALS: Record<string, string> = {
  // A
  "啊": "a", "阿": "a", "爱": "a", "安": "a", "暗": "a", "按": "a", "艾": "a", "奥": "a",
  // B
  "把": "b", "吧": "b", "白": "b", "百": "b", "办": "b", "半": "b", "包": "b", "保": "b",
  "报": "b", "杯": "b", "备": "b", "本": "b", "笔": "b", "比": "b", "变": "b", "表": "b",
  "别": "b", "并": "b", "拨": "b", "波": "b", "补": "b", "不": "b", "步": "b", "标": "b",
  "版": "b", "板": "b", "辨": "b", "背": "b", "被": "b", "币": "b", "必": "b", "边": "b",
  "播": "b", "部": "b", "宾": "b", "帮": "b",
  // C
  "才": "c", "材": "c", "裁": "c", "采": "c", "菜": "c", "参": "c", "查": "c", "察": "c",
  "差": "c", "产": "c", "长": "c", "常": "c", "场": "c", "厂": "c", "车": "c", "称": "c",
  "成": "c", "程": "c", "尺": "c", "出": "c", "除": "c", "处": "c", "传": "c", "创": "c",
  "此": "c", "次": "c", "从": "c", "错": "c", "财": "c", "测": "c", "层": "c", "曾": "c",
  "拆": "c", "词": "c", "磁": "c", "存": "c", "操": "c", "草": "c", "策": "c", "储": "c",
  // D
  "答": "d", "大": "d", "代": "d", "单": "d", "但": "d", "当": "d", "导": "d", "到": "d",
  "道": "d", "得": "d", "的": "d", "等": "d", "低": "d", "底": "d", "地": "d", "第": "d",
  "点": "d", "电": "d", "定": "d", "动": "d", "都": "d", "独": "d", "度": "d",
  "短": "d", "断": "d", "对": "d", "多": "d", "档": "d", "段": "d", "典": "d", "倒": "d",
  "顶": "d", "冬": "d", "东": "d", "读": "d", "队": "d", "兑": "d",
  // E
  "饿": "e", "额": "e", "恶": "e", "二": "e", "而": "e", "尔": "e", "耳": "e",
  // F
  "发": "f", "翻": "f", "反": "f", "返": "f", "方": "f", "防": "f", "访": "f", "放": "f",
  "飞": "f", "非": "f", "分": "f", "丰": "f", "风": "f", "否": "f", "夫": "f", "服": "f",
  "浮": "f", "符": "f", "附": "f", "复": "f", "法": "f", "范": "f", "犯": "f", "繁": "f",
  "饭": "f", "费": "f", "封": "f", "峰": "f", "幅": "f",
  // G
  "改": "g", "盖": "g", "干": "g", "感": "g", "高": "g", "搞": "g", "个": "g", "各": "g",
  "给": "g", "根": "g", "跟": "g", "更": "g", "工": "g", "公": "g", "功": "g", "共": "g",
  "关": "g", "观": "g", "管": "g", "光": "g", "广": "g", "归": "g", "规": "g", "过": "g",
  "格": "g", "国": "g", "故": "g", "固": "g", "购": "g", "股": "g", "割": "g", "供": "g",
  "刮": "g", "滚": "g",
  // H
  "海": "h", "含": "h", "合": "h", "和": "h", "黑": "h", "很": "h", "换": "h", "回": "h",
  "会": "h", "活": "h", "火": "h", "获": "h", "化": "h", "话": "h", "画": "h", "后": "h",
  "候": "h", "好": "h", "号": "h", "红": "h", "宏": "h", "黄": "h", "灰": "h", "护": "h",
  "互": "h", "环": "h", "缓": "h", "还": "h", "哈": "h", "核": "h", "横": "h", "衡": "h",
  // J
  "机": "j", "基": "j", "几": "j", "计": "j", "记": "j", "技": "j", "加": "j", "间": "j",
  "检": "j", "简": "j", "建": "j", "健": "j", "交": "j", "角": "j", "脚": "j", "教": "j",
  "接": "j", "节": "j", "结": "j", "解": "j", "进": "j", "近": "j", "经": "j", "精": "j",
  "净": "j", "静": "j", "旧": "j", "就": "j", "句": "j", "绝": "j", "价": "j", "件": "j",
  "减": "j", "剪": "j", "鉴": "j", "键": "j", "渐": "j", "将": "j", "奖": "j", "降": "j",
  "阶": "j", "金": "j", "今": "j", "紧": "j", "仅": "j", "景": "j", "境": "j", "局": "j",
  "具": "j", "据": "j", "聚": "j", "距": "j", "决": "j", "均": "j",
  // K
  "卡": "k", "开": "k", "看": "k", "考": "k", "科": "k", "可": "k", "克": "k", "客": "k",
  "课": "k", "空": "k", "控": "k", "口": "k", "快": "k", "块": "k", "款": "k", "扩": "k",
  "括": "k", "库": "k", "跨": "k", "框": "k", "康": "k", "抗": "k",
  // L
  "拉": "l", "来": "l", "蓝": "l", "老": "l", "乐": "l", "类": "l", "离": "l", "里": "l",
  "理": "l", "力": "l", "立": "l", "连": "l", "联": "l", "量": "l", "料": "l", "列": "l",
  "临": "l", "零": "l", "另": "l", "流": "l", "留": "l", "六": "l", "龙": "l", "录": "l",
  "旅": "l", "绿": "l", "路": "l", "论": "l", "轮": "l", "律": "l", "率": "l", "两": "l",
  "亮": "l",
  // M
  "马": "m", "买": "m", "卖": "m", "满": "m", "慢": "m", "忙": "m", "毛": "m", "么": "m",
  "每": "m", "美": "m", "门": "m", "密": "m", "面": "m", "秒": "m", "名": "m", "明": "m",
  "命": "m", "模": "m", "码": "m",
  // N
  "那": "n", "内": "n", "能": "n", "你": "n", "年": "n", "念": "n", "宁": "n", "南": "n",
  "难": "n", "牛": "n", "农": "n", "女": "n", "男": "n",
  // O
  "哦": "o", "欧": "o", "偶": "o",
  // P
  "怕": "p", "判": "p", "旁": "p", "配": "p", "批": "p", "匹": "p", "片": "p", "拼": "p",
  "平": "p", "评": "p", "破": "p", "普": "p", "频": "p", "排": "p", "盘": "p", "票": "p",
  "品": "p", "屏": "p",
  // Q
  "七": "q", "期": "q", "其": "q", "奇": "q", "起": "q", "企": "q", "气": "q", "千": "q",
  "迁": "q", "签": "q", "前": "q", "钱": "q", "切": "q", "情": "q", "请": "q", "区": "q",
  "去": "q", "全": "q", "群": "q", "取": "q", "求": "q", "曲": "q", "趣": "q", "轻": "q",
  "清": "q", "秋": "q", "球": "q", "确": "q", "缺": "q", "却": "q",
  // R
  "然": "r", "让": "r", "人": "r", "任": "r", "日": "r", "容": "r", "认": "r", "仍": "r",
  "如": "r", "入": "r", "弱": "r", "肉": "r", "软": "r", "瑞": "r",
  // S
  "三": "s", "色": "s", "杀": "s", "傻": "s", "删": "s", "山": "s", "闪": "s", "商": "s",
  "上": "s", "烧": "s", "少": "s", "设": "s", "身": "s", "深": "s", "生": "s", "声": "s",
  "实": "s", "时": "s", "使": "s", "世": "s", "事": "s", "适": "s", "收": "s", "手": "s",
  "受": "s", "输": "s", "数": "s", "算": "s", "说": "s", "思": "s", "死": "s", "四": "s",
  "速": "s", "宿": "s", "随": "s", "所": "s", "缩": "s", "式": "s", "视": "s", "是": "s",
  "十": "s", "什": "s", "双": "s", "水": "s", "顺": "s", "司": "s", "私": "s", "似": "s",
  "松": "s", "送": "s", "素": "s", "诉": "s", "塑": "s", "酸": "s", "虽": "s", "岁": "s",
  "碎": "s", "损": "s", "锁": "s",
  // T
  "他": "t", "台": "t", "太": "t", "谈": "t", "探": "t", "套": "t", "特": "t", "提": "t",
  "题": "t", "体": "t", "天": "t", "调": "t", "条": "t", "铁": "t", "听": "t", "同": "t",
  "统": "t", "图": "t", "推": "t", "退": "t", "通": "t", "停": "t", "脱": "t", "碳": "t",
  "它": "t", "她": "t", "堂": "t", "腾": "t", "填": "t", "跳": "t", "铜": "t", "头": "t",
  "透": "t", "突": "t", "土": "t", "团": "t",
  // U V W
  "外": "w", "完": "w", "万": "w", "网": "w", "往": "w", "为": "w", "闻": "w", "问": "w",
  "我": "w", "无": "w", "五": "w", "物": "w", "维": "w", "文": "w", "位": "w", "委": "w",
  "未": "w", "卫": "w", "温": "w", "稳": "w", "握": "w", "污": "w", "武": "w", "误": "w",
  "务": "w",
  // X
  "西": "x", "吸": "x", "希": "x", "喜": "x", "系": "x", "下": "x", "先": "x", "显": "x",
  "现": "x", "线": "x", "相": "x", "想": "x", "向": "x", "像": "x", "小": "x", "校": "x",
  "写": "x", "些": "x", "新": "x", "心": "x", "信": "x", "行": "x", "型": "x", "选": "x",
  "学": "x", "雪": "x", "询": "x", "习": "x", "需": "x", "许": "x", "续": "x", "息": "x",
  "修": "x", "秀": "x", "虚": "x", "序": "x", "项": "x", "效": "x", "消": "x", "笑": "x",
  "星": "x", "形": "x", "性": "x", "姓": "x", "休": "x",
  // Y
  "压": "y", "牙": "y", "研": "y", "颜": "y", "眼": "y", "验": "y", "样": "y", "要": "y",
  "也": "y", "夜": "y", "一": "y", "移": "y", "已": "y", "以": "y", "亿": "y", "易": "y",
  "意": "y", "因": "y", "银": "y", "应": "y", "英": "y", "迎": "y", "赢": "y", "映": "y",
  "用": "y", "优": "y", "由": "y", "有": "y", "又": "y", "右": "y", "与": "y", "语": "y",
  "预": "y", "元": "y", "原": "y", "月": "y", "运": "y", "音": "y", "页": "y", "钥": "y",
  "余": "y", "育": "y", "域": "y", "遇": "y", "员": "y", "源": "y", "远": "y", "约": "y",
  "阅": "y", "云": "y", "允": "y", "永": "y", "勇": "y", "拥": "y", "硬": "y", "影": "y",
  // Z
  "杂": "z", "再": "z", "在": "z", "责": "z", "增": "z", "展": "z", "占": "z", "站": "z",
  "找": "z", "照": "z", "真": "z", "整": "z", "正": "z", "证": "z", "支": "z",
  "直": "z", "制": "z", "中": "z", "钟": "z", "种": "z", "重": "z", "周": "z", "转": "z",
  "装": "z", "准": "z", "子": "z", "字": "z", "自": "z", "总": "z", "组": "z", "最": "z",
  "左": "z", "做": "z", "作": "z", "只": "z", "至": "z", "知": "z", "值": "z", "质": "z",
  "着": "z", "这": "z", "怎": "z", "则": "z", "早": "z", "造": "z", "择": "z", "战": "z",
  "张": "z", "招": "z", "遮": "z", "针": "z", "珍": "z", "震": "z", "争": "z", "之": "z",
  "止": "z", "终": "z", "州": "z", "主": "z", "助": "z", "专": "z", "追": "z", "资": "z",
  "紫": "z",
};

// ============================================================
// 4. 搜索结果接口
// ============================================================

export interface SearchResult {
  tool: Tool;
  score: number;
  matchedFields: string[];
}

// ============================================================
// 5. 工具函数
// ============================================================

/** 判断字符是否为中文字符 */
function isChineseChar(ch: string): boolean {
  return /[\u4e00-\u9fa5]/.test(ch);
}

/** 判断字符是否为英文字母 */
function isAsciiLetter(ch: string): boolean {
  return /[a-zA-Z]/.test(ch);
}

/** 判断字符串是否全部由 ASCII 字母组成 */
function isAllAsciiLetters(s: string): boolean {
  return s.length > 0 && /^[a-zA-Z]+$/.test(s);
}

/**
 * 简单中文分词
 * - 去除停用词
 * - 提取英文单词与中文片段
 * - 对中文片段生成 bigram（双字词）以提升匹配率
 * - 支持中英混合查询
 */
function tokenize(query: string): string[] {
  // 统一小写
  let text = query.toLowerCase().trim();

  // 先按停用词做替换：把停用词替换为空格，避免把有意义的词切碎
  // 按长度倒序替换，优先匹配较长的停用词（如 "不然的话" 先于 "不然"）
  const stopWordList = Array.from(STOP_WORDS).sort((a, b) => b.length - a.length);
  for (const sw of stopWordList) {
    // 使用全局替换，注意特殊字符转义
    const escaped = sw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(escaped, "g"), " ");
  }

  const tokens: string[] = [];
  // 提取连续的英文/数字单词
  const latinMatches = text.match(/[a-z0-9]+/g);
  if (latinMatches) {
    for (const m of latinMatches) {
      if (m.length >= 1) tokens.push(m);
    }
  }

  // 提取连续的中文片段
  const chineseSegments = text.match(/[\u4e00-\u9fa5]+/g);
  if (chineseSegments) {
    for (const seg of chineseSegments) {
      if (seg.length === 1) {
        tokens.push(seg);
      } else {
        // 整段作为一个 token
        tokens.push(seg);
        // 同时生成 bigram 提高召回率
        for (let i = 0; i < seg.length - 1; i++) {
          tokens.push(seg.substring(i, i + 2));
        }
      }
    }
  }

  // 去重并过滤掉过短的纯标点
  const seen = new Set<string>();
  const result: string[] = [];
  for (const t of tokens) {
    if (t.length === 0) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    result.push(t);
  }
  return result;
}

/**
 * 去除停用词后的"清洗查询"
 * 将查询中的停用词移除后，把剩余内容拼接为连续字符串（去除空格），
 * 用于场景映射匹配，避免停用词穿插导致子串匹配失败。
 * 例如："帮我生成一个二维码" → "生成二维码"
 */
function removeStopWords(query: string): string {
  let text = query.toLowerCase().trim();
  const stopWordList = Array.from(STOP_WORDS).sort((a, b) => b.length - a.length);
  for (const sw of stopWordList) {
    const escaped = sw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(escaped, "g"), " ");
  }
  // 拼接为连续字符串，去掉所有空白
  return text.replace(/\s+/g, "");
}

/** 获取工具名拼音首字母串（仅对中文字符取首字母，非中文字符保留原样小写） */
function getPinyinInitials(name: string): string {
  let result = "";
  for (const ch of name) {
    if (isChineseChar(ch)) {
      result += PINYIN_INITIALS[ch] ?? "";
    } else if (isAsciiLetter(ch)) {
      result += ch.toLowerCase();
    }
  }
  return result;
}

/**
 * Levenshtein 编辑距离（动态规划实现）
 * 用于模糊匹配
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  // 使用单行数组优化空间
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1, // 删除
        curr[j - 1] + 1, // 插入
        prev[j - 1] + cost, // 替换
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/** 计算相似度（0-1），基于编辑距离 */
function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDistance(a, b);
  return 1 - dist / maxLen;
}

// ============================================================
// 6. 主搜索函数
// ============================================================

/**
 * 智能搜索工具
 *
 * 多维度打分策略（取每个工具在各策略下的最高分，并叠加较小权重）：
 *   1. 精确匹配（100）：工具名完全匹配
 *   2. 场景映射（90）：命中场景描述映射表
 *   3. 名称包含（80）：工具名包含搜索词
 *   4. 标签匹配（70）：工具 tags 包含搜索词
 *   5. 描述包含（60）：描述包含搜索词
 *   6. 分类匹配（50）：分类名包含搜索词
 *   7. 分词匹配（40）：搜索词分词后与工具信息匹配
 *   8. 拼音匹配（30）：工具名拼音首字母匹配搜索词
 *   9. 模糊匹配（20-35）：编辑距离模糊匹配
 *
 * @param query    用户搜索词
 * @param allTools 全部工具列表
 * @returns 按分数降序排序的搜索结果
 */
export function searchTools(query: string, allTools: Tool[]): SearchResult[] {
  const normalizedQuery = query.trim().toLowerCase();

  // 空查询直接返回空结果
  if (normalizedQuery.length === 0) return [];

  // 预处理：分词
  const tokens = tokenize(normalizedQuery);

  // 预处理：清洗查询（去除停用词后拼接），用于场景映射匹配
  const cleanedQuery = removeStopWords(normalizedQuery);

  // 预处理：场景映射命中
  const scenarioHitToolIds = new Set<string>();
  for (const [scenario, toolIds] of Object.entries(SCENARIO_MAP)) {
    const lowerScenario = scenario.toLowerCase();
    // 三重匹配，提升召回率：
    //   1. 原始查询包含场景关键词（如 "我想把图片变小" 包含 "图片变小"）
    //   2. 场景关键词包含原始查询（如查询 "压缩图片" 命中 "压缩图片"）
    //   3. 清洗查询与场景关键词互相包含（如 "帮我生成一个二维码" 清洗为 "生成二维码"）
    if (
      normalizedQuery.includes(lowerScenario) ||
      lowerScenario.includes(normalizedQuery) ||
      (cleanedQuery.length > 0 &&
        (cleanedQuery.includes(lowerScenario) || lowerScenario.includes(cleanedQuery)))
    ) {
      for (const tid of toolIds) scenarioHitToolIds.add(tid);
    }
  }

  const results: SearchResult[] = [];

  for (const tool of allTools) {
    let score = 0;
    const matchedFields = new Set<string>();

    const toolName = tool.name.toLowerCase();
    const toolDesc = tool.description.toLowerCase();
    const toolCategory = tool.category.toLowerCase();
    const toolTags = (tool.tags ?? []).map((t) => t.toLowerCase());
    const toolId = tool.id.toLowerCase();

    // ---- 1. 精确匹配（100）：工具名完全匹配 ----
    if (toolName === normalizedQuery) {
      score = Math.max(score, 100);
      matchedFields.add("name-exact");
    }
    // 工具 id 完全匹配也算精确
    if (toolId === normalizedQuery) {
      score = Math.max(score, 100);
      matchedFields.add("id-exact");
    }

    // ---- 2. 场景映射（90） ----
    if (scenarioHitToolIds.has(tool.id)) {
      score = Math.max(score, 90);
      matchedFields.add("scenario");
    }

    // ---- 3. 名称包含（80）：工具名包含搜索词 ----
    if (toolName.includes(normalizedQuery)) {
      score = Math.max(score, 80);
      matchedFields.add("name");
    }

    // ---- 4. 标签匹配（70）：工具 tags 包含搜索词 ----
    if (toolTags.some((t) => t.includes(normalizedQuery) || normalizedQuery.includes(t))) {
      score = Math.max(score, 70);
      matchedFields.add("tags");
    }

    // ---- 5. 描述包含（60）：描述包含搜索词 ----
    if (toolDesc.includes(normalizedQuery)) {
      score = Math.max(score, 60);
      matchedFields.add("description");
    }

    // ---- 6. 分类匹配（50）：分类名包含搜索词 ----
    if (toolCategory.includes(normalizedQuery)) {
      score = Math.max(score, 50);
      matchedFields.add("category");
    }

    // ---- 7. 分词匹配（40）：搜索词分词后与工具信息匹配 ----
    if (tokens.length > 0) {
      let tokenHitCount = 0;
      for (const token of tokens) {
        if (token.length < 1) continue;
        const hit =
          toolName.includes(token) ||
          toolDesc.includes(token) ||
          toolCategory.includes(token) ||
          toolId.includes(token) ||
          toolTags.some((t) => t.includes(token));
        if (hit) tokenHitCount++;
      }
      // 至少命中 1 个分词，且命中的分词占比越高得分越高（上限 40）
      if (tokenHitCount > 0) {
        const ratio = tokenHitCount / tokens.length;
        const tokenScore = Math.round(40 * ratio);
        if (tokenScore > score) {
          score = tokenScore;
        }
        matchedFields.add("tokenize");
      }
    }

    // ---- 8. 拼音匹配（30）：搜索词全为字母时，与工具名拼音首字母匹配 ----
    if (isAllAsciiLetters(normalizedQuery)) {
      const initials = getPinyinInitials(tool.name);
      if (initials.length > 0) {
        // 拼音首字母串包含搜索词，或搜索词包含拼音首字母串
        if (initials.includes(normalizedQuery) || normalizedQuery.includes(initials)) {
          score = Math.max(score, 30);
          matchedFields.add("pinyin");
        }
      }
    }

    // ---- 9. 模糊匹配（20-35）：编辑距离模糊匹配 ----
    // 仅在前面策略未命中或得分较低时，用模糊匹配兜底
    if (score < 40) {
      // 工具名模糊匹配
      const nameSim = similarity(normalizedQuery, toolName);
      if (nameSim >= 0.5) {
        const fuzzyScore = Math.round(20 + nameSim * 15); // 20-35
        if (fuzzyScore > score) {
          score = fuzzyScore;
          matchedFields.add("fuzzy-name");
        }
      }
      // 描述模糊匹配（阈值更高，避免过多噪音）
      if (score < 30) {
        const descSim = similarity(normalizedQuery, toolDesc);
        if (descSim >= 0.6) {
          const fuzzyScore = Math.round(20 + descSim * 10); // 20-30
          if (fuzzyScore > score) {
            score = fuzzyScore;
            matchedFields.add("fuzzy-description");
          }
        }
      }
    }

    // 命中任意策略则加入结果
    if (score > 0 && matchedFields.size > 0) {
      results.push({
        tool,
        score,
        matchedFields: Array.from(matchedFields),
      });
    }
  }

  // 按分数降序排序；分数相同时保持工具在原列表中的相对顺序（稳定排序）
  results.sort((a, b) => b.score - a.score);

  return results;
}
