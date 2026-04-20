import { useState } from "react";
import { Link, useParams } from "wouter";
import { 
  useGetCase, 
  useUpdateCase, 
  useAddTimelineEvent,
  useGetLawyers,
  getGetCaseQueryKey,
  TimelineEventEventType
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Clock, FileText, Gavel, FileSignature, RefreshCw, AlertTriangle, Calendar as CalendarIcon, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CaseDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: caseData, isLoading } = useGetCase(id, { query: { enabled: !!id } });
  const { data: lawyersData } = useGetLawyers();
  const updateCase = useUpdateCase();
  const addEvent = useAddTimelineEvent();

  const [newEvent, setNewEvent] = useState({
    title: "", description: "", eventType: "note" as TimelineEventEventType, eventDate: format(new Date(), "yyyy-MM-dd'T'HH:mm")
  });
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateCase.mutateAsync({ id, data: { status: newStatus as any } });
      queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(id) });
      toast({ title: "Status atualizado" });
    } catch (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      await updateCase.mutateAsync({ id, data: { priority: newPriority as any } });
      queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(id) });
      toast({ title: "Prioridade atualizada" });
    } catch (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  const handleAssignLawyer = async (lawyerId: string) => {
    try {
      await updateCase.mutateAsync({ id, data: { lawyerId: Number(lawyerId) } });
      queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(id) });
      toast({ title: "Advogado reatribuído" });
    } catch (error) {
      toast({ title: "Erro ao reatribuir", variant: "destructive" });
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEvent.mutateAsync({ 
        data: {
          caseId: id,
          ...newEvent,
          eventDate: new Date(newEvent.eventDate).toISOString()
        } as any // using any because generated types might mismatch slightly on caseId injection vs payload
      });
      queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(id) });
      setIsAddingEvent(false);
      setNewEvent({ title: "", description: "", eventType: "note", eventDate: format(new Date(), "yyyy-MM-dd'T'HH:mm") });
      toast({ title: "Evento adicionado" });
    } catch (error) {
      toast({ title: "Erro ao adicionar evento", variant: "destructive" });
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'note': return <FileText className="w-4 h-4 text-zinc-400" />;
      case 'hearing': return <Gavel className="w-4 h-4 text-amber-500" />;
      case 'document': return <FileSignature className="w-4 h-4 text-blue-400" />;
      case 'deadline': return <Clock className="w-4 h-4 text-red-400" />;
      case 'status_change': return <RefreshCw className="w-4 h-4 text-emerald-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-zinc-500" />;
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 text-zinc-500">Carregando...</div>;
  }

  if (!caseData) {
    return <div className="text-center py-20 text-zinc-500">Caso não encontrado.</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <Link href="/admin/cases" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-amber-500 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Casos
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#121214] p-6 rounded-xl border border-zinc-800">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
              {caseData.caseNumber || `CASO-${caseData.id.toString().padStart(4, '0')}`}
            </span>
            <span className="text-xs text-amber-500/80 font-medium uppercase tracking-wider">{caseData.caseType}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight">{caseData.title}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={caseData.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 text-zinc-100 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <SelectItem value="active">🟢 Ativo</SelectItem>
              <SelectItem value="pending">🟡 Pendente</SelectItem>
              <SelectItem value="closed">⚪ Encerrado</SelectItem>
              <SelectItem value="archived">⚫ Arquivado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={caseData.priority} onValueChange={handlePriorityChange}>
            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800 text-zinc-100 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
              <SelectItem value="low">🔵 Baixa</SelectItem>
              <SelectItem value="medium">🟢 Média</SelectItem>
              <SelectItem value="high">🟠 Alta</SelectItem>
              <SelectItem value="urgent">🔴 Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 col-span-1 lg:col-span-1">
          <Card className="bg-[#121214] border-zinc-800/50">
            <CardHeader className="pb-3 border-b border-zinc-800/50">
              <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
              <div>
                <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Cliente</p>
                <Link href={`/admin/clients/${caseData.clientId}`} className="text-amber-500 hover:underline font-medium text-sm">
                  {caseData.client?.name}
                </Link>
              </div>
              
              <div>
                <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Advogado Responsável</p>
                <Select value={caseData.lawyerId.toString()} onValueChange={handleAssignLawyer}>
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-zinc-100 h-9">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    {lawyersData?.map(l => (
                      <SelectItem key={l.id} value={l.id.toString()}>{l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {caseData.deadline && (
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-medium mb-1">Prazo Principal</p>
                  <div className="flex items-center gap-2 text-sm text-red-400 font-medium">
                    <CalendarIcon className="w-4 h-4" />
                    {format(new Date(caseData.deadline), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-zinc-500 uppercase font-medium mb-2">Descrição / Resumo</p>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {caseData.description || 'Nenhuma descrição fornecida.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 lg:col-span-2">
          <Card className="bg-[#121214] border-zinc-800/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800/50 pb-4">
              <CardTitle className="text-lg font-serif text-white">Linha do Tempo</CardTitle>
              <Button 
                size="sm" 
                variant={isAddingEvent ? "secondary" : "default"}
                onClick={() => setIsAddingEvent(!isAddingEvent)}
                className={isAddingEvent ? "bg-zinc-800 text-white" : "bg-amber-600 hover:bg-amber-700 text-white"}
              >
                {isAddingEvent ? "Cancelar" : "+ Novo Evento"}
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              
              {isAddingEvent && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-8">
                  <h4 className="text-sm font-medium text-white mb-4">Adicionar Andamento</h4>
                  <form onSubmit={handleAddEvent} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-400 text-xs">Tipo de Evento</Label>
                        <Select value={newEvent.eventType} onValueChange={(v: any) => setNewEvent({...newEvent, eventType: v})}>
                          <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                            <SelectItem value="note">Anotação Interna</SelectItem>
                            <SelectItem value="document">Documento Anexado</SelectItem>
                            <SelectItem value="hearing">Audiência/Sessão</SelectItem>
                            <SelectItem value="deadline">Prazo/Vencimento</SelectItem>
                            <SelectItem value="update">Atualização Externa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-400 text-xs">Data e Hora</Label>
                        <Input 
                          type="datetime-local" 
                          required 
                          value={newEvent.eventDate} 
                          onChange={e => setNewEvent({...newEvent, eventDate: e.target.value})} 
                          className="bg-zinc-950 border-zinc-800 text-zinc-100 [color-scheme:dark]" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs">Título Curto</Label>
                      <Input 
                        required 
                        value={newEvent.title} 
                        onChange={e => setNewEvent({...newEvent, title: e.target.value})} 
                        className="bg-zinc-950 border-zinc-800 text-zinc-100" 
                        placeholder="Ex: Petição inicial protocolada"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs">Descrição Detalhada (Opcional)</Label>
                      <Textarea 
                        value={newEvent.description} 
                        onChange={e => setNewEvent({...newEvent, description: e.target.value})} 
                        className="bg-zinc-950 border-zinc-800 text-zinc-100 min-h-[80px]" 
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto" disabled={addEvent.isPending}>
                        Salvar Evento
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              <div className="relative pl-4 border-l border-zinc-800/80 space-y-8 ml-2 mt-2">
                {caseData.timeline && caseData.timeline.length > 0 ? (
                  caseData.timeline.map((event, i) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-[25px] w-6 h-6 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center shadow-lg">
                        {getEventIcon(event.eventType)}
                      </div>
                      <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-lg p-4 -mt-1 hover:border-zinc-700 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-zinc-200 font-medium text-sm">{event.title}</h4>
                          <span className="text-xs text-zinc-500 font-mono">
                            {format(new Date(event.eventDate), "dd/MM/yy HH:mm")}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-zinc-800/50">
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Registrado por:</span>
                          <span className="text-xs text-zinc-400">{event.lawyer?.name || 'Sistema'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-zinc-500 text-sm py-4 italic">Nenhum andamento registrado neste caso.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
