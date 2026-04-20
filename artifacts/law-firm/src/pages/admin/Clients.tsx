import { useState } from "react";
import { Link } from "wouter";
import { useGetClients, useCreateClient, useDeleteClient, getGetClientsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function Clients() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clientsData, isLoading } = useGetClients({ search, page, limit: 10 });
  const createClient = useCreateClient();
  const deleteClient = useDeleteClient();

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", cpf: "", address: "", notes: ""
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClient.mutateAsync({ data: formData });
      queryClient.invalidateQueries({ queryKey: getGetClientsQueryKey() });
      setIsCreateOpen(false);
      setFormData({ name: "", email: "", phone: "", cpf: "", address: "", notes: "" });
      toast({ title: "Cliente criado com sucesso" });
    } catch (error) {
      toast({ title: "Erro ao criar cliente", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      try {
        await deleteClient.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: getGetClientsQueryKey() });
        toast({ title: "Cliente excluído com sucesso" });
      } catch (error) {
        toast({ title: "Erro ao excluir cliente", variant: "destructive" });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Clientes</h1>
          <p className="text-zinc-400">Gerencie a carteira de clientes do escritório</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-white">Cadastrar Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-400">Nome Completo *</Label>
                <Input id="name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-zinc-900 border-zinc-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-400">Email *</Label>
                  <Input id="email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-zinc-900 border-zinc-800" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-zinc-400">Telefone</Label>
                  <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-zinc-900 border-zinc-800" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-zinc-400">CPF/CNPJ</Label>
                <Input id="cpf" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="bg-zinc-900 border-zinc-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-zinc-400">Observações</Label>
                <Textarea id="notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="bg-zinc-900 border-zinc-800 min-h-[100px]" />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="border-zinc-700 text-zinc-300">Cancelar</Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={createClient.isPending}>Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2 max-w-md">
        <Search className="w-5 h-5 text-zinc-500 ml-2" />
        <Input 
          placeholder="Buscar clientes por nome, email ou CPF..." 
          className="border-0 bg-transparent focus-visible:ring-0 px-2 h-10 text-zinc-100"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-[#121214] border border-zinc-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-medium">Nome</TableHead>
              <TableHead className="text-zinc-400 font-medium">Contato</TableHead>
              <TableHead className="text-zinc-400 font-medium text-center">Casos Ativos</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-zinc-500">Carregando...</TableCell>
              </TableRow>
            ) : clientsData?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-zinc-500">Nenhum cliente encontrado</TableCell>
              </TableRow>
            ) : (
              clientsData?.data.map((client) => (
                <TableRow key={client.id} className="border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                  <TableCell>
                    <div className="font-medium text-zinc-100">{client.name}</div>
                    <div className="text-xs text-zinc-500">{client.cpf || 'Sem documento'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-zinc-300">{client.email}</div>
                    <div className="text-xs text-zinc-500">{client.phone || 'Sem telefone'}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center bg-zinc-800 text-zinc-300 w-8 h-8 rounded-full text-xs font-medium">
                      {client.activeCaseCount || 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                        <Link href={`/admin/clients/${client.id}`}>
                          <DropdownMenuItem className="cursor-pointer hover:bg-zinc-800 hover:text-white">
                            <Eye className="w-4 h-4 mr-2" /> Ver Detalhes
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="cursor-pointer text-red-400 hover:bg-red-950/30 hover:text-red-300 focus:text-red-300 focus:bg-red-950/30" onClick={() => handleDelete(client.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
