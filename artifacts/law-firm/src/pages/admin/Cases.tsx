import { useState } from "react";
import { Link } from "wouter";
import { useGetCases, useCreateCase, useDeleteCase, useGetClients, useGetLawyers, getGetCasesQueryKey, CreateCaseBodyStatus, CreateCaseBodyPriority } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Calendar, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Cases() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: casesData, isLoading } = useGetCases({ 
    search, 
    status: statusFilter !== "all" ? statusFilter as any : undefined,
    limit: 50 
  });
  const { data: clientsData } = useGetClients({ limit: 100 });
  const { data: lawyersData } = useGetLawyers();
  const createCase = useCreateCase();

  const [formData, setFormData] = useState({
    title: "", description: "", clientId: "", lawyerId: "", 
    caseType: "", status: "active" as CreateCaseBodyStatus, 
    priority: "medium" as CreateCaseBodyPriority, deadline: ""
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId || !formData.lawyerId) {
      toast({ title: "Selecione cliente e advogado", variant: "destructive" });
      return;
    }
    
    try {
      await createCase.mutateAsync({ 
        data: {
          ...formData,
          clientId: Number(formData.clientId),
          lawyerId: Number(formData.lawyerId),
          deadline: formData.deadline || undefined
        } 
      });
      queryClient.invalidateQueries({ queryKey: getGetCasesQueryKey() });
      setIsCreateOpen(false);
      setFormData({
        title: "", description: "", clientId: "", lawyerId: "", 
        caseType: "", status: "active" as CreateCaseBodyStatus, 
        priority: "medium" as CreateCaseBodyPriority, deadline: ""
      });
      toast({ title: "Caso criado com sucesso" });
    } catch (error) {
      toast({ title: "Erro ao criar caso", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string, color: string }> = {
      'active': { label: 'Ativo', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
      'pending': { label: 'Pendente', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
      'closed': { label: 'Encerrado', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
      'archived': { label: 'Arquivado', color: 'bg-zinc-800 text-zinc-500 border-zinc-700' },
    };
    const s = statusMap[status] || { label: status, color: 'bg-zinc-800 text-zinc-400' };
    return <Badge variant="outline" className={`${s.color} font-medium`}>{s.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const pMap: Record<string, { label: string, color: string }> = {
      'low': { label: 'Baixa', color: 'text-zinc-400 bg-zinc-800' },
      'medium': { label: 'Média', color: 'text-blue-400 bg-blue-950' },
      'high': { label: 'Alta', color: 'text-amber-500 bg-amber-950' },
      'urgent': { label: 'Urgente', color: 'text-red-500 bg-red-950 font-bold border-red-900 border' },
    };
    const p = pMap[priority] || { label: priority, color: 'text-zinc-400 bg-zinc-800' };
    return <span className={`text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider ${p.color}`}>{p.label}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Casos e Processos</h1>
          <p className="text-zinc-400">Acompanhamento processual e consultivo</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Novo Caso
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-white">Novo Caso</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-zinc-400">Título do Caso *</Label>
                <Input id="title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-zinc-900 border-zinc-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Cliente *</Label>
                  <Select value={formData.clientId} onValueChange={v => setFormData({...formData, clientId: v})}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-[200px]">
                      {clientsData?.data.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">Advogado Responsável *</Label>
                  <Select value={formData.lawyerId} onValueChange={v => setFormData({...formData, lawyerId: v})}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      {lawyersData?.map(l => (
                        <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Status</Label>
                  <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v as CreateCaseBodyStatus})}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="closed">Encerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">Prioridade</Label>
                  <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v as CreateCaseBodyPriority})}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-zinc-400">Prazo Principal</Label>
                  <Input id="deadline" type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="bg-zinc-900 border-zinc-800 text-white [color-scheme:dark]" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="caseType" className="text-zinc-400">Tipo/Área (ex: Cível, Penal, Contrato)</Label>
                <Input id="caseType" value={formData.caseType} onChange={e => setFormData({...formData, caseType: e.target.value})} className="bg-zinc-900 border-zinc-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-zinc-400">Descrição Inicial</Label>
                <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-zinc-900 border-zinc-800 min-h-[100px]" />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="border-zinc-700 text-zinc-300">Cancelar</Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={createCase.isPending}>Criar Caso</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 max-w-2xl">
        <div className="flex-1 flex items-center gap-2 bg-zinc-950 rounded border border-zinc-800 px-3">
          <Search className="w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Buscar por título, número ou cliente..." 
            className="border-0 bg-transparent focus-visible:ring-0 px-1 h-9 text-sm text-zinc-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-zinc-950 border-zinc-800 text-zinc-100 h-9">
            <SelectValue placeholder="Todos os Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="closed">Encerrados</SelectItem>
            <SelectItem value="archived">Arquivados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-20 text-zinc-500">Carregando casos...</div>
        ) : casesData?.data.length === 0 ? (
          <div className="col-span-full text-center py-20 text-zinc-500 border border-zinc-800 border-dashed rounded-lg">
            Nenhum caso encontrado com os filtros atuais.
          </div>
        ) : (
          casesData?.data.map((c) => (
            <Link key={c.id} href={`/admin/cases/${c.id}`}>
              <div className="bg-[#121214] border border-zinc-800 rounded-xl p-5 hover:border-amber-500/50 transition-all group flex flex-col h-full cursor-pointer hover:shadow-lg hover:shadow-amber-900/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-zinc-800 group-hover:bg-amber-500 transition-colors" />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                      {c.caseNumber || `CASO-${c.id.toString().padStart(4, '0')}`}
                    </span>
                  </div>
                  {getStatusBadge(c.status)}
                </div>
                
                <h3 className="text-lg font-serif font-medium text-white mb-2 line-clamp-2 leading-tight">
                  {c.title}
                </h3>
                
                <div className="text-sm text-zinc-400 mb-4 line-clamp-1 flex-1">
                  <span className="font-medium text-zinc-300">Cliente:</span> {c.client?.name}
                </div>

                <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-zinc-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-bold border border-zinc-700">
                        {c.lawyer?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-xs text-zinc-300">{c.lawyer?.name || 'Não atribuído'}</span>
                    </div>
                    {getPriorityBadge(c.priority)}
                  </div>
                  
                  {c.deadline && (
                    <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/20 w-fit px-2 py-1 rounded">
                      <Calendar className="w-3.5 h-3.5" />
                      Prazo: {format(new Date(c.deadline), "dd/MM/yyyy")}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
