import { appParams } from '@/lib/app-params';

// Simple Query Builder to mimic the Base44 SDK syntax
// allowing us to keep the existing code largely intact while pointing to our local API.

class QueryBuilder {
    constructor(table) {
        this.table = table;
        this.method = 'GET';
        this.body = null;
        this.filters = [];
        this._single = false;
    }

    select(columns = '*') {
        this.method = 'GET';
        return this;
    }

    insert(data) {
        this.method = 'POST';
        this.body = data;
        return this;
    }

    update(data) {
        this.method = 'PATCH';
        this.body = data;
        return this;
    }

    delete() {
        this.method = 'DELETE';
        return this;
    }

    eq(column, value) {
        this.filters.push({ column, value });
        return this;
    }

    single() {
        this._single = true;
        return this;
    }

    async then(resolve, reject) {
        // Execute the request when awaited
        try {
            let url = `/api/${this.table}`;

            // Handle filters (simple implementation for now)
            if (this.filters.length > 0) {
                // If we have an ID filter, append it to URL for RESTful convention
                const idFilter = this.filters.find(f => f.column === 'id');
                if (idFilter) {
                    url += `/${idFilter.value}`;
                }
            }

            const options = {
                method: this.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };

            if (this.body && (this.method === 'POST' || this.method === 'PATCH')) {
                options.body = JSON.stringify(this.body);
            }

            const response = await fetch(url, options);

            let data = null;
            let error = null;

            if (!response.ok) {
                error = {
                    message: response.statusText,
                    status: response.status,
                    details: await response.text().catch(() => '')
                };
            } else {
                // Only parse JSON if there is content
                const text = await response.text();
                if (text) {
                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        // ignore JSON parse error for empty bodies
                    }
                }
            }

            resolve({ data, error });
        } catch (err) {
            resolve({ data: null, error: err });
        }
    }
}

export const apiClient = {
    from: (table) => new QueryBuilder(table),

    // Storage bucket helper stub
    storage: {
        from: (bucket) => ({
            upload: async (path, file) => {
                // Implementation for local file upload would go here
                // For now, return a mock success
                console.log(`[Mock] Uploading ${file.name} to ${bucket}/${path}`);
                return { data: { path }, error: null };
            },
            getPublicUrl: (path) => {
                return { data: { publicUrl: `/api/storage/${bucket}/${path}` } };
            }
        })
    }
};

// Alias for backward compatibility during refactor

