import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { http } from '../api/http.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';

const radarZones = [
  { value: 'library', label: 'Library' },
  { value: 'cafeteria', label: 'Cafeteria' },
  { value: 'amenities', label: 'Amenities' },
  { value: 'college_gate', label: 'College gate' },
  { value: 'mandir_area', label: 'Mandir area' },
  { value: 'boys_hostel', label: 'Boys hostel' },
  { value: 'girls_hostel', label: 'Girls hostel' },
  { value: 'field', label: 'Field' },
  { value: 'basketball_court', label: 'Basketball court' },
  { value: 'badminton_court', label: 'Badminton court' },
  { value: 'volleyball_court', label: 'Volleyball court' },
  { value: 'first_year_block', label: '1st year block' },
  { value: 'amphitheatre', label: 'Amphitheatre' },
  { value: 'courtyard', label: 'Courtyard' },
  { value: 'parking', label: 'Parking' },
  { value: 'placement_cell_office', label: 'Placement cell office' },
  { value: 'registrar_office', label: 'Registrar office' }
];

export const RadarPage = () => {
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState(null);

  const usersQuery = useQuery({
    queryKey: ['radar-zone-users', selectedZone],
    enabled: Boolean(selectedZone),
    queryFn: () => http.get(`/discovery/radar/users?zone=${selectedZone}`)
  });

  const radarMutation = useMutation({
    mutationFn: (payload) => http.post('/discovery/radar', payload),
    onSuccess: (res) => {
      const zone = res?.data?.zone;
      setSelectedZone(zone);
      toast.success(res?.message || `Zone updated to ${zone}`);
    },
    onError: (err) => {
      toast.error(err.message || 'Could not update zone');
    }
  });

  const updateZone = (zone) => radarMutation.mutate({ zone });

  return (
    <div className="min-h-[calc(100vh-6rem)] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black font-display">Quick Radar</h1>
            <p className="mt-1 text-sm text-slate-500">Select an approximate campus zone to find nearby students.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate('/discover')}>Back to Discover</Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-4">
            <h3 className="font-semibold mb-3">Zones</h3>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[60vh] pb-3 lg:pb-0 whitespace-nowrap">
              {radarZones.map((z) => (
                <Button
                  key={z.value}
                  type="button"
                  variant={selectedZone === z.value ? 'neon' : 'ghost'}
                  className="whitespace-nowrap shrink-0 lg:w-full justify-start text-sm"
                  onClick={() => updateZone(z.value)}
                >
                  {z.label}
                </Button>
              ))}
            </div>
          </Card>

          <div className="lg:col-span-2">
            {selectedZone ? (
              <Card className="p-4">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white font-display text-sm sm:text-base">
                        {radarZones.find(r => r.value === selectedZone)?.label}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {usersQuery.isLoading ? 'Scanning campus grid...' : `${usersQuery.data?.data?.users?.length || 0} student(s) localized`}
                      </div>
                    </div>
                  </div>
                  {!usersQuery.isLoading && (usersQuery.data?.data?.users || []).length > 0 && (
                    <Button type="button" variant="neon" size="sm" className="text-xs py-1.5 px-3 rounded-lg" onClick={() => navigate(`/discover?zone=${selectedZone}`)}>
                      Open Swiping Deck
                    </Button>
                  )}
                </div>

                <div className="mt-4">
                  {usersQuery.isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="relative w-40 h-40 rounded-full border border-emerald-500/20 dark:border-aurora/20 flex items-center justify-center overflow-hidden bg-black/5 dark:bg-white/5 shadow-inner mb-4">
                        <div className="absolute w-28 h-28 rounded-full border border-emerald-500/15 dark:border-aurora/15 animate-ping [animation-duration:3s]" />
                        <div className="absolute w-16 h-16 rounded-full border border-emerald-500/10 dark:border-aurora/10" />
                        <div className="absolute w-full h-[1px] bg-emerald-500/10 dark:bg-aurora/10" />
                        <div className="absolute h-full w-[1px] bg-emerald-500/10 dark:bg-aurora/10" />
                        <div className="absolute w-1/2 h-1/2 right-1/2 bottom-1/2 origin-bottom-right bg-gradient-to-tr from-transparent via-emerald-500/10 to-emerald-500/30 dark:via-aurora/10 dark:to-aurora/30 border-r border-emerald-500/40 dark:border-aurora/40 rounded-tl-full animate-radar-sweep" />
                      </div>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 animate-pulse">Pinging local active devices...</p>
                    </div>
                  ) : (usersQuery.data?.data?.users || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="relative w-40 h-40 rounded-full border border-red-500/25 flex items-center justify-center overflow-hidden bg-red-500/5 mb-4 animate-pulse-slow">
                        <div className="absolute w-full h-[1px] bg-red-500/10" />
                        <div className="absolute h-full w-[1px] bg-red-500/10" />
                        <span className="text-red-500 text-xs font-semibold">Offline</span>
                      </div>
                      <p className="font-bold text-slate-800 dark:text-white">No matches localized</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">No active students are currently set to this zone. Try picking another area or check back later!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-auto p-1">
                      {(usersQuery.data?.data?.users || []).map((u) => (
                        <div key={u._id} className="flex items-center gap-3 p-3 rounded-xl border border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all duration-300">
                          <div className="h-12 w-12 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                            {u.avatar ? (
                              <img src={u.avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-base font-black text-white/80 bg-aurora text-ink">{u.nickname?.[0]?.toUpperCase()}</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate">{u.nickname}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{u.branch?.toUpperCase()} · Year {u.year}</div>
                          </div>
                          <div>
                            <Button type="button" size="sm" variant="ghost" className="rounded-lg text-xs" onClick={() => navigate(`/discover?zone=${selectedZone}`)}>View</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-8 flex flex-col items-center justify-center min-h-[50vh] text-center border-dashed">
                <div className="relative w-48 h-48 rounded-full border border-emerald-500/20 dark:border-aurora/20 flex items-center justify-center overflow-hidden bg-slate-50/50 dark:bg-white/[0.02] shadow-2xl backdrop-blur-md mb-6">
                  {/* Concentric rings */}
                  <div className="absolute w-36 h-36 rounded-full border border-emerald-500/15 dark:border-aurora/15 animate-pulse" />
                  <div className="absolute w-24 h-24 rounded-full border border-emerald-500/10 dark:border-aurora/10" />
                  <div className="absolute w-12 h-12 rounded-full border border-emerald-500/5 dark:border-aurora/5" />
                  
                  {/* Grid axes */}
                  <div className="absolute w-full h-[1px] bg-emerald-500/10 dark:bg-aurora/10" />
                  <div className="absolute h-full w-[1px] bg-emerald-500/10 dark:bg-aurora/10" />

                  {/* Sweeper arm */}
                  <div className="absolute w-1/2 h-1/2 right-1/2 bottom-1/2 origin-bottom-right bg-gradient-to-tr from-transparent via-emerald-500/10 to-emerald-500/30 dark:via-aurora/10 dark:to-aurora/30 border-r border-emerald-500/40 dark:border-aurora/40 rounded-tl-full animate-radar-sweep" />

                  {/* Pulsing radar dots */}
                  <div className="absolute top-[25%] left-[30%] w-2.5 h-2.5 rounded-full bg-emerald-400 dark:bg-aurora animate-pulse shadow-[0_0_8px_#54f4c8]" />
                  <div className="absolute bottom-[35%] right-[25%] w-2.5 h-2.5 rounded-full bg-emerald-400 dark:bg-aurora animate-pulse [animation-delay:1.2s] shadow-[0_0_8px_#54f4c8]" />
                </div>
                <h3 className="text-xl font-black font-display text-slate-900 dark:text-white">Quick Radar Off-grid</h3>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-xs">Select a campus zone from the left sidebar to start scanning for nearby active students.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadarPage;
