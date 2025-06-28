/**
 * Seed data for partners, services, availability, and days off
 */

export const partners = [
  {
    name: "Wellness TCM Clinic",
    description: "Traditional Chinese Medicine clinic specializing in acupuncture, herbal medicine, and holistic treatments",
    address: "123 Orchard Road, #03-45",
    city: "Singapore",
    state: "Singapore",
    country: "Singapore",
    postalCode: "238890",
    phone: "+65 6234 5678",
    email: "info@wellnesstcm.sg",
    website: "https://wellnesstcm.sg",
    rating: 4.5,
    totalReviews: 127,
    isActive: true,
    operatingHours: {
      general: "Mon-Fri: 9:00 AM - 8:00 PM, Sat: 9:00 AM - 1:00 PM, Sun: Closed"
    },
    specializations: ["TCM", "Acupuncture", "Herbal Medicine", "Cupping"]
  },
  {
    name: "HealthFirst Medical Clinic",
    description: "Modern medical clinic offering general practice, health screening, and vaccination services",
    address: "456 Clementi Ave 3, #01-123",
    city: "Singapore",
    state: "Singapore",
    country: "Singapore",
    postalCode: "120456",
    phone: "+65 6789 1234",
    email: "contact@healthfirst.sg",
    website: "https://healthfirst.sg",
    rating: 4.7,
    totalReviews: 245,
    isActive: true,
    operatingHours: {
      general: "Mon-Sun: 8:00 AM - 10:00 PM"
    },
    specializations: ["General Practice", "Health Screening", "Vaccination", "Minor Surgery"]
  },
  {
    name: "SmileCare Dental Clinic",
    description: "Comprehensive dental care from routine check-ups to cosmetic dentistry",
    address: "789 Tampines Central 5, #02-34",
    city: "Singapore",
    state: "Singapore",
    country: "Singapore",
    postalCode: "520789",
    phone: "+65 6785 4321",
    email: "hello@smilecare.sg",
    website: "https://smilecare.sg",
    rating: 4.8,
    totalReviews: 189,
    isActive: true,
    operatingHours: {
      general: "Mon-Fri: 9:00 AM - 6:00 PM, Sat: 9:00 AM - 2:00 PM, Sun: Closed"
    },
    specializations: ["General Dentistry", "Orthodontics", "Cosmetic Dentistry", "Oral Surgery"]
  },
  {
    name: "ActiveLife Physiotherapy",
    description: "Sports and rehabilitation physiotherapy center",
    address: "321 Bukit Timah Road, #04-10",
    city: "Singapore",
    state: "Singapore",
    country: "Singapore",
    postalCode: "259708",
    phone: "+65 6468 9101",
    email: "info@activelifephysio.sg",
    website: "https://activelifephysio.sg",
    rating: 4.6,
    totalReviews: 156,
    isActive: true,
    operatingHours: {
      general: "Mon-Fri: 8:00 AM - 8:00 PM, Sat: 8:00 AM - 4:00 PM, Sun: Closed"
    },
    specializations: ["Sports Physiotherapy", "Post-Surgery Rehab", "Chronic Pain Management"]
  }
];

