export interface IChartBase {
  canvasId: string;
  cWidth?: number;
  cHeight?: number;
  cBackgroundColor?: string;
  cPadding?: number;
  animDuration?: number; // 动画时间，单位毫秒
}