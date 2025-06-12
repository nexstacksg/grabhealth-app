import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { neon } from "@neondatabase/serverless"
import { MapPin, Phone, Clock, Gift } from "lucide-react"

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!)

// Fetch partners from database
async function getPartners() {
  const partners = await sql`
    SELECT 
      p.*,
      COUNT(gc.id) as gift_claims
    FROM partners p
    LEFT JOIN gift_claims gc ON p.id = gc.partner_id
    GROUP BY p.id
    ORDER BY p.name
  `
  return partners
}

// Fetch gift items from database
async function getGiftItems() {
  const giftItems = await sql`
    SELECT 
      gi.*,
      mt.name as tier_name
    FROM gift_items gi
    JOIN membership_tiers mt ON gi.tier_id = mt.id
    ORDER BY mt.name, gi.name
  `
  return giftItems
}

export default async function PartnersPage() {
  const partners = await getPartners()
  const giftItems = await getGiftItems()

  return (
    <div className="container mx-auto px-4 py-6 md:py-16 md:px-6">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Our Partner Locations</h1>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          Visit our partner pharmacies and clinics to claim your monthly gifts and access exclusive member benefits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {partners.map((partner) => (
          <Card key={partner.id} className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">{partner.name}</CardTitle>
              <CardDescription className="flex items-center mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                {partner.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>Mon-Fri: 9am-7pm, Sat: 10am-5pm</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Gift className="h-4 w-4 mr-2" />
                <span>
                  {Number.parseInt(partner.gift_claims) > 0
                    ? `${partner.gift_claims} gifts claimed here`
                    : "No gifts claimed yet"}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600">View Location</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Available Monthly Gifts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {["Essential", "Premium"].map((tier) => (
            <Card key={tier} className="border-2 border-emerald-100">
              <CardHeader>
                <CardTitle className="text-xl">{tier} Tier Gifts</CardTitle>
                <CardDescription>Available for {tier.toLowerCase()} members</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {giftItems
                    .filter((item) => item.tier_name === tier)
                    .map((item) => (
                      <li key={item.id} className="flex items-start">
                        <Gift className="h-5 w-5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.description}</div>
                        </div>
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
