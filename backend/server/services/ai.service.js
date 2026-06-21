import axios from 'axios';
import { env } from '../config/env.js';

const fallbackCompatibility = (a, b) => {
  const left = new Set([...(a.interests || []), ...(a.vibeTags || []), ...(a.musicTaste || [])].map((x) => x.toLowerCase()));
  const right = [...(b.interests || []), ...(b.vibeTags || []), ...(b.musicTaste || [])].map((x) => x.toLowerCase());
  const overlap = right.filter((x) => left.has(x));
  const score = Math.min(96, 45 + overlap.length * 10);
  return { score, explanation: overlap.length ? `You both connect over ${overlap.slice(0, 3).join(', ')}.` : 'Your campus goals and profile energy have a promising overlap.' };
};

export const generateCompatibility = async (a, b) => {
  if (!env.openRouterApiKey) return fallbackCompatibility(a, b);
  try {
    const { data } = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'deepseek/deepseek-chat',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Return JSON with score 0-100 and explanation under 140 chars. Keep it warm, safe, college-friendly.' },
        { role: 'user', content: JSON.stringify({ a: profileForAi(a), b: profileForAi(b) }) }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${env.openRouterApiKey}`,
        'HTTP-Referer': env.openRouterSiteUrl,
        'X-Title': env.openRouterAppName
      },
      timeout: 8000
    });
    return JSON.parse(data.choices?.[0]?.message?.content || '{}');
  } catch {
    return fallbackCompatibility(a, b);
  }
};

export const moderateText = async (text) => {
  const toxicTerms = ['kill yourself', 'nude', 'slut', 'bitch'];
  const lowered = String(text || '').toLowerCase();
  const labels = toxicTerms.filter((term) => lowered.includes(term));
  return { flagged: labels.length > 0, labels, score: labels.length ? 0.92 : 0.05 };
};

const profileForAi = (u) => ({
  interests: u.interests,
  vibeTags: u.vibeTags,
  musicTaste: u.musicTaste,
  prompts: u.prompts,
  goals: u.relationshipGoals,
  studyInterests: u.studyInterests
});