export const services = [
  // Wellness TCM Clinic Services
  {
    partnerIndex: 0,
    services: [
      {
        name: "Acupuncture Treatment",
        description: "Traditional acupuncture for pain relief and wellness",
        duration: 45,
        price: 80,
        category: "TCM",
        isActive: true,
        requiresApproval: false,
        maxBookingsPerDay: 8
      },
      {
        name: "Cupping Therapy",
        description: "Traditional cupping for muscle tension and circulation",
        duration: 30,
        price: 60,
        category: "TCM",
        isActive: true,
        requiresApproval: false,
        maxBookingsPerDay: 10
      },
      {
        name: "Herbal Consultation",
        description: "Personalized herbal medicine consultation and prescription",
        duration: 30,
        price: 50,
        category: "TCM",
        isActive: true,
        requiresApproval: false,
        maxBookingsPerDay: 12
      },
      {
        name: "Full Body Tuina Massage",
        description: "Traditional Chinese therapeutic massage",
        duration: 60,
        price: 100,
        category: "TCM",
        isActive: true,
        requiresApproval: false,
        maxBookingsPerDay: 6
      }
    ]
  },
  // HealthFirst Medical Clinic Services
  {
    partnerIndex: 1,
    services: [
      {
        name: "General Consultation",
        description: "General medical consultation with experienced GP",
        duration: 20,
        price: 40,
        category: "General Practice",
        isActive: true,
        requiresApproval: false,
        maxBookingsPerDay: 30
      },
      {
        name: "Health Screening Basic",
        description: "Basic health screening package including blood test",
        duration: 45,
        price: 120,
        category: "Health Screening",
        isActive: true,
        requiresApproval: true,
        maxBookingsPerDay: 8
      },
      {
        name: "Health Screening Premium",
        description: "Comprehensive health screening with full blood panel",
        duration: 60,
        price: 280,
        category: "Health Screening",
        isActive: true,
        requiresApproval: true,
        maxBookingsPerDay: 5
      },
      {
        name: "COVID-19 Vaccination",
        description: "COVID-19 vaccination service",
        duration: 15,
        price: 35,
        category: "Vaccination",
        isActive: true,
        requiresApproval: false,
        maxBookingsPerDay: 20
      },
      {
        name: "Minor Wound Treatment",
        description: "Treatment for minor cuts, wounds, and injuries",
        duration: 30,
        price: 80,
        category: "Minor Surgery",
        isActive: true,
        requiresApproval: false,
        maxBookingsPerDay: 10
      }
    ]
  },
  // SmileCare Dental Clinic Services
  {
    partnerIndex: 2,
    services: [
      {
        name: "Dental Consultation",
        description: "Initial dental examination and consultation",
        duration: 30,
        price: 50,
        category: "General Dentistry",
        isActive: true,
        requiresApproval: false,
        maxBookingsPerDay: 15
      },
      {
        name: "Teeth Cleaning & Scaling",
        description: "Professional teeth cleaning and scaling",
        duration: 45,
        price: 120,
        category: "General Dentistry",
        isActive: true,
        requiresApproval: false,
        maxBookingsPerDay: 10
      },
      {
        name: "Tooth Extraction",
        description: "Simple tooth extraction procedure",
        duration: 45,
        price: 150,
        category: "Oral Surgery",
        isActive: true,
        requiresApproval: true,
        maxBookingsPerDay: 5
      },
      {
        name: "Teeth Whitening",
        description: "Professional teeth whitening treatment",
        duration: 60,
        price: 350,
        category: "Cosmetic Dentistry",
        isActive: true,
        requiresApproval: false,
        maxBookingsPerDay: 4
      }
    ]
  },
  // ActiveLife Physiotherapy Services
  {
    partnerIndex: 3,
    services: [
      {
        name: "Initial Assessment",
        description: "Comprehensive physiotherapy assessment",
        duration: 60,
        price: 150,
        category: "Physiotherapy",
        isActive: true,
        requiresApproval: false,
        maxBookingsPerDay: 8
      },
      {
        name: "Follow-up Treatment",
        description: "Physiotherapy follow-up session",
        duration: 45,
        price: 120,
        category: "Physiotherapy",
        isActive: true,
        requiresApproval: false,
        maxBookingsPerDay: 12
      },
      {
        name: "Sports Injury Treatment",
        description: "Specialized treatment for sports injuries",
        duration: 60,
        price: 160,
        category: "Sports Physiotherapy",
        isActive: true,
        requiresApproval: false,
        maxBookingsPerDay: 6
      },
      {
        name: "Dry Needling",
        description: "Dry needling therapy for trigger points",
        duration: 30,
        price: 80,
        category: "Physiotherapy",
        isActive: true,
        requiresApproval: false,
        maxBookingsPerDay: 10
      }
    ]
  }
];

