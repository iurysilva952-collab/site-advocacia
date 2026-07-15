import { 
  useGetDashboardSummary, 
  useGetRecentActivity, 
  useGetCasesByStatus, 
  useGetLawyerWorkload 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, AlertTriangle, Bell, Clock, FileText, Scale } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ['#10b981', '#f59e0b', '#64748b', '#3b82f6'];

export default function Dashboard() {
  const { data: summary } = useGetDashboardSummary();
  const { data: activity } = useGetRecentActivity();
  const { data: casesByStatus } = useGetCasesByStatus();
  const { data: workload } = useGetLawyerWorkload();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'case_created': return <Briefcase className="w-4 h-4 text-emerald-500" />;
      case 'case_updated': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'client_added': return <Users className="w-4 h-4 text-amber-500" />;
      case 'timeline_event': return <FileText className="w-4 h-4 text-indigo-500" />;
      default: return <Bell className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white mb-2">Visão Geral</h1>
        <p className="text-zinc-400">Resumo das atividades do escritório</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#121214] border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{summary?.totalClients || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#121214] border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Casos Ativos</CardTitle>
            <Briefcase className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{summary?.activeCases || 0}</div>
            <p className="text-xs text-zinc-500 mt-1">de {summary?.totalCases || 0} totais</p>
          </CardContent>
        </Card>
        <Card className="bg-[#121214] border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Casos Urgentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{summary?.urgentCases || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-[#121214] border-zinc-800/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Notificações</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{summary?.unreadNotifications || 0}</div>
            <p className="text-xs text-zinc-500 mt-1">não lidas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases by Status Chart */}
        <Card className="bg-[#121214] border-zinc-800/50 col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-white">Casos por Status</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center h-64">
            {casesByStatus && casesByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={casesByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="label"
                  >
                    {casesByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5' }}
                    itemStyle={{ color: '#f4f4f5' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                Sem dados suficientes
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-[#121214] border-zinc-800/50 col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-white">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity?.length ? activity.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-zinc-900/50 transition-colors border border-transparent hover:border-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-800">
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-600 font-medium uppercase tracking-wider">
                      <span>{format(new Date(item.createdAt), "dd MMM, HH:mm", { locale: ptBR })}</span>
                      {item.lawyer && (
                        <>
                          <span>•</span>
                          <span>{item.lawyer.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  Nenhuma atividade recente
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Lawyer Workload */}
        <Card className="bg-[#121214] border-zinc-800/50 col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-500" />
              Carga de Trabalho da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workload?.map((w) => (
                <div key={w.lawyer.id} className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold border border-zinc-700">
                      {w.lawyer.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-zinc-200 text-sm">{w.lawyer.name}</h4>
                      <p className="text-xs text-zinc-500">{w.lawyer.specialty || 'Advogado'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center border-t border-zinc-800/50 pt-3">
                    <div>
                      <div className="text-lg font-bold text-white">{w.activeCases}</div>
                      <div className="text-[10px] text-zinc-500 uppercase">Ativos</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-500">{w.urgentCases}</div>
                      <div className="text-[10px] text-zinc-500 uppercase">Urgentes</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-zinc-400">{w.totalCases}</div>
                      <div className="text-[10px] text-zinc-500 uppercase">Total</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
