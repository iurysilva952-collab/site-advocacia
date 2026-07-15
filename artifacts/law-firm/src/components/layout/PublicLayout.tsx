import { ReactNode, useEffect } from "react";
import { Link } from "wouter";
import { MessageCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function PublicLayout({ children }: { children: ReactNode }) {
  // Force dark mode for the public site to ensure the dark serious vibe
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-700/30">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex flex-col gap-0.5 group">
            <span className="text-xl md:text-2xl font-serif font-bold tracking-tight text-white group-hover:text-amber-500 transition-colors">
              SILVA & ASSOCIADOS
            </span>
            <span className="text-[0.65rem] tracking-[0.2em] text-zinc-400 uppercase font-medium">
              Advocacia
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <a href="/#atuacao" className="text-zinc-300 hover:text-amber-500 transition-colors uppercase text-xs">Áreas de Atuação</a>
            <a href="/#equipe" className="text-zinc-300 hover:text-amber-500 transition-colors uppercase text-xs">A Equipe</a>
            <Link href="/blog" className="text-zinc-300 hover:text-amber-500 transition-colors uppercase text-xs">Artigos</Link>
            <a href="/#contato" className="text-zinc-300 hover:text-amber-500 transition-colors uppercase text-xs">Contato</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="bg-zinc-950 border-t border-white/5 py-12 md:py-16 text-zinc-400">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex flex-col gap-0.5 mb-6">
              <span className="text-xl font-serif font-bold tracking-tight text-white">
                SILVA & ASSOCIADOS
              </span>
              <span className="text-[0.65rem] tracking-[0.2em] text-zinc-500 uppercase font-medium">
                Advocacia
              </span>
            </Link>
            <p className="text-sm max-w-sm mb-6 leading-relaxed">
              Excelência, discrição e autoridade em representação jurídica. Defendendo seus interesses com a máxima precisão.
            </p>
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} Silva & Associados. Todos os direitos reservados.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-6 uppercase text-xs tracking-wider">Endereço</h4>
            <address className="not-italic text-sm leading-relaxed text-zinc-400">
              Av. Brigadeiro Faria Lima, 1000<br />
              15º Andar - Itaim Bibi<br />
              São Paulo - SP<br />
              01452-000
            </address>
          </div>
          <div>
            <h4 className="text-white font-medium mb-6 uppercase text-xs tracking-wider">Contato</h4>
            <div className="text-sm flex flex-col gap-3">
              <a href="tel:+5511999999999" className="hover:text-amber-500 transition-colors">
                +55 (11) 99999-9999
              </a>
              <a href="mailto:contato@silva.com.br" className="hover:text-amber-500 transition-colors">
                contato@silva.com.br
              </a>
              <Link href="/admin/login" className="text-xs text-zinc-700 hover:text-zinc-500 mt-4">
                Acesso Restrito
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="norenoopener noreferrer"
            className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-50 ring-4 ring-zinc-950"
            aria-label="Fale conosco no WhatsApp"
          >
            <MessageCircle className="w-7 h-7" />
          </a>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-zinc-900 border-zinc-800 text-zinc-100 font-medium">
          Precisa de ajuda jurídica? Fale conosco!
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
