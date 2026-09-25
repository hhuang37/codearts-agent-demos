/**
 * 内置场景模板（services/scene-templates.ts）
 *
 * 5 个核心场景：考试周 / 加班冲刺 / 出差倒时差 / 孕中期 / 经期调理
 *
 * 模板结构与 design.md §5.1.4 对齐
 */

import { Scene, SceneCode, QuestionnaireItem } from '../models/scene';

/** 通用问卷题库 */
const COMMON_QUESTIONS: QuestionnaireItem[] = [
  {
    id: 'stress_level',
    type: 'single',
    question: '最近压力如何？',
    options: [
      { value: 'low', label: '还行，能扛住' },
      { value: 'mid', label: '中等，有些' },
      { value: 'high', label: '挺大，需要照顾自己' },
    ],
    required: true,
  },
  {
    id: 'bedtime',
    type: 'single',
    question: '你平时几点上床？（HH:mm）',
    options: [
      { value: '22:00', label: '22:00 左右' },
      { value: '23:00', label: '23:00 左右' },
      { value: '00:00', label: '凌晨 0 点' },
      { value: '01:00', label: '凌晨 1 点及以后' },
    ],
    required: true,
  },
  {
    id: 'wakeup_time',
    type: 'single',
    question: '你通常几点起床？（HH:mm）',
    options: [
      { value: '06:00', label: '06:00 左右' },
      { value: '07:00', label: '07:00 左右' },
      { value: '08:00', label: '08:00 左右' },
      { value: '09:00', label: '09:00 及以后' },
    ],
    required: true,
  },
  {
    id: 'nap_habit',
    type: 'single',
    question: '你白天会午睡吗？',
    options: [
      { value: 'never', label: '从不' },
      { value: 'sometimes', label: '偶尔' },
      { value: 'often', label: '经常' },
    ],
    required: false,
  },
  {
    id: 'caffeine',
    type: 'single',
    question: '下午 4 点后还喝咖啡/茶吗？',
    options: [
      { value: 'no', label: '不会' },
      { value: 'sometimes', label: '偶尔' },
      { value: 'yes', label: '每天' },
    ],
    required: false,
  },
  {
    id: 'screen_before_bed',
    type: 'single',
    question: '睡前 1 小时看手机/电脑吗？',
    options: [
      { value: 'never', label: '从不' },
      { value: 'sometimes', label: '偶尔' },
      { value: 'often', label: '经常' },
    ],
    required: false,
  },
  {
    id: 'mood',
    type: 'single',
    question: '最近心情总体如何？',
    options: [
      { value: 'light', label: '轻松' },
      { value: 'neutral', label: '一般' },
      { value: 'heavy', label: '沉重' },
    ],
    required: false,
  },
];

const EXAM_QUESTIONS: QuestionnaireItem[] = [
  ...COMMON_QUESTIONS.slice(0, 6),
  {
    id: 'workload',
    type: 'single',
    question: '考试/任务量有多大？',
    options: [
      { value: 'light', label: '正常' },
      { value: 'heavy', label: '很重' },
      { value: 'extreme', label: '撑不住' },
    ],
    required: true,
  },
];

const OVERTIME_QUESTIONS: QuestionnaireItem[] = [
  ...COMMON_QUESTIONS.slice(0, 6),
  {
    id: 'workload',
    type: 'single',
    question: '加班强度？',
    options: [
      { value: 'light', label: '1-2 天/周' },
      { value: 'heavy', label: '3-4 天/周' },
      { value: 'extreme', label: '基本每天' },
    ],
    required: true,
  },
];

const TRAVEL_QUESTIONS: QuestionnaireItem[] = [
  ...COMMON_QUESTIONS.slice(0, 5),
  {
    id: 'timezone_diff',
    type: 'single',
    question: '与本地时差多大？',
    options: [
      { value: '1', label: '1-2 小时' },
      { value: '3', label: '3-5 小时' },
      { value: '6', label: '6 小时以上' },
    ],
    required: true,
  },
  {
    id: 'trip_duration',
    type: 'single',
    question: '出差多久？',
    options: [
      { value: 'short', label: '几天' },
      { value: 'medium', label: '1-2 周' },
      { value: 'long', label: '一个月+' },
    ],
    required: true,
  },
];

