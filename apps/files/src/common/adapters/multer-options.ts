import { diskStorage as multerDiskStorage } from 'multer';

// Экспортируем объект конфигурации для хранения файлов, который будет использоваться Multer
export const diskStorage = multerDiskStorage({
  // Определяем директорию для временного хранения файлов
  destination: './uploads',

  // Определяем логику именования файлов при их сохранении
  filename: (req, file, cb) => {
    // Генерируем уникальный суффикс для имени файла
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    // Вызываем callback функцию cb, передавая два аргумента:
    // 1. null - означает, что ошибки нет
    // 2. итоговое имя файла, которое включает в себя уникальный суффикс и оригинальное имя файла
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
