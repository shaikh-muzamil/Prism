import { GoogleGenerativeAI } from '@google/generative-ai';
import { SlackResult } from './slack';

interface NotionResult {
    title: string;
    url: string;
    object: string;
    icon?: string;
}

const MAX_SNIPPET_LENGTH = 300;
const MAX_SLACK_RESULTS = 5;
const MAX_NOTION_RESULTS = 5;

function buildPrompt(
    query: string,
    slackResults: SlackResult[],
    notionResults: NotionResult[]
): string {
    const slackSnippets = slackResults
        .slice(0, MAX_SLACK_RESULTS)
        .map((r, i) => `[Slack #${r.channel} - ${r.user}]: ${r.text.slice(0, MAX_SNIPPET_LENGTH)}`)
        .join('\n');

    const notionSnippets = notionResults
        .slice(0, MAX_NOTION_RESULTS)
        .map((r) => `[Notion - "${r.title}"]: (${r.object})`)
        .join('\n');

    const hasSources = slackSnippets.length > 0 || notionSnippets.length > 0;
    if (!hasSources) return '';

    return `You are Prism AI, a helpful knowledge assistant for a team. 
A user searched for: "${query}"

Here are the relevant results found across their connected tools:

${slackSnippets ? `**Slack Messages:**\n${slackSnippets}` : ''}
${notionSnippets ? `\n**Notion Documents:**\n${notionSnippets}` : ''}

Based ONLY on the above sources, write a concise 2-4 sentence answer that directly addresses the user's query. 
Be factual and specific. If the sources don't contain enough information to answer confidently, say so briefly.
Do not use markdown formatting in your response — write plain prose only.`;
}

export async function synthesizeAnswer(
    query: string,
    slackResults: SlackResult[],
    notionResults: NotionResult[]
): Promise<string | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn('GEMINI_API_KEY not set — skipping AI synthesis');
        return null;
    }

    const totalResults = slackResults.length + notionResults.length;
    if (totalResults === 0) return null;

    const prompt = buildPrompt(query, slackResults, notionResults);
    if (!prompt) return null;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        return text || null;
    } catch (error: any) {
        console.error('Gemini AI synthesis failed:', error?.message || error);
        return null;
    }
}
