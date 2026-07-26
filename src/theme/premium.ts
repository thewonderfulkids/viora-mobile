export const premiumPalette = {
  canvas: "#F4FAF6",
  canvasDeep: "#E7F4EC",
  forest: "#022E22",
  forestSoft: "#044330",
  emerald: "#0B6E4F",
  emeraldBright: "#0C8A60",
  mint: "#8FE45F",
  mintSoft: "#E5F5EB",
  lime: "#B9FF66",
  ink: "#0D211A",
  inkMuted: "#657A70",
  line: "rgba(13, 33, 26, 0.09)",
  glass: "rgba(255, 255, 255, 0.88)",
  glassStrong: "rgba(255, 255, 255, 0.96)",
  white: "#FFFFFF",
  amber: "#F6B84A",
  coral: "#FF7D6B",
  sky: "#79C9F2",
};

export const premiumGradients = {
  screen: ["#F8FCF9", "#EDF8F1", "#FFFFFF"] as const,
  hero: ["#022E22", "#07543C", "#0B6E4F"] as const,
  action: ["#0B6E4F", "#0C8A60", "#66BB5A"] as const,
  mintGlass: ["rgba(255,255,255,0.98)", "rgba(229,245,235,0.92)"] as const,
};

export const premiumShadow = {
  card: {
    shadowColor: "#063C2C",
    shadowOpacity: 0.11,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  hero: {
    shadowColor: "#022E22",
    shadowOpacity: 0.24,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
  },
  glow: {
    shadowColor: "#8FE45F",
    shadowOpacity: 0.34,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
};
