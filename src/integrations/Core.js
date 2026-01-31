import { base44 } from '@/api/base44Client';

export const UploadFile = async ({ file }) => {
    // Simple upload to 'imports' bucket
    const filePath = `${Date.now()}_${file.name}`;
    const { data, error } = await base44.storage
        .from('imports')
        .upload(filePath, file);

    if (error) {
        // If bucket doesn't exist, we might fail here. 
        // For now, let's assume we can just return a fake URL if we want to bypass,
        // but better to try real upload.
        console.error('Upload error:', error);
        throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = base44.storage
        .from('imports')
        .getPublicUrl(filePath);

    return { file_url: publicUrl, filePath };
};

export const ExtractDataFromUploadedFile = async ({ file_url, json_schema }) => {
    // Since we don't have the original AI backend for extraction,
    // we will implement a simple client-side CSV parser here.
    // This assumes the file is public or accessible via the URL.

    try {
        const response = await fetch(file_url);
        const text = await response.text();

        // Simple CSV parser
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) return { status: 'success', output: [] };

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            // Handle quotes loosely
            const row = lines[i].split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
            if (row.length === headers.length) {
                const obj = {};
                headers.forEach((h, index) => {
                    obj[h] = row[index];
                });
                data.push(obj);
            }
        }

        return {
            status: 'success',
            output: data
        };

    } catch (err) {
        console.error('Extraction error:', err);
        throw new Error('Failed to parse CSV file');
    }
};
