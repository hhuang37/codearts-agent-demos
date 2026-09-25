/**
 * AI 报告规则引擎（services/rule-engine.ts）
 *
 * 与 design.md §8.1 对齐。
 *
 * v1.0 MVP：纯本地规则引擎
 * - 至少 30 条规则（按 durationMin / selfRating / type / source 维度匹配
 * - 三段式输出（现状 → 归因 → 建议）
 * - 模板填充占位符（X/Y/小时数等）
 *
 * 命中规则返回三段文案，未命中返回兜底模板
 */

import { SleepRecord } from '../models/sleep-record';

export interface RuleTemplate {
  /** 模板 ID */
  id: string;
  /** 适用类型 */
  type: 'night' | 'noon' | 'any';
  /** 触发条件 */
  conditions: Condition[];
  /** 现状模板数组（任选其一） */
  currentTemplates: string[];
  /** 归因模板数组 */
  causeTemplates: string[];
  /** 建议模板数组 */
  suggestionTemplates: string[];
}

export interface Condition {
  /** 字段名 */
  field: keyof SleepRecord;
  /** 比较操作符 */
  operator: '<' | '<=' | '==' | '!=' | '>' | '>=' | 'between';
  /** 比较值 */
  value: number | string | [number, number];
}

/**
 * 判断条件是否匹配
 */
function matchCondition(cond: Condition, record: SleepRecord): boolean {
  const fieldValue = record[cond.field];
  if (fieldValue === null || fieldValue === undefined) return false;
  switch (cond.operator) {
    case '<':
      return Number(fieldValue) < Number(cond.value);
    case '<=':
      return Number(fieldValue) <= Number(cond.value);
    case '==':
      return fieldValue === cond.value;
    case '!=':
      return fieldValue !== cond.value;
    case '>':
      return Number(fieldValue) > Number(cond.value);
    case '>=':
      return Number(fieldValue) >= Number(cond.value);
    case 'between': {
      if (!Array.isArray(cond.value)) return false;
      const [min, max] = cond.value;
      return Number(fieldValue) >= min && Number(fieldValue) <= max;
    }
    default:
      return false;
  }
}

/**
 * 模板填充（X=时长小时数，Y=与 8h 的差值小时数）
 */
function fillTemplate(template: string, record: SleepRecord): string {
  const hours = (record.durationMin / 60).toFixed(1);
  const diff = Math.abs(8 - record.durationMin / 60).toFixed(1);
  return template.replace(/X/g, hours).replace(/Y/g, diff);
}

/**
 * 30+ 条规则（按时间窗 × 类型 × 自评 多维组合）
 */
