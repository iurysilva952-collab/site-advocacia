import { useGetBlogPosts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BlogList() {
  const { data: blogData, isLoading } = useGetBlogPosts({ page: 1, limit: 20 });

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="bg-zinc-950 min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-16"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-colors mb-8 text-sm uppercase tracking-wider font-medium">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Início
          </Link>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            Insights Jurídicos
          </h1>
          <p className="text-zinc-400 text-xl leading-relaxed">
            Análises, artigos e novidades do mundo jurídico elaborados por nossa equipe de especialistas.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-20 text-zinc-500">Carregando artigos...</div>
        ) : (
          <div className="grid gap-8">
            {blogData?.data.map((post, i) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 p-8 md:p-10 transition-colors"
              >
                <div className="flex flex-col md:flex-row gap-8 justify-between items-start md:items-center mb-6">
                  <div className="text-amber-600 text-xs font-bold uppercase tracking-wider">
                    {post.category || "Direito"}
                  </div>
                  <div className="text-zinc-500 text-sm">
                    {post.publishedAt ? format(new Date(post.publishedAt), "dd 'de' MMMM, yyyy", { locale: ptBR }) : ""}
                  </div>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-zinc-100 mb-6 group-hover:text-amber-500 transition-colors leading-tight">
                  <Link href={`/blog/${post.id}`}>{post.title}</Link>
                </h2>
                
                <p className="text-zinc-400 text-base leading-relaxed mb-8">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-500">
                    Por <span className="text-zinc-300 font-medium">{post.author?.name || "Equipe"}</span>
                  </div>
                  <Link href={`/blog/${post.id}`} className="text-zinc-400 group-hover:text-amber-500 flex items-center gap-1 text-sm uppercase tracking-wide transition-colors">
                    Ler Artigo <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.article>
            ))}

            {(!blogData?.data || blogData.data.length === 0) && (
              <div className="text-center py-20 text-zinc-500 border border-zinc-800 border-dashed">
                Nenhum artigo publicado ainda.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
