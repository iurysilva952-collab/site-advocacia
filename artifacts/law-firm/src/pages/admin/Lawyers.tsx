import { useGetLawyers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield } from "lucide-react";

export default function Lawyers() {
  const { data: lawyers, isLoading } = useGetLawyers();

  if (isLoading) {
    return <div className="text-center py-20 text-zinc-500">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white mb-2">Corpo Jurídico</h1>
        <p className="text-zinc-400">Gestão de advogados associados e sócios</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {lawyers?.map((lawyer) => (
          <Card key={lawyer.id} className="bg-[#121214] border-zinc-800 overflow-hidden">
            <CardHeader className="pb-4 relative">
              {lawyer.isAdmin && (
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                    <Shield className="w-3 h-3 mr-1" /> Sócio
                  </Badge>
                </div>
              )}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-zinc-800">
                  <AvatarImage src={lawyer.avatarUrl} />
                  <AvatarFallback className="bg-zinc-900 text-zinc-400 text-lg font-serif">
                    {lawyer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg font-serif text-white">{lawyer.name}</CardTitle>
                  <p className="text-sm text-zinc-500 mt-1">{lawyer.specialty || 'Advogado'}</p>
                  <p className="text-xs font-mono text-zinc-600 mt-0.5">OAB: {lawyer.oab}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="bg-zinc-950/50 pt-4 border-t border-zinc-800/50">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Mail className="w-4 h-4 text-zinc-500" />
                  {lawyer.email}
                </div>
                <div className="flex justify-between items-center py-2 border-t border-zinc-800/50 mt-2">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Casos Ativos</span>
                  <span className="text-sm font-bold text-white bg-zinc-800 px-3 py-1 rounded-full">
                    {lawyer.activeCaseCount || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
