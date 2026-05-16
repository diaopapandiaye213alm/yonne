export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const ref = searchParams.ref;
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 p-6">
      <div className="bg-white rounded-2xl shadow-card-lg p-8 max-w-sm w-full text-center space-y-5">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900">Paiement confirmé !</h1>
          <p className="text-sm text-ink-500 mt-2">
            Votre paiement a bien été reçu.
            {ref && <> La livraison <span className="font-mono font-semibold text-ink-900">#{ref}</span> va être débloquée.</>}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs text-emerald-700">
          Le livreur va être dépêché dans les prochaines minutes. Vous recevrez une confirmation par SMS.
        </div>
        <p className="text-xs text-ink-400">Vous pouvez fermer cet onglet.</p>
      </div>
    </div>
  );
}
