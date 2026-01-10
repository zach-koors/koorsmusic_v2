export type VoicePart = 'S' | 'A' | 'B' | 'T';

export function isValidVoicePart(v: any): v is VoicePart {
  return v === 'S' || v === 'A' || v === 'B' || v === 'T';
}

export const VOICE_PART_LABEL: Record<VoicePart, string> = {
  S: 's - soprano',
  A: 'a - alto',
  B: 'b - bass',
  T: 't - tenor'
};

export const VOICE_PART_NAME: Record<VoicePart, string> = {
  S: 'SOPRANO',
  A: 'ALTO',
  B: 'BASS',
  T: 'TENOR'
};
