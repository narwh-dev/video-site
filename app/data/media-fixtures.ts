export const MEDIA_BASE = "/prototype/media";

export type QualityOption = {
  id: "auto" | "1080p" | "720p";
  label: string;
  url: string;
  default?: boolean;
};

export type SubtitleOption = {
  id: "off" | "zh" | "en";
  label: string;
  url?: string;
  default?: boolean;
};

export const qualityOptions: QualityOption[] = [
  { id: "auto", label: "自动", url: `${MEDIA_BASE}/sample-1080.webm`, default: true },
  { id: "1080p", label: "1080p", url: `${MEDIA_BASE}/sample-1080.webm` },
  { id: "720p", label: "720p", url: `${MEDIA_BASE}/sample-720.webm` },
];

export const subtitleOptions: SubtitleOption[] = [
  { id: "off", label: "关闭" },
  { id: "zh", label: "简体中文", url: `${MEDIA_BASE}/sample.zh.vtt`, default: true },
  { id: "en", label: "English", url: `${MEDIA_BASE}/sample.en.vtt` },
];

export const FAILED_SOURCE_URL = `${MEDIA_BASE}/missing-source.webm`;

export function defaultQualityUrl() {
  return qualityOptions.find((item) => item.default)?.url ?? qualityOptions[0].url;
}

export function qualityById(id: string): QualityOption {
  return qualityOptions.find((item) => item.id === id) ?? qualityOptions[0];
}
