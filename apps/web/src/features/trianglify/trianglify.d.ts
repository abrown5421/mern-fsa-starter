declare module "trianglify" {
  interface TrianglifyOptions {
    width: number;
    height: number;
    cellSize?: number;
    variance?: number;
    seed?: string;
    xColors?: string[];
    yColors?: string[];
  }

  interface TrianglifyPattern {
    toSVG(): SVGSVGElement;
    toCanvas(): HTMLCanvasElement;
  }

  export default function trianglify(
    options: TrianglifyOptions
  ): TrianglifyPattern;
}
