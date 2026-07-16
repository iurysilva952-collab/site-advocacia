import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Scale, GraduationCap, Award, BookOpen } from "lucide-react";
import teamImg from "@/assets/team.png";

const credentials = [
  { icon: GraduationCap, label: "Formação", value: "Bacharel em Direito" },
  { icon: Scale, label: "OAB", value: "OAB/SP 000.000" },
  { icon: Award, label: "Experiência", value: "X anos de atuação" },
  { icon: BookOpen, label: "Especialização", value: "Área de especialização" },
];

export default function Advogado() {
  return (
    <div className="bg-zinc-950">
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img
                src={teamImg}
                alt="Advogado"
                className="w-full h-[600px] object-cover grayscale border border-zinc-800"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-amber-500 font-medium tracking-widest uppercase text-sm mb-4">
                O Advogado
              </h2>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8 leading-tight">
                Nome do Advogado
              </h1>
              <div className="space-y-6 text-zinc-400 text-lg leading-relaxed mb-10">
                <p>
                  Texto de apresentação profissional, trajetória e filosofia de atuação. Substitua por uma
                  biografia real destacando experiência, casos relevantes e valores de atuação.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10">
                {credentials.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-amber-500 mt-1 shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zinc-500">{item.label}</p>
                      <p className="text-zinc-200 text-sm">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-none px-8 h-14 text-base tracking-wide"
                asChild
              >
                <a href="/#contato">FALE COM O ADVOGADO</a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
