"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { authenticate } from "@/lib/auth-mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const account = authenticate(email.trim(), password);
    if (!account) {
      setError("Email ou mot de passe invalide.");
      return;
    }
    router.push(account.redirect);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-gold-400/10 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Wordmark size="xl" />
          <p className="mt-3 text-ink-500 text-sm">Livraison intelligente · Sénégal</p>
        </div>
        <form onSubmit={submit} className="bg-white rounded-lg shadow-card p-7 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@yonne.sn" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 shadow-glow-emerald">Se connecter</Button>
          <button type="button" className="block w-full text-center text-xs text-ink-500 hover:text-ink-700">Mot de passe oublié ?</button>
        </form>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Authentification 2FA SMS activée pour votre sécurité
        </div>
        <details className="mt-8 text-xs text-ink-500 bg-white/50 rounded-md p-3">
          <summary className="cursor-pointer font-medium">Comptes de démo</summary>
          <ul className="mt-2 space-y-1 font-mono">
            <li>admin@yonne.sn / Admin123!</li>
            <li>boutique.plateau@gmail.com / Demo123!</li>
            <li>livreur.dakar@yonne.sn / Demo123!</li>
          </ul>
        </details>
      </div>
    </main>
  );
}
