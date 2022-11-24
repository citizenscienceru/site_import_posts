/*
  Импортирует файлы md из черновиков в БД
*/
import { Sequelize, DataTypes } from "sequelize";
import config from "./config";
import * as fs from "fs";

const sequelize = new Sequelize(
  `postgres://${config.DB_USER}:${config.DB_PASS}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`
);
//-------------------------------------------------------------------
type connectResult = {
  status: string; //"ok" | "error";
  data: string;
  sequelize?: Sequelize;
};
//-------------------------------------------------------------------
const Projects = sequelize.define(
  "projects",
  {
    title: {
      type: DataTypes.TEXT,
    },
    tags: {
      type: DataTypes.JSONB,
    },
    description_short: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
    },
    small_logo: {
      type: DataTypes.TEXT,
    },
    logo: {
      type: DataTypes.TEXT,
    },
    trends: {
      type: DataTypes.JSONB,
    },
    location: {
      type: DataTypes.JSONB,
    },
    participation: {
      type: DataTypes.JSONB,
    },
    url: {
      type: DataTypes.TEXT,
    },
    path: {
      type: DataTypes.TEXT,
    },
  },
  {
    freezeTableName: true,
  }
);

export { Projects };
//-------------------------------------------------------------------
// подключение к БД
export async function connect(): Promise<connectResult> {
  return await sequelize
    .authenticate()
    .then(() => {
      return {
        status: "ok",
        data: "Connection to DB has been established successfully.",
        sequelize: sequelize,
      };
    })
    .catch((error) => {
      return {
        status: "error",
        data: "PG: Unable to connect to the database: " + JSON.stringify(error),
      };
    });
}

export async function importPosts(): Promise<void> {
  const directoryPath = "./drafts";
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
      // Do whatever you want to do with the file
      fs.readFile(`${directoryPath}/${file}`, "utf8", function (err, data) {
        if (err) throw err;
        // разбиваем данные на 3 порции
        const dataSplitted = data.split("---");
        const postInfoHash: { [key: string]: string } = {};
        if (dataSplitted[1]) {
          // данные поста. в [1] - свойства поста, [2] - текст
          // получаем свойства поста
          const postInfo = dataSplitted[1].split("\n");
          postInfo.forEach((s) => {
            // s - одно свойство. Делим и вставляем в хэш
            const tmp = s.split(": ");
            tmp[0] = tmp[0].replace(/\s+/g, "");
            if (tmp[0]) {
              postInfoHash[tmp[0]] = tmp[1];
            }
          });
          postInfoHash["content"] = dataSplitted[2];
          postInfoHash["path"] = file;
          // вставка
          Projects.create(postInfoHash);
          // перенос в чистовики
          fs.rename("../" + directoryPath + "/" + file, "../source/_posts/", function (err) {
            if (err) throw err;
            console.log("Successfully renamed - AKA moved!");
          });
        }
      });
    });
  });
}
//-------------------------------------------------------------------
