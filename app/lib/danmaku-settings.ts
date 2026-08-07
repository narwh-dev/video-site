import type { CSSProperties } from "react";

export type DanmakuSize = "small" | "medium" | "large";
export type DanmakuOpacity = 0.55 | 0.8 | 1;
export type DanmakuArea = "full" | "top";

export type DanmakuSettingsState = {
  size: DanmakuSize;
  opacity: DanmakuOpacity;
  area: DanmakuArea;
};

export const defaultDanmakuSettings: DanmakuSettingsState = {
  size: "medium",
  opacity: 1,
  area: "full",
};

const sizeFontMap: Record<DanmakuSize, number> = {
  small: 14,
  medium: 16,
  large: 18,
};

export function danmakuLayerStyle(settings: DanmakuSettingsState): CSSProperties {
  return {
    fontSize: sizeFontMap[settings.size],
    opacity: settings.opacity,
    ...(settings.area === "top" ? { bottom: "50%" } : null),
  };
}
