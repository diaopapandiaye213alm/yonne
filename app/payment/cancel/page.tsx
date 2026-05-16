import Link from "next/link";

export default function PaymentCancelPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const ref = searchParams.ref;
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 p-6">
      <div className="bg-white rounded-2xl shadow-card-lg p-8 max-w-sm w-full text-center space-y-5">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900">Paiement annulé</h1>
          <p className="text-sm text-ink-500 mt-2">
            La transaction a été annulée.
            {ref && <> La commande <span className="font-mono font-semibold text-ink-900">#{ref}</span> reste en attente.</>}
          </p>
        </div>
        <p className="text-xs text-ink-400">
          Contactez le marchand pour réessayer ou choisir une autre méthode de paiement.
        </p>
        {ref && (
          <Link
            href={`/merchant/commande/${ref}`}
            className="inline-block text-sm text-emerald-600 hover:underline font-medium"
          >
            Retour à la commande →
          </Link>
        )}
      </div>
    </div>
  );
}
