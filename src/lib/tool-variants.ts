// Programmatic SEO variant definitions for high-frequency tools.
// Each variant targets a specific long-tail keyword with unique SEO content.

export interface ToolVariantFAQ {
  question: string;
  answer: string;
}

export interface ToolVariant {
  toolId: string;
  variantId: string;
  title: string;
  description: string;
  params: Record<string, string>;
  keywords: string[];
  faqs: ToolVariantFAQ[];
}

export const toolVariants: ToolVariant[] = [
  // ============================================================
  // BMI Calculator Variants
  // ============================================================
  {
    toolId: "bmi-calculator",
    variantId: "male",
    title: "男性BMI计算器 - 在线计算身体质量指数",
    description:
      "专为男性设计的BMI计算器，根据身高体重快速计算身体质量指数，评估男性体重是否健康，提供针对男性的健康建议。",
    params: { gender: "male" },
    keywords: [
      "男性BMI计算器",
      "男生BMI计算",
      "男性身体质量指数",
      "男性体重计算",
      "男性健康体重",
      "BMI计算男性",
    ],
    faqs: [
      {
        question: "男性BMI正常范围是多少？",
        answer:
          "男性BMI正常范围为18.5-23.9。低于18.5为偏瘦，24-27.9为超重，28及以上为肥胖。男性BMI标准与女性相同，但体脂率标准有所不同。",
      },
      {
        question: "男性BMI多少最健康？",
        answer:
          "研究表明，男性BMI保持在20-22之间时健康风险最低。这个范围内通常体脂率适中，心血管疾病风险较小。",
      },
      {
        question: "男性肌肉量大BMI会偏高吗？",
        answer:
          "是的。BMI无法区分肌肉和脂肪，肌肉量大的男性BMI可能偏高但不代表肥胖。建议结合体脂率指标综合判断。",
      },
    ],
  },
  {
    toolId: "bmi-calculator",
    variantId: "female",
    title: "女性BMI计算器 - 在线计算身体质量指数",
    description:
      "专为女性设计的BMI计算器，精准计算女性身体质量指数，评估女性体重健康状况，提供针对女性的健康和体型管理建议。",
    params: { gender: "female" },
    keywords: [
      "女性BMI计算器",
      "女生BMI计算",
      "女性身体质量指数",
      "女性体重计算",
      "女性健康体重",
      "BMI计算女性",
    ],
    faqs: [
      {
        question: "女性BMI正常范围是多少？",
        answer:
          "女性BMI正常范围为18.5-23.9。低于18.5为偏瘦，24-27.9为超重，28及以上为肥胖。女性体脂率通常高于男性，相同BMI下体脂率可能不同。",
      },
      {
        question: "女性BMI 20算正常吗？",
        answer:
          "女性BMI 20属于正常范围（18.5-23.9），是非常健康的体重水平。保持均衡饮食和适量运动即可维持这一健康状态。",
      },
      {
        question: "女性怀孕期间BMI怎么算？",
        answer:
          "怀孕期间BMI计算方法相同，但评判标准不同。孕期体重增加是正常现象，建议咨询医生了解孕期适宜的体重增长范围。",
      },
    ],
  },
  {
    toolId: "bmi-calculator",
    variantId: "child",
    title: "儿童BMI计算器 - 在线计算儿童身体质量指数",
    description:
      "专为儿童设计的BMI计算器，根据儿童身高体重计算BMI值，使用儿童专属标准评估生长发育状况，帮助家长了解孩子的健康成长情况。",
    params: { gender: "child" },
    keywords: [
      "儿童BMI计算器",
      "儿童BMI计算",
      "小孩身体质量指数",
      "儿童体重计算",
      "儿童健康体重",
      "儿童BMI标准",
    ],
    faqs: [
      {
        question: "儿童BMI标准与成人一样吗？",
        answer:
          "不一样。儿童BMI标准因年龄和性别而异，需要使用儿童BMI百分位曲线图来评估。通常使用CDC或WHO的儿童生长标准进行判断。",
      },
      {
        question: "儿童BMI百分位怎么看？",
        answer:
          "儿童BMI按百分位评估：低于第5百分位为体重不足，第5-85百分位为健康体重，第85-95百分位为超重，第95百分位以上为肥胖。",
      },
      {
        question: "儿童BMI偏低怎么办？",
        answer:
          "儿童BMI偏低可能影响生长发育。建议保证均衡营养摄入，增加蛋白质和优质碳水化合物，必要时咨询儿科医生或营养师。",
      },
    ],
  },

  // ============================================================
  // Mortgage Calculator Variants
  // ============================================================
  {
    toolId: "mortgage-calculator",
    variantId: "commercial",
    title: "商业贷款计算器 - 在线计算房贷月供",
    description:
      "专业的商业贷款计算器，支持等额本息和等额本金两种还款方式，精准计算商业房贷月供、总利息和还款总额，买房必备工具。",
    params: { loanType: "commercial" },
    keywords: [
      "商业贷款计算器",
      "商业房贷计算",
      "商业贷款月供计算",
      "等额本息商业贷款",
      "等额本金商业贷款",
      "商业贷款利率",
    ],
    faqs: [
      {
        question: "商业贷款利率是多少？",
        answer:
          "商业贷款利率以LPR（贷款市场报价利率）为基准，各银行在LPR基础上加点。当前首套房LPR利率通常在3.5%-4.2%之间，具体以银行实际审批为准。",
      },
      {
        question: "等额本息和等额本金哪个划算？",
        answer:
          "等额本金总利息更少，但前期月供较高；等额本息每月月供固定，还款压力均匀。如果前期资金充裕，选择等额本金更省利息。",
      },
      {
        question: "商业贷款最长可以贷多少年？",
        answer:
          "商业贷款最长贷款期限为30年，但实际期限受借款人年龄限制，通常要求贷款到期时借款人不超过70周岁。",
      },
    ],
  },
  {
    toolId: "mortgage-calculator",
    variantId: "housing-fund",
    title: "公积金贷款计算器 - 在线计算公积金房贷",
    description:
      "公积金贷款计算器，支持计算住房公积金贷款月供、利息和还款总额，对比公积金与商业贷款差异，帮你节省购房利息支出。",
    params: { loanType: "housing-fund" },
    keywords: [
      "公积金贷款计算器",
      "公积金房贷计算",
      "公积金月供计算",
      "住房公积金贷款",
      "公积金贷款利率",
      "公积金贷款额度",
    ],
    faqs: [
      {
        question: "公积金贷款利率是多少？",
        answer:
          "公积金贷款利率远低于商业贷款。当前首套房公积金贷款利率为2.85%（5年以上），二套房为3.325%（5年以上），具体以当地公积金中心公布为准。",
      },
      {
        question: "公积金贷款额度怎么算？",
        answer:
          "公积金贷款额度取决于多个因素：公积金缴存基数、缴存年限、账户余额、当地最高贷款限额等。一般最高可贷账户余额的15-20倍，具体以当地政策为准。",
      },
      {
        question: "公积金贷款和商业贷款能同时用吗？",
        answer:
          "可以。当公积金贷款额度不足以覆盖房款时，可以申请组合贷款（公积金贷款+商业贷款），享受公积金低利率的同时满足资金需求。",
      },
    ],
  },
  {
    toolId: "mortgage-calculator",
    variantId: "combined",
    title: "组合贷款计算器 - 公积金+商业贷款计算",
    description:
      "组合贷款计算器，同时计算公积金贷款和商业贷款的月供和利息，帮助你在公积金额度不足时合理规划组合贷款方案，最大化节省利息。",
    params: { loanType: "combined" },
    keywords: [
      "组合贷款计算器",
      "公积金商业组合贷款",
      "组合贷款月供计算",
      "组合贷款利息计算",
      "房贷组合贷款",
      "组合贷款方案",
    ],
    faqs: [
      {
        question: "组合贷款怎么分配最划算？",
        answer:
          "组合贷款应优先用足公积金贷款额度（利率低），剩余部分用商业贷款。公积金贷款额度越高，节省的利息越多。",
      },
      {
        question: "组合贷款还款方式可以不同吗？",
        answer:
          "可以。组合贷款中公积金贷款和商业贷款可以分别选择不同的还款方式（等额本息或等额本金），但实际操作中建议统一还款日方便管理。",
      },
      {
        question: "组合贷款审批需要多长时间？",
        answer:
          "组合贷款需要同时通过公积金中心和商业银行审批，通常比纯商业贷款慢1-2周，整体审批周期约30-45个工作日。",
      },
    ],
  },

  // ============================================================
  // Tax Calculator Variants
  // ============================================================
  {
    toolId: "tax-calculator",
    variantId: "salary",
    title: "工资税计算器 - 在线计算个人所得税",
    description:
      "工资税计算器，根据2026年最新个税税率表，计算工资薪金个人所得税，支持五险一金扣除和专项附加扣除，精准计算到手工资。",
    params: { taxType: "salary" },
    keywords: [
      "工资税计算器",
      "工资个税计算",
      "个人所得税计算",
      "工资税后计算",
      "工资扣税计算",
      "个税税率表",
    ],
    faqs: [
      {
        question: "工资个人所得税怎么计算？",
        answer:
          "工资个税 = (税前工资 - 五险一金个人部分 - 5000元起征点 - 专项附加扣除) × 适用税率 - 速算扣除数。采用累计预扣法按月计算。",
      },
      {
        question: "专项附加扣除有哪些？",
        answer:
          "专项附加扣除包括：子女教育（2000元/月/子女）、继续教育（400元/月）、住房贷款利息（1000元/月）、住房租金（800-1500元/月）、赡养老人（2000-3000元/月）、3岁以下婴幼儿照护（2000元/月/孩）。",
      },
      {
        question: "工资多少需要交税？",
        answer:
          "扣除五险一金和5000元起征点后，如果应纳税所得额大于0则需要缴纳个人所得税。月收入低于5000元（扣除五险一金前）通常无需缴税。",
      },
    ],
  },
  {
    toolId: "tax-calculator",
    variantId: "annual-bonus",
    title: "年终奖税计算器 - 在线计算年终奖个税",
    description:
      "年终奖个税计算器，支持单独计税和合并计税两种方式，精准计算年终奖应缴纳的个人所得税，帮你选择最优计税方案，到手更多。",
    params: { taxType: "annual-bonus" },
    keywords: [
      "年终奖税计算器",
      "年终奖个税计算",
      "年终奖扣税",
      "年终奖计税方式",
      "年终奖单独计税",
      "年终奖合并计税",
    ],
    faqs: [
      {
        question: "年终奖单独计税和合并计税哪个更划算？",
        answer:
          "取决于年终奖金额和月工资水平。一般来说，月工资较低（适用低税率档）时合并计税更划算；月工资较高时单独计税更划算。建议两种方式都计算后对比选择。",
      },
      {
        question: "年终奖单独计税怎么算？",
        answer:
          "单独计税时，将年终奖除以12个月，按照月度税率表确定适用税率和速算扣除数，然后计算：应纳税额 = 年终奖 × 适用税率 - 速算扣除数。",
      },
      {
        question: "年终奖计税优惠还有多久？",
        answer:
          "根据现行政策，居民个人取得全年一次性奖金，可选择单独计税，该优惠政策延续至2027年12月31日。建议在此期间合理规划年终奖计税方式。",
      },
    ],
  },
  {
    toolId: "tax-calculator",
    variantId: "labor-income",
    title: "劳务报酬税计算器 - 在线计算劳务费个税",
    description:
      "劳务报酬税计算器，精准计算劳务报酬所得的个人所得税，支持预扣预缴和年度汇算清缴两种场景，帮助你了解劳务费到手金额。",
    params: { taxType: "labor-income" },
    keywords: [
      "劳务报酬税计算器",
      "劳务费个税计算",
      "劳务报酬扣税",
      "劳务报酬所得税",
      "劳务费税后计算",
      "劳务报酬预扣预缴",
    ],
    faqs: [
      {
        question: "劳务报酬所得税怎么计算？",
        answer:
          "劳务报酬每次收入不超过4000元的减除800元，4000元以上的减除20%费用，剩余部分为应纳税所得额，按20%-40%三级超额累进税率计算。",
      },
      {
        question: "劳务报酬和工资薪金的区别？",
        answer:
          "工资薪金是任职受雇取得的收入，按月累计预扣；劳务报酬是独立个人劳务取得的收入，按次预扣预缴。年度汇算时两者合并计入综合所得。",
      },
      {
        question: "劳务报酬预扣率是多少？",
        answer:
          "劳务报酬预扣率分三档：应纳税所得额不超过20000元部分税率20%，20000-50000元部分税率30%（速算扣除数2000），超过50000元部分税率40%（速算扣除数7000）。",
      },
    ],
  },
];

// Get all variants for a specific tool
export function getVariantsByToolId(toolId: string): ToolVariant[] {
  return toolVariants.filter((v) => v.toolId === toolId);
}

// Get a specific variant by toolId and variantId
export function getVariant(
  toolId: string,
  variantId: string
): ToolVariant | undefined {
  return toolVariants.find(
    (v) => v.toolId === toolId && v.variantId === variantId
  );
}

// Get all unique toolIds that have variants
export function getToolsWithVariants(): string[] {
  return Array.from(new Set(toolVariants.map((v) => v.toolId)));
}
