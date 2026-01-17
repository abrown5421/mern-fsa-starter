export interface TrianglifyConfig {
  cellSize?: number;
  variance?: number;
  xColors?: string[];
  yColors?: string[];
  seed?: string;
  colorSpace?: string;
  colorFunction?: string;
  strokeWidth?: number;
  points?: number[][];
}

export interface TrianglifyBannerProps {
  width: number;
  height: number;
  config: TrianglifyConfig;
}