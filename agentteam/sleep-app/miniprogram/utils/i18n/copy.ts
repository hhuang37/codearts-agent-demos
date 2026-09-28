/**
 * 文案集中管理（utils/i18n/copy.ts）
 *
 * 集中存放所有 UI 文案，避免散落。
 *
 * 调性（design.md §9.2）：
 * - 温柔、可信、克制
 * - 不打扰、不催促
 * - 像朋友、要解释
 *
 * 同时实现合规词替换（design.md §10.5）：
 * - "睡眠监测" -> "睡眠记录"
 * - "睡眠评分" -> "自我感受"
 * - "深度睡眠" -> "深度休息"
 */

import { sanitizeUGC } from '../string';

export const COPY = {
  app: {
    name: '陪你睡个好觉',
    slogan: '读懂 + 解法 + 陪伴',
  },
  home: {
    greeting_morning: '昨晚的月亮很亮，要记得早点合上眼睛。',
    greeting_afternoon: '午后阳光正好，要不要小憩一会儿？',
    greeting_evening: '今天辛苦了，去好好睡一觉吧。',
    greeting_night: '月亮和星星都在陪你。',
    recent_title: '最近的睡眠',
    empty_recent: '还没有记录，今晚试着记一笔吧。',
    quick_action_record: '记一笔睡眠',
    quick_action_nap: '午睡模式',
    quick_action_scene: '睡眠处方',
    quick_action_soundscape: '白噪音',
    quick_action_alarm: '智能闹钟',
    quick_action_evening: '晚安电台',
    menu_start: '开始记录',
    menu_nap: '午睡模式',
    menu_cancel: '取消',
  },
  record: {
    night_title: '记录夜间睡眠',
    night_subtitle: '填一下昨晚睡得怎么样',
    noon_title: '午睡模式',
    noon_subtitle: '10-60 分钟的午后小憩',
    bedtime_label: '昨晚入睡时间',
    waketime_label: '今天起床时间',
    selfrating_label: '给自己的睡眠打几分？',
    notes_label: '想说点什么（可选）',
    notes_placeholder: '比如：梦见大海 / 半夜醒了两次 / 一直没睡熟…',
    duration_label: '时长',
    save: '保存',
    save_success: '已保存，正在生成你的睡眠报告…',
    invalid_time: '时间不合理，请检查',
    nap_duration_label: '想睡多久？',
    nap_location_label: '在哪里午睡？',
    nap_depth_label: '睡得有多沉？',
    nap_recovery_label: '醒来感觉？',
    nap_start: '开始午睡',
    nap_end: '醒了',
    nap_end_early: '提前结束',
    nap_ended_ask: '上次午睡是否已结束？',
    nap_invalid: '午睡时长需 10-60 分钟',
  },
  report: {
    title: '昨晚你睡得怎么样',
    placeholder: '正在为你准备报告…',
    current_label: '现状',
    cause_label: '可能的原因',
    suggestion_label: '温柔建议',
    followup_entry: '长按可追问',
    followup_quota_used: '今日追问已用完，明日 0 点重置',
    followup_input_placeholder: '想问点什么？比如：为什么这么说？',
    tip_ai: '以上内容由 AI 小助手生成',
  },
  scene: {
    title: '睡眠方案',
    select_tag_title: '最近有什么想撑过去的？',
    pick_exam: '考试周',
    pick_overtime: '加班冲刺',
    pick_travel: '出差倒时差',
    pick_pregnancy: '孕中期',
    pick_menstrual: '经期调理',
    pick_premium_only: '会员专属',
    questionnaire_title: '几个小问题',
    prescription_title: '为你准备的 7 天方案',
    schedule_label: '作息表',
    soundscape_label: '白噪音组合',
    actions_label: '醒来行动清单',
    notice_label: '本期注意事项',
    start_now: '今晚就试试',
    subscribe_reminder: '订阅 21:00 晚安提醒',
    unavailable: '该场景暂未上线，敬请期待',
  },
  evening: {
    title: '晚安电台',
    today_card_title: '今晚的月亮很亮',
    memory_label: '今天值得被记住的事',
    memory_placeholder: '写一句话给自己…',
    task_label: '明天要完成的小事',
    task_placeholder: '给自己立个小 flag',
    anonymous_cast: '匿名投送到星空',
    subscribe_btn: '订阅 21:00 提醒',
    subscribe_done: '已订阅，每天 21:00 准时见',
    sky_title: '星空',
    sky_empty: '今晚的星空暂时安静',
  },
  alarm: {
    title: '智能闹钟',
    subtitle: '浅睡期温柔唤醒，节假日自动跳过',
    holiday_tip: '今天（',
    holiday_tip_tail: '）是法定节假日，闹钟将自动跳过',
    empty: '你还没有设置闹钟',
    empty_hint: '添加一个，让它替你叫醒自己',
    window_label: '唤醒窗口',
    skip_holiday: '节假日跳过',
    vibrate: '震动',
    edit: '编辑',
    delete: '删除',
    create: '新建闹钟',
    create_title: '新建闹钟',
    edit_title: '编辑闹钟',
    time_label: '目标起床时间',
    repeat_label: '重复日',
    cancel: '取消',
    save: '保存',
    invalid_time: '时间格式不正确',
    save_done: '已保存',
    deleted: '已删除',
    confirm_delete_title: '删除闹钟',
    confirm_delete: '删除后无法恢复，确认删除吗？',
    optimal_none: '浅睡数据不足，将按目标时间精确唤醒',
    optimal_hint: '建议在 ',
  },
  soundscape: {
    title: '白噪音',
    category_all: '全部',
    category_nature: '自然',
    category_rain: '雨声',
    category_city: '城市',
    category_animal: '动物',
    category_music: '音乐',
    search_placeholder: '搜索…',
    timer_label: '定时关闭',
    timer_off: '不设',
    timer_15: '15 分钟',
    timer_30: '30 分钟',
    timer_60: '60 分钟',
    loading: '加载中…',
    load_failed: '加载失败，请重试',
  },
  profile: {
    title: '我的',
    membership: '会员状态',
    free: '免费用户',
    monthly: '月度会员',
    yearly: '年度会员',
    upgrade: '升级会员',
    settings: '设置',
    privacy_vault: '隐私保险箱',
    about: '关于我们',
    feedback: '意见反馈',
    sleep_buddy: '睡眠搭子',
    data_hub: '睡眠数据中枢',
    notification_settings: '通知设置',
    evening_sub: '晚安提醒',
    sound_sub: '音效提醒',
    logout: '退出登录',
  },
  privacy: {
    title: '隐私保险箱',
    promise: '你的睡眠只属于你。我们看不到，也不会看。',
    export_btn: '导出我的数据',
    delete_account: '注销账户',
    delete_warning: '注销账户后，7 天内将永久删除全部云端数据。',
    delete_confirm: '我已了解风险，确认注销',
    disable_cloud: '关闭云端备份',
    enable_cloud: '开启云端备份',
    policy_btn: '查看完整隐私政策',
  },
  common: {
    confirm: '确定',
    cancel: '取消',
    save: '保存',
    back: '返回',
    more: '更多',
    loading: '加载中…',
    empty: '暂无内容',
    error: '出错了，请稍后再试',
    network_error: '网络异常，请稍后再试',
    coming_soon: '敬请期待',
    done: '完成',
    editing: '编辑中',
  },
  compliance: {
    monitor_to: '睡眠记录',
    score_to: '自我感受',
    deep_to: '深度休息',
  },
} as const;

/**
 * 合规替换：对 UI 文案统一执行"敏感词 -> 替换词"
 * 见 design.md §10.5
 */
export function complianceReplace(input: string): string {
  if (!input) return '';
  const map: Record<string, string> = {
    睡眠监测: COPY.compliance.monitor_to,
    睡眠评分: COPY.compliance.score_to,
    深度睡眠: COPY.compliance.deep_to,
    医疗: '专业',
    治疗: '陪伴',
    诊断: '了解',
  };
  let out = input;
  Object.keys(map).forEach((k) => {
    out = out.split(k).join(map[k]);
  });
  return out;
}

/**
 * 安全裁剪：用户生成文本（用于晚安电台"今天值得被记住的事"等）
 * - 去除控制字符
 * - 限制长度
 */
export function safeUGC(text: string, maxLen = 100): string {
  return sanitizeUGC(text, maxLen);
}