const RULES: RuleTemplate[] = [
  // ========== 夜间（night）规则 ==========
  {
    id: 'R001',
    type: 'night',
    conditions: [{ field: 'durationMin', operator: '<', value: 360 }],
    currentTemplates: [
      '昨晚你睡了 X 小时，比平时少 Y 小时',
      '只有 X 小时的睡眠，身体还没缓过来',
    ],
    causeTemplates: ['可能是睡前太晚，或者中间醒了几次', '屏幕亮太久让大脑没放松下来'],
    suggestionTemplates: [
      '今晚 22:30 关灯，给自己一点缓冲',
      '试试 5 分钟呼吸，让身体慢下来',
    ],
  },
  {
    id: 'R002',
    type: 'night',
    conditions: [
      { field: 'durationMin', operator: '>=', value: 360 },
      { field: 'durationMin', operator: '<', value: 480 },
    ],
    currentTemplates: ['昨晚你睡了 X 小时，刚好够身体修复', 'X 小时的睡眠，够用但不算充裕'],
    causeTemplates: ['时长 OK，但深睡比例可能偏低', '节奏稳定，是日常的常态'],
    suggestionTemplates: [
      '试试 21:30 后关灯，延长深睡',
      '保持这个节奏，再往前挪 30 分钟就更好',
    ],
  },
  {
    id: 'R003',
    type: 'night',
    conditions: [{ field: 'durationMin', operator: '>=', value: 480 }],
    currentTemplates: ['昨晚你睡了 X 小时，是充足的一觉', 'X 小时的睡眠，让身体满血'],
    causeTemplates: ['身体得到了充分休息', '节奏稳定，心情也跟着轻松'],
    suggestionTemplates: [
      '保持这个节奏，今天会很有精神',
      '把这个节奏记下来，照着做就好',
    ],
  },
  {
    id: 'R004',
    type: 'night',
    conditions: [
      { field: 'selfRating', operator: '>=', value: 1 },
      { field: 'selfRating', operator: '<=', value: 2 },
    ],
    currentTemplates: ['昨晚你睡得不太好', '身体好像还没完全放松'],
    causeTemplates: [
      '你的身体还在紧张，没真正慢下来',
      '可能是心事太重，脑子停不下来',
    ],
    suggestionTemplates: [
      '今晚试试 5 分钟呼吸练习',
      '把今天的烦恼写在纸上，让它离开你',
    ],
  },
  {
    id: 'R005',
    type: 'night',
    conditions: [{ field: 'selfRating', operator: '==', value: 5 }],
    currentTemplates: ['昨晚你睡得很棒！', '你睡出了五星的好觉'],
    causeTemplates: ['身体和心情都在状态', '一切刚刚好'],
    suggestionTemplates: [
      '保持这种节奏，记得记录心情',
      '把让你安心的事写下来，下次照做',
    ],
  },
  {
    id: 'R006',
    type: 'night',
    conditions: [
      { field: 'durationMin', operator: '>=', value: 360 },
      { field: 'durationMin', operator: '<', value: 420 },
      { field: 'selfRating', operator: '>=', value: 3 },
    ],
    currentTemplates: ['X 小时的中等睡眠，但体感不错', '时长普通，但你睡得很舒服'],
    causeTemplates: ['质量胜过时长', '身体很会调节'],
    suggestionTemplates: [
      '保持即可，不必追求更长',
      '晚上少看手机，体感会更好',
    ],
  },
  {
    id: 'R007',
    type: 'night',
    conditions: [
      { field: 'durationMin', operator: '>', value: 540 },
    ],
    currentTemplates: ['X 小时的长睡眠，身体很放松', '睡了 X 小时，像是给自己充电'],
    causeTemplates: ['身体确实需要这么多，可能是最近太累了', '深度修复进行中'],
    suggestionTemplates: ['继续这个节奏', '中午可以来个小午睡'],
  },
  {
    id: 'R008',
    type: 'night',
    conditions: [
      { field: 'source', operator: '==', value: 'manual' },
      { field: 'selfRating', operator: '==', value: 3 },
    ],
    currentTemplates: ['你选择记下这一觉', '中规中矩的一晚'],
    causeTemplates: ['身体在稳定运行', '生活节奏平稳'],
    suggestionTemplates: ['保持就好', '今晚试着提早 30 分钟关灯'],
  },

  // ========== 午睡（noon）规则 ==========
  {
    id: 'R010',
    type: 'noon',
    conditions: [{ field: 'durationMin', operator: '<', value: 20 }],
    currentTemplates: ['你午睡了 X 分钟', '一段小憩，X 分钟'],
    causeTemplates: ['短午睡更解困，太长反而昏沉', '刚刚好，赶在回去工作前'],
    suggestionTemplates: [
      '试试 20-30 分钟最佳时长',
      '继续这个节奏，下午不累',
    ],
  },
  {
    id: 'R011',
    type: 'noon',
    conditions: [
      { field: 'durationMin', operator: '>=', value: 20 },
      { field: 'durationMin', operator: '<', value: 30 },
    ],
    currentTemplates: ['你午睡了 X 分钟，刚好', 'X 分钟，节奏拿捏了'],
    causeTemplates: ['午后小憩让下午更有精神', '身体喜欢这个长度'],
    suggestionTemplates: ['明天继续这个节奏', '配上白噪音效果更好'],
  },
  {
    id: 'R012',
    type: 'noon',
    conditions: [
      { field: 'durationMin', operator: '>=', value: 30 },
      { field: 'durationMin', operator: '<', value: 45 },
    ],
    currentTemplates: ['你午睡了 X 分钟，有点长', 'X 分钟，比标准多了一点'],
    causeTemplates: ['可能进入深睡，醒来反而更累', '午后身体想多休息一会儿'],
    suggestionTemplates: ['下次控制在 25 分钟左右', '醒来动一动，散步 2 分钟'],
  },
  {
    id: 'R013',
    type: 'noon',
    conditions: [{ field: 'durationMin', operator: '>=', value: 45 }],
    currentTemplates: ['你午睡了 X 分钟，是一段长午睡', 'X 分钟，可能影响晚上的睡眠'],
    causeTemplates: ['睡太久了，可能会影响今晚的入睡', '身体可能进入了深睡期'],
    suggestionTemplates: ['今晚推迟 30 分钟再上床', '晚上试试白噪音帮助入眠'],
  },
  {
    id: 'R014',
    type: 'noon',
    conditions: [
      { field: 'depth', operator: '==', value: 3 },
      { field: 'recovery', operator: '<=', value: 2 },
    ],
    currentTemplates: ['睡得很沉，但醒来感觉一般', '身体休息了，心情没跟上'],
    causeTemplates: [
      '可能做梦多，或者压力没放下',
      '深睡后的惯性反应',
    ],
    suggestionTemplates: ['醒来先喝一杯温水', '试试 5 分钟伸展'],
  },
  {
    id: 'R015',
    type: 'noon',
    conditions: [
      { field: 'depth', operator: '<=', value: 2 },
      { field: 'recovery', operator: '==', value: 3 },
    ],
    currentTemplates: ['睡得不算沉，但醒来的感觉好极了', '浅睡也很有用'],
    causeTemplates: ['身体很容易入眠', '节奏把握得好'],
    suggestionTemplates: ['保持', '今晚也会顺利'],
  },

  // ========== 通用（any）规则 ==========
  {
    id: 'R020',
    type: 'any',
    conditions: [{ field: 'source', operator: '==', value: 'healthkit' }],
    currentTemplates: ['数据来自 iPhone', '你同步了 Apple Health 的数据'],
    causeTemplates: ['设备记录了整夜睡眠', '数据自动同步过来了'],
    suggestionTemplates: ['数据不错，下次还可以手动加备注', '对照自我感受，找到最准的那个指标'],
  },
  {
    id: 'R021',
    type: 'any',
    conditions: [{ field: 'source', operator: '==', value: 'huawei' }],
    currentTemplates: ['数据来自华为运动健康', '华为手表的睡眠记录'],
    causeTemplates: ['设备记录得比较细致', '深睡/浅睡比例完整'],
    suggestionTemplates: ['数据已归一化', '结合自我感受看更准'],
  },
  {
    id: 'R022',
    type: 'any',
    conditions: [{ field: 'source', operator: '==', value: 'xiaomi' }],
    currentTemplates: ['数据来自小米运动健康', '小米手环的睡眠记录'],
    causeTemplates: ['通过 CSV 文件导入', '数据已归一化'],
    suggestionTemplates: ['下次直接用微信运动同步更方便', '记录自我感受更准'],
  },

  // ========== 备注驱动规则 ==========
  {
    id: 'R030',
    type: 'night',
    conditions: [
      { field: 'notes', operator: '!=', value: '' },
      { field: 'selfRating', operator: '<=', value: 2 },
    ],
    currentTemplates: ['你写下了这一晚', '有话想跟自己说'],
    causeTemplates: ['看你的备注，能感觉到点什么', '把心事写下来，本身就是放松'],
    suggestionTemplates: ['今晚试试 5 分钟呼吸练习', '把今天的烦恼写在纸上，让它离开你'],
  },
  {
    id: 'R031',
    type: 'night',
    conditions: [
      { field: 'notes', operator: '!=', value: '' },
      { field: 'selfRating', operator: '>=', value: 4 },
    ],
    currentTemplates: ['你的备注透露着好心情', '今晚的心情不错'],
    causeTemplates: ['好事让你睡得安稳', '身体和心情都在线'],
    suggestionTemplates: ['继续保持这个节奏', '把让你开心的事记下来'],
  },

  // ========== 时长特别规则（兜底之前） ==========
  {
    id: 'R040',
    type: 'night',
    conditions: [
      { field: 'durationMin', operator: '<', value: 240 },
    ],
    currentTemplates: ['只有 X 小时，差距有点大', '严重睡眠不足'],
    causeTemplates: ['身体已经发出警报', '建议今晚多睡一会儿'],
    suggestionTemplates: ['今晚 22:00 上床，提前两小时', '白天小憩 20 分钟补一补'],
  },
  {
    id: 'R041',
    type: 'night',
    conditions: [
      { field: 'durationMin', operator: '>', value: 720 },
    ],
    currentTemplates: ['X 小时，是一段超长睡眠', '睡得不少，身体在深度修复'],
    causeTemplates: ['最近可能很疲惫', '身体正在还睡眠债'],
    suggestionTemplates: ['保持', '晚上别再熬了'],
  },
];

