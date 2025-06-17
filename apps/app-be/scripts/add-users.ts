import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function addUsers() {
  try {
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash("Test12345**", 10);

    // Find the free membership tier
    const freeTier = await prisma.membershipTier.findFirst({
      where: { name: "FREE" }
    });

    if (!freeTier) {
      throw new Error("Free membership tier not found. Please run seed first.");
    }

    console.log("👤 Checking/Creating first user: kyithantsin@nexbe.sg");
    
    // Check if user already exists
    let user1 = await prisma.user.findUnique({
      where: { email: "kyithantsin@nexbe.sg" }
    });

    if (user1) {
      console.log("User already exists, updating password...");
      user1 = await prisma.user.update({
        where: { email: "kyithantsin@nexbe.sg" },
        data: {
          password: hashedPassword,
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
        }
      });
    } else {
      user1 = await prisma.user.create({
        data: {
          email: "kyithantsin@nexbe.sg",
          password: hashedPassword,
          firstName: "Kyi Thant",
          lastName: "Sin",
          role: "USER",
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
          referralCode: "KYITHANT001",
        },
      });
    }

    // Check if membership exists
    const existingMembership = await prisma.userMembership.findUnique({
      where: { userId: user1.id }
    });

    if (!existingMembership) {
      await prisma.userMembership.create({
        data: {
          userId: user1.id,
          tierId: freeTier.id,
          status: "ACTIVE",
        },
      });
    }

    console.log("✅ User 1 created successfully!");

    console.log("🏥 Checking/Creating partner account: partner@nexbe.sg");
    
    // Check if partner already exists
    let partner = await prisma.partner.findUnique({
      where: { email: 'partner@nexbe.sg' }
    });

    if (!partner) {
      partner = await prisma.partner.create({
        data: {
          id: 'partner-nexbe-001',
          name: 'Nexbe Health Center',
          description: 'Premium healthcare services provider',
          address: '123 Nexbe Tower, Business District',
          city: 'Singapore',
          state: 'Singapore',
          country: 'Singapore',
          postalCode: '098765',
          phone: '+65 9876 5432',
          email: 'partner@nexbe.sg',
          website: 'https://nexbe.sg',
          rating: 5.0,
          totalReviews: 0,
          isActive: true,
          operatingHours: JSON.stringify({
            monday: { open: "09:00", close: "18:00" },
            tuesday: { open: "09:00", close: "18:00" },
            wednesday: { open: "09:00", close: "18:00" },
            thursday: { open: "09:00", close: "18:00" },
            friday: { open: "09:00", close: "18:00" },
            saturday: { open: "09:00", close: "13:00" },
            sunday: { open: "closed", close: "closed" }
          }),
          specializations: ['General Practice', 'Health Screening', 'Consultation'],
        },
      });
    } else {
      console.log("Partner already exists");
    }

    // Check/create a user account for partner management
    let partnerUser = await prisma.user.findUnique({
      where: { email: "partner.admin@nexbe.sg" }
    });

    if (partnerUser) {
      console.log("Partner user already exists, updating password and partner link...");
      partnerUser = await prisma.user.update({
        where: { email: "partner.admin@nexbe.sg" },
        data: {
          password: hashedPassword,
          role: "PARTNER", // Update role to PARTNER
          partnerId: partner.id, // Link to the partner organization
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
        }
      });
    } else {
      partnerUser = await prisma.user.create({
        data: {
          email: "partner.admin@nexbe.sg",
          password: hashedPassword,
          firstName: "Partner",
          lastName: "Admin",
          role: "PARTNER", // Partner role for dashboard access
          partnerId: partner.id, // Link to the partner organization
          status: "ACTIVE",
          emailVerifiedAt: new Date(),
          referralCode: "PARTNER001",
        },
      });
    }

    // Check if membership exists for partner user
    const partnerMembership = await prisma.userMembership.findUnique({
      where: { userId: partnerUser.id }
    });

    if (!partnerMembership) {
      await prisma.userMembership.create({
        data: {
          userId: partnerUser.id,
          tierId: freeTier.id,
          status: "ACTIVE",
        },
      });
    }

    // Check if services exist for the partner
    const existingServices = await prisma.service.count({
      where: { partnerId: partner.id }
    });

    if (existingServices === 0) {
      await prisma.service.createMany({
        data: [
          {
            partnerId: partner.id,
            name: 'General Health Consultation',
            description: 'Comprehensive health consultation with experienced doctors',
            duration: 30,
            price: 75.00,
            category: 'Consultation',
            isActive: true,
          },
          {
            partnerId: partner.id,
            name: 'Basic Health Screening',
            description: 'Essential health check including blood pressure and basic tests',
            duration: 60,
            price: 120.00,
            category: 'Body Check',
            isActive: true,
          },
        ],
      });
    }

    // Check and create availability for the partner
    const daysOfWeek = [1, 2, 3, 4, 5, 6]; // Monday to Saturday
    for (const day of daysOfWeek) {
      const existingAvailability = await prisma.partnerAvailability.findUnique({
        where: {
          partnerId_dayOfWeek: {
            partnerId: partner.id,
            dayOfWeek: day,
          }
        }
      });

      if (!existingAvailability) {
        await prisma.partnerAvailability.create({
          data: {
            partnerId: partner.id,
            dayOfWeek: day,
            startTime: day === 6 ? '09:00' : '09:00', // Saturday different hours
            endTime: day === 6 ? '13:00' : '18:00',
            slotDuration: 30,
            maxBookingsPerSlot: 1,
          },
        });
      }
    }

    console.log("✅ Partner created successfully!");

    console.log("\n📋 Summary:");
    console.log("=================");
    console.log("User Account:");
    console.log("- Email: kyithantsin@nexbe.sg");
    console.log("- Password: Test12345**");
    console.log("- Role: USER");
    console.log("\nPartner Account:");
    console.log("- Partner Name: Nexbe Health Center");
    console.log("- Partner Email: partner@nexbe.sg");
    console.log("- Admin Login: partner.admin@nexbe.sg");
    console.log("- Password: Test12345**");
    console.log("- Role: PARTNER (for partner dashboard access)");
    console.log("\nBoth accounts are active and ready to use!");

  } catch (error) {
    console.error("❌ Error creating users:", error);
    throw error;
  }
}

// Run the function
addUsers()
  .then(async () => {
    await prisma.$disconnect();
    console.log("\n✅ Database connection closed.");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });