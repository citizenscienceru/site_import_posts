/*
Импорт черновиков в БД и их публикация

Сканируем папку на публикацию
Добавляем в БД
Переносим в готовые посты
*/

import { connect, importPosts } from "./db.js";
import { log_error } from "./logger.js";

(async () => {
  const DB = await connect();
  if (DB.status !== "ok") {
    log_error(DB.toString());
    process.exit(1);
  }

  await importPosts();
})();
