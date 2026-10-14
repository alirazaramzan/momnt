/**
 * Momnt sample price sheet
 *
 * NOTE: All monetary values in this file are mock sample prices in PKR (Pakistani Rupee)
 * for interface prototyping and presentational development only.
 * Replace or bind these values to dynamic catalog/billing rates when live database is integrated.
 */

export const SAMPLE_PRICES = {
  // Photographer Packages (PKR)
  photographers: {
    saraKhan: {
      mehndiSixHours: 120000, // sample price: Sara Khan 6-hour Mehndi coverage
      fullWeddingTwelveHours: 240000, // sample price: Sara Khan 12-hour full wedding package
      portraitSessionTwoHours: 45000, // sample price: Sara Khan 2-hour solo or couple portrait session
    },
    omarSiddiqui: {
      halfDayFiveHours: 85000, // sample price: Omar Siddiqui half day (5 hours)
      fullWeddingTenHours: 180000, // sample price: Omar Siddiqui full wedding (10 hours)
    },
    hiraAnwar: {
      nikahFourHours: 70000, // sample price: Hira Anwar Nikah coverage (4 hours)
      fullWeddingTwelveHours: 195000, // sample price: Hira Anwar full wedding coverage (12 hours)
    },
  },

  // Gig Marketplace & Bids (PKR)
  gigs: {
    cliftonMehndi: {
      budgetFrom: 100000, // sample price: Gig budget lower bound
      budgetTo: 250000, // sample price: Gig budget upper bound
      bids: {
        saraKhan: 220000, // sample price: Competitive bid from Sara Khan
        omarSiddiqui: 175000, // sample price: Competitive bid from Omar Siddiqui
        hiraAnwar: 190000, // sample price: Competitive bid from Hira Anwar
      },
    },
    portraitSessionGulberg: {
      budgetFrom: 35000, // sample price: Portrait gig budget lower bound
      budgetTo: 60000, // sample price: Portrait gig budget upper bound
      bids: {
        hiraAnwar: 45000, // sample price: Portrait bid from Hira Anwar
      },
    },
  },

  // Vendor Quotes (PKR) - e.g. Print House
  vendors: {
    printHouse: {
      albumThirtyPages: 28000, // sample price: 30-page flush mount album print
      linenCoverUpgrade: 6500, // sample price: Premium natural linen cover
      courierDelivery: 1500, // sample price: Secure door delivery within Karachi
      totalQuote: 36000, // sample price: Total quote sum (28000 + 6500 + 1500)
    },
  },

  // Location Rental Fees (PKR) - e.g. The Rooftop Studio, Clifton
  locations: {
    theRooftopStudio: {
      threeHourSlot: 35000, // sample price: 3-hour daylight slot for up to 6 crew
      hourlyExtension: 12000, // sample price: Per-hour extension rate
      securityDeposit: 15000, // sample price: Refundable venue damage deposit
    },
  },

  // Academy Workshops & Courses (PKR)
  academy: {
    lightingMehndiWorkshop: 8500, // sample price: Live interactive workshop seat reservation
    weddingMasterclassCourse: 24000, // sample price: 24-lesson comprehensive certification course
  },
} as const;
