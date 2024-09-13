export class DateHalper {
  // преобразование в Date. Формат date - 07.07.1997. Формат parsedDate - 1997-07-07T00:00:00.000Z
  static getDate({ date }: { date: string }) {
    const partsOfDate = date.split('.');

    const formattedDateString = `${partsOfDate[2]}-${partsOfDate[1]}-${partsOfDate[0]}`;

    const parsedDate = new Date(formattedDateString);

    return { parsedDate };
  }

  // проверка на максимальную разницу в датах
  static checkMaxDate({ date, years }: { date: Date; years: number }) {
    // получение текущей даты
    const currentDate = new Date();

    // получение даты, с которой будет происходить сравнение
    const yearsAgo = new Date(currentDate.getFullYear() - years, currentDate.getMonth(), currentDate.getDate());

    // сверка дат
    if (date < yearsAgo) return false;

    return true;
  }

  // проверка на минимальную разницу в датах
  static checkMinDate({ date, years }: { date: Date; years: number }) {
    // получение текущей даты
    const currentDate = new Date();

    // получение даты, с которой будет происходить сравнение
    const yearsAgo = new Date(currentDate.getFullYear() - years, currentDate.getMonth(), currentDate.getDate());

    // сверка дат
    if (date > yearsAgo) return false;

    return true;
  }
}
