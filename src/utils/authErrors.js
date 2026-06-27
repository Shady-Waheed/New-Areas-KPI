/**
 * Map Firebase Auth error codes to user-friendly messages.
 * @param {unknown} error
 * @returns {string}
 */
export function getAuthErrorMessage(error) {
  const code = error?.code || ''

  const messages = {
    'auth/email-already-in-use': 'هذا البريد مسجل بالفعل',
    'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
    'auth/operation-not-allowed': 'تسجيل Email/Password غير مفعّل في Firebase Console',
    'auth/weak-password': 'كلمة المرور ضعيفة — استخدم 6 أحرف على الأقل',
    'auth/invalid-credential': 'البريد أو كلمة المرور غير صحيحة',
    'auth/user-disabled': 'تم تعطيل هذا الحساب',
    'auth/user-not-found': 'البريد أو كلمة المرور غير صحيحة',
    'auth/wrong-password': 'البريد أو كلمة المرور غير صحيحة',
    'auth/too-many-requests': 'محاولات كثيرة — انتظر قليلاً ثم حاول مجدداً',
    'auth/network-request-failed': 'مشكلة في الشبكة — عطّل Ad Blocker أو جرّب متصفحاً آخر',
    'auth/invalid-api-key': 'مفتاح Firebase غير صحيح — راجع ملف .env',
  }

  if (messages[code]) return messages[code]

  if (code.startsWith('permission-denied') || code === 'permission-denied') {
    return 'صلاحيات Firestore مرفوضة — انشر firestore.rules من Firebase Console'
  }

  return 'حدث خطأ — تحقق من Firebase Console وتعطيل Ad Blocker'
}
