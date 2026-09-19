# تقرير تسليم لوحة مونتنيرو التنفيذية

## النتيجة

تمت إعادة هيكلة مستودع `almidyaf-dashboard` وتحويل واجهته إلى غرفة قيادة تنفيذية عربية باتجاه RTL لعلامة **MONTNERO**، مع هوية Neo-Classic White Luxury UI، ولوحة ألوان بيضاء/عاجية مع قرمزي ملكي `#C41228` وذهبي إمبراطوري `#B38E46`، وخط Cairo.

**رابط النشر الحي:** [فتح لوحة مونتنيرو على Vercel](https://almidyaf-dashboard-6wzue5yxi-mohammedmekh1s-projects.vercel.app/)

## المكونات التي تم تحديثها

| المسار | التغيير |
|---|---|
| `client/src/pages/Home.tsx` | إعادة بناء الصفحة التنفيذية: مؤشرات الإيرادات والعملاء والطلبات والتسليم، مخططات Recharts، الطلبات الأخيرة، وصحة المنظومة. |
| `client/src/components/Sidebar.tsx` | تقسيم التنقل إلى مركز القيادة، الرادار والمبيعات، استوديو المحتوى، الكتالوج واللوجستيات، خدمة العملاء، والتوصيل. |
| `client/src/components/DashboardLayout.tsx` | شريط علوي جديد للبحث والإشعارات وملف المدير، مع دعم الجوال. |
| `client/src/index.css` | نظام تصميم مونتنيرو الكامل: RTL، بطاقات ناعمة، ظلال خفيفة، حركات hover، وتدرجات الهوية. |
| `client/src/hooks/useGoogleSheets.ts` | نقل الجلب من المتصفح إلى `/api/dashboard` الخادمية. |
| `api/dashboard.ts` | جلب CSV من Google Sheets خادمياً، تحويل CSV آمن، تخزين مؤقت قصير، ومعالجة فشل الأوراق دون إسقاط اللوحة. |
| `client/index.html` | تحديث العنوان إلى MONTNERO وإزالة سكربت التحليلات غير المعرّف. |

## البيانات والبيئة

تم ضبط المتغير التالي في `.env.example` وملف البيئة المحلي وإعدادات مشروع Vercel للبيئات `production` و`preview` و`development`:

```text
GOOGLE_SHEET_ID=1A4zseycVNZ8bkL9qCYdGViiAzjgH7qucvzPw5avJ5qc
```

تمت مواءمة طبقة البيانات مع أوراق الجدول الفعلية، بما فيها `leads` و`products_catalog` و`sales_handoff` و`delivery_log` و`social_posts` و`content_queue` و`daily_reports`.

> ملاحظة تشغيلية: اختبار `gviz/tq` العام أعاد `401`، ما يعني أن الجدول غير متاح حالياً عبر القراءة العامة. نقطة API جاهزة وتتعامل مع هذا بأمان، لكن ظهور البيانات الحقيقية على Vercel يتطلب إما نشر الأوراق للقراءة عبر الرابط أو إضافة اعتماد خادمي/مسار Google Sheets API مناسب. لم يتم تغيير صلاحيات المشاركة حفاظاً على أمان بيانات الجدول.

## التحقق والنشر

- `pnpm run check` — **ناجح**.
- `pnpm run build` — **ناجح**، مع تحذير حجم chunk غير حاجب للنشر.
- Git commit: `d211bdd feat: rebuild dashboard for Montnero luxury operations`.
- تم دفع التعديلات إلى `main` في GitHub.
- نشر Vercel الناتج من commit الجديد يجيب `HTTP 200`.

## ملاحظة Vercel

تم إنشاء/تحديث `GOOGLE_SHEET_ID` بنجاح في مشروع Vercel `almidyaf-dashboard`. يوجد متغير قديم باسم `VITE_SHEETS_ID` في إعدادات Vercel لكنه لم يعد مستخدماً في الكود؛ يمكن حذفه يدوياً من إعدادات Environment Variables عند توفر صلاحية الحذف في واجهة Vercel.
