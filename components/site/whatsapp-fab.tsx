import { WhatsAppIcon } from "@/components/ui/icons";
import { site } from "@/lib/data/site";

/**
 * Low-friction enquiry channel from Section 8 of the brief. It points at the
 * desk's business number, never at an owner.
 */
export function WhatsAppFab() {
  const number = site.whatsapp.replace(/[^\d]/g, "");
  const message = encodeURIComponent(
    "Hi CommercialLink — I'm looking for commercial space and would like to speak to an advisor.",
  );

  return (
    <a
      href={`https://wa.me/${number}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-brand-800 py-3 pl-3.5 pr-4 text-sand-50 shadow-lift transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-brand-700 sm:bottom-7 sm:right-7"
    >
      <WhatsAppIcon className="h-5 w-5 text-clay-300" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[0.8125rem] font-semibold opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:max-w-[10rem] group-hover:opacity-100">
        Chat with the desk
      </span>
    </a>
  );
}
