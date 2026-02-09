"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useControllableState } from "@/shared/hooks/useControllableState";

export interface TermsDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TermsDialog({
  trigger,
  open,
  defaultOpen,
  onOpenChange,
}: TermsDialogProps) {
  const [dialogOpen, setDialogOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent dir="rtl" className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>شروط الاستخدام</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-auto p-2 text-right leading-relaxed">
          <p>آخر تحديث: [●] / [●] / [●]</p>

          <p>
            مرحبًا بك في موقع/تطبيق [اسم الموقع أو الخدمة] (“نحن”، “لنا”،
            “الموقع”، “الخدمة”). باستخدامك لخدماتنا، فإنك توافق على الالتزام
            بهذه الشروط. يرجى قراءتها بعناية قبل استخدام الموقع أو التسجيل في
            الخدمة.
          </p>

          <p>
            إذا كنت لا توافق على أي جزء من هذه الشروط، فيرجى التوقف عن استخدام
            الموقع فورًا.
          </p>

          <h3 className="font-semibold">1. التعريفات</h3>
          <p>لأغراض هذه الشروط، يقصد بالمصطلحات التالية:</p>
          <ul className="list-inside list-decimal">
            <li>
              <strong>الموقع / الخدمة:</strong> موقع أو تطبيق [اسم الموقع] وجميع
              الخدمات المرتبطة به.
            </li>
            <li>
              <strong>المستخدم / أنت:</strong> أي شخص يقوم بزيارة الموقع أو
              استخدامه أو إنشاء حساب عليه.
            </li>
            <li>
              <strong>المحتوى:</strong> أي نصوص، صور، فيديوهات، ملفات، تعليقات،
              أو أي مواد أخرى تُنشَر أو تُعرَض عبر الموقع.
            </li>
            <li>
              <strong>الحساب:</strong> البيانات الخاصة بالمستخدم التي تمكّنه من
              استخدام أجزاء معينة من الخدمة.
            </li>
          </ul>

          <h3 className="font-semibold">2. قبول الشروط</h3>
          <p>
            باستخدمك للموقع أو الخدمة، فإنك تقر بما يلي: أنك قرأت هذه الشروط
            وفهمتها وتوافق على الالتزام بها. أنك بلغت سن الأهلية القانونية وفق
            القوانين المعمول بها في بلدك لاستخدام هذه الخدمة وإبرام العقود. إذا
            كنت تستخدم الخدمة نيابة عن جهة، فأنت تقر أنك مخوّل بربط تلك الجهة
            بهذه الشروط.
          </p>

          <h3 className="font-semibold">3. تعديل الشروط</h3>
          <p>
            نحتفظ بالحق في تعديل أو تحديث هذه الشروط في أي وقت. تصبح التعديلات
            نافذة فور نشرها على هذه الصفحة مع تحديث تاريخ “آخر تحديث”. استمرارك
            في استخدام الموقع بعد نشر التعديلات يُعتبَر موافقة ضمنية منك على
            الشروط المعدّلة.
          </p>

          <h3 className="font-semibold">4. إنشاء الحساب</h3>
          <p>
            قد يتطلب استخدام بعض أجزاء الخدمة إنشاء حساب خاص بك. تلتزم بتقديم
            معلومات صحيحة ودقيقة ومحدثة عند التسجيل. تتحمل وحدك مسؤولية الحفاظ
            على سرية بيانات تسجيل الدخول الخاصة بك.
          </p>

          <h3 className="font-semibold">5. استخدام الخدمة</h3>
          <p>
            تلتزم باستخدام الموقع للأغراض المشروعة فقط وعدم استخدامه بأي طريقة
            تنتهك القوانين أو تتسبب في إضرار بالموقع أو المستخدمين الآخرين.
          </p>

          <h3 className="font-semibold">6. المحتوى الذي يقدّمه المستخدمون</h3>
          <p>
            أنت المسؤول الوحيد عن أي محتوى تنشره، وتقر بأن لديك جميع الحقوق
            اللازمة لنشر هذا المحتوى. نحتفظ بالحق في مراجعة أو إزالة أي محتوى
            نراه مخالفًا لهذه الشروط أو للقانون.
          </p>

          <h3 className="font-semibold">7. الملكية الفكرية</h3>
          <p>
            جميع الحقوق المتعلقة بالموقع والخدمة والمحتوى المتاح من خلالهما
            مملوكة لنا أو للجهات المرخِّصة لنا. لا يُسمح بنسخ أو إعادة إنتاج أو
            نشر أو تعديل أي جزء من الموقع أو محتواه دون موافقة خطية مسبقة.
          </p>

          <h3 className="font-semibold">8. الرسوم والمدفوعات (إن وُجدت)</h3>
          <p>
            احذف هذا القسم إذا كانت الخدمة مجانية بالكامل. قد تتطلب بعض الخدمات
            دفع رسوم اشتراك أو مقابل خدمات معينة. أنت مسؤول عن تقديم معلومات دفع
            صحيحة وسداد جميع الرسوم المستحقة.
          </p>

          <h3 className="font-semibold">9. الروابط إلى مواقع خارجية</h3>
          <p>
            قد يحتوي الموقع على روابط لمواقع أو خدمات تابعة لطرف ثالث. لسنا
            مسؤولين عن محتوى تلك المواقع أو سياساتها.
          </p>

          <h3 className="font-semibold">10. إخلاء المسؤولية</h3>
          <p>
            يتم تقديم الموقع والخدمة على أساس “كما هو” و”كما هو متاح” دون أي
            ضمانات صريحة أو ضمنية من أي نوع.
          </p>

          <h3 className="font-semibold">11. تحديد المسؤولية</h3>
          <p>
            إلى الحد الذي يسمح به القانون المعمول به، لن نكون مسؤولين عن أي
            أضرار غير مباشرة أو تبعية تنتج عن استخدامك أو عدم قدرتك على استخدام
            الخدمة.
          </p>

          <h3 className="font-semibold">12. إنهاء الوصول إلى الخدمة</h3>
          <p>
            نحتفظ بالحق في تعليق أو إنهاء أو تقييد وصولك إلى الموقع أو الحساب،
            كليًا أو جزئيًا، في أي وقت ودون إشعار مسبق، إذا خالفت هذه الشروط.
          </p>

          <h3 className="font-semibold">13. القانون الحاكم وحل النزاعات</h3>
          <p>
            تخضع هذه الشروط وتفسَّر وفقًا لقوانين [اسم الدولة]. في حال نشوء أي
            نزاع، يتم السعي أولاً لحله وديًا.
          </p>

          <h3 className="font-semibold">14. سياسة الخصوصية</h3>
          <p>
            يخضع جمعنا واستخدامنا لبياناتك لسياسة الخصوصية الخاصة بنا. يٌنصح
            بقراءة سياسة الخصوصية بعناية.
          </p>

          <h3 className="font-semibold">15. أحكام عامة</h3>
          <p>
            إذا تبيّن أن أي بند من هذه الشروط غير صالح أو غير قابل للتنفيذ، فإن
            بطلان هذا البند لا يؤثر على صحة باقي الأحكام.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setDialogOpen(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TermsDialog;
