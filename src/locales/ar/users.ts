const users = {
  list: {
    title: "المستخدمون",
    description: "إدارة مستخدمي النظام وصلاحياتهم.",
    columns: {
      name: "الاسم",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      status: "الحالة",
      roles: "الأدوار",
      createdAt: "تاريخ الإنشاء",
    },
    filters: {
      searchPlaceholder: "ابحث بالاسم أو البريد الإلكتروني",
      status: {
        label: "الحالة",
        all: "الكل",
        active: "نشط",
        inactive: "غير نشط",
      },
    },
    actions: {
      create: "إضافة مستخدم",
      edit: "تعديل",
      delete: "حذف",
    },
    empty: {
      title: "لا يوجد مستخدمون",
      description: "جرّب تعديل عوامل التصفية أو إضافة مستخدم جديد.",
    },
  },
};

export default users;
