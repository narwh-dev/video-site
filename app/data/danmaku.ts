export type DanmakuItem = {
  text: string;
  time: number;
  color?: string;
  mode?: 0 | 1 | 2;
};

const seed = [
  "这开场太有档案感了",
  "舰桥灯光刚刚好",
  "中文字幕清晰",
  "社区整理辛苦了",
  "这一段节奏稳",
  "继续探索未知",
  "弹幕不挡字幕真好",
  "本地样例也能演示",
  "清晰度切换无感",
  "恢复进度成功",
  "S02E04 经典",
  "舰长决定很克制",
  "音乐铺垫到位",
  "档案感拉满",
  "欢迎新船员",
  "这一镜构图稳",
  "字幕时间轴对齐",
  "弹幕字号可调",
  "半屏模式舒服",
  "横屏也不裁切",
  "触控命中区域够大",
  "键盘也能操作",
  "减少动效时默认关弹幕",
  "相关推荐合理",
  "上一集下一集清楚",
  "结束倒计时可取消",
  "电影重播入口明确",
  "访客投稿要登录",
  "用户投稿有反馈",
  "审核后才公开",
  "本地预览不混公共数据",
  "IME 组合期间不误提交",
  "80 字上限合理",
  "失败可重试",
  "无弹幕时播放仍正常",
  "设置面板完整",
  "透明度可调",
  "全屏与上半屏可切",
  "画中画入口可见",
  "倍速演示可用",
] as const;

export const publicDanmaku: DanmakuItem[] = seed.map((text, index) => ({
  text,
  time: Number(((index * 0.35) % 5.5).toFixed(2)),
  color: index % 5 === 0 ? "#93c5fd" : index % 7 === 0 ? "#fcd34d" : "#ffffff",
  mode: index % 11 === 0 ? 1 : 0,
}));

export function danmakuForState(noDanmaku: boolean): DanmakuItem[] {
  return noDanmaku ? [] : publicDanmaku;
}
