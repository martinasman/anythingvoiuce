import { Container } from '@/components/ui/container'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

const faqs = [
  {
    id: '1',
    question: 'How does it work?',
    answer:
      'Our AI uses natural language processing to understand and respond to callers. It learns your business, services, and common questions to provide accurate responses.',
  },
  {
    id: '2',
    question: 'What if the AI can\'t answer?',
    answer:
      'The AI gracefully hands off to a human. You can configure fallback options like voicemail, call forwarding, or scheduling a callback.',
  },
  {
    id: '3',
    question: 'How long does setup take?',
    answer:
      'Most businesses are up and running within 5-10 minutes. Our onboarding guides you through the process.',
  },
  {
    id: '4',
    question: 'What languages are supported?',
    answer:
      'Currently Swedish and English, with more languages coming soon. The AI can switch languages based on caller preference.',
  },
]

export function FAQAccordion() {
  return (
    <section id="faq" className="py-24 bg-[#F4F3F3]">
      <Container size="narrow">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1D1C1B] mb-12 text-center">
          FAQ
        </h2>

        {/* FAQ List */}
        <div className="bg-white rounded-sm border border-[#ECECEC]">
          <Accordion>
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} id={faq.id} className="px-6">
                <AccordionTrigger id={faq.id}>{faq.question}</AccordionTrigger>
                <AccordionContent id={faq.id}>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  )
}
