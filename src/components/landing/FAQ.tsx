import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Where is my contract data stored?",
    a: "Your contracts are stored on secure cloud infrastructure hosted on AWS in the US. All data is encrypted at rest using AES-256 and in transit using HTTPS/TLS.",
  },
  {
    q: "Is my contract used to train AI models?",
    a: "No. ContractOwl uses the Anthropic Claude API for contract analysis. Anthropic does not use API-processed data for model training. Your contract text is processed and discarded after analysis — only the extracted data points are stored.",
  },
  {
    q: "Can I delete my contracts?",
    a: "Yes. You can delete any individual contract instantly from your dashboard. If you close your account, all data is permanently removed within 24 hours.",
  },
];

const FAQ = () => {
  return (
    <section className="py-24 border-t border-border/50">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Frequently Asked Questions</h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="gradient-card rounded-xl border border-border/50 px-6">
              <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
