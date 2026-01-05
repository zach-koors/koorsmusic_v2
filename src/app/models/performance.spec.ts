import { createIdlePerformance } from './performance';

describe('Performance model', () => {
  it('createIdlePerformance returns IDLE performance with sensible defaults', () => {
    const before = Date.now();
    const p = createIdlePerformance(before);

    expect(p.id).toBe('current');
    expect(p.status).toBe('IDLE');
    expect(p.version).toBe(0);
    expect(p.leaderId).toBeNull();
    expect(p.createdAt).toBe(before);
    expect(p.updatedAt).toBe(before);
    expect(p.expiresAt).toBe(0);
    expect(p.startTime).toBeNull();
    expect(p.participantCount).toBe(0);
  });

  it('createIdlePerformance uses provided now when supplied', () => {
    const now = 1234567890;
    const p = createIdlePerformance(now);
    expect(p.createdAt).toBe(now);
    expect(p.updatedAt).toBe(now);
  });
});
