import { base44 } from '@/api/base44Client';

export const Contact = {
    list: async () => {
        const { data, error } = await base44.from('contact').select('*');
        if (error) throw error;
        return data || [];
    },

    create: async (contact) => {
        const { data, error } = await base44.from('contact').insert(contact).select().single();
        if (error) throw error;
        return data;
    },

    update: async (id, updates) => {
        const { data, error } = await base44.from('contact').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    delete: async (id) => {
        const { error } = await base44.from('contact').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    get: async (id) => {
        const { data, error } = await base44.from('contact').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    }
};
