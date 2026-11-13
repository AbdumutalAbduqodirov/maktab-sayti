import PageHeader from "@/components/PageHeader";
import ScheduleBlock from "@/components/ScheduleBlock";

export default async function MaktabHaqida({
  searchParams,
}: {
  searchParams: Promise<{ sinf?: string }>;
}) {
  const { sinf } = await searchParams;

  return (
    <>
      <PageHeader title="Maktab haqida" subtitle="Maktabimiz tarixi, maqsadi va dars jadvali." />
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-2xl font-bold text-blue-900">Biz haqimizda</h2>
          <p className="leading-relaxed text-slate-700">
            Bu yerga maktabning qisqacha tarixi, yo'nalishlari, direktor murojaati
            va boshqa ma'lumotlar yoziladi. Matnni keyinroq o'zingiz almashtirasiz.
          </p>
        </section>

        <ScheduleBlock sinf={sinf} />
      </div>
    </>
  );
}