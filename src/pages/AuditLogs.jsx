import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { format } from "date-fns";
import { ShieldAlert, RefreshCw } from "lucide-react";

export default function AuditLogs() {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/audit-logs', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setLogs(data.data || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="p-8 text-center">
                <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
                <p className="text-slate-600">You must be an administrator to view audit logs.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
                        <p className="text-slate-600">Track system activity and security events</p>
                    </div>
                    <button
                        onClick={loadLogs}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                        title="Refresh Logs"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        Error loading logs: {error}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">Entity</th>
                                    <th className="px-6 py-4">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                            {format(new Date(log.timestamp), 'PP pp')}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {log.user_email || `User #${log.user_id}`}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${log.action === 'LOGIN' ? 'bg-blue-100 text-blue-800' :
                                                    log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                                                        log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                                                            'bg-slate-100 text-slate-800'}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={log.details}>
                                            {log.details}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                            No audit logs found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
