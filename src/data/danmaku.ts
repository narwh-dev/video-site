import type { CommentKey, DanmakuItem, DanmakuMode } from "./types.ts";

const COLORS = ["#3B82F6", "#FB923C", "#34D399", "#F472B6"] as const;

const SNW_CONTENTS = [
  "曲速引擎启动！",
  "派克舰长太稳了",
  "史波克表情包",
  "前方高能",
  "这转场绝了",
  "联邦万岁",
  "弹幕护体",
  "大副视角+1",
  "BGM 好听",
  "字幕清晰",
  "红色警报！",
  "探索未知",
  "这一刀剪得好",
  "重看第三遍",
  "剧情加速了",
  "细节满满",
  "舰桥构图美",
  "致敬原初",
  "泪目",
  "哈哈哈哈",
  "顶",
  "已截图",
  "精彩",
  "完结撒花？还早",
] as const;

const ST09_CONTENTS = [
  "开场炸裂",
  "柯克登场",
  "史波克辩论赛",
  "曲速特效",
  "经典台词",
  "IMAX 感",
  "尼禄太狠",
  "年轻的进取号",
  "配乐拉满",
  "高能预警",
  "重看必看",
  "档案收藏",
] as const;

function makeItem(
  id: string,
  timeSec: number,
  content: string,
  mode: DanmakuMode,
  color: string | null,
  likes: number,
): DanmakuItem {
  return { id, timeSec, content, mode, color, likes };
}

function buildSnwDanmaku(): DanmakuItem[] {
  const items: DanmakuItem[] = [];
  for (let i = 0; i < 24; i += 1) {
    const timeSec = Math.floor((i / 23) * 3000);
    let mode: DanmakuMode = "scroll";
    if (i === 5 || i === 12 || i === 19) {
      mode = "top";
    } else if (i === 8 || i === 21) {
      mode = "bottom";
    }
    const color =
      i === 2 || i === 7 || i === 14 || i === 18
        ? (COLORS[i % COLORS.length] ?? null)
        : null;
    items.push(
      makeItem(
        `d-snw-${String(i + 1).padStart(2, "0")}`,
        timeSec,
        SNW_CONTENTS[i] ?? "弹幕",
        mode,
        color,
        (i * 3) % 17,
      ),
    );
  }
  return items;
}

function buildSt09Danmaku(): DanmakuItem[] {
  const items: DanmakuItem[] = [];
  for (let i = 0; i < 12; i += 1) {
    const timeSec = Math.floor((i / 11) * 7200);
    let mode: DanmakuMode = "scroll";
    if (i === 3) {
      mode = "top";
    } else if (i === 9) {
      mode = "bottom";
    }
    const color = i === 1 || i === 6 ? (COLORS[i % COLORS.length] ?? null) : null;
    items.push(
      makeItem(
        `d-st09-${String(i + 1).padStart(2, "0")}`,
        timeSec,
        ST09_CONTENTS[i] ?? "弹幕",
        mode,
        color,
        (i * 5) % 11,
      ),
    );
  }
  return items;
}

export const DANMAKU: Record<CommentKey, DanmakuItem[]> = {
  "snw:S02E04": buildSnwDanmaku(),
  "st09:MOVIE": buildSt09Danmaku(),
};
