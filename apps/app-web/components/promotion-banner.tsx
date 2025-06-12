import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function PromotionBanner() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Supercharge Your Health with BNR Probiotics
              </h2>
              <p className="text-teal-50 mb-6">
                Clinically proven, family-friendly formula designed to improve digestion, metabolism, and support gut
                health.
              </p>
              <Button className="bg-white text-emerald-600 hover:bg-teal-50">SHOP NOW</Button>
            </div>
            <div className="relative h-64 md:h-auto">
              <Image
                src="/Image-container.png"
                alt="BNR Probiotics"
                width={600}
                height={400}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
