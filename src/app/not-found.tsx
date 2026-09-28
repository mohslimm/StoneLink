import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(197,160,89,0.12)] border border-[rgba(197,160,89,0.25)] text-[#c5a059] text-[11px] font-mono uppercase tracking-[0.1em] mb-4">
        Erreur 404 • Page Introuvable
      </div>
      <h1 className="font-display text-4xl sm:text-5xl text-[#f0ede8] mb-3 font-normal">
        Ressource Non Localisée
      </h1>
      <p className="font-body text-[rgba(240,237,232,0.55)] max-w-md text-sm sm:text-base mb-8">
        La page ou le prospect demandé n&apos;existe pas ou a été déplacé dans le pipeline StoneLink.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#B8924A] via-[#c5a059] to-[#D4B57A] text-[#1A1200] font-body font-semibold text-sm shadow-[0_0_20px_rgba(197,160,89,0.25)] hover:shadow-[0_0_25px_rgba(197,160,89,0.4)] transition-all cursor-pointer"
      >
        Retour au Tableau de Bord
      </Link>
    </div>
  );
}
