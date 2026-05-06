// lib/auth-mock.ts
export interface DemoAccount {
  email: string;
  password: string;
  role: "admin" | "merchant" | "driver";
  redirect: string;
  displayName: string;
}

export const demoAccounts: DemoAccount[] = [
  { email: "admin@yonne.sn",          password: "Admin123!", role: "admin",    redirect: "/admin",                    displayName: "Admin YONNE" },
  { email: "boutique.plateau@gmail.com", password: "Demo123!", role: "merchant", redirect: "/merchant/nouvelle-commande", displayName: "Boutique Plateau" },
  { email: "livreur.dakar@yonne.sn",    password: "Demo123!", role: "driver",   redirect: "/driver/carte",                displayName: "Ibrahima Sow" },
];

export function authenticate(email: string, password: string): DemoAccount | null {
  return demoAccounts.find(a => a.email === email && a.password === password) ?? null;
}
