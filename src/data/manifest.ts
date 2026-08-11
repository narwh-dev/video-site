export type ManifestTitle = {
  zhHans: string;
  zhHant?: string;
  en?: string;
};

export type ManifestEntry = {
  slug: string;
  code: string;
  kind: "series" | "movie";
  title: ManifestTitle;
  year: number;
  genres: string[];
  summary: string;
  seasons?: number[];
  unplayable?: string[];
  durationMin: number;
};

export const MANIFEST: ManifestEntry[] = [
  {
    slug: "tos",
    code: "TOS",
    kind: "series",
    title: {
      zhHans: "星际迷航：原初系列",
      zhHant: "星際迷航：原初系列",
      en: "Star Trek: The Original Series",
    },
    year: 1966,
    genres: ["科幻", "冒险"],
    summary:
      "进取号 NCC-1701 的五年任务：探索未知世界，寻找新生命与新文明，勇敢地航向前人未至之境。",
    seasons: [6, 6, 6],
    durationMin: 50,
  },
  {
    slug: "tng",
    code: "TNG",
    kind: "series",
    title: {
      zhHans: "星际迷航：下一代",
      zhHant: "星際迷航：下一代",
      en: "Star Trek: The Next Generation",
    },
    year: 1987,
    genres: ["科幻", "剧情"],
    summary:
      "皮卡德舰长率领进取号 NCC-1701-D 继续星际舰队的探索使命，面对 Q 连续体与博格集合体的挑战。",
    seasons: [4, 4, 4, 4, 4, 4, 4],
    durationMin: 45,
  },
  {
    slug: "ds9",
    code: "DS9",
    kind: "series",
    title: {
      zhHans: "星际迷航：深空九站",
      zhHant: "星際迷航：深空九站",
      en: "Star Trek: Deep Space Nine",
    },
    year: 1993,
    genres: ["科幻", "剧情"],
    summary:
      "贝久虫洞旁的深空九站，西斯科指挥官在战后重建、先知信仰与自治同盟战争之间维系平衡。",
    seasons: [4, 4, 4, 4, 4, 4, 4],
    durationMin: 45,
  },
  {
    slug: "voy",
    code: "VOY",
    kind: "series",
    title: {
      zhHans: "星际迷航：航海家号",
      zhHant: "星際迷航：航海家號",
      en: "Star Trek: Voyager",
    },
    year: 1995,
    genres: ["科幻", "冒险"],
    summary:
      "航海家号被卷入七万光年外的德尔塔象限，珍妮薇舰长带领船员踏上漫长的回家之路。",
    seasons: [4, 4, 4, 4, 4, 4, 4],
    durationMin: 45,
  },
  {
    slug: "ent",
    code: "ENT",
    kind: "series",
    title: {
      zhHans: "星际迷航：进取号",
      zhHant: "星際迷航：進取號",
      en: "Star Trek: Enterprise",
    },
    year: 2001,
    genres: ["科幻", "冒险"],
    summary:
      "地球首艘曲速五级星舰进取号 NX-01 的首航，亚契舰长与人类最早的深空探索历程。",
    seasons: [4, 4, 4, 4],
    durationMin: 42,
  },
  {
    slug: "dis",
    code: "DIS",
    kind: "series",
    title: {
      zhHans: "星际迷航：发现号",
      zhHant: "星際迷航：發現號",
      en: "Star Trek: Discovery",
    },
    year: 2017,
    genres: ["科幻", "剧情"],
    summary:
      "迈克尔·伯纳姆与发现号船员穿越孢子网络的跳跃，从克林贡战争一路驶向三十二年后的未来。",
    seasons: [4, 4, 4, 4, 4],
    durationMin: 48,
  },
  {
    slug: "pic",
    code: "PIC",
    kind: "series",
    title: {
      zhHans: "星际迷航：皮卡德",
      zhHant: "星際迷航：皮卡德——讓-呂克·皮卡德上校的最終使命與全新旅程",
      en: "Star Trek: Picard",
    },
    year: 2020,
    genres: ["科幻", "剧情"],
    summary:
      "退役多年的让-吕克·皮卡德因一位神秘少女的求助再度启航，面对合成生命与旧日遗产的纠葛。",
    seasons: [4, 4, 4],
    durationMin: 52,
  },
  {
    slug: "snw",
    code: "SNW",
    kind: "series",
    title: {
      zhHans: "星际迷航：奇异新世界",
      zhHant: "星際迷航：奇異新世界",
      en: "Star Trek: Strange New Worlds",
    },
    year: 2022,
    genres: ["科幻", "冒险"],
    summary:
      "派克舰长、史波克与大副率领进取号重返五年任务前的黄金年代，每周探索一个全新的奇异世界。",
    seasons: [6, 6, 6],
    durationMin: 52,
  },
  {
    slug: "ld",
    code: "LD",
    kind: "series",
    title: {
      zhHans: "星际迷航：下层舰员",
      zhHant: "星際迷航：下層艦員",
      en: "Star Trek: Lower Decks",
    },
    year: 2020,
    genres: ["动画", "喜剧"],
    summary:
      "喜瑞都号最普通甲板上的四位少尉，用不那么英雄的方式守护星际舰队的日常运转。",
    seasons: [3, 3, 3, 3, 3],
    durationMin: 25,
  },
  {
    slug: "pro",
    code: "PRO",
    kind: "series",
    title: {
      zhHans: "星际迷航：神童舰队",
      en: "Star Trek: Prodigy",
    },
    year: 2021,
    genres: ["动画", "冒险"],
    summary:
      "一群外星少年在德尔塔象限发现废弃的联邦星舰原恒星号，在珍妮薇全息影像的引导下学习星际舰队的理念。",
    seasons: [3, 3],
    unplayable: ["S02E01", "S02E02", "S02E03"],
    durationMin: 24,
  },
  {
    slug: "tmp",
    code: "TMP",
    kind: "movie",
    title: {
      zhHans: "星际迷航：无限太空",
      zhHant: "星際迷航：無限太空",
      en: "Star Trek: The Motion Picture",
    },
    year: 1979,
    genres: ["科幻", "电影"],
    summary: "一朵自称“威者”的巨大能量云直逼地球，柯克重新接管改装后的进取号迎击。",
    durationMin: 132,
  },
  {
    slug: "twok",
    code: "TWOK",
    kind: "movie",
    title: {
      zhHans: "星际迷航：可汗怒吼",
      zhHant: "星際迷航：可汗怒吼",
      en: "Star Trek II: The Wrath of Khan",
    },
    year: 1982,
    genres: ["科幻", "电影"],
    summary: "可汗·努尼恩·辛格自荒废星球归来复仇，创世装置落入敌手，史波克做出最终牺牲。",
    durationMin: 113,
  },
  {
    slug: "fc",
    code: "FC",
    kind: "movie",
    title: {
      zhHans: "星际迷航：第一次接触",
      zhHant: "星際迷航：第一次接觸",
      en: "Star Trek: First Contact",
    },
    year: 1996,
    genres: ["科幻", "电影"],
    summary: "博格穿越时间企图阻止人类与瓦肯人的第一次接触，皮卡德率进取号-E 追至二十一世纪。",
    durationMin: 111,
  },
  {
    slug: "st09",
    code: "ST09",
    kind: "movie",
    title: {
      zhHans: "星际迷航",
      zhHant: "星際迷航",
      en: "Star Trek",
    },
    year: 2009,
    genres: ["科幻", "电影"],
    summary: "开尔文时间线开启：年轻的柯克与史波克在尼禄的复仇阴影下首次并肩作战。",
    durationMin: 127,
  },
  {
    slug: "stid",
    code: "STID",
    kind: "movie",
    title: {
      zhHans: "星际迷航：暗黑无界",
      zhHant: "星際迷航：暗黑無界",
      en: "Star Trek Into Darkness",
    },
    year: 2013,
    genres: ["科幻", "电影"],
    summary: "星际舰队内部潜藏的危机浮出水面，柯克与船员追捕神秘特工约翰·哈里森。",
    durationMin: 132,
  },
  {
    slug: "stb",
    code: "STB",
    kind: "movie",
    title: {
      zhHans: "星际迷航：超越星辰",
      zhHant: "星際迷航：超越星辰",
      en: "Star Trek Beyond",
    },
    year: 2016,
    genres: ["科幻", "电影"],
    summary: "进取号在约克城空间站外遭蜂群伏击坠毁，船员们在一颗陌生星球上各自求生。",
    durationMin: 122,
  },
];

export const MOVIE_EPISODE_CODE = "MOVIE";

export const ASSET_COLOR_CYCLE = ["#111111", "#3B82F6", "#FB923C", "#34D399"] as const;

export function episodeCode(season: number, episode: number): string {
  return `S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}`;
}

export function assetColorForIndex(index: number): string {
  return ASSET_COLOR_CYCLE[index % ASSET_COLOR_CYCLE.length] ?? "#111111";
}
