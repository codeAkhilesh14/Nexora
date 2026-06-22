import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, BadgeIndianRupee, School, ShieldAlert, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { http } from '../api/http.js';
import { Card } from '../components/ui/Card.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { getSocket } from '../sockets/socket.js';

export const AdminPage = () => {
  const qc = useQueryClient();

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({ 
    queryKey: ['admin-dashboard'], 
    queryFn: () => http.get('/admin/dashboard') 
  });
  const stats = dashboardData?.data || {};

  const { data: reportsData, isLoading: reportsLoading } = useQuery({ 
    queryKey: ['admin-reports'], 
    queryFn: () => http.get('/admin/reports') 
  });
  const reportsList = reportsData?.data?.reports || [];

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewReport = () => {
      toast('New safety report received!', { icon: '🔔' });
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    };

    const handleReportUpdate = () => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    };

    socket.on('report:new', handleNewReport);
    socket.on('report:update', handleReportUpdate);
    return () => {
      socket.off('report:new', handleNewReport);
      socket.off('report:update', handleReportUpdate);
    };
  }, [qc]);

  const dismissMutation = useMutation({
    mutationFn: (reportId) => http.patch(`/admin/reports/${reportId}/status`, { status: 'dismissed', actionTaken: 'Report dismissed by admin.' }),
    onSuccess: () => {
      toast.success('Report dismissed');
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to dismiss report');
    }
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ reportId, targetUserId }) => {
      if (!targetUserId) throw new Error('No target user to suspend.');
      await http.patch(`/admin/users/${targetUserId}/status`, { status: 'suspended' });
      await http.patch(`/admin/reports/${reportId}/status`, { status: 'resolved', actionTaken: 'Suspended the target user.' });
    },
    onSuccess: () => {
      toast.success('Target user suspended and report resolved');
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to suspend user');
    }
  });

  const banMutation = useMutation({
    mutationFn: async ({ reportId, targetUserId }) => {
      if (!targetUserId) throw new Error('No target user to ban.');
      await http.patch(`/admin/users/${targetUserId}/status`, { status: 'banned' });
      await http.patch(`/admin/reports/${reportId}/status`, { status: 'resolved', actionTaken: 'Permanently banned the target user.' });
    },
    onSuccess: () => {
      toast.success('Target user permanently banned and report resolved');
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to ban user');
    }
  });

  const unsuspendMutation = useMutation({
    mutationFn: async ({ targetUserId }) => {
      if (!targetUserId) throw new Error('No target user to unsuspend.');
      await http.patch(`/admin/users/${targetUserId}/status`, { status: 'active' });
    },
    onSuccess: () => {
      toast.success('User status restored to active successfully');
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to unsuspend user');
    }
  });

  const isActionPending = dismissMutation.isPending || suspendMutation.isPending || banMutation.isPending || unsuspendMutation.isPending;

  const items = [
    ['Users', stats.users, Users],
    ['Colleges', stats.colleges, School],
    ['Open reports', stats.reports, ShieldAlert],
    ['Revenue', `₹${Math.round((stats.revenuePaise || 0) / 100)}`, BadgeIndianRupee]
  ];

  if (dashboardLoading) {
    return <LoadingSpinner fullScreen={false} />;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6">
      <div>
        <h1 className="text-4xl font-black font-display">Admin Command</h1>
        <p className="mt-2 text-sm text-slate-500">One dashboard. One decision maker in admin dashboard</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(([label, value, Icon]) => (
          <Card key={label}>
            <Icon className="text-aurora" />
            <p className="mt-5 text-sm text-slate-500">{label}</p>
            <p className="text-3xl font-black">{value ?? '-'}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center gap-3">
          <Activity className="text-flare" />
          <div>
            <h2 className="font-black">Platform health</h2>
            <p className="text-sm text-slate-500">API, database, sockets, moderation queue, payment webhooks.</p>
          </div>
        </div>
      </Card>

      {/* Reports Listing Panel */}
      <div className="mt-8 space-y-4">
        <h2 className="text-2xl font-black font-display flex items-center gap-2">
          <ShieldAlert className="text-rose-500" />
          Moderation & Safety Reports
        </h2>
        
        {reportsLoading ? (
          <LoadingSpinner fullScreen={false} />
        ) : reportsList.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            No safety reports submitted yet.
          </Card>
        ) : (
          <div className="space-y-4">
            {reportsList.map((report) => {
              const isResolved = ['resolved', 'dismissed'].includes(report.status);
              return (
                <Card 
                  key={report._id} 
                  className={`p-5 border transition-all duration-300 ${
                    isResolved 
                      ? 'border-slate-200/50 bg-slate-50/30 dark:border-slate-800/40 dark:bg-slate-900/10 opacity-70 shadow-none' 
                      : 'border-rose-500/30 dark:border-rose-500/20 shadow-md shadow-rose-500/5'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full ${
                          report.status === 'open' 
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' 
                            : report.status === 'resolved' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {report.status}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
                          Reported on {new Date(report.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          Reporter: <span className="text-slate-500 font-medium">@{report.reporter?.nickname || 'Anonymous'} ({report.reporter?.email || 'N/A'})</span>
                        </p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center flex-wrap gap-1.5">
                          Target User: <span className="text-rose-500 font-bold">@{report.targetUser?.nickname || 'Anonymous'} ({report.targetUser?.email || 'N/A'})</span>
                          {report.targetUser?.status && report.targetUser.status !== 'active' && (
                            <span className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-500 dark:text-red-400 animate-pulse shrink-0">
                              {report.targetUser.status}
                            </span>
                          )}
                        </p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          Reason: <span className="text-amber-600 dark:text-amber-400 capitalize">{report.reason?.replace(/_/g, ' ')}</span>
                        </p>
                      </div>
                      
                      {report.notes && (
                        <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl text-xs text-slate-600 dark:text-slate-450 max-w-xl">
                          <span className="font-bold block mb-1">Reporter Notes:</span>
                          {report.notes}
                        </div>
                      )}

                      {report.actionTaken && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold italic mt-2">
                          Action taken: {report.actionTaken}
                        </p>
                      )}
                    </div>

                    {!isResolved ? (
                      <div className="flex flex-row md:flex-col gap-2 shrink-0 self-end md:self-start">
                        <button
                          onClick={() => dismissMutation.mutate(report._id)}
                          disabled={isActionPending}
                          className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 transition-colors"
                        >
                          Dismiss Report
                        </button>
                        
                        <button
                          onClick={() => suspendMutation.mutate({ reportId: report._id, targetUserId: report.targetUser?._id })}
                          disabled={isActionPending}
                          className="px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/10 transition-colors"
                        >
                          Suspend User
                        </button>

                        <button
                          onClick={() => banMutation.mutate({ reportId: report._id, targetUserId: report.targetUser?._id })}
                          disabled={isActionPending}
                          className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black shadow-md transition-colors"
                        >
                          Ban User
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-row md:flex-col gap-2 shrink-0 self-end md:self-start">
                        {['suspended', 'banned'].includes(report.targetUser?.status) && (
                          <button
                            onClick={() => unsuspendMutation.mutate({ targetUserId: report.targetUser?._id })}
                            disabled={isActionPending}
                            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10 transition-colors"
                          >
                            Unsuspend User
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

