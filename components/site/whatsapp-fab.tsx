import { WhatsAppIcon } from "@/components/ui/icons";
import { site } from "@/lib/data/site";

/**
 * Low-friction enquiry channel. It points at the CommercialLink business
 * number, never at a lister — a project enquiry goes through the form on the
 * listing, which is what attaches it to the right lister's dashboard.
 */
export function WhatsAppFab() {
  const number = site.whatsapp.replace(/[^\d]/g, "");
  const message = encodeURIComponent(
    "Hi CommercialLink — I'm looking for a property between Mira Road and Dahanu Road.",
  );

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-lg bg-brand-800 py-3 pl-3.5 pr-4 text-white shadow-lift transition-colors duration-200 hover:bg-brand-700 sm:bottom-7 sm:right-7"
    >
      <WhatsAppIcon className="h-5 w-5 text-white" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[0.8125rem] font-semibold opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:max-w-[10rem] group-hover:opacity-100">
        Chat on WhatsApp
      </span>
    </a>
  );
}
