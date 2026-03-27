import { searchSlack } from './slack';
import Groq from 'groq-sdk';

interface User {
    id: number;
    email: string;
    name: string;
    slack_access_token?: string;
}

// Fetch recent messages by trying several common words
// (Slack search doesn't support * wildcards — this is the reliable workaround)
async function fetchRecentSlackMessages(accessToken: string) {
    const queries = ['the', 'is', 'we', 'update', 'team'];
    const seen = new Set<string>();
    const messages: any[] = [];

    for (const q of queries) {
        try {
            const results = await searchSlack(q, accessToken);
            for (const m of results) {
                if (!seen.has(m.ts)) {
                    seen.add(m.ts);
                    messages.push(m);
                }
            }
            if (messages.length >= 10) break;
        } catch { /* try next query */ }
    }

    return messages.slice(0, 10);
}


export async function generateDigestForUser(user: User): Promise<string | null> {
    if (!user.slack_access_token) return null;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    try {
        // Fetch recent Slack messages
        const messages = await fetchRecentSlackMessages(user.slack_access_token);
        if (!messages || messages.length === 0) return null;

        // Build context from messages
        const messageContext = messages
            .slice(0, 10)
            .map(m => `[#${m.channel} - ${m.user}]: ${m.text.slice(0, 250)}`)
            .join('\n');

        const prompt = `You are Prism AI. Summarize this week's team activity from Slack for a weekly digest email.

Here are recent messages from the user's Slack workspace:
${messageContext}

Write a warm, engaging 3-4 sentence summary of what the team was working on, discussing, or decided this week.
Write it as if you're talking to the individual user directly (use "your team").
Be specific about topics mentioned. Keep it concise and upbeat.
Plain prose only — no bullet points or markdown.`;

        const groq = new Groq({ apiKey });
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 250,
            temperature: 0.6,
        });

        return completion.choices[0]?.message?.content?.trim() || null;
    } catch (err: any) {
        console.error(`Digest generation failed for user ${user.id}:`, err?.message);
        return null;
    }
}

export function getWeekOf(): string {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(start)} – ${fmt(now)}`;
}
