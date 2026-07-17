import { trustedClients } from '@/constants/landing.data';

export function TrustedBySection() {
  return (
    <section className="border-y border-border/50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Trusted by ambitious teams across industries
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {trustedClients.map((client) => (
            <div
              key={client.id}
              className="flex items-center gap-2 text-lg font-semibold text-muted-foreground/60 transition-colors hover:text-muted-foreground"
            >
              <span className="text-purple-400">{client.logo}</span>
              {client.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
