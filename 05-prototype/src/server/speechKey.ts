import { createHash } from 'node:crypto';
import { normalizeSpeechText } from '../shared/navigationSpeech';
export const speechId = (text: string) => `vi-${createHash('sha256').update(normalizeSpeechText(text)).digest('hex').slice(0, 20)}`;
