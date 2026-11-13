export default function PageHeader({
    title,
    subtitle,
  }: {
    title: string;
    subtitle?: string;
  }) {
    return (
      <section className="bg-gradient-to-br from-blue-800 to-blue-600 py-12 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 max-w-2xl text-blue-100">{subtitle}</p>}
        </div>
      </section>
    );
  }