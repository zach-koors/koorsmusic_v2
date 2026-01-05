export type PerformanceStatus = 'IDLE' | 'READY' | 'PLAYING' | 'FINISHED';

export interface Performance {
  id: 'current';
  status: PerformanceStatus;
  version: number;
  leaderId: string | null;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  startTime: number | null;
  participantCount: number;
}

export const DEFAULT_PERFORMANCE_ID = 'current' as const;

export function createIdlePerformance(now = Date.now()): Performance {
  return {
    id: DEFAULT_PERFORMANCE_ID,
    status: 'IDLE',
    version: 0,
    leaderId: null,
    createdAt: now,
    updatedAt: now,
    expiresAt: 0,
    startTime: null,
    participantCount: 0
  };
}
