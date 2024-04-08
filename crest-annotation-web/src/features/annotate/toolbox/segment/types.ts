export type Algorithm = { id: string; name: string };

export interface SegmentConfig {
  backend?: string;
  state?: boolean;
  algorithms?: Algorithm[];
  algorithm?: string;
  // algorithm specific config
  details?: { [key: string]: unknown };
}
