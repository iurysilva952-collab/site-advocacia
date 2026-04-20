import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Scale } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const loginMutation = useLogin();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await loginMutation.mutateAsync({
        data: { email, password }
      });
      // Will trigger AuthContext to re-fetch user and redirect
      window.location.href = "/admin/dashboard";
    } catch (err: any) {
      setError(err?.response?.data?.message || "Credenciais inválidas");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
            <Scale className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight mb-2">Silva & Associados</h1>
          <p className="text-zinc-500 uppercase tracking-widest text-xs font-medium">Acesso Restrito</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl shadow-2xl backdrop-blur-sm">
          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-950/50 border-red-900 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400 uppercase text-xs tracking-wider font-semibold">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@silva.com"
                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-700 h-12"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-400 uppercase text-xs tracking-wider font-semibold">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-700 h-12"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12 font-medium tracking-wide"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "AUTENTICANDO..." : "ENTRAR"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
            <p className="text-xs text-zinc-600 font-mono">
              Demo credentials: admin@silva.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
