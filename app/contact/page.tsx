import { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';
import PageLayout from '@/components/landing/PageLayout';
import { generateMetadata as genMeta } from '@/lib/seo';

export const metadata: Metadata = genMeta({
  title: 'Contact Us',
  description: 'Get in touch with Cartaisy. We\'re here to help you launch your Shopify mobile app. Response within 24 hours.',
  keywords: ['contact', 'support', 'help', 'customer service'],
});

export default function ContactPage() {
  return (
    <PageLayout>
      <h1 className="text-4xl font-bold text-white mb-4">Contact Us</h1>
      <p className="text-gray-400 mb-12">
        Have a question or need help? We&apos;re here for you.
      </p>

      <ContactForm />
    </PageLayout>
  );
}
