import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useGetBlogPosts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Scale, Shield, Building2, Users, FileText, Landmark, ArrowRight, ChevronRight } from "lucide-react";
import heroImg from "@/assets/hero.png";
import officeImg from "@/assets/office.png";
import teamImg from "@/assets/team.png";

const prompts = [
  "Está enfrentando um problema jurídico?",
  "Precisa de representação legal confiável?",
  "Seu caso merece atenção especializada.",
];

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function Home() {
  const [promptIndex, setPromptIndex] = useState(0);
  const { data: blogData } = useGetBlogPosts(
    { page: 1, limit: 3 },
    {
      query: {
        queryKey: ["home-blog-posts", 1, 3],
      },
    }
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % prompts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-zinc-950">
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImg} alt="Law office" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/40" />
        </div>

        <div className="container mx-auto px-4 z-10 relative mt-20">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-4xl">
            <motion.div variants={fadeIn} className="h-12 mb-6">
              <AnimatePresence mode="wait">
                <motion.p
                  key={promptIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="text-amber-500 font-medium tracking-widest uppercase text-sm md:text-base"
                >
                  {prompts[promptIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-tight mb-8"
            >
              A Excelência na <br />
              <span className="text-zinc-400 italic font-light">Defesa dos seus Direitos.</span>
            </motion.h1>

            <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-none px-8 h-14 text-base tracking-wide"
                asChild
              >
                <a href="#contato">FALE COM UM ADVOGADO</a>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-none px-8 h-14 text-base tracking-wide"
                asChild
              >
                <a href="#atuacao">NOSSAS ÁREAS</a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 md:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-amber-500 font-medium tracking-widest uppercase text-sm mb-4">A Banca</h2>
              <h3 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8 leading-tight">
                Mais de duas décadas de tradição e resultados expressivos.
              </h3>

              <div className="space-y-6 text-zinc-400 text-lg leading-relaxed">
                <p>
                  A Silva & Associados Advocacia consolidou-se como referência no mercado jurídico nacional pela
                  condução estratégica e impecável de casos complexos.
                </p>
                <p>
                  Nossa atuação é pautada por um rigor técnico implacável e dedicação exclusiva a cada cliente.
                  Entendemos que por trás de cada processo há um patrimônio, uma liberdade ou uma reputação a ser
                  preservada.
                </p>

                <div className="pt-6">
                  <img
                    src={officeImg}
                    alt="Office interior"
                    className="w-full h-64 object-cover grayscale hover:grayscale-0 transition-all duration-700 border border-zinc-800"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {[
                { number: "25+", label: "Anos de Experiência" },
                { number: "5k+", label: "Casos Resolvidos" },
                { number: "98%", label: "Taxa de Sucesso" },
                { number: "12", label: "Advogados Especialistas" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  className="bg-zinc-900/50 border border-zinc-800 p-8 flex flex-col items-center text-center"
                >
                  <span className="text-4xl font-serif text-amber-500 mb-2">{stat.number}</span>
                  <span className="text-zinc-400 uppercase text-xs tracking-widest">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section id="atuacao" className="py-24 md:py-32 bg-zinc-900/20 border-y border-zinc-800/50 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-amber-500 font-medium tracking-widest uppercase text-sm mb-4">Especialidades</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">Áreas de Atuação</h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Scale,
                title: "Direito Penal Econômico",
                desc: "Defesa especializada em crimes corporativos, lavagem de capitais e compliance.",
              },
              {
                icon: Shield,
                title: "Contencioso Cível",
                desc: "Atuação em litígios complexos, responsabilidade civil e disputas contratuais.",
              },
              {
                icon: Building2,
                title: "Direito Empresarial",
                desc: "Consultoria para empresas, fusões, aquisições e governança corporativa.",
              },
              {
                icon: Users,
                title: "Direito de Família e Sucessões",
                desc: "Planejamento sucessório, divórcios, partilhas e gestão de patrimônio familiar.",
              },
              {
                icon: FileText,
                title: "Direito do Trabalho",
                desc: "Defesa patronal e contencioso trabalhista estratégico para corporações.",
              },
              {
                icon: Landmark,
                title: "Direito Imobiliário",
                desc: "Assessoria em negócios imobiliários, incorporações e regularização.",
              },
            ].map((area, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeIn}
                className="group p-10 bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 transition-colors duration-500"
              >
                <area.icon className="w-10 h-10 text-zinc-600 group-hover:text-amber-500 transition-colors duration-500 mb-6" />
                <h4 className="text-xl font-serif text-white mb-4">{area.title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{area.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="equipe" className="py-24 md:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <img
                src={teamImg}
                alt="Equipe de advogados"
                className="w-full h-[600px] object-cover grayscale border border-zinc-800"
              />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="flex flex-col justify-center"
            >
              <motion.h2 variants={fadeIn} className="text-amber-500 font-medium tracking-widest uppercase text-sm mb-4">
                A Equipe
              </motion.h2>

              <motion.h3
                variants={fadeIn}
                className="text-4xl md:text-5xl font-serif font-bold text-white mb-8 leading-tight"
              >
                Advogados Forjados na Complexidade.
              </motion.h3>

              <motion.p variants={fadeIn} className="text-zinc-400 text-lg leading-relaxed mb-10">
                Selecionamos os profissionais mais brilhantes e combativos do mercado. Nossa equipe é formada por
                mestres e doutores com vasta experiência nos tribunais superiores, garantindo uma defesa irretocável em
                qualquer instância.
              </motion.p>

              <motion.div variants={fadeIn}>
                <Button
                  variant="outline"
                  className="border-amber-600 text-amber-500 hover:bg-amber-600 hover:text-white rounded-none px-8 h-12"
                  asChild
                >
                  <a href="#equipe">CONHEÇA OS SÓCIOS</a>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-zinc-900/20 border-y border-zinc-800/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <h2 className="text-amber-500 font-medium tracking-widest uppercase text-sm mb-4">Insights</h2>
              <h3 className="text-4xl font-serif font-bold text-white">Artigos e Publicações</h3>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <Link
                href="/blog"
                className="text-amber-500 hover:text-amber-400 flex items-center gap-2 text-sm uppercase tracking-wider font-medium"
              >
                Ver Todos <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogData?.data?.length ? (
              blogData.data.map((post: any) => (
                <motion.article
                  key={post.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeIn}
                  className="group border border-zinc-800 hover:border-zinc-700 bg-zinc-950 flex flex-col h-full"
                >
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-4">
                      {post.category || "Direito"}
                    </div>
                    <h4 className="text-xl font-serif text-zinc-100 mb-4 group-hover:text-amber-500 transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-zinc-500 text-sm line-clamp-3 mb-8 flex-1">{post.excerpt}</p>
                    <Link
                      href={`/blog/${post.id}`}
                      className="text-zinc-400 group-hover:text-amber-500 flex items-center gap-1 text-sm uppercase tracking-wide transition-colors mt-auto"
                    >
                      Ler Artigo <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="col-span-3 text-center text-zinc-500 py-12">Nenhum artigo publicado recentemente.</div>
            )}
          </div>
        </div>
      </section>

      <section id="contato" className="py-32 relative">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight">
              Agende uma Consulta Estratégica
            </h2>
            <p className="text-zinc-400 text-xl mb-12 max-w-2xl mx-auto">
              Nossa equipe está pronta para avaliar a complexidade do seu caso e propor as melhores medidas jurídicas
              cabíveis.
            </p>
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-none px-12 h-16 text-lg tracking-wide w-full md:w-auto"
              asChild
            >
              <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer">
                INICIAR ATENDIMENTO
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}