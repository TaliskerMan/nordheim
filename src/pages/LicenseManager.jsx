import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { format } from "date-fns";
import { Key, Plus, Copy, Check, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LicenseManager() {
    const { user } = useAuth();
    const [licenses, setLicenses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: "",
        technical_contact: "",
        technical_email: "",
        business_contact: "",
        business_email: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [copiedKey, setCopiedKey] = useState(null);

    useEffect(() => {
        loadLicenses();
    }, []);

    const loadLicenses = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/licenses', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.error) setLicenses(data.data || []);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/licenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            await loadLicenses();
            setShowForm(false);
            setFormData({
                customer_name: "",
                technical_contact: "",
                technical_email: "",
                business_contact: "",
                business_email: ""
            });
        } catch (err) {
            alert(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (key) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    if (!user || user.role !== 'admin') return <div className="p-8">Access Denied</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">License Management</h1>
                        <p className="text-slate-600">Issue and track enterprise licenses</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>
                        <Plus className="w-5 h-5 mr-2" />
                        Issue New License
                    </Button>
                </div>

                {showForm && (
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8 max-w-2xl">
                        <h3 className="text-lg font-semibold mb-4 text-slate-900">New License Details</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_name">Customer Company Name</Label>
                                    <Input
                                        id="customer_name"
                                        required
                                        value={formData.customer_name}
                                        onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="technical_contact">Technical Contact Name</Label>
                                    <Input
                                        id="technical_contact"
                                        value={formData.technical_contact}
                                        onChange={e => setFormData({ ...formData, technical_contact: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="technical_email">Technical Contact Email</Label>
                                    <Input
                                        id="technical_email"
                                        type="email"
                                        value={formData.technical_email}
                                        onChange={e => setFormData({ ...formData, technical_email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="business_contact">Business Contact Name</Label>
                                    <Input
                                        id="business_contact"
                                        value={formData.business_contact}
                                        onChange={e => setFormData({ ...formData, business_contact: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="business_email">Business Contact Email</Label>
                                    <Input
                                        id="business_email"
                                        type="email"
                                        value={formData.business_email}
                                        onChange={e => setFormData({ ...formData, business_email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Generating...' : 'Generate License Key'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid gap-4">
                    {licenses.map(license => (
                        <div key={license.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-slate-400" />
                                    <h3 className="font-semibold text-slate-900 text-lg">{license.customer_name}</h3>
                                </div>
                                <p className="text-sm text-slate-500">Issued on {format(new Date(license.created_at), 'PPP')}</p>
                                <div className="text-sm text-slate-600 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mt-2">
                                    <span>Tech: {license.technical_contact} ({license.technical_email})</span>
                                    <span>Biz: {license.business_contact} ({license.business_email})</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                                <Key className="w-4 h-4 text-slate-400" />
                                <code className="text-sm font-mono text-slate-700">{license.generated_key}</code>
                                <button
                                    onClick={() => copyToClipboard(license.generated_key)}
                                    className="ml-2 p-1.5 hover:bg-white rounded-md transition-all text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-200"
                                    title="Copy License Key"
                                >
                                    {copiedKey === license.generated_key ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    ))}

                    {licenses.length === 0 && !isLoading && (
                        <div className="text-center py-12 text-slate-500">
                            No licenses issued yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
