import { useState } from "react";
import {
  useGetBlogPosts,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  getGetBlogPostsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Eye, Globe, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";

export default function AdminBlogList() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blogData, isLoading } = useGetBlogPosts(
    { page, limit: 20 },
    {
      query: {
        queryKey: ["blog-posts", page],
      },
    }
  );

  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Direito",
    published: false,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createPost.mutateAsync({ data: formData });
      queryClient.invalidateQueries({ queryKey: getGetBlogPostsQueryKey() });
      setIsCreateOpen(false);
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        category: "Direito",
        published: false,
      });
      toast({ title: "Artigo criado com sucesso" });
    } catch {
      toast({ title: "Erro ao criar artigo", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este artigo?")) {
      try {
        await deletePost.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: getGetBlogPostsQueryKey() });
        toast({ title: "Artigo excluído" });
      } catch {
        toast({ title: "Erro ao excluir", variant: "destructive" });
      }
    }
  };

  const togglePublish = async (id: number, currentStatus: boolean) => {
    try {
      await updatePost.mutateAsync({ id, data: { published: !currentStatus } });
      queryClient.invalidateQueries({ queryKey: getGetBlogPostsQueryKey() });
      toast({ title: !currentStatus ? "Artigo publicado" : "Artigo ocultado" });
    } catch {
      toast({ title: "Erro ao atualizar status", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Blog e Publicações</h1>
          <p className="text-zinc-400">Gerencie os artigos do site público</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Novo Artigo
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl text-white">Escrever Novo Artigo</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Título</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-lg font-serif"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Categoria</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="bg-zinc-900 border-zinc-800"
                    placeholder="ex: Direito Tributário"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(c) => setFormData({ ...formData, published: c })}
                  />
                  <Label htmlFor="published" className="text-zinc-300">
                    Publicar imediatamente
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">Resumo (Excerpt)</Label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 min-h-[80px]"
                  placeholder="Breve introdução para a listagem..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">Conteúdo Completo (Aceita HTML básico)</Label>
                <Textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 min-h-[300px] font-mono text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="border-zinc-700 text-zinc-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={createPost.isPending}
                >
                  Salvar Artigo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-[#121214] border border-zinc-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-medium">Título</TableHead>
              <TableHead className="text-zinc-400 font-medium w-[150px]">Categoria</TableHead>
              <TableHead className="text-zinc-400 font-medium w-[150px]">Data</TableHead>
              <TableHead className="text-zinc-400 font-medium w-[100px] text-center">Status</TableHead>
              <TableHead className="text-zinc-400 font-medium text-right w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : blogData?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                  Nenhum artigo encontrado
                </TableCell>
              </TableRow>
            ) : (
              blogData?.data.map((post) => (
                <TableRow key={post.id} className="border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                  <TableCell>
                    <div className="font-medium text-zinc-100 font-serif">{post.title}</div>
                    <div className="text-xs text-zinc-500 truncate max-w-[400px]">{post.excerpt}</div>
                  </TableCell>

                  <TableCell className="text-sm text-amber-500/80">{post.category}</TableCell>

                  <TableCell className="text-xs text-zinc-400">
                    {post.createdAt ? format(new Date(post.createdAt), "dd/MM/yyyy") : "-"}
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-7 px-2 text-xs ${
                        post.published
                          ? "text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                      }`}
                      onClick={() => togglePublish(post.id, post.published || false)}
                    >
                      {post.published ? (
                        <>
                          <Globe className="w-3 h-3 mr-1" /> Público
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 mr-1" /> Oculto
                        </>
                      )}
                    </Button>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                        asChild
                      >
                        <a href={`/blog/${post.id}`} target="_blank" rel="noreferrer">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/30"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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