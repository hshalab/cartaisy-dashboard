import { Metadata } from "next";
import PageLayout from "@/components/landing/PageLayout";
import CalendlyEmbed from "@/components/landing/CalendlyEmbed";
import { Calendar, Clock, Video } from "lucide-react";
import { generateMetadata as genMeta } from "@/lib/seo";

export const metadata: Metadata = genMeta({
  title: "Schedule a Demo",
  description:
    "Book a personalized 30-minute demo of Cartaisy. See how easy it is to turn your Shopify store into a mobile app.",
  keywords: ["demo", "book demo", "free demo", "product demo"],
});

export default function ScheduleDemoPage() {
  return (
    <PageLayout maxWidth="6xl">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left side - Info */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Schedule a Demo
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            See Cartaisy in action. Book a personalized demo with our team and
            discover how easy it is to launch your mobile app.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg shrink-0">
                <Video className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Live Demo</h3>
                <p className="text-gray-400 text-sm">
                  See the dashboard and mobile app in real-time
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg shrink-0">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">30 Minutes</h3>
                <p className="text-gray-400 text-sm">
                  Quick overview tailored to your needs
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg shrink-0">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  Flexible Scheduling
                </h3>
                <p className="text-gray-400 text-sm">
                  Pick a time that works for you
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-gray-300 text-sm">
              <strong className="text-white">Prefer email?</strong> Reach out to
              us at{" "}
              <a
                href="mailto:demo@cartaisy.com"
                className="text-purple-400 hover:text-purple-300"
              >
                demo@cartaisy.com
              </a>
            </p>
          </div>
        </div>

        {/* Right side - Calendly */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <CalendlyEmbed url="https://calendly.com/rendernext/cartaisy-demo" />
        </div>
      </div>
    </PageLayout>
  );
}
