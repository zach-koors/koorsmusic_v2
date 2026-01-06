import { InjectionToken } from '@angular/core';

export const PERFORMANCE_API_BASE = new InjectionToken<string>('PERFORMANCE_API_BASE');

export function getDefaultPerformanceApiBase(): string {
  try {
    const win = (window as any) as Record<string, unknown>;
    // Prefer explicit injected runtime value, otherwise fall back to the known dev API endpoint
  const explicit = (win as any)['__PERFORMANCE_API_BASE'] as string | undefined;
    const fallback = 'https://j1d6emqagj.execute-api.us-east-1.amazonaws.com/dev';
    const result = explicit && explicit.length ? explicit : fallback;
    try { console.debug('PERFORMANCE_API_BASE ->', result); } catch (e) { /* noop */ }
    return result;
  } catch (e) {
    return 'https://j1d6emqagj.execute-api.us-east-1.amazonaws.com/dev';
  }
}
