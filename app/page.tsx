import { Wordmark } from "@/components/brand/Wordmark";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center gap-8 flex-wrap">
      <Wordmark size="sm" />
      <Wordmark size="md" />
      <Wordmark size="lg" />
      <Wordmark size="xl" />
    </main>
  );
}
