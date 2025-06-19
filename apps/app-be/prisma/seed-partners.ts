import bcrypt from 'bcrypt';
import prisma from '../src/database/client';

async function seedPartners() {
  console.log('Seeding partners and related data...');

  try {
    // Clear existing partner-related data
    console.log('🧹 Clearing existing partner data...');
    await prisma.freeCheckupClaim.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.partnerDaysOff.deleteMany();
    await prisma.partnerAvailability.deleteMany();
    await prisma.service.deleteMany();

    // Delete partner admin users
    await prisma.user.deleteMany({
      where: { role: 'PARTNER' },
    });

    // Delete partners
    await prisma.partner.deleteMany();
    console.log('✅ Partner data cleared successfully');

    // Create partners
    const partners = await Promise.all([
      prisma.partner.create({
        data: {
          name: 'HealthFirst Medical Center',
          description:
            'Premium healthcare facility offering comprehensive health screening services',
          address: '123 Orchard Road',
          city: 'Singapore',
          state: 'Singapore',
          country: 'Singapore',
          postalCode: '238869',
          phone: '+65 6123 4567',
          email: 'info@healthfirst.sg',
          website: 'https://healthfirst.sg',
          imageUrl:
            'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
          rating: 4.8,
          totalReviews: 156,
          isActive: true,
          specializations: [
            'General Practice',
            'Health Screening',
            'Vaccination',
            'Specialist Consultation',
          ],
          operatingHours: JSON.stringify({
            monday: { open: '08:00', close: '20:00' },
            tuesday: { open: '08:00', close: '20:00' },
            wednesday: { open: '08:00', close: '20:00' },
            thursday: { open: '08:00', close: '20:00' },
            friday: { open: '08:00', close: '20:00' },
            saturday: { open: '08:00', close: '17:00' },
            sunday: { open: '09:00', close: '13:00' },
          }),
        },
      }),
      prisma.partner.create({
        data: {
          name: 'WellCare Clinic & Surgery',
          description:
            'Family-friendly clinic specializing in preventive care and wellness programs',
          address: '456 Bukit Timah Road',
          city: 'Singapore',
          state: 'Singapore',
          country: 'Singapore',
          postalCode: '269734',
          phone: '+65 6789 0123',
          email: 'contact@wellcare.sg',
          website: 'https://wellcare.sg',
          imageUrl:
            'https://images.unsplash.com/photo-1631563019676-0b10b9b14504?w=800',
          rating: 4.6,
          totalReviews: 98,
          isActive: true,
          specializations: [
            'Family Medicine',
            'Pediatrics',
            "Women's Health",
            'Chronic Disease Management',
          ],
          operatingHours: JSON.stringify({
            monday: { open: '09:00', close: '18:00' },
            tuesday: { open: '09:00', close: '18:00' },
            wednesday: { open: '09:00', close: '18:00' },
            thursday: { open: '09:00', close: '18:00' },
            friday: { open: '09:00', close: '18:00' },
            saturday: { open: '09:00', close: '13:00' },
            sunday: { open: 'closed', close: 'closed' },
          }),
        },
      }),
      prisma.partner.create({
        data: {
          name: 'MediCheck Diagnostics',
          description:
            'State-of-the-art diagnostic center with advanced imaging and laboratory services',
          address: '789 Marina Boulevard',
          city: 'Singapore',
          state: 'Singapore',
          country: 'Singapore',
          postalCode: '018956',
          phone: '+65 6345 6789',
          email: 'hello@medicheck.sg',
          website: 'https://medicheck.sg',
          imageUrl:
            'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800',
          rating: 4.9,
          totalReviews: 234,
          isActive: true,
          specializations: [
            'Laboratory Services',
            'Medical Imaging',
            'Cardiac Screening',
            'Cancer Screening',
          ],
          operatingHours: JSON.stringify({
            monday: { open: '07:00', close: '21:00' },
            tuesday: { open: '07:00', close: '21:00' },
            wednesday: { open: '07:00', close: '21:00' },
            thursday: { open: '07:00', close: '21:00' },
            friday: { open: '07:00', close: '21:00' },
            saturday: { open: '07:00', close: '17:00' },
            sunday: { open: '08:00', close: '14:00' },
          }),
        },
      }),
    ]);

    console.log(`Created ${partners.length} partners`);

    // Create partner admin users
    const hashedPassword = await bcrypt.hash('Partner@123', 10);

    const partnerUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'admin@healthfirst.sg',
          password: hashedPassword,
          firstName: 'HealthFirst',
          lastName: 'Admin',
          role: 'PARTNER',
          status: 'ACTIVE',
          partnerId: partners[0].id,
          emailVerifiedAt: new Date(),
        },
      }),
      prisma.user.create({
        data: {
          email: 'admin@wellcare.sg',
          password: hashedPassword,
          firstName: 'WellCare',
          lastName: 'Admin',
          role: 'PARTNER',
          status: 'ACTIVE',
          partnerId: partners[1].id,
          emailVerifiedAt: new Date(),
        },
      }),
      prisma.user.create({
        data: {
          email: 'admin@medicheck.sg',
          password: hashedPassword,
          firstName: 'MediCheck',
          lastName: 'Admin',
          role: 'PARTNER',
          status: 'ACTIVE',
          partnerId: partners[2].id,
          emailVerifiedAt: new Date(),
        },
      }),
    ]);

    console.log(`Created ${partnerUsers.length} partner admin users`);

    // Create services for each partner
    const services = await Promise.all([
      // HealthFirst services
      prisma.service.create({
        data: {
          partnerId: partners[0].id,
          name: 'Basic Health Screening',
          description:
            'Comprehensive basic health check including blood tests, BMI, and vital signs',
          duration: 60,
          price: 120,
          category: 'Health Screening',
          isActive: true,
          maxBookingsPerDay: 20,
        },
      }),
      prisma.service.create({
        data: {
          partnerId: partners[0].id,
          name: 'Premium Health Screening',
          description:
            'Advanced health screening with additional tests including cardiac and cancer markers',
          duration: 120,
          price: 380,
          category: 'Health Screening',
          isActive: true,
          maxBookingsPerDay: 10,
        },
      }),
      prisma.service.create({
        data: {
          partnerId: partners[0].id,
          name: 'COVID-19 Vaccination',
          description:
            'COVID-19 vaccination service with pre-vaccination consultation',
          duration: 30,
          price: 45,
          category: 'Vaccination',
          isActive: true,
          maxBookingsPerDay: 50,
        },
      }),

      // WellCare services
      prisma.service.create({
        data: {
          partnerId: partners[1].id,
          name: 'General Consultation',
          description: 'Consultation with experienced family physicians',
          duration: 30,
          price: 65,
          category: 'Consultation',
          isActive: true,
          maxBookingsPerDay: 30,
        },
      }),
      prisma.service.create({
        data: {
          partnerId: partners[1].id,
          name: 'Pediatric Check-up',
          description:
            'Comprehensive health check for children including growth assessment',
          duration: 45,
          price: 85,
          category: 'Pediatrics',
          isActive: true,
          maxBookingsPerDay: 15,
        },
      }),
      prisma.service.create({
        data: {
          partnerId: partners[1].id,
          name: "Women's Health Package",
          description:
            'Specialized health screening for women including pap smear and breast examination',
          duration: 90,
          price: 250,
          category: "Women's Health",
          isActive: true,
          maxBookingsPerDay: 8,
        },
      }),

      // MediCheck services
      prisma.service.create({
        data: {
          partnerId: partners[2].id,
          name: 'Full Body MRI Scan',
          description: 'Comprehensive MRI scan with radiologist report',
          duration: 90,
          price: 1200,
          category: 'Medical Imaging',
          isActive: true,
          requiresApproval: true,
          maxBookingsPerDay: 6,
        },
      }),
      prisma.service.create({
        data: {
          partnerId: partners[2].id,
          name: 'Cardiac Health Check',
          description:
            'Complete cardiac assessment including ECG, stress test, and echo',
          duration: 180,
          price: 680,
          category: 'Cardiac Screening',
          isActive: true,
          maxBookingsPerDay: 8,
        },
      }),
      prisma.service.create({
        data: {
          partnerId: partners[2].id,
          name: 'Executive Health Screening',
          description:
            'Premium health package for executives with comprehensive tests and consultation',
          duration: 240,
          price: 1580,
          category: 'Health Screening',
          isActive: true,
          requiresApproval: true,
          maxBookingsPerDay: 4,
        },
      }),
    ]);

    console.log(`Created ${services.length} services`);

    // Create availability for partners
    const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Sunday to Saturday

    for (const partner of partners) {
      const availability: any[] = [];

      for (const day of daysOfWeek) {
        if (partner.name === 'WellCare Clinic & Surgery' && day === 0) {
          // WellCare is closed on Sundays
          continue;
        }

        let startTime = '09:00';
        let endTime = '18:00';

        if (partner.name === 'HealthFirst Medical Center') {
          startTime = '08:00';
          endTime = day === 6 ? '17:00' : day === 0 ? '13:00' : '20:00';
        } else if (partner.name === 'MediCheck Diagnostics') {
          startTime = '07:00';
          endTime = day === 6 ? '17:00' : day === 0 ? '14:00' : '21:00';
        } else if (day === 6) {
          endTime = '13:00';
        }

        availability.push({
          partnerId: partner.id,
          dayOfWeek: day,
          startTime,
          endTime,
          slotDuration: 30,
          maxBookingsPerSlot: 1,
        });
      }

      await prisma.partnerAvailability.createMany({
        data: availability,
      });
    }

    console.log('Created partner availability schedules');

    // Create some sample bookings for today and future dates
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      take: 5,
    });

    if (users.length > 0) {
      const today = new Date();
      const bookingsData: any[] = [];

      // Create bookings for the next 7 days
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const bookingDate = new Date(today);
        bookingDate.setDate(bookingDate.getDate() + dayOffset);
        bookingDate.setHours(0, 0, 0, 0);

        // Create 2-3 bookings per day for each partner
        for (const partner of partners) {
          const partnerServices = services.filter(
            (s) => s.partnerId === partner.id
          );
          const numBookings = Math.floor(Math.random() * 2) + 2; // 2-3 bookings

          for (let i = 0; i < numBookings && i < users.length; i++) {
            const service =
              partnerServices[
                Math.floor(Math.random() * partnerServices.length)
              ];
            const hour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
            const minute = Math.random() < 0.5 ? '00' : '30';
            const startTime = `${hour.toString().padStart(2, '0')}:${minute}`;

            const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED'];
            const status =
              dayOffset === 0
                ? Math.random() < 0.7
                  ? 'CONFIRMED'
                  : 'PENDING'
                : statuses[Math.floor(Math.random() * statuses.length)];

            bookingsData.push({
              userId: users[i].id,
              partnerId: partner.id,
              serviceId: service.id,
              bookingDate,
              startTime,
              endTime: `${(hour + Math.floor(service.duration / 60)).toString().padStart(2, '0')}:${minute}`,
              status,
              totalAmount: service.price,
              paymentStatus: status === 'COMPLETED' ? 'PAID' : 'PENDING',
              notes: status === 'PENDING' ? 'Awaiting confirmation' : null,
            });
          }
        }
      }

      const createdBookings = await prisma.booking.createMany({
        data: bookingsData,
      });

      console.log(`Created ${createdBookings.count} sample bookings`);
    }

    // Add some days off for partners
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await prisma.partnerDaysOff.create({
      data: {
        partnerId: partners[0].id,
        date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15),
        reason: 'Staff Training Day',
      },
    });

    console.log('Partner seeding completed successfully!');

    // Log partner admin credentials
    console.log('\n=== Partner Admin Credentials ===');
    console.log('HealthFirst Admin: admin@healthfirst.sg / Partner@123');
    console.log('WellCare Admin: admin@wellcare.sg / Partner@123');
    console.log('MediCheck Admin: admin@medicheck.sg / Partner@123');
  } catch (error) {
    console.error('Error seeding partners:', error);
    throw error;
  }
}

// Run the seed function
seedPartners()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
