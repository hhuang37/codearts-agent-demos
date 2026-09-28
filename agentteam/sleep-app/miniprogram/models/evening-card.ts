/**
 * 晚安电台模型（models/evening-card.ts）
 *
 * 与 design.md §5.1.7 对齐
 */

export interface EveningCard {
  _id: string;
  userId: string;
  /** YYYY-MM-DD */
  cardDate: string;
  /** 60 秒语音 URL */
  voiceUrl: string;
  /** 推荐白噪音 ID */
  recommendedSoundscapeId: string;
  /** 用户填写"今天值得被记住的事" */
  memoryText: string;
  /** 用户填写"明天要完成的小事" */
  taskText: string;
  /** 是否匿名投送（FR-5.5） */
  memoryAnonymousCast: boolean;
  /** 用户查看时间 */
  readAt: number | null;
}

/**
 * 创建空的晚安卡片（按当前日期）
 */
export function createEmptyEveningCard(userId: string, cardDate: string): EveningCard {
  return {
    _id: `ec_${userId}_${cardDate}`,
    userId,
    cardDate,
    voiceUrl: '',
    recommendedSoundscapeId: '',
    memoryText: '',
    taskText: '',
    memoryAnonymousCast: false,
    readAt: null,
  };
}