export interface Position {
  x: number;
  y: number;
}

export interface Translation {
  x: number;
  y: number;
}

export interface Transformation {
  translate: Translation;
  scale: number;
}
