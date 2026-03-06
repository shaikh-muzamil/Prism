import axios from 'axios';

export interface SearchResult {
    id: string;
    title: string;
    description: string;
    url: string;
    source: 'drive' | 'gmail';
    timestamp?: string;
}

export const searchGoogleDrive = async (query: string, accessToken: string): Promise<SearchResult[]> => {
    if (!accessToken) return [];

    try {
        const response = await axios.get('https://www.googleapis.com/drive/v3/files', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                q: `name contains '${query}' or fullText contains '${query}'`,
                fields: 'files(id, name, webViewLink, modifiedTime, mimeType)',
                pageSize: 5,
            },
        });

        const files = response.data.files || [];
        return files.map((file: any) => ({
            id: file.id,
            title: file.name,
            description: `Type: ${file.mimeType.replace('application/vnd.google-apps.', '')}`,
            url: file.webViewLink,
            source: 'drive',
            timestamp: file.modifiedTime,
        }));
    } catch (error: any) {
        console.error('Drive API Error:', error.response?.data || error.message);
        return [];
    }
};

export const searchGmail = async (query: string, accessToken: string): Promise<SearchResult[]> => {
    if (!accessToken) return [];

    try {
        // First find message IDs
        const listResponse = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { q: query, maxResults: 5 },
        });

        const messages = listResponse.data.messages || [];
        if (messages.length === 0) return [];

        // Fetch details for each message
        const messagePromises = messages.map((msg: any) =>
            axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { format: 'metadata', metadataHeaders: ['Subject', 'From', 'Date'] },
            })
        );

        const detailResponses = await Promise.all(messagePromises);

        return detailResponses.map((res: any) => {
            const msgData = res.data;
            const headers = msgData.payload.headers;

            const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === 'subject');
            const fromHeader = headers.find((h: any) => h.name.toLowerCase() === 'from');
            const dateHeader = headers.find((h: any) => h.name.toLowerCase() === 'date');

            return {
                id: msgData.id,
                title: subjectHeader ? subjectHeader.value : '(No Subject)',
                description: `From: ${fromHeader ? fromHeader.value : 'Unknown'} - ${msgData.snippet}`,
                url: `https://mail.google.com/mail/u/0/#inbox/${msgData.id}`,
                source: 'gmail',
                timestamp: dateHeader ? dateHeader.value : undefined,
            };
        });
    } catch (error: any) {
        console.error('Gmail API Error:', error.response?.data || error.message);
        return [];
    }
};
