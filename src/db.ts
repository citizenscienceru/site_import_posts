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
  fs.readdir(`${config.DRAFTS_PATH}`, function (err, files) {
    //handling error
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }
    //listing all files using forEach
    files.forEach(function (file) {
      // Do whatever you want to do with the file
      fs.readFile(`${config.DRAFTS_PATH}/${file}`, "utf8", async function (err, data) {
        if (err) throw err;
        // разбиваем данные на 3 порции
        const dataSplitted = data.split("---");
        // const postInfoHash: { [key: string]: string } = {};
        type postInfoHashType = {
          // [key: string?]: string | string[];
          title: string;
          description_short: string;
          description: string;
          small_logo: string;
          logo: string;
          trends: string[];
          location: string[];
          participation: string[];
          url: string;
          path: string;
          content: string;
        }; // = {};
        const postInfoHash: postInfoHashType = {
          title: "",
          description_short: "",
          description: "",
          small_logo: "",
          logo: "",
          trends: [],
          location: [],
          participation: [],
          url: "",
          path: "",
          content: "",
        };
        // const postInfoHash: { [key: string]: string } = {};

        if (dataSplitted[1]) {
          // данные поста. в [1] - свойства поста, [2] - текст
          // получаем свойства поста
          const postInfo = dataSplitted[1].split("\n");
          postInfo.forEach((s: string | []) => {
            // s - одно свойство. Делим и вставляем в хэш
            let tmp: string[];
            if (typeof s === "string") {
              tmp = s.split(": ");
              if (tmp[0]) {
                tmp[0] = tmp[0].replace(/\s+/g, "");
                if (tmp[0] === "trends") {
                  const tmp1 = tmp[1].split(", ");
                  // console.log(tmp1);
                  postInfoHash.trends = tmp1;
                } else if (tmp[0] === "location") {
                  const tmp1 = tmp[1].split(", ");
                  postInfoHash.location = tmp1;
                } else if (tmp[0] === "participation") {
                  const tmp1 = tmp[1].split(", ");
                  postInfoHash.participation = tmp1;
                } else if (tmp[0] === "title") {
                  postInfoHash.title = tmp[1];
                } else if (tmp[0] === "description_short") {
                  postInfoHash.description_short = tmp[1];
                } else if (tmp[0] === "description") {
                  postInfoHash.description = tmp[1];
                } else if (tmp[0] === "small_logo") {
                  postInfoHash.small_logo = tmp[1];
                } else if (tmp[0] === "logo") {
                  postInfoHash.logo = tmp[1];
                } else if (tmp[0] === "url") {
                  postInfoHash.url = tmp[1];
                } else if (tmp[0] === "path") {
                  postInfoHash.path = tmp[1];
                }
              }
            }
          });
          postInfoHash["content"] = dataSplitted[2];
          postInfoHash["path"] = file;

          // console.log(postInfoHash);
          // process.exit(0);

          // вставка
          const [_project, created] = await Projects.findOrCreate({
            where: {
              title: postInfoHash.title,
            },
            defaults: postInfoHash,
          });

          if (created) {
            // перенос в чистовики
            fs.rename(
              `${config.DRAFTS_PATH}${file}`,
              `${config.PUBLISH_PATH}${file}`,
              function (err) {
                if (err) throw err;
                console.log("Successfully renamed - AKA moved!");
                // TODO: post news about new project to twitter & telegram
              }
            );
          } else {
            console.log("! Already present");
          }
        }
      });
    });
  });
}
//-------------------------------------------------------------------
