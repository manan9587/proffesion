const PYTHAG_MAP = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
};
const vowels = new Set(['A', 'E', 'I', 'O', 'U']);

function onlyLetters(str) {
  return (str || "").toUpperCase().replace(/[^A-Z]/g, "");
}

function sumMappedLetters(str) {
  return onlyLetters(str).split("")
    .reduce((sum, ch) => sum + (PYTHAG_MAP[ch] || 0), 0);
}

function sumMappedVowels(str) {
  return onlyLetters(str).split("")
    .filter(ch => vowels.has(ch))
    .reduce((sum, ch) => sum + (PYTHAG_MAP[ch] || 0), 0);
}

function sumMappedConsonants(str) {
  return onlyLetters(str).split("")
    .filter(ch => !vowels.has(ch))
    .reduce((sum, ch) => sum + (PYTHAG_MAP[ch] || 0), 0);
}


export class FallbackCalculations {
  static digitSum(n) {
    return n.toString().split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }

  static reduceNumber(n) {
    let currentVal = n;
    while (currentVal > 9 && ![11, 22, 33].includes(currentVal)) {
      currentVal = this.digitSum(currentVal);
    }
    return currentVal;
  }

  static calculatePersonalMonth(personalYear, targetMonth) {
    if (typeof personalYear !== 'number' || typeof targetMonth !== 'number') {
      return null;
    }
    return this.reduceNumber(personalYear + targetMonth);
  }
  
  static calculateLifePath(birthDate) {
    const date = new Date(birthDate);
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();

    // Sum the full numeric values of month, day, and year, then reduce
    const total = day + month + year;
    return this.reduceNumber(total);
  }

  static calculateExpressionNumber(name) {
    return this.reduceNumber(sumMappedLetters(name));
  }
  
  static calculateSoulUrgeNumber(name) {
    return this.reduceNumber(sumMappedVowels(name));
  }
  
  static calculatePersonalityNumber(name) {
    return this.reduceNumber(sumMappedConsonants(name));
  }

  static calculateMaturity(lifePath, expression) {
    return this.reduceNumber(lifePath + expression);
  }

  static calculateAllNumbers(fullName, birthDate) {
    const lifePath = this.calculateLifePath(birthDate);
    const expression = this.calculateExpressionNumber(fullName);
    const soulUrge = this.calculateSoulUrgeNumber(fullName);
    const personality = this.calculatePersonalityNumber(fullName);
    const maturity = this.calculateMaturity(lifePath, expression);
    
    return {
      lifePath,
      expression,
      soulUrge,
      personality,
      maturity,
    };
  }
}
