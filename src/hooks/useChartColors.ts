import { useEffect, useState } from "react";

import { useTheme } from "@/components/theme-provider";

const VARS = {
  primary: "--primary",
  muted: "--muted-foreground",
  border: "--border",
  success: "--success",
  destructive: "--destructive",
} as const;

type ColorKey = keyof typeof VARS;
type Colors = Record<ColorKey, string>;

function read(): Colors {
  const styles = getComputedStyle(document.documentElement);
  const out = {} as Colors;
  (Object.keys(VARS) as ColorKey[]).forEach((k) => {
    const raw = styles.getPropertyValue(VARS[k]).trim();
    out[k] = raw ? `hsl(${raw})` : "currentColor";
  });
  return out;
}

/** Trả về màu (dạng hsl) đọc từ CSS token, tự cập nhật khi đổi sáng/tối. */
export function useChartColors(): Colors {
  const { theme } = useTheme();
  const [colors, setColors] = useState<Colors>(read);

  useEffect(() => {
    // Chờ 1 frame để class .dark được áp lên <html> rồi mới đọc lại biến.
    const id = requestAnimationFrame(() => setColors(read()));
    return () => cancelAnimationFrame(id);
  }, [theme]);

  return colors;
}