const PREGNANCY_QUESTIONS: QuestionnaireItem[] = [
  ...COMMON_QUESTIONS.slice(0, 4),
  {
    id: 'pregnancy_week',
    type: 'single',
    question: '孕周？',
    options: [
      { value: 'early', label: '12 周内' },
      { value: 'mid', label: '12-28 周' },
      { value: 'late', label: '28 周以后' },
    ],
    required: true,
  },
  {
    id: 'discomfort',
    type: 'multi',
    question: '目前主要的不适？',
    options: [
      { value: 'urination', label: '夜尿多' },
      { value: 'back_pain', label: '腰背痛' },
      { value: 'heartburn', label: '胃反酸' },
      { value: 'anxiety', label: '情绪波动' },
    ],
    required: false,
  },
];

const MENSTRUAL_QUESTIONS: QuestionnaireItem[] = [
  ...COMMON_QUESTIONS.slice(0, 5),
  {
    id: 'cycle_phase',
    type: 'single',
    question: '当前周期阶段？',
    options: [
      { value: 'before', label: '经前 1 周' },
      { value: 'during', label: '经期中' },
      { value: 'after', label: '经后 1 周' },
    ],
    required: true,
  },
  {
    id: 'symptoms',
    type: 'multi',
    question: '主要症状？',
    options: [
      { value: 'cramp', label: '腹痛' },
      { value: 'headache', label: '头痛' },
      { value: 'mood_swings', label: '情绪波动' },
      { value: 'insomnia', label: '入睡困难' },
    ],
    required: false,
  },
];

/**
 * 5 个内置场景
 */