export const availabilities = [
  // Wellness TCM Clinic - Different hours on different days
  {
    partnerIndex: 0,
    schedule: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "20:00", slotDuration: 30, maxBookingsPerSlot: 1 }, // Monday
      { dayOfWeek: 2, startTime: "09:00", endTime: "20:00", slotDuration: 30, maxBookingsPerSlot: 1 }, // Tuesday
      { dayOfWeek: 3, startTime: "09:00", endTime: "20:00", slotDuration: 30, maxBookingsPerSlot: 1 }, // Wednesday
      { dayOfWeek: 4, startTime: "09:00", endTime: "20:00", slotDuration: 30, maxBookingsPerSlot: 1 }, // Thursday
      { dayOfWeek: 5, startTime: "09:00", endTime: "20:00", slotDuration: 30, maxBookingsPerSlot: 1 }, // Friday
      { dayOfWeek: 6, startTime: "09:00", endTime: "13:00", slotDuration: 30, maxBookingsPerSlot: 1 }  // Saturday
    ]
  },
  // HealthFirst Medical Clinic - Open every day, different weekend hours
  {
    partnerIndex: 1,
    schedule: [
      { dayOfWeek: 0, startTime: "09:00", endTime: "22:00", slotDuration: 20, maxBookingsPerSlot: 2 }, // Sunday
      { dayOfWeek: 1, startTime: "08:00", endTime: "22:00", slotDuration: 20, maxBookingsPerSlot: 2 }, // Monday
      { dayOfWeek: 2, startTime: "08:00", endTime: "22:00", slotDuration: 20, maxBookingsPerSlot: 2 }, // Tuesday
      { dayOfWeek: 3, startTime: "08:00", endTime: "22:00", slotDuration: 20, maxBookingsPerSlot: 2 }, // Wednesday
      { dayOfWeek: 4, startTime: "08:00", endTime: "22:00", slotDuration: 20, maxBookingsPerSlot: 2 }, // Thursday
      { dayOfWeek: 5, startTime: "08:00", endTime: "22:00", slotDuration: 20, maxBookingsPerSlot: 2 }, // Friday
      { dayOfWeek: 6, startTime: "09:00", endTime: "22:00", slotDuration: 20, maxBookingsPerSlot: 2 }  // Saturday
    ]
  },
  // SmileCare Dental - With lunch break
  {
    partnerIndex: 2,
    schedule: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "12:30", slotDuration: 30, maxBookingsPerSlot: 1 }, // Monday AM
      { dayOfWeek: 1, startTime: "13:30", endTime: "18:00", slotDuration: 30, maxBookingsPerSlot: 1 }, // Monday PM
      { dayOfWeek: 2, startTime: "09:00", endTime: "12:30", slotDuration: 30, maxBookingsPerSlot: 1 }, // Tuesday AM
      { dayOfWeek: 2, startTime: "13:30", endTime: "18:00", slotDuration: 30, maxBookingsPerSlot: 1 }, // Tuesday PM
      { dayOfWeek: 3, startTime: "09:00", endTime: "12:30", slotDuration: 30, maxBookingsPerSlot: 1 }, // Wednesday AM
      { dayOfWeek: 3, startTime: "13:30", endTime: "18:00", slotDuration: 30, maxBookingsPerSlot: 1 }, // Wednesday PM
      { dayOfWeek: 4, startTime: "09:00", endTime: "12:30", slotDuration: 30, maxBookingsPerSlot: 1 }, // Thursday AM
      { dayOfWeek: 4, startTime: "13:30", endTime: "18:00", slotDuration: 30, maxBookingsPerSlot: 1 }, // Thursday PM
      { dayOfWeek: 5, startTime: "09:00", endTime: "12:30", slotDuration: 30, maxBookingsPerSlot: 1 }, // Friday AM
      { dayOfWeek: 5, startTime: "13:30", endTime: "18:00", slotDuration: 30, maxBookingsPerSlot: 1 }, // Friday PM
      { dayOfWeek: 6, startTime: "09:00", endTime: "14:00", slotDuration: 30, maxBookingsPerSlot: 1 }  // Saturday
    ]
  },
  // ActiveLife Physiotherapy - Varied schedule
  {
    partnerIndex: 3,
    schedule: [
      { dayOfWeek: 1, startTime: "08:00", endTime: "20:00", slotDuration: 45, maxBookingsPerSlot: 1 }, // Monday
      { dayOfWeek: 2, startTime: "08:00", endTime: "20:00", slotDuration: 45, maxBookingsPerSlot: 1 }, // Tuesday
      { dayOfWeek: 3, startTime: "08:00", endTime: "20:00", slotDuration: 45, maxBookingsPerSlot: 1 }, // Wednesday
      { dayOfWeek: 4, startTime: "08:00", endTime: "20:00", slotDuration: 45, maxBookingsPerSlot: 1 }, // Thursday
      { dayOfWeek: 5, startTime: "08:00", endTime: "20:00", slotDuration: 45, maxBookingsPerSlot: 1 }, // Friday
      { dayOfWeek: 6, startTime: "08:00", endTime: "16:00", slotDuration: 45, maxBookingsPerSlot: 1 }  // Saturday
    ]
  }
];

export const daysOff = [
  // Sample days off for partners
  {
    partnerIndex: 0,
    daysOff: [
      {
        date: "2025-01-01",
        reason: "New Year's Day",
        isRecurring: false
      },
      {
        date: "2025-01-28",
        reason: "Chinese New Year",
        isRecurring: false
      },
      {
        date: "2025-01-29",
        reason: "Chinese New Year",
        isRecurring: false
      }
    ]
  },
  {
    partnerIndex: 1,
    daysOff: [
      {
        date: "2025-01-01",
        reason: "New Year's Day",
        isRecurring: false
      }
    ]
  },
  {
    partnerIndex: 2,
    daysOff: [
      {
        date: "2025-01-01",
        reason: "New Year's Day",
        isRecurring: false
      },
      {
        date: "2025-02-14",
        reason: "Staff Training Day",
        isRecurring: false
      }
    ]
  }
];