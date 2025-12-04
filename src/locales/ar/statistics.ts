export default {
  pageTitle: "الإحصائيات",
  pageDescription: "لوحة تحليلات ورؤى مالية",

  // إحصائيات مصغرة
  miniStats: {
    sales: {
      title: "المبيعات الشهرية",
      trend: "+12.5% من الشهر الماضي",
    },
    transactions: {
      title: "إجمالي المعاملات",
      trend: "+8.2% من الشهر الماضي",
    },
    customers: {
      title: "عملاء جدد",
      trend: "-3.1% من الشهر الماضي",
    },
  },

  // مخطط المساحة التفاعلي
  areaInteractive: {
    title: "اتجاهات الدخل مقابل المصروفات",
    subtitle: "نظرة مالية يومية للفترة المحددة",
    series: {
      income: "الدخل",
      expense: "المصروفات",
    },
    footer: {
      trending: "الاتجاه صاعد بنسبة 5.2% في هذه الفترة",
      note: "عرض البيانات المالية للنطاق الزمني المحدد",
    },
    timeRange: {
      label: "اختر الفترة:",
      last7Days: "آخر 7 أيام",
      last30Days: "آخر 30 يوماً",
      last90Days: "آخر 90 يوماً",
    },
  },

  // مخطط الأعمدة بالتسميات المخصصة
  barLabelCustom: {
    title: "حجم نقاط البيع الشهرية",
    subtitle: "أحجام المعاملات حسب الشركة (يناير - يونيو 2024)",
    series: {
      volume: "حجم المعاملات",
      volumeShort: "الحجم",
    },
    companies: {
      zain: "زين كاش",
      asiacell: "آسيا سل",
      korek: "كورك",
      earthlink: "إيرثلينك",
      newroz: "نوروز",
    },
    units: {
      million: "م",
    },
    footer: {
      topCompany: "زين كاش تتصدر بأعلى حجم",
      note: "إجمالي حجم المعاملات عبر جميع مزودي نقاط البيع",
    },
  },

  // مخطط الأعمدة المكدسة
  barStacked: {
    title: "أوامر الشراء مقابل البيع",
    subtitle: "مقارنة الأوامر المكدسة (يوليو - أكتوبر 2024)",
    series: {
      buys: "أوامر الشراء",
      sells: "أوامر البيع",
    },
    months: {
      jul: "يوليو",
      aug: "أغسطس",
      sep: "سبتمبر",
      oct: "أكتوبر",
    },
    units: {
      order: "أوامر",
    },
    footer: {
      topBuys: "أوامر الشراء في اتجاه صاعد",
      note: "عرض توزيع الأوامر خلال الأشهر الأربعة الماضية",
    },
  },

  // مخطط الخط بالتسميات
  lineLabel: {
    title: "الإيرادات الشهرية",
    subtitle: "أداء الإيرادات (أبريل - سبتمبر 2024)",
    series: {
      income: "الإيرادات",
      incomeShort: "الإير",
    },
    months: {
      apr: "أبر",
      may: "ماي",
      jun: "يون",
      jul: "يول",
      aug: "أغس",
      sep: "سبت",
    },
    units: {
      million: "م",
    },
    footer: {
      topRevenue: "الإيرادات ارتفعت بنسبة 34% في 6 أشهر",
      note: "عرض مسار نمو الإيرادات",
    },
  },

  // مخطط دائري بالنص
  radialText: {
    title: "إجمالي الإيرادات 2025",
    subtitle: "توقعات الإيرادات السنوية (يناير - ديسمبر 2025)",
    series: {
      visitors: "إجمالي الإيرادات",
    },
    seriesKey: {
      safari: "إيرادات سفاري 2025",
    },
    units: {
      million: "م",
    },
    center: {
      caption: "إجمالي الإيرادات",
    },
    footer: {
      delta: "ارتفاع بنسبة 5.2% من 2024",
      note: "بناءً على الاتجاهات والتوقعات الحالية",
    },
  },

  // مخطط دائري بالتسميات
  pieLabel: {
    title: "توزيع الاستثمارات",
    subtitle: "تخصيص رأس المال حسب المستثمر (يناير - يونيو 2024)",
    series: {
      amount: "مبلغ الاستثمار",
    },
    investors: {
      mustafa: "مصطفى",
      sarah: "سارة",
      laith: "ليث",
      zainab: "زينب",
      omar: "عمر",
    },
    units: {
      million: "م",
    },
    footer: {
      topInvestor: "مصطفى يتصدر بأكبر استثمار",
      note: "إجمالي الاستثمارات: 950 مليون دينار",
    },
  },
};
