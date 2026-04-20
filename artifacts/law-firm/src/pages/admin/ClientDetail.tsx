import { useState } from "react";
import { Link, useParams } from "wouter";
import { useGetClient, useGetCases, getGetClientQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, Briefcase, Mail, Phone, MapPin, FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ClientDetail() {
  const params = useParams();
  const id = Number(params.id);
  const { data: client, isLoading } = useGetClient(id, { query: { enabled: !!id } });
  const { data: casesData } = useGetCases({ clientId: id }, { query: { enabled: !!id } });

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

  if (isLoading) {
    return <div className="text-center py-20 text-zinc-500">Carregando...</div>;
  }

  if (!client) {
    return <div className="text-center py-20 text-zinc-500">Cliente não encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/clients" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-amber-500 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Clientes
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">{client.name}</h1>
          <p className="text-zinc-400 flex items-center gap-2 text-sm uppercase tracking-wider">
            CPF/CNPJ: {client.cpf || 'Não informado'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-[#121214] border-zinc-800/50 col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-white">Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 text-zinc-300">
              <Mail className="w-5 h-5 text-zinc-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-zinc-500 uppercase font-medium mb-0.5">Email</p>
                <p className="text-sm truncate">{client.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-zinc-300">
              <Phone className="w-5 h-5 text-zinc-500 shrink-0" />
              <div>
                <p className="text-xs text-zinc-500 uppercase font-medium mb-0.5">Telefone</p>
                <p className="text-sm">{client.phone || 'Não informado'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-zinc-300">
              <MapPin className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-zinc-500 uppercase font-medium mb-0.5">Endereço</p>
                <p className="text-sm leading-relaxed">{client.address || 'Não informado'}</p>
              </div>
            </div>
            {client.notes && (
              <div className="flex items-start gap-3 text-zinc-300 pt-4 border-t border-zinc-800/50">
                <FileText className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-medium mb-0.5">Observações</p>
                  <p className="text-sm leading-relaxed">{client.notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#121214] border-zinc-800/50 col-span-1 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-serif text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-500" />
              Casos Associados
            </CardTitle>
            <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-800">{casesData?.total || 0} Casos</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {casesData?.data.length ? casesData.data.map(c => (
                <Link key={c.id} href={`/admin/cases/${c.id}`}>
                  <div className="block p-4 rounded-lg bg-zinc-900/30 border border-zinc-800 hover:border-amber-500/30 transition-colors group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-mono text-zinc-500">{c.caseNumber || 'S/N'}</span>
                          {getStatusBadge(c.status)}
                        </div>
                        <h4 className="font-medium text-zinc-200 group-hover:text-amber-500 transition-colors">{c.title}</h4>
                        <p className="text-xs text-zinc-500 mt-1">{c.caseType}</p>
                      </div>
                      <div className="flex flex-col md:items-end gap-2 shrink-0">
                        {c.deadline && (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <Calendar className="w-3.5 h-3.5 text-amber-500" />
                            Prazo: {format(new Date(c.deadline), "dd/MM/yyyy")}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500">Resp:</span>
                          <span className="text-xs font-medium text-zinc-300">{c.lawyer?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="text-center py-8 text-zinc-500 border border-zinc-800 border-dashed rounded-lg">
                  Nenhum caso associado a este cliente.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
