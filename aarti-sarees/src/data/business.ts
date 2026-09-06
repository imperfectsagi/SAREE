// AUDIT NOTE: email and social links were previously hardcoded with invented
// values (hello@aartisarees.com, instagram/facebook handles) that were never
// provided by the business. Removed — these are set to null until the real
// values are entered in Admin → Settings. Frontend components must check for
// null/empty before rendering these fields (see Footer.tsx).
export const business = {
  name: "Aarti Sarees",
  tagline: "Timeless Ethnic Elegance",
  phone: "+91 92132 85214",
  phoneRaw: "919213285214",
  whatsapp: "919213285214",
  email: null as string | null,
  address: {
    line1: "Wz 625, Palam, Syndicate Market",
    line2: "Palam Colony, Raj Nagar I, Raj Nagar",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110077",
    full: "Wz 625, Palam, Syndicate Market, Palam Colony, Raj Nagar I, Raj Nagar, New Delhi, Delhi – 110077",
  },
  hours: "Mon – Sat: 10:00 AM – 8:00 PM | Sun: 11:00 AM – 6:00 PM",
  social: {
    instagram: null as string | null,
    facebook: null as string | null,
  },
};

export function buildWhatsAppUrl(
  message: string,
  whatsappNumber: string = business.whatsapp
): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${whatsappNumber}?text=${encoded}`;
}

export function productInquiryMessage(productName: string, price: string): string {
  return `Hello Aarti Sarees! 👋\n\nI'm interested in:\n*${productName}*\nPrice: ${price}\n\nPlease share more details and availability.`;
}

export function cartInquiryMessage(
  items: { name: string; qty: number; price: number }[],
  total: number
): string {
  const lines = items.map(
    (i) => `• ${i.name} × ${i.qty} — ₹${i.price.toLocaleString("en-IN")}`
  );
  return `Hello Aarti Sarees! 👋\n\nI would like to inquire about the following items:\n\n${lines.join(
    "\n"
  )}\n\n*Total: ₹${total.toLocaleString("en-IN")}*\n\nPlease confirm availability and next steps.`;
}
