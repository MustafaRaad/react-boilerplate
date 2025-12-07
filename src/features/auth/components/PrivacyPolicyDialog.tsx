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

export interface PrivacyPolicyDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PrivacyPolicyDialog({
  trigger,
  open,
  defaultOpen,
  onOpenChange,
}: PrivacyPolicyDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent dir="rtl" className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>سياسة الخصوصية</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-auto p-2 text-right leading-relaxed">
          <p>آخر تحديث: [●] / [●] / [●]</p>

          <p>
            مرحبًا بك في [اسم الموقع / التطبيق] (“نحن”، “لنا”، “الموقع”،
            “الخدمة”). تحترم [اسم الموقع] خصوصيتك، ونلتزم بحماية بياناتك الشخصية
            وفقًا لهذه السياسة.
          </p>

          <p>
            باستخدامك للموقع أو خدماتنا، فإنك توافق على جمع واستخدام ومشاركة
            بياناتك كما هو موضّح في هذه السياسة. إذا لم توافق على ما فيها، أوقف
            استخدامك للموقع فورًا.
          </p>

          <h3 className="font-semibold">1. نطاق هذه السياسة</h3>
          <p>
            توضح هذه السياسة ما هي البيانات التي نجمعها عنك، كيف نستخدم هذه
            البيانات ولماذا، مع من نشاركها ومتى، كيف نحميها ومدة الاحتفاظ بها،
            وحقوقك المتعلقة ببياناتك.
          </p>

          <h3 className="font-semibold">2. البيانات التي نجمعها عنك</h3>
          <p>
            قد نجمع أنواعًا مختلفة من البيانات، منها بيانات تُقدِّمها أنت مباشرة
            (الاسم، البريد الإلكتروني، رقم الهاتف، بيانات الحساب)، وبيانات تُجمع
            تلقائيًا (IP، المتصفح، الصفحات التي تزورها)، وبيانات من أطراف ثالثة
            في حال استخدام تسجيل الدخول عبر مزود خارجي أو خدمات تحليل.
          </p>

          <h3 className="font-semibold">3. استخدام ملفات تعريف الارتباط</h3>
          <p>
            نستخدم ملفات تعريف الارتباط وتقنيات مشابهة لتذكر تفضيلاتك، تحسين
            التجربة، تحليل الاستخدام وقياس أداء الحملات. يمكنك التحكم في إعدادات
            الكوكيز من متصفّحك، لكن تعطيلها قد يؤثر على بعض وظائف الموقع.
          </p>

          <h3 className="font-semibold">4. كيف نستخدم بياناتك</h3>
          <p>
            نستخدم بياناتك لتقديم الخدمة وتشغيل الموقع، إنشاء الحسابات، التواصل
            معك، تحسين الخدمة، وأغراض الأمن والامتثال.
          </p>

          <h3 className="font-semibold">5. مشاركة البيانات مع أطراف ثالثة</h3>
          <p>
            قد نشارك بياناتك مع مزودي الخدمة (استضافة، تحليلات، بريد إلكتروني)
            وبالامتثال للمتطلبات القانونية. لا نبيع بياناتك دون موافقة صريحة.
          </p>

          <h3 className="font-semibold">6. حفظ البيانات ومدة الاحتفاظ</h3>
          <p>
            نحتفظ ببياناتك للمدة اللازمة لتحقيق الأغراض المذكورة، والامتثال
            للالتزامات القانونية، وحل النزاعات. عند عدم الحاجة، نقوم بحذفها أو
            إخفاء هويتها بشكل آمن.
          </p>

          <h3 className="font-semibold">7. حماية البيانات</h3>
          <p>
            نتخذ إجراءات تقنية وتنظيمية معقولة لحماية بياناتك من الوصول أو
            الاستخدام غير المصرّح به، لكن لا يوجد نظام آمن بنسبة 100%.
          </p>

          <h3 className="font-semibold">8. حقوقك تجاه بياناتك</h3>
          <p>
            قد تكون لك حقوق مثل الحق في الوصول، التصحيح، الحذف، تقييد المعالجة
            أو سحب الموافقة. لممارسة الحقوق تواصل معنا من خلال بيانات الاتصال
            المتاحة.
          </p>

          <h3 className="font-semibold">9. خصوصية الأطفال</h3>
          <p>
            الخدمة ليست موجهة للأطفال دون سن [●] عامًا. لا نجمع عن عمد بيانات
            شخصية من أطفال في هذه الفئة دون موافقة ولي الأمر إذا كان القانون
            يتطلب ذلك.
          </p>

          <h3 className="font-semibold">10. المواقع والخدمات الخارجية</h3>
          <p>
            قد يحتوي الموقع على روابط لمواقع خارجية؛ لسنا مسؤولين عن ممارسات
            الخصوصية فيها أو محتواها.
          </p>

          <h3 className="font-semibold">11. نقل البيانات عبر الحدود</h3>
          <p>
            عند نقل بياناتك إلى خوادم خارج [اسم الدولة] سنسعى لاتخاذ تدابير
            مناسبة لحمايتها ونتبع القوانين ذات الصلة.
          </p>

          <h3 className="font-semibold">12. التعديلات على سياسة الخصوصية</h3>
          <p>
            سنقوم بتحديث هذه السياسة من وقت لآخر. عند إجراء تغيير جوهري سنقوم
            بتحديث تاريخ "آخر تحديث" ونشر السياسة المحدّثة.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PrivacyPolicyDialog;
