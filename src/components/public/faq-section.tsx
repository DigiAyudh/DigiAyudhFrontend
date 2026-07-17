import { ArrowUpRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SectionHeader } from '../common/section-header';
import { faqItems } from '@/constants/landing.data';

export function FAQSection() {
  return (
    <section className="border-t border-border/50 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeader
              badge="Questions"
              title="Good questions. Clear answers."
              description="Still wondering about something?"
              align="left"
            />
            <a
              href="#contact"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-purple-400 hover:text-purple-300"
            >
              Let's chat
              <ArrowUpRight className="size-4" />
            </a>
          </div>

          <Accordion type="single" collapsible defaultValue={faqItems[0]?.id} className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
