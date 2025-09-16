export class ValidationUtils {
  static isEmailValid(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isPasswordValid(password) {
    return password && password.length >= 6;
  }

  static isBirthDateValid(day, month, year) {
    if (!day || !month || !year) return false;
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
    if (y < 1900 || y > new Date().getFullYear()) return false;
    if (m < 1 || m > 12) return false;
    if (d < 1 || d > 31) return false;

    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  }

  static isNumerologyNumberValid(number) {
    const n = parseInt(number, 10);
    if (isNaN(n)) return false;
    return (n >= 1 && n <= 9) || [11, 22, 33].includes(n);
  }
}