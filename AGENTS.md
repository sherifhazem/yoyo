# تعليمات الوكلاء (AI coding agents)

تنطبق هذه التعليمات على أي وكيل يعمل في هذا المستودع: Claude، Codex، أو أي
AI reviewer / coding agent آخر.

## مراجعة Pull Requests — إلزامية

المرجع الرسمي: [`docs/review-policy.md`](docs/review-policy.md). اقرأه قبل بدء
أي مراجعة، والتزم به حرفياً.

الخلاصة المُلزِمة:

- **المراجعة محدودة الحدود، لا مفتوحة.** الحصة الافتراضية لكل PR:
  **1 Full Review + 1 Verification Review**.
- بمجرد تحقق Acceptance Criteria، وخُضرة الـCI والاختبارات المطلوبة، وعدم وجود
  `BLOCKER` مفتوح ولا regression معروف — **توقّف عن المراجعة وأعلن الـPR
  جاهزة**. لا تكمل البحث عن تحسينات بعد هذه النقطة.
- **لا تبدأ جولة مراجعة شاملة جديدة لمجرد أن ملاحظات سابقة أُصلحت.** جولة
  الـVerification تقتصر على: الملاحظات المفتوحة السابقة، والـdiff الناتج عن
  إصلاحها، وأي regression مباشر سببه هذا الـdiff.
- أي جولة ثالثة فأكثر تتطلب تعليقاً مكتوباً في الـPR يحدد سبباً واحداً:
  `New Blocker` أو `Regression` أو `Acceptance Criteria failure`.
  **ملاحظات MINOR/SUGGESTION لا تبرر جولة إضافية.**
- صنّف كل ملاحظة بواحدة من: `BLOCKER` / `MAJOR` / `MINOR` / `SUGGESTION`.
  `BLOCKER` تمنع الدمج، `MAJOR` تُصلح قبل الدمج فقط داخل نطاق الـPR أو عند تأثير
  مباشر على الصحة/الأمان/البيانات، و`MINOR`/`SUGGESTION` لا تمنعان الدمج.
- **ممنوع** رفع refactor أو naming أو cleanup أو تحسين اختياري إلى `BLOCKER`.
- ابدأ بأعلى المخاطر أولاً (الأمان، سلامة البيانات، الهجرات، الصلاحيات)، وقدّم
  ملاحظات كل جولة في دفعة واحدة، وسجّل ما تبقّى كـfollow-up.

بالإنجليزية، للوكلاء التي تعمل بها:

> Reviews are bounded, not open-ended.
> Once acceptance criteria pass, required CI/tests are green, and no BLOCKER
> remains, stop reviewing and declare the PR ready.
> Do not start another full review round solely because prior findings were
> fixed. Verification reviews must focus on previous findings and their fix
> diff.

## Explicit Review Authorization — مراجعة Codex opt-in

مراجعة Codex **ليست خطوة افتراضية**. لا تطلبها ولا تُشغّلها ولا تنفّذها ولا
تكرّرها إلا بإذن صريح من مالك المستودع لهذه الـPR أو المهمة تحديداً. الإذن يكون
بذكر Codex بالاسم، مثل: «راجع PR #123 باستخدام Codex».

ممنوع تحديداً:

- طلب مراجعة Codex تلقائياً بعد انتهاء التنفيذ.
- طلب مراجعة Codex جديدة بعد إصلاح الملاحظات، ما لم يُطلب صراحة.
- اعتبار «راجع» أو «تحقق» أو «تأكد» إذناً باستدعاء Codex — الإذن يتطلب ذكر
  Codex بالاسم.
- استدعاء Codex لمجرد أن الـPR صارت جاهزة للمراجعة.
- معاملة Codex كبوابة دمج إلزامية، ما لم يعرّفها المالك كذلك صراحة.
- طلب مراجعة Codex لتغييرات توثيقية أو CI أو إعدادات أو تنظيمية، ما لم تُطلب صراحة.
- استدعاء Codex لمجرد أن عملاً سابقاً استخدمه.
- تكليف Codex بإصلاح ملاحظات أو تعديل كود أو بدء دورة إصلاح/مراجعة بلا طلب صريح
  من المالك.

بلا إذن صريح: امضِ بالاختبارات والـCI وAcceptance Criteria وسياسة المراجعة في
[`docs/review-policy.md`](docs/review-policy.md)، بلا Codex.

> Codex review is opt-in, not default. Authorization must be explicit and must
> name Codex for the specific PR or task.

هذه القاعدة تسري على كل المستودعات وكل المهام، لا على هذا المستودع وحده.

## حدود أخرى

- لا تطلب مراجعة آلية إضافية (Codex/بوت) لـPR مستوفية Stop Condition.
- التزم بنطاق المهمة المطلوبة؛ التحسينات خارج النطاق تُسجَّل follow-up ولا تُنفَّذ
  ضمن نفس الـPR.
