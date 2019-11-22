import { IChartBase } from "./interface";

interface IPieData {
  color: string;
  activeColor?: string;
  text: string;
  textFont?: string;
  activeText?: string;
  activeFont?: string;
  value: number;
}

interface IPieConfig extends IChartBase {
  data: IPieData[];
  tagX?: number;
  tagY?: number;
  tagW?: number;
  tagH?: number;
  tagTextSize?: number;
  tagFont?: string;
  pieRadius?: number;
  pieX?: number;
  pieY?: number;
  tipLine?: number;
  tipLineW?: number;
  tipFont?: string;
  tipPadding?: number;
  toFix?: number;
  isShowTag?: boolean; // 是否展示标签
}

const DEFAULT: IPieConfig = {
  canvasId: 'canvas',
  data: [],
  cPadding: 10,
}

class Pie {
  private c: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pieData: IPieData[];
  private config: IPieConfig;

  constructor(config: IPieConfig) {
    this.config = config;
    this.init();
  }

  // 执行画图
  public exec() {
    this.draw();
  }

  public init() {
    const config = this.config;

    const c = document.getElementById(config.canvasId) as HTMLCanvasElement;
    if (!c) {
      throw new Error('cannot find the canvas container');
    }

    this.c = c;
    this.ctx = c.getContext('2d');

    // 开始初始化，默认初始值或者取 config 的值
    // 容器配置
    const cWidth = (config.cWidth || Number(c.parentElement.getAttribute('width')));
    const cHeight = (config.cHeight || Number(c.parentElement.getAttribute('height')));
    c.width = cWidth;
    c.height = cHeight;
    c.style.width = cWidth + 'px';
    c.style.height = cHeight + 'px';
    c.style.backgroundColor = config.cBackgroundColor || '#fff';

    config.cHeight = cHeight - (config.cPadding || DEFAULT.cPadding) * 2;
    config.cWidth = cWidth - (config.cPadding || DEFAULT.cPadding) * 2;
    config.toFix = (config.toFix || 2);

    // 饼图配置
    config.pieRadius = (config.pieRadius || cHeight / 3);
    config.pieX = (config.pieX || cWidth / 2);
    config.pieY = (config.pieY || cHeight / 2);

    // 概览配置
    config.tagX = (config.tagX || 0);
    config.tagY = (config.tagY || 0);
    config.tagW = (config.tagW || 60);
    config.tagH = (config.tagH || 20);

    // 
    config.tipLine = (config.tipLine || 10);
    config.tipPadding = (config.tipPadding || 10);

    this.transData(config.data);
  }

  private draw() {
    if (this.config.isShowTag !== false) {
      this.drawTag();
    }
    this.drawPie();
  }

  // 画 tag 
  // 
  private drawTag() {
    const { ctx, pieData, config } = this;
    ctx.textAlign = 'left';
    for(let i = 0; i < pieData.length; ++i) {
      const d = pieData[i];
      const height = (config.tagH + 10) * i;
      ctx.fillStyle = d.color;
      ctx.fillRect(config.tagX, config.tagY + height, config.tagW, config.tagH);
      ctx.moveTo(config.tagX, config.tagY + height + config.tagH / 2);
      ctx.font = config.tagFont;
      ctx.fillStyle = d.color;
      ctx.textBaseline = 'middle';
      const text = d.text + ' ' + (100 * d.value).toFixed(config.toFix) + '%';
      ctx.fillText(text, config.tagX + config.tagW + 15, config.tagY + height + config.tagH / 2); // 文字垂直居中
    }
  }

  private drawPie(mouseMove?: boolean) {
    const {ctx, pieData, config} = this;
    let currentAngle = 0;
    for(let i = 0; i < pieData.length; ++i) {
      const d = pieData[i];
      ctx.fillStyle = d.color;
      ctx.strokeStyle = d.color;
      ctx.lineWidth = 1;
      // ctx.
      const angle = d.value * Math.PI * 2; // 圆弧
      const lineAngle = currentAngle + angle / 2; // 线的角度，当前的圆弧的一半
      currentAngle += angle;

      // tip 的线在圆上的点的坐标
      const x0 = config.pieX + config.pieRadius * Math.cos(lineAngle);
      const y0 = config.pieY + config.pieRadius * Math.sin(lineAngle);
      // tip 的线的转折的点的坐标
      const x1 = config.pieX + (config.pieRadius + config.tipLine) * Math.cos(lineAngle);
      const y1 = config.pieX + (config.pieRadius + config.tipLine) * Math.sin(lineAngle);

      const textWidth = ctx.measureText(d.text).width;
      const linePadding = textWidth + config.tipPadding;

      // 开始绘制 tip
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.textBaseline = 'bottom';
      // 如果转折点的坐标，在圆点坐标的左边
      if (x1 <= x0) {
        ctx.lineTo(x1 - linePadding, y1);
        ctx.textAlign = 'right';
        ctx.fillText(d.text, x1 - config.tipPadding, y1 - 2); // 文字距离线有个 2 像素的bottom
      } else {
        ctx.lineTo(x1 + linePadding, y1);
        ctx.textAlign = 'left';
        ctx.fillText(d.text, x1 + config.tipPadding, y1 - 2); // 文字距离线有个 2 像素的bottom
      }
      ctx.stroke();
    }

    // 绘制饼图
    currentAngle = 0;
    let endAngle = 0;
    for (let i = 0; i < pieData.length; ++i) {
      const d = pieData[i];
      ctx.beginPath();
      // 圆心
      ctx.moveTo(config.pieX, config.pieY);
      endAngle = endAngle + (d.value) * Math.PI * 2;
      ctx.arc(config.pieX, config.pieY, config.pieRadius, currentAngle, endAngle, false);
      ctx.fillStyle = d.color;

      // 
      if (mouseMove && ctx.isPointInPath(1, 1)) {
        ctx.globalAlpha = 0.8;
      }
      
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      currentAngle = endAngle;

      if (i === pieData.length - 1) {
        currentAngle = endAngle = (90 * Math.PI) / 180;
      }
    }
  }

  private transData(data: IPieData[]) {
    let total = 0;
    let pieData: IPieData[] = [];
    for (let i = 0; i < data.length; ++i) {
      total += data[i].value;
      pieData[i] = data[i];
    }
    for (let i = 0; i < data.length; ++i) {
      pieData[i].value = (pieData[i].value / total);
    }
    this.pieData = pieData;
  }

  private onMouseMove () {

  }

  private bindMouseMove() {

  }

  public release() {
  }
}

export default Pie;

