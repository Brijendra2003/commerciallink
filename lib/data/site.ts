import type { Testimonial } from "@/lib/types";

export const site = {
  name: "CommercialLink",
  tagline: "Property on the Western line, listed properly.",
  description:
    "A residential and commercial property portal for the Mira Road to Dahanu Road corridor. Owners, brokers and developers list their projects, our team verifies each one, and buyer enquiries reach the lister directly.",
  url: "https://commerciallink.in",
  email: "desk@commerciallink.in",
  phone: "+91 22 4890 1200",
  whatsapp: "+91 98200 41200",
  address: "Unit 12, Shanti Shopping Centre, Mira Road East 401107",
  hours: "Mon – Sat, 9:30 am – 7:00 pm IST",
  /** The single market the portal serves. */
  region: "Mira Road to Dahanu Road",
};

export const navLinks = [
  { href: "/properties", label: "Projects" },
  { href: "/list-your-property", label: "List Your Project" },
  { href: "/post-requirement", label: "Post Requirement" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Rendered at display size with tabular figures, so each value stays short and
// numeric — a word here would set loose and overflow the tile on mobile.
export const stats = [
  { value: "40", label: "Station areas, Mira Road to Dahanu Road" },
  { value: "13", label: "Asset classes, residential and commercial" },
  { value: "2 min", label: "To list a project" },
  { value: "100%", label: "Verified before they publish" },
];

export const trustPoints = [
  {
    title: "Every project is verified",
    body: "Our team checks the details and the ownership documents before a project appears on the site. A new project under construction cannot list without its MahaRERA number.",
  },
  {
    title: "You reach the actual lister",
    body: "Send an enquiry and it goes to the owner, broker or developer who listed the project — not into a call-centre queue. You talk to whoever can answer.",
  },
  {
    title: "Listers work their own leads",
    body: "Every enquiry on a project lands in that lister's dashboard with your name and number, so nothing sits waiting on a middleman to pass it along.",
  },
  {
    title: "One corridor is all we do",
    body: "Mira Road to Dahanu Road, forty station areas, residential and commercial. Depth on one line beats a thin presence across the state.",
  },
];

export const processSteps = [
  {
    number: "01",
    title: "Browse the corridor",
    body: "Every live project is on this site — residential and commercial, from Mira Road to Dahanu Road. Filter by category, station area, budget and configuration.",
  },
  {
    number: "02",
    title: "Enquire on what fits",
    body: "One short form. Your enquiry reaches the owner, broker or developer who listed the project, with a copy to our team.",
  },
  {
    number: "03",
    title: "They call you back",
    body: "You get the price, the papers and a site-visit slot from the person who actually holds the property. Usually the same working day.",
  },
  {
    number: "04",
    title: "Nothing fits? Post a brief",
    body: "Tell us what you need and we will match it against projects that have not gone live yet, and against stock listers have not published.",
  },
];

export const ownerBenefits = [
  {
    title: "Leads come straight to you",
    body: "Every buyer who enquires on your project appears in your dashboard with their name, phone number and message. You call them, not us.",
  },
  {
    title: "One short form, not six tabs",
    body: "Category, type, location, size, price, a few photographs. Our team fills in the rest before the project goes live.",
  },
  {
    title: "The verified badge",
    body: "Our team checks each project before it publishes, so buyers can see the listing has been through a real check rather than taking your word for it.",
  },
  {
    title: "Your own dashboard",
    body: "Add, edit and withdraw projects yourself, see views on each one, and move each enquiry along your own pipeline.",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "We were looking for a 2 BHK between Nalasopara and Virar and every portal gave us the same six brokers calling at once. Here we enquired on four flats and the actual owners rang back. We bought the second one.",
    name: "Rohan Mehta",
    role: "Bought in Virar West",
    initials: "RM",
  },
  {
    quote:
      "I list five or six flats around Mira Road at any time. The form takes two minutes and every enquiry shows up in my dashboard with the buyer's number. I am not waiting on anyone to forward it.",
    name: "Sunita Desai",
    role: "Channel partner, Mira Road",
    initials: "SD",
  },
  {
    quote:
      "Our Palghar launch needed to reach buyers on the line, not across the state. The RERA number sits on the listing, the leads come to our sales team directly, and we closed eleven units in the first phase.",
    name: "Farhan Qureshi",
    role: "Sales head, Shree Siddhi Developers",
    initials: "FQ",
  },
];

export const faqs = [
  {
    q: "Who sees my enquiry when I send one?",
    a: "The owner, broker or developer who listed that project, and our team. They get your name, phone number and message so they can call you back — usually the same working day. We do not sell your details or pass them to anyone else.",
  },
  {
    q: "Is there a fee for buyers or tenants?",
    a: "There is no fee to search, enquire or post a requirement. If a brokerage fee applies on a completed transaction, the lister discloses it in writing before you commit to anything.",
  },
  {
    q: "Can anyone list a property here?",
    a: "You need an account — as an owner, a broker or a developer — and every project you add is checked by our team before it appears on the site. A new project under construction cannot be listed at all without its MahaRERA registration number.",
  },
  {
    q: "How long does it take to get a project published?",
    a: "The form itself takes about two minutes. Verification is usually done within one to two working days; if something is missing we send it back with a note telling you exactly what to add.",
  },
  {
    q: "Which areas do you cover?",
    a: "The Western line from Mira Road to Dahanu Road, and nothing else. That is Mira Road and Bhayandar, then Naigaon, Vasai, Nalasopara and Virar, then Saphale, Kelve Road, Palghar, Boisar, Tarapur, Vangaon and Dahanu Road. Depth on one corridor beats a thin presence everywhere. If your requirement is outside it we will say so upfront rather than take the brief and sit on it.",
  },
  {
    q: "Do you list residential as well as commercial?",
    a: "Both. Flats, studios, penthouses, villas, row houses, bungalows and residential plots on the residential side; shops, offices, godowns, industrial units, co-working and commercial land on the other. The filter at the top of the projects page switches between them.",
  },
];
