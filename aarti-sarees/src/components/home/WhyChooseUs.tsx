const features = [
  {
    title: "Authentic Craftsmanship",
    desc: "Handpicked sarees and suits from master weavers across India.",
    icon: "✦",
  },
  {
    title: "Premium Quality",
    desc: "Only the finest silks, pure zari and carefully inspected pieces.",
    icon: "◆",
  },
  {
    title: "Personal Styling",
    desc: "Expert guidance to help you find the perfect outfit for any occasion.",
    icon: "✧",
  },
  {
    title: "Easy Inquiry",
    desc: "WhatsApp us anytime for availability, sizing and custom requests.",
    icon: "❖",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-12 md:py-16 bg-[var(--surface)] border-y border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-serif font-semibold">
            Why Choose Aarti Sarees
          </h2>
          <p className="mt-2 text-[var(--muted)] text-sm md:text-base max-w-lg mx-auto">
            Decades of trust, passion for ethnic wear, and a commitment to
            quality you can feel.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="text-center p-6 rounded-[var(--radius)] bg-[var(--background)] border border-[var(--border)]"
            >
              <div className="text-2xl text-[var(--accent)] mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
