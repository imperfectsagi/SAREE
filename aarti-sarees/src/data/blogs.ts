import { images } from "./images";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
};

export const blogs: BlogPost[] = [
  {
    id: "b1",
    slug: "how-to-drape-a-banarasi-saree",
    title: "How to Perfectly Drape a Banarasi Saree",
    excerpt:
      "Master the art of draping a heavy Banarasi silk saree with our step-by-step guide for a graceful and comfortable look.",
    content: `
      <p>Banarasi sarees are known for their rich texture and intricate zari work. Draping them correctly enhances both comfort and elegance.</p>
      <h3>Step 1: Prepare the Saree</h3>
      <p>Iron the saree gently on low heat. Ensure the blouse is well-fitted.</p>
      <h3>Step 2: Tucking</h3>
      <p>Start by tucking the plain end into your petticoat at the right side, leaving enough for the pallu.</p>
      <h3>Step 3: Pleats</h3>
      <p>Make 7-9 neat pleats of equal width and tuck them securely at the center.</p>
      <h3>Step 4: Pallu</h3>
      <p>Bring the pallu over your left shoulder and arrange the zari border prominently.</p>
      <p>Practice makes perfect — try different styles for different occasions!</p>
    `,
    image: images.blog1,
    author: "Aarti Sarees Team",
    date: "2026-01-15",
    category: "Styling Tips",
    readTime: "5 min",
  },
  {
    id: "b2",
    slug: "wedding-saree-trends-2026",
    title: "Wedding Saree Trends for 2026",
    excerpt:
      "Discover the most stunning wedding saree trends this season — from pastel organza to rich velvet and modern zari combinations.",
    content: `
      <p>2026 brings a beautiful blend of tradition and contemporary design to bridal wear.</p>
      <h3>Pastel Power</h3>
      <p>Soft blush, mint, and ivory sarees with delicate embroidery are taking center stage for day weddings.</p>
      <h3>Velvet Revival</h3>
      <p>Deep wine and emerald velvet sarees with heavy thread work are perfect for winter evening functions.</p>
      <h3>Modern Borders</h3>
      <p>Asymmetric and geometric zari borders are giving a fresh twist to classic Banarasi and Kanjeevaram weaves.</p>
    `,
    image: images.blog2,
    author: "Priya Sharma",
    date: "2026-01-08",
    category: "Trends",
    readTime: "4 min",
  },
  {
    id: "b3",
    slug: "care-guide-silk-sarees",
    title: "Complete Care Guide for Silk Sarees",
    excerpt:
      "Learn how to store, clean, and maintain your precious silk sarees so they remain beautiful for generations.",
    content: `
      <p>Silk sarees are an investment. Proper care ensures they last a lifetime.</p>
      <h3>Storage</h3>
      <p>Always store in a cool, dry place wrapped in pure cotton or muslin cloth. Avoid plastic covers.</p>
      <h3>Cleaning</h3>
      <p>Dry clean only. Never machine wash pure silk. For light stains, consult a professional immediately.</p>
      <h3>Ironing</h3>
      <p>Use low heat and iron on the reverse side. Place a cotton cloth between the iron and the saree.</p>
    `,
    image: images.blog3,
    author: "Aarti Sarees Team",
    date: "2025-12-22",
    category: "Care Tips",
    readTime: "6 min",
  },
  {
    id: "b4",
    slug: "choosing-saree-for-body-type",
    title: "Choosing the Right Saree for Your Body Type",
    excerpt:
      "Find the most flattering saree styles, fabrics and drapes that complement your unique body shape.",
    content: `
      <p>The right saree can enhance your silhouette and boost confidence.</p>
      <h3>Petite Frames</h3>
      <p>Opt for lightweight fabrics like georgette or chiffon with vertical patterns and shorter blouses.</p>
      <h3>Tall & Slim</h3>
      <p>Heavy silks, broad borders and bold prints look stunning. Experiment with high-waist drapes.</p>
      <h3>Curvy</h3>
      <p>Structured fabrics like Kanjeevaram and Anarkali-style blouses create beautiful balance.</p>
    `,
    image: images.blog4,
    author: "Meera Kapoor",
    date: "2025-12-10",
    category: "Styling Tips",
    readTime: "5 min",
  },
];

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return blogs.find((b) => b.slug === slug);
}
