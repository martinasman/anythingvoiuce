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
    question: 'How does the AI receptionist work?',
    answer:
      'Our AI receptionist uses advanced natural language processing to understand and respond to callers naturally. It learns about your business, services, and common questions to provide accurate, helpful responses. The AI can handle bookings, answer FAQs, and route calls when needed.',
  },
  {
    id: '2',
    question: 'What happens if the AI can\'t answer a question?',
    answer:
      'When the AI encounters a question it cannot confidently answer, it gracefully hands off the call to a human. You can configure fallback options like voicemail, call forwarding to your mobile, or scheduling a callback.',
  },
  {
    id: '3',
    question: 'Can I customize the voice and personality?',
    answer:
      'Yes! You can choose from multiple voice options and customize the tone and personality to match your brand. Whether you want a formal professional tone or a friendly casual approach, the AI adapts to your preferences.',
  },
  {
    id: '4',
    question: 'How long does setup take?',
    answer:
      'Most businesses are up and running within 5-10 minutes. Our onboarding wizard guides you through adding your business information, and our AI automatically learns from your website. More complex customizations can be added over time.',
  },
  {
    id: '5',
    question: 'What languages are supported?',
    answer:
      'Currently, AnythingVoice supports Swedish and English, with more languages coming soon. The AI can even handle multilingual conversations, switching languages based on caller preference.',
  },
  {
    id: '6',
    question: 'How does pricing work?',
    answer:
      'We offer simple, transparent pricing based on call minutes. Pay only for what you use with no hidden fees. Volume discounts are available for businesses with high call volumes. See our pricing section for details.',
  },
  {
    id: '7',
    question: 'Is my data secure?',
    answer:
      'Absolutely. We take security seriously with enterprise-grade encryption, GDPR compliance, and strict data handling policies. Call recordings and transcripts are stored securely and you maintain full control over your data.',
  },
  {
    id: '8',
    question: 'Can I try before I buy?',
    answer:
      'Yes! We offer a free demo where you can experience the AI receptionist firsthand. Try calling our demo line or request a personalized demo for your business. No credit card required to get started.',
  },
]

export function FAQAccordion() {
  return (
    <section id="faq" className="py-24 bg-[#F4F3F3]">
      <Container size="narrow">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-[#1D1C1B] mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-[#4A4A4A]">
            Everything you need to know about AnythingVoice.
          </p>
        </div>

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

        {/* Contact Link */}
        <div className="text-center mt-8">
          <p className="text-[#4A4A4A]">
            Still have questions?{' '}
            <a href="/contact" className="text-[#4A4A4A] hover:text-[#1D1C1B] font-medium underline">
              Get in touch
            </a>
          </p>
        </div>
      </Container>
    </section>
  )
}
