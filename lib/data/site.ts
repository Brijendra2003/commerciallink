import type { Testimonial } from "@/lib/types";

export const site = {
  name: "CommercialLink",
  tagline: "Mumbai commercial real estate, brokered properly.",
  description:
    "A Mumbai commercial real estate portal connecting owners, developers and occupiers through a single advisory desk. Every enquiry is qualified by our team — no cold contact lists, no unfiltered noise.",
  url: "https://commerciallink.in",
  email: "desk@commerciallink.in",
  phone: "+91 22 4890 1200",
  whatsapp: "+91 98200 41200",
  address: "Unit 704, Trade Centre, Bandra Kurla Complex, Mumbai 400051",
  hours: "Mon – Sat, 9:30 am – 7:00 pm IST",
  /** The single market the portal serves. */
  region: "Mumbai Metropolitan Region",
};

export const navLinks = [
  { href: "/properties", label: "Properties" },
  { href: "/list-your-property", label: "List Your Property" },
  { href: "/post-requirement", label: "Post Requirement" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const stats = [
  { value: "1,240+", label: "Properties under mandate" },
  { value: "38 mn", label: "Sq.ft. transacted" },
  { value: "26", label: "MMR micro-markets covered" },
  { value: "412", label: "Deals closed since 2019" },
];

export const trustPoints = [
  {
    title: "Every listing is verified",
    body: "Ownership documents, title chain and approvals are checked by our desk before a listing goes live. Nothing reaches the site on the owner's word alone.",
  },
  {
    title: "One advisory desk, not a phone tree",
    body: "Your enquiry is answered by a named advisor who owns it end to end — through shortlisting, site visits, negotiation and closure.",
  },
  {
    title: "Owners are shielded from noise",
    body: "We qualify budget, timeline and intent before any introduction, so owners meet buyers who are actually ready to transact.",
  },
  {
    title: "Mumbai is all we do",
    body: "One city, twenty-six micro-markets, and advisors who have walked the floors. We know what a BKC floor plate really rents for, not what a portal says it does.",
  },
];

export const processSteps = [
  {
    number: "01",
    title: "Tell us the brief",
    body: "Send an enquiry on a listing, or post a requirement if nothing on site fits. Either way it lands with a named advisor.",
  },
  {
    number: "02",
    title: "We shortlist and verify",
    body: "We match your brief against live mandates and off-market stock across the MMR, and confirm title, approvals and commercial terms before you see it.",
  },
  {
    number: "03",
    title: "Inspect on site",
    body: "We coordinate the visit schedule with owners directly, so you see three or four qualified options in a single day.",
  },
  {
    number: "04",
    title: "Negotiate and close",
    body: "We run the commercial negotiation, coordinate legal diligence and stay on the file through fit-out handover.",
  },
];

export const ownerBenefits = [
  {
    title: "Qualified buyers only",
    body: "We screen budget, timeline and decision authority before an introduction is made. You never field a speculative call.",
  },
  {
    title: "Your contact stays private",
    body: "Your phone number and email never appear on the public site. Enquiries route to our desk and reach you only once they are worth your time.",
  },
  {
    title: "Professional presentation",
    body: "We commission photography, floor plans and a brochure for every mandate — at our cost, not yours.",
  },
  {
    title: "Transparent reporting",
    body: "Your dashboard shows views, enquiry volume and where each live negotiation stands, updated as we work the file.",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "We had been shown the same four buildings by three different brokers. CommercialLink came back with two off-market floors in BKC within a week, and one of them is now our head office.",
    name: "Rohan Mehta",
    role: "COO, Arclight Technologies",
    initials: "RM",
  },
  {
    quote:
      "I own two industrial sheds in Taloja and I do not want my number on a listing site. Their desk filters everything and only calls me when there is a real buyer on the other side.",
    name: "Sunita Desai",
    role: "Owner, Desai Estates",
    initials: "SD",
  },
  {
    quote:
      "The warehouse search covered Bhiwandi, Panvel and Taloja across eleven parks. Having one advisor hold the whole process — including the fire NOC diligence — saved our expansion timeline.",
    name: "Farhan Qureshi",
    role: "Head of Supply Chain, Nordwell Retail",
    initials: "FQ",
  },
];

export const faqs = [
  {
    q: "Why can't I see the owner's phone number on a listing?",
    a: "Because our desk sits between both sides on purpose. Owners list with us specifically so they are not called by every browsing visitor, and buyers get a single advisor who knows the whole market rather than one building. Submit an enquiry and a named advisor responds — usually within four working hours.",
  },
  {
    q: "Is there a fee for buyers or tenants?",
    a: "There is no fee to search, enquire or post a requirement. On a completed transaction we are paid a brokerage fee, and the structure is disclosed in writing before you commit to anything.",
  },
  {
    q: "What if nothing on the site matches what I need?",
    a: "Post a requirement. Roughly a third of what we transact never appears as a public listing, so a written brief lets us match you against off-market mandates and owner stock that is not yet live.",
  },
  {
    q: "How long does it take to get a listing published?",
    a: "Once you submit a property we review the details and ownership documents, then arrange photography. Most listings go live within five to seven working days of a complete submission.",
  },
  {
    q: "Do you work outside Mumbai?",
    a: "No — and that is deliberate. We cover the Mumbai Metropolitan Region only, from Nariman Point through the suburbs to Navi Mumbai, Thane, Bhiwandi and Panvel. Depth in one market beats a thin presence in seven. If your requirement is in another city we will say so upfront rather than take the brief and sit on it.",
  },
];