export const BUILTIN_SCENES: Scene[] = [
  {
    _id: 'scene_exam',
    code: 'exam',
    name: '考试周',
    description: '要熬夜？陪你把这周撑过去，然后一起好好睡。',
    questionnaire: EXAM_QUESTIONS,
    template: {
      durationDays: 7,
      schedule: [
        { day: 1, bedtime: '23:30', wakeupTime: '06:30', napDuration: 25, note: '前三天逐步提前' },
        { day: 2, bedtime: '23:00', wakeupTime: '06:30', napDuration: 25 },
        { day: 3, bedtime: '22:30', wakeupTime: '06:00', napDuration: 20 },
        { day: 4, bedtime: '22:30', wakeupTime: '06:00', napDuration: 20, note: '考试周高峰期' },
        { day: 5, bedtime: '22:30', wakeupTime: '06:00', napDuration: 20 },
        { day: 6, bedtime: '23:00', wakeupTime: '06:30', napDuration: 25 },
        { day: 7, bedtime: '23:30', wakeupTime: '07:00', napDuration: 0, note: '恢复日' },
      ],
      soundscapeIds: ['rain-soft', 'piano-quiet', 'white-noise'],
      actions: [
        '起床后 30 分钟内晒 5 分钟太阳',
        '22:00 前完成复习，睡前 1 小时不刷手机',
        '午睡不超过 30 分钟，超过会进入深睡',
        '考前两天不要突然加深熬夜',
      ],
      notice: '考试周熬夜是短期行为，结束后请逐步恢复 7 小时睡眠。',
    },
    isPremium: false,
    enabled: true,
    order: 1,
  },
  {
    _id: 'scene_overtime',
    code: 'overtime',
    name: '加班冲刺',
    description: '项目要紧，但你也很重要。',
    questionnaire: OVERTIME_QUESTIONS,
    template: {
      durationDays: 7,
      schedule: [
        { day: 1, bedtime: '00:00', wakeupTime: '07:00', napDuration: 20, note: '最难的一周，慢慢来' },
        { day: 2, bedtime: '00:00', wakeupTime: '07:00', napDuration: 20 },
        { day: 3, bedtime: '23:30', wakeupTime: '06:30', napDuration: 20 },
        { day: 4, bedtime: '23:30', wakeupTime: '06:30', napDuration: 20 },
        { day: 5, bedtime: '23:00', wakeupTime: '06:30', napDuration: 20 },
        { day: 6, bedtime: '23:00', wakeupTime: '06:30', napDuration: 0 },
        { day: 7, bedtime: '23:00', wakeupTime: '07:00', napDuration: 0, note: '本周收尾' },
      ],
      soundscapeIds: ['rain-medium', 'cafe-soft', 'ocean-wave'],
      actions: [
        '22:00 后关电脑，不带工作进卧室',
        '午餐后散步 10 分钟',
        '23:30 前上床，给身体留缓冲',
        '周末不要"补觉过头"',
      ],
      notice: '工作节奏不要和身体节奏打架，能少熬一天是一天。',
    },
    isPremium: false,
    enabled: true,
    order: 2,
  },
  {
    _id: 'scene_travel',
    code: 'travel',
    name: '出差倒时差',
    description: '换个时区不慌，先让身体跟上。',
    questionnaire: TRAVEL_QUESTIONS,
    template: {
      durationDays: 5,
      schedule: [
        { day: 1, bedtime: '23:00', wakeupTime: '08:00', napDuration: 20, note: '按当地时间，强制对齐' },
        { day: 2, bedtime: '22:30', wakeupTime: '07:30', napDuration: 0 },
        { day: 3, bedtime: '22:30', wakeupTime: '07:00', napDuration: 0 },
        { day: 4, bedtime: '22:30', wakeupTime: '07:00', napDuration: 0 },
        { day: 5, bedtime: '22:30', wakeupTime: '07:00', napDuration: 0, note: '基本同步' },
      ],
      soundscapeIds: ['rain-soft', 'forest-bird', 'plane-cabin'],
      actions: [
        '到达后第一天尽量在户外晒 15 分钟太阳',
        '白天尽量不睡，让晚上更困',
        '晚餐别太晚，22 点后不进食',
        '睡前 1 小时关电子设备',
      ],
      notice: '时差调整需要 1-3 天，别急，慢慢来。',
    },
    isPremium: false,
    enabled: true,
    order: 3,
  },
  {
    _id: 'scene_pregnancy',
    code: 'pregnancy',
    name: '孕中期',
    description: '你和一个新生命一起睡，更需要温柔。',
    questionnaire: PREGNANCY_QUESTIONS,
    template: {
      durationDays: 7,
      schedule: [
        { day: 1, bedtime: '22:30', wakeupTime: '07:30', napDuration: 30 },
        { day: 2, bedtime: '22:30', wakeupTime: '07:30', napDuration: 30 },
        { day: 3, bedtime: '22:30', wakeupTime: '07:30', napDuration: 30 },
        { day: 4, bedtime: '22:30', wakeupTime: '07:30', napDuration: 30 },
        { day: 5, bedtime: '22:30', wakeupTime: '07:30', napDuration: 30 },
        { day: 6, bedtime: '22:30', wakeupTime: '07:30', napDuration: 30 },
        { day: 7, bedtime: '22:30', wakeupTime: '07:30', napDuration: 30 },
      ],
      soundscapeIds: ['ocean-wave', 'heartbeat', 'rain-soft'],
      actions: [
        '左侧卧优先，减轻腹部压力',
        '睡前少喝水，减少夜尿',
        '下午开始不喝咖啡/茶',
        '21 点后关大灯，换暖光',
      ],
      notice: '孕中期的睡眠需求增加，不必苛求时长，听医生的信号。',
    },
    isPremium: true,
    enabled: true,
    order: 4,
  },
  {
    _id: 'scene_menstrual',
    code: 'menstrual',
    name: '经期调理',
    description: '身体在特殊的日子，对自己温柔一点。',
    questionnaire: MENSTRUAL_QUESTIONS,
    template: {
      durationDays: 7,
      schedule: [
        { day: 1, bedtime: '22:30', wakeupTime: '07:00', napDuration: 30, note: '让自己多睡一会儿' },
        { day: 2, bedtime: '22:30', wakeupTime: '07:00', napDuration: 30 },
        { day: 3, bedtime: '22:30', wakeupTime: '07:00', napDuration: 20 },
        { day: 4, bedtime: '23:00', wakeupTime: '07:00', napDuration: 20 },
        { day: 5, bedtime: '23:00', wakeupTime: '07:00', napDuration: 0 },
        { day: 6, bedtime: '23:00', wakeupTime: '07:00', napDuration: 0 },
        { day: 7, bedtime: '23:00', wakeupTime: '07:00', napDuration: 0 },
      ],
      soundscapeIds: ['rain-soft', 'ocean-wave', 'fireplace'],
      actions: [
        '睡前泡脚 10 分钟',
        '热敷小腹 5 分钟',
        '减少咖啡因',
        '心情不好就写下来',
      ],
      notice: '经期允许自己"不那么好"，别苛责自己。',
    },
    isPremium: false,
    enabled: true,
    order: 5,
  },
];

/** 场景 code 列表（用于校验） */
export const ALL_SCENE_CODES: SceneCode[] = ['exam', 'overtime', 'travel', 'pregnancy', 'menstrual'];