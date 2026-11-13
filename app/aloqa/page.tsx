import PageHeader from "@/components/PageHeader";

export default function Aloqa() {
  const items = [
    { label: "Manzil", value: "Bekobod shahri, manzil keyinroq kiritiladi" },
    { label: "Telefon", value: "+998 __ ___ __ __" },
    { label: "Email", value: "maktab@example.uz" },
    { label: "Ish vaqti", value: "Dushanba – Shanba, 08:00 – 17:00" },
  ];

  return (
    <>
      <PageHeader title="Aloqa" subtitle="Biz bilan bog'laning." />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((i) => (
            <div key={i.label} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">{i.label}</div>
              <div className="mt-1 font-medium text-blue-900">{i.value}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}