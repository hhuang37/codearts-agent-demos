/**
 * 白噪音模型（models/soundscape.ts）
 *
 * 与 design.md §5.1.6 对齐
 */

export type SoundscapeCategory = 'nature' | 'rain' | 'city' | 'animal' | 'music';
export type SoundscapeBitrate = 'standard' | 'hi-res';

export interface Soundscape {
  _id: string;
  /** 名称（如"夏夜细雨"） */
  name: string;
  /** 分类（FR-7.2） */
  category: SoundscapeCategory;
  /** 云存储地址（v1.0 占位） */
  audioUrl: string;
  /** 单曲时长（秒，循环用） */
  durationSec: number;
  /** 码率（FR-7.6） */
  bitrate: SoundscapeBitrate;
  /** 是否永久免费（FR-7.1：30 个 true） */
  isFree: boolean;
  /** 临时会员可听天数（v1.0：20 个 trialDays=30） */
  trialDays: number;
  /** 搜索标签 */
  tags: string[];
  /** 是否启用 */
  enabled: boolean;
  /** 排序权重 */
  order: number;
  /** 封面图（可选） */
  cover?: string;
}

/** 白噪音分类的中文显示 */
export const CATEGORY_LABELS: Record<SoundscapeCategory, string> = {
  nature: '自然',
  rain: '雨声',
  city: '城市',
  animal: '动物',
  music: '音乐',
};