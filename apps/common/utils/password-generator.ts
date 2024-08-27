export function generatePassword(length: number = 12): string {
  const digits = '0123456789';
  const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const specialCharacters = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';

  const allCharacters = digits + lowerCaseLetters + upperCaseLetters + specialCharacters;

  let password = '';
  password += digits[Math.floor(Math.random() * digits.length)];
  password += lowerCaseLetters[Math.floor(Math.random() * lowerCaseLetters.length)];
  password += upperCaseLetters[Math.floor(Math.random() * upperCaseLetters.length)];
  password += specialCharacters[Math.floor(Math.random() * specialCharacters.length)];

  for (let i = 4; i < length; i++) {
    password += allCharacters[Math.floor(Math.random() * allCharacters.length)];
  }

  // Перемешиваем символы
  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
}
