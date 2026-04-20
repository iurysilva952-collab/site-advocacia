import { useGetBlogPost } from "@workspace/api-client-react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BlogPost() {
  const params = useParams();
  const id = Number(params.id);
  const { data: post, isLoading } = useGetBlogPost(id, { query: { enabled: !!id } });

  if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 pt-32 text-center text-zinc-500">Carregando artigo...</div>;
  }

  if (!post) {
    return <div className="min-h-screen bg-zinc-950 pt-32 text-center text-zinc-500">Artigo não encontrado.</div>;
  }

  return (
    <div className="bg-zinc-950 min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/blog" className="inline-flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-colors mb-12 text-sm uppercase tracking-wider font-medium">
            <ArrowLeft className="w-4 h-4" /> Todos os Artigos
          </Link>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="text-amber-600 text-xs font-bold uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full">
              {post.category || "Direito"}
            </span>
            {post.publishedAt && (
              <span className="text-zinc-500 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {format(new Date(post.publishedAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-8 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 py-8 border-y border-zinc-800/50 mb-12">
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 font-serif font-bold text-xl">
              {post.author?.name?.charAt(0) || "S"}
            </div>
            <div>
              <div className="text-zinc-200 font-medium">{post.author?.name || "Equipe Silva & Associados"}</div>
              <div className="text-zinc-500 text-sm">{post.author?.specialty || "Advogado"}</div>
            </div>
          </div>

          <div className="prose prose-invert prose-zinc prose-amber max-w-none">
            <div dangerouslySetContent={{ __html: post.content || "" }} className="text-zinc-300 leading-relaxed text-lg" />
          </div>
          
          {post.content && !post.content.includes('<') && (
             <div className="text-zinc-300 leading-relaxed text-lg whitespace-pre-wrap">
               {post.content}
             </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
