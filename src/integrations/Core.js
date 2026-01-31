export const UploadFile = async ({ file }) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
    });

    const result = await res.json();
    if (result.error) throw new Error(result.error);

    return { file_url: result.data.publicUrl, filePath: result.data.publicUrl };
};

export const ExtractDataFromUploadedFile = async ({ file_url, json_schema }) => {
    // Since we don't have the original AI backend for extraction,
    // we will implement a simple client-side CSV parser here.
    // This assumes the file is public or accessible via the URL.

    try {
        const response = await fetch(file_url);
        const text = await response.text();

        // Better CSV parser handling quotes
        // Matches: "quoted field" OR unquoted_field
        // followed by comma or end of line
        const parseCSVLine = (line) => {
            const values = [];
            let current = '';
            let inQuote = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuote = !inQuote;
                } else if (char === ',' && !inQuote) {
                    values.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
            return values;
        };

        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) return { status: 'success', output: [] };

        const headers = parseCSVLine(lines[0]);
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const row = parseCSVLine(lines[i]);
            if (row.length === headers.length) {
                const obj = {};
                headers.forEach((h, index) => {
                    // Remove any BOM or whitespace from header keys
                    const key = h.trim();
                    if (key) obj[key] = row[index];
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
