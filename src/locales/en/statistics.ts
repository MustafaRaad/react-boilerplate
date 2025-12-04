export default {
  pageTitle: "Statistics",
  pageDescription: "Financial analytics and insights dashboard",

  // Mini Stats
  miniStats: {
    sales: {
      title: "Monthly Sales",
      trend: "+12.5% from last month",
    },
    transactions: {
      title: "Total Transactions",
      trend: "+8.2% from last month",
    },
    customers: {
      title: "New Customers",
      trend: "-3.1% from last month",
    },
  },

  // Area Interactive Chart
  areaInteractive: {
    title: "Income vs Expense Trends",
    subtitle: "Daily financial overview for the selected period",
    series: {
      income: "Income",
      expense: "Expense",
    },
    footer: {
      trending: "Trending up by 5.2% this period",
      note: "Showing financial data for the selected time range",
    },
    timeRange: {
      label: "Select period:",
      last7Days: "Last 7 days",
      last30Days: "Last 30 days",
      last90Days: "Last 90 days",
    },
  },

  // Bar Label Custom Chart
  barLabelCustom: {
    title: "POS Monthly Volume",
    subtitle: "Transaction volumes by company (January - June 2024)",
    series: {
      volume: "Transaction Volume",
      volumeShort: "Volume",
    },
    companies: {
      zain: "Zain Cash",
      asiacell: "Asia Cell",
      korek: "Korek",
      earthlink: "Earthlink",
      newroz: "Newroz",
    },
    units: {
      million: "M",
    },
    footer: {
      topCompany: "Zain Cash leads with highest volume",
      note: "Total transaction volume across all POS providers",
    },
  },

  // Bar Stacked Chart
  barStacked: {
    title: "Buy vs Sell Orders",
    subtitle: "Stacked order comparison (July - October 2024)",
    series: {
      buys: "Buy Orders",
      sells: "Sell Orders",
    },
    months: {
      jul: "July",
      aug: "August",
      sep: "September",
      oct: "October",
    },
    units: {
      order: "orders",
    },
    footer: {
      topBuys: "Buy orders trending upward",
      note: "Showing order distribution over the last 4 months",
    },
  },

  // Line Label Chart
  lineLabel: {
    title: "Monthly Revenue",
    subtitle: "Revenue performance (April - September 2024)",
    series: {
      income: "Revenue",
      incomeShort: "Rev",
    },
    months: {
      apr: "Apr",
      may: "May",
      jun: "Jun",
      jul: "Jul",
      aug: "Aug",
      sep: "Sep",
    },
    units: {
      million: "M",
    },
    footer: {
      topRevenue: "Revenue up by 34% in 6 months",
      note: "Displaying revenue growth trajectory",
    },
  },

  // Radial Text Chart
  radialText: {
    title: "Total Revenue 2025",
    subtitle: "Annual revenue projection (January - December 2025)",
    series: {
      visitors: "Total Revenue",
    },
    seriesKey: {
      safari: "Safari 2025 Revenue",
    },
    units: {
      million: "M",
    },
    center: {
      caption: "Total Revenue",
    },
    footer: {
      delta: "Up by 5.2% from 2024",
      note: "Based on current trends and projections",
    },
  },

  // Pie Label Chart
  pieLabel: {
    title: "Investment Distribution",
    subtitle: "Capital allocation by investor (January - June 2024)",
    series: {
      amount: "Investment Amount",
    },
    investors: {
      mustafa: "Mustafa",
      sarah: "Sarah",
      laith: "Laith",
      zainab: "Zainab",
      omar: "Omar",
    },
    units: {
      million: "M",
    },
    footer: {
      topInvestor: "Mustafa leads with largest investment",
      note: "Total investments: 950M IQD",
    },
  },
};
