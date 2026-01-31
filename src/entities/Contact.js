import { apiClient as db } from '@/api/client';

export const Contact = {
    list: async () => {
        const { data, error } = await db.from('contact').select('*');
        if (error) throw error;
        return data || [];
    },

    create: async (contact) => {
        const { data, error } = await db.from('contact').insert(contact).select().single();
        if (error) throw error;
        return data;
    },

    update: async (id, updates) => {
        const { data, error } = await db.from('contact').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    delete: async (id) => {
        const { error } = await db.from('contact').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    get: async (id) => {
        const { data, error } = await db.from('contact').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    }
};
