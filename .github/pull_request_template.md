<!--
المراجعة في هذا المستودع محكومة بـ docs/review-policy.md
الحصة الافتراضية: 1 Full Review + 1 Verification Review.
-->

## ما الذي يفعله هذا الـPR

<!-- سطر أو ثلاثة. ما تغيّر ولماذا. -->

## Acceptance Criteria

<!-- شروط القبول المعلنة لهذه الـPR، قابلة للتحقق. -->

- [ ]
- [ ]

## Stop Condition — تُملأ قبل طلب الدمج

- [ ] Acceptance Criteria محققة.
- [ ] الـCI المطلوب أخضر.
- [ ] الاختبارات المطلوبة ناجحة.
- [ ] لا يوجد `BLOCKER` مفتوح.
- [ ] لا يوجد regression معروف.
- [ ] تم التحقق من إصلاحات الجولة السابقة (إن وُجدت جولة سابقة).

عند اكتمال البنود الستة: الـPR **Ready** — يتوقف البحث عن تحسينات جديدة.

## Follow-up (خارج نطاق هذه الـPR)

<!-- ملاحظات MINOR/SUGGESTION أو تحسينات مؤجَّلة. وجودها لا يمنع الدمج. -->

---

### للمراجع

المرجع الملزِم: [`docs/review-policy.md`](../docs/review-policy.md).

- الحصة: **1 Full Review + 1 Verification Review**.
- جولة الـVerification تقتصر على: الملاحظات المفتوحة السابقة + الـdiff الناتج عن
  إصلاحها + أي regression مباشر سببه هذا الـdiff. لا إعادة مراجعة كاملة لمجرد أن
  الملاحظات أُصلحت.
- صنّف كل ملاحظة: `BLOCKER` / `MAJOR` / `MINOR` / `SUGGESTION`. لا ترفع refactor
  أو naming أو cleanup إلى `BLOCKER`.
- أي جولة ثالثة فأكثر تحتاج تعليقاً يحدد: `New Blocker` أو `Regression` أو
  `Acceptance Criteria failure`.
- ابدأ بأعلى المخاطر أولاً، وتوقّف عند تحقق Stop Condition.