/**
 * 兜底模板（规则未命中时使用）
 */
const FALLBACK: Pick<RuleTemplate, 'currentTemplates' | 'causeTemplates' | 'suggestionTemplates'> = {
  currentTemplates: ['你安静地睡了一觉', '这一晚已收入记录'],
  causeTemplates: ['身体在慢慢找回节奏', '每一次记录都是对自己的在意'],
  suggestionTemplates: [
    '今晚 22:30 关灯，给自己一点缓冲',
    '保持节奏，不必苛求完美',
  ],
};

/**
 * 从模板数组中随机选一个
 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 主入口：匹配规则并填充模板
 * 返回 { currentStatus, cause, suggestion }
 */
export function generateByRule(record: SleepRecord): {
  currentStatus: string;
  cause: string;
  suggestion: string;
  ruleId: string;
} {
  // 1. 先按 type 精确匹配
  for (const rule of RULES) {
    if (rule.type !== 'any' && rule.type !== record.type) continue;
    if (rule.conditions.every((c) => matchCondition(c, record))) {
      return {
        currentStatus: fillTemplate(pickRandom(rule.currentTemplates), record),
        cause: fillTemplate(pickRandom(rule.causeTemplates), record),
        suggestion: fillTemplate(pickRandom(rule.suggestionTemplates), record),
        ruleId: rule.id,
      };
    }
  }
  // 2. 再尝试 any 规则
  for (const rule of RULES) {
    if (rule.type !== 'any') continue;
    if (rule.conditions.every((c) => matchCondition(c, record))) {
      return {
        currentStatus: fillTemplate(pickRandom(rule.currentTemplates), record),
        cause: fillTemplate(pickRandom(rule.causeTemplates), record),
        suggestion: fillTemplate(pickRandom(rule.suggestionTemplates), record),
        ruleId: rule.id,
      };
    }
  }
  // 3. 兜底
  return {
    currentStatus: fillTemplate(pickRandom(FALLBACK.currentTemplates), record),
    cause: fillTemplate(pickRandom(FALLBACK.causeTemplates), record),
    suggestion: fillTemplate(pickRandom(FALLBACK.suggestionTemplates), record),
    ruleId: 'FALLBACK',
  };
}

/**
 * 规则总数（用于 UI 调试）
 */
export function getRuleCount(): number {
  return RULES.length;
}