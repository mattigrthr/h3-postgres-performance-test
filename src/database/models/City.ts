import { FLOAT, GEOMETRY, INTEGER, Model, STRING } from "sequelize";
import { sequelize } from "../connection";

class City extends Model {}

City.init(
    {
        name: {
            type: STRING,
        },
        population: {
            type: INTEGER
        },
        lat: {
            type: FLOAT
        },
        lng: {
            type: FLOAT
        },
        point: {
            type: GEOMETRY("POINT", 4326)
        },
        h3_0: {
            type: STRING
        },
        h3_1: {
            type: STRING
        },
        h3_2: {
            type: STRING
        },
        h3_3: {
            type: STRING
        },
        h3_4: {
            type: STRING
        },
        h3_5: {
            type: STRING
        },
        h3_6: {
            type: STRING
        },
        h3_7: {
            type: STRING
        },
        h3_8: {
            type: STRING
        },
        h3_9: {
            type: STRING
        },
        h3_10: {
            type: STRING
        },
        h3_11: {
            type: STRING
        },
        h3_12: {
            type: STRING
        },
        h3_13: {
            type: STRING
        },
        h3_14: {
            type: STRING
        },
        h3_15: {
            type: STRING
        }
    },
    {
        sequelize,
        modelName: "city",
        indexes: [
            {
                unique: false,
                fields: ["h3_0"]
            },
            {
                unique: false,
                fields: ["h3_1"]
            },
            {
                unique: false,
                fields: ["h3_2"]
            },
            {
                unique: false,
                fields: ["h3_3"]
            },
            {
                unique: false,
                fields: ["h3_4"]
            },
            {
                unique: false,
                fields: ["h3_5"]
            },
            {
                unique: false,
                fields: ["h3_6"]
            },
            {
                unique: false,
                fields: ["h3_7"]
            },
            {
                unique: false,
                fields: ["h3_8"]
            },
            {
                unique: false,
                fields: ["h3_9"]
            },
            {
                unique: false,
                fields: ["h3_10"]
            },
            {
                unique: false,
                fields: ["h3_11"]
            },
            {
                unique: false,
                fields: ["h3_12"]
            },
            {
                unique: false,
                fields: ["h3_13"]
            },
            {
                unique: false,
                fields: ["h3_14"]
            },
            {
                unique: false,
                fields: ["h3_15"]
            }
        ]
    }
);

export default City;