'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FadeIn } from '@/components/ui/motion';
import { t } from '@/i18n';

const FAQ_SECTIONS = [
  {
    title: t('faq.sections.general'),
    icon: '💡',
    color: 'text-amber-500',
    bg: 'bg-amber-50 border-amber-100',
    items: [
      { question: t('faq.q1'), answer: t('faq.a1') },
      { question: t('faq.q2'), answer: t('faq.a2') },
      { question: t('faq.q3'), answer: t('faq.a3') },
    ],
  },
  {
    title: t('faq.sections.besoinsPropositions'),
    icon: '🎯',
    color: 'text-coral-500',
    bg: 'bg-red-50 border-red-100',
    items: [
      { question: t('faq.q4'), answer: t('faq.a4') },
      { question: t('faq.q5'), answer: t('faq.a5') },
      { question: t('faq.q6'), answer: t('faq.a6') },
    ],
  },
  {
    title: t('faq.sections.aiMatching'),
    icon: '🔮',
    color: 'text-violet-500',
    bg: 'bg-violet-50 border-violet-100',
    items: [
      { question: t('faq.q7'), answer: t('faq.a7') },
      { question: t('faq.q8'), answer: t('faq.a8') },
      { question: t('faq.q9'), answer: t('faq.a9') },
    ],
  },
  {
    title: t('faq.sections.accountSecurity'),
    icon: '🔐',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 border-emerald-100',
    items: [
      { question: t('faq.q10'), answer: t('faq.a10') },
      { question: t('faq.q11'), answer: t('faq.a11') },
      { question: t('faq.q12'), answer: t('faq.a12') },
    ],
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-left font-medium hover:text-primary transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{question}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 mt-20 py-12 space-y-10">
      <FadeIn>
        <h1 className="text-3xl font-bold font-display gradient-text-primary">{t('faq.title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('faq.subtitle')}
        </p>
      </FadeIn>

      {FAQ_SECTIONS.map((section, i) => (
        <FadeIn key={section.title} delay={i * 0.1}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-2xl ${section.color}`}>{section.icon}</span>
              <h2 className="text-lg font-semibold">{section.title}</h2>
            </div>
            <div className={`border rounded-lg px-4 ${section.bg}`}>
              {section.items.map((item, index) => (
                <FaqItem key={index} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}
