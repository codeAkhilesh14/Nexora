import { useQuery } from '@tanstack/react-query';
import { Activity, BadgeIndianRupee, School, ShieldAlert, Users } from 'lucide-react';
import { http } from '../api/http.js';
import { Card } from '../components/ui/Card.jsx';

export const AdminPage = () => {
  const { data } = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => http.get('/admin/dashboard') });
  const stats = data?.data || {};
  const items = [
    ['Users', stats.users, Users],
    ['Colleges', stats.colleges, School],
    ['Open reports', stats.reports, ShieldAlert],
    ['Revenue', `₹${Math.round((stats.revenuePaise || 0) / 100)}`, BadgeIndianRupee]
  ];
  return (
    <div>
      <h1 className="text-4xl font-black font-display">Admin Command</h1>
      <p className="mt-2 text-sm text-slate-500">Single-admin controls are locked to the ENV admin email.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(([label, value, Icon]) => <Card key={label}><Icon className="text-aurora" /><p className="mt-5 text-sm text-slate-500">{label}</p><p className="text-3xl font-black">{value ?? '-'}</p></Card>)}
      </div>
      <Card className="mt-4"><div className="flex items-center gap-3"><Activity className="text-flare" /><div><h2 className="font-black">Platform health</h2><p className="text-sm text-slate-500">API, database, sockets, moderation queue, payment webhooks.</p></div></div></Card>
    </div>
  );
};
