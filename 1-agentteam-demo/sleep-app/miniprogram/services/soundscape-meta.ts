/**
 * 白噪音元数据（services/soundscape-meta.ts）
 *
 * 内置 50 个白噪音：30 个永久免费 + 20 个会员专属
 *
 * v1.0 占位：audioUrl 全部为空数组，实际播放前由云端下发
 */

import { Soundscape } from '../models/soundscape';

function build(): Soundscape[] {
  const list: Soundscape[] = [];
  // 30 个免费：自然 + 雨声 + 城市
  const freeNames: Array<[string, 'nature' | 'rain' | 'city', string[]]> = [
    ['夏夜细雨', 'rain', ['下雨', '助眠', '浪漫']],
    ['春雨敲窗', 'rain', ['下雨', '写作']],
    ['秋雨落叶', 'rain', ['下雨', '秋天']],
    ['雷阵雨', 'rain', ['下雨', '激烈']],
    ['森林鸟鸣', 'nature', ['森林', '鸟']],
    ['海边潮汐', 'nature', ['海', '潮']],
    ['溪水潺潺', 'nature', ['溪', '流水']],
    ['风声', 'nature', ['风']],
    ['篝火', 'nature', ['火', '温暖']],
    ['风吹麦浪', 'nature', ['风', '麦']],
    ['夏夜虫鸣', 'nature', ['虫', '夏夜']],
    ['远山回声', 'nature', ['山']],
    ['清晨露珠', 'nature', ['清晨', '鸟']],
    ['草原夜风', 'nature', ['草原']],
    ['林间雨声', 'rain', ['林', '雨']],
    ['城市雨夜', 'rain', ['城市', '夜']],
    ['温柔夜雨', 'rain', ['夜', '温柔']],
    ['大雨倾盆', 'rain', ['大雨']],
    ['中雨', 'rain', ['中雨']],
    ['毛毛雨', 'rain', ['毛毛雨']],
    ['咖啡馆', 'city', ['咖啡', '写作']],
    ['地铁站', 'city', ['地铁']],
    ['夜市', 'city', ['夜市']],
    ['图书馆', 'city', ['图书馆']],
    ['火车', 'city', ['火车']],
    ['城市远雷', 'city', ['雷']],
    ['港口', 'city', ['港口']],
    ['海港码头', 'city', ['码头']],
    ['城市清晨', 'city', ['清晨']],
    ['夜班工厂', 'city', ['工厂']],
  ];

  freeNames.forEach((n, idx) => {
    list.push({
      _id: `s_free_${idx + 1}`,
      name: n[0],
      category: n[1],
      audioUrl: `cloud://sleepbuddy/audio/free_${idx + 1}.mp3`,
      durationSec: 180,
      bitrate: 'standard',
      isFree: true,
      trialDays: 0,
      tags: n[2],
      enabled: true,
      order: idx + 1,
    });
  });

  // 20 个会员：动物 + 音乐
  const premiumNames: Array<[string, 'animal' | 'music', string[]]> = [
    ['猫咪呼噜', 'animal', ['猫', '治愈']],
    ['犬吠远山', 'animal', ['狗']],
    ['蛙鸣一片', 'animal', ['青蛙', '夏夜']],
    ['牛铃', 'animal', ['牛']],
    ['马蹄', 'animal', ['马']],
    ['古典钢琴', 'music', ['钢琴', '古典']],
    ['吉他弹奏', 'music', ['吉他']],
    ['禅意古琴', 'music', ['古琴', '禅']],
    ['日系轻音', 'music', ['日系']],
    ['北欧氛围', 'music', ['北欧']],
    ['白噪音 4Hz', 'music', ['白噪音']],
    ['粉噪音', 'music', ['粉噪音']],
    ['棕噪音', 'music', ['棕噪音']],
    ['心跳声', 'animal', ['心跳', '宝宝']],
    ['摇篮曲', 'music', ['摇篮']],
    ['夏日蝉鸣', 'animal', ['蝉']],
    ['孔雀东南', 'animal', ['孔雀']],
    ['海鸥', 'animal', ['海鸥']],
    ['鲸鱼低吟', 'animal', ['鲸']],
    ['小羊', 'animal', ['羊']],
  ];

  premiumNames.forEach((n, idx) => {
    list.push({
      _id: `s_pre_${idx + 1}`,
      name: n[0],
      category: n[1],
      audioUrl: `cloud://sleepbuddy/audio/pre_${idx + 1}.mp3`,
      durationSec: 180,
      bitrate: 'hi-res',
      isFree: false,
      trialDays: 30,
      tags: n[2],
      enabled: true,
      order: 100 + idx,
    });
  });

  return list;
}

export const BUILTIN_SOUNDSCAPES: Soundscape[] = build();