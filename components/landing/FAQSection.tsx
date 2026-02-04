"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { fadeInUp, staggerContainer, viewportOnce } from "@/lib/animations";

const faqs = [
  {
    question: "How long does it take to set up my mobile app?",
    answer:
      "Most merchants can have their app ready in under an hour. The initial Shopify sync takes 1-5 minutes depending on your catalog size. Customizing your app with our drag-and-drop builder is quick and intuitive. The app store review process (Apple/Google) typically takes 1-3 days.",
  },
  {
    question: "Do I need coding skills to use Cartaisy?",
    answer:
      "No coding skills required! Cartaisy is designed for non-technical users. Our visual App Builder lets you customize your app with drag-and-drop components. You can add carousels, banners, collection grids, and more without writing a single line of code.",
  },
  {
    question: "How much does Cartaisy cost?",
    answer:
      "We offer several pricing tiers starting at $49/month for small stores. Our Growth plan at $99/month is popular for growing businesses, and we have Pro ($199/month) and Enterprise ($499/month) plans for larger operations. All plans include a 14-day free trial.",
  },
  {
    question: "Can I customize the look and feel of my app?",
    answer:
      "Absolutely! You can customize colors, fonts, logos, and the entire home screen layout. Add hero banners, product carousels, collection grids, promotional banners, and more. Your app will match your brand identity perfectly.",
  },
  {
    question: "How do push notifications work?",
    answer:
      "Push notifications let you send messages directly to your customers' phones. You can create campaigns for sales, new arrivals, abandoned carts, and more. Segment your audience based on behavior, purchase history, or custom criteria. Track open rates and conversions in your dashboard.",
  },
  {
    question: "Will my products sync automatically from Shopify?",
    answer:
      "Yes! Once you connect your Shopify store, all products, collections, variants, and images sync automatically. We use webhooks to keep everything updated in real-time. When you add or modify products in Shopify, changes appear in your app instantly.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative pt-16 pb-8 sm:pt-20 sm:pb-10 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-10"
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeInUp}
            className="text-sm font-semibold uppercase tracking-wider text-purple-400 mb-3"
          >
            FAQ
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold text-white"
          >
            Frequently Asked Questions
          </motion.h2>
        </motion.div>

        {/* FAQ accordion */}
        <motion.div
          className="space-y-4"
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex items-center justify-between w-full p-6 text-left cursor-pointer"
              >
                <h3 className="text-lg font-medium text-white pr-4">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-purple-400 shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
