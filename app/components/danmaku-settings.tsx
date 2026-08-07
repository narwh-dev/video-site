import { Popover } from "@base-ui/react/popover";
import { Settings2 } from "lucide-react";
import type { DanmakuArea, DanmakuOpacity, DanmakuSettingsState, DanmakuSize } from "../lib/danmaku-settings";

const sizeOptions: { id: DanmakuSize; label: string }[] = [
  { id: "small", label: "小" },
  { id: "medium", label: "中" },
  { id: "large", label: "大" },
];

const opacityOptions: { id: DanmakuOpacity; label: string }[] = [
  { id: 0.55, label: "低" },
  { id: 0.8, label: "中" },
  { id: 1, label: "高" },
];

const areaOptions: { id: DanmakuArea; label: string }[] = [
  { id: "full", label: "全屏" },
  { id: "top", label: "上半屏" },
];

type DanmakuSettingsProps = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  settings: DanmakuSettingsState;
  onChange: (settings: DanmakuSettingsState) => void;
};

export function DanmakuSettings({ enabled, onEnabledChange, settings, onChange }: DanmakuSettingsProps) {
  return (
    <Popover.Root>
      <Popover.Trigger className="icon-button dark" aria-label="弹幕设置" title="弹幕设置">
        <Settings2 aria-hidden="true" size={18} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="end" side="top">
          <Popover.Popup className="danmaku-settings-panel">
            <Popover.Title>弹幕设置</Popover.Title>
            <div className="danmaku-settings-row">
              <span id="danmaku-enabled-label">显示弹幕</span>
              <button
                className="danmaku-settings-toggle"
                type="button"
                aria-pressed={enabled}
                aria-labelledby="danmaku-enabled-label"
                onClick={() => onEnabledChange(!enabled)}
              >
                {enabled ? "已开启" : "已关闭"}
              </button>
            </div>
            <div className="danmaku-settings-row" role="group" aria-labelledby="danmaku-size-label">
              <span id="danmaku-size-label">字号</span>
              <div className="danmaku-segmented">
                {sizeOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={settings.size === option.id}
                    onClick={() => onChange({ ...settings, size: option.id })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="danmaku-settings-row" role="group" aria-labelledby="danmaku-opacity-label">
              <span id="danmaku-opacity-label">透明度</span>
              <div className="danmaku-segmented">
                {opacityOptions.map((option) => (
                  <button
                    key={String(option.id)}
                    type="button"
                    aria-pressed={settings.opacity === option.id}
                    onClick={() => onChange({ ...settings, opacity: option.id })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="danmaku-settings-row" role="group" aria-labelledby="danmaku-area-label">
              <span id="danmaku-area-label">显示区域</span>
              <div className="danmaku-segmented">
                {areaOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={settings.area === option.id}
                    onClick={() => onChange({ ...settings, area: option.id })}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
