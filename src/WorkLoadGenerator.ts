import fs from "fs"
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { latLngToCell } from "h3-js";
import City from "./database/models/City";
import { sequelize } from "./database/connection";
import { QueryTypes } from "sequelize";

type CityObject = {
    name: string;
    population: number;
    lat: number;
    lng: number;
    point: {
        type: string;
        coordinates: number[];
    };
    h3_0: string;
    h3_1: string;
    h3_2: string;
    h3_3: string;
    h3_4: string;
    h3_5: string;
    h3_6: string;
    h3_7: string;
    h3_8: string;
    h3_9: string;
    h3_10: string;
    h3_11: string;
    h3_12: string;
    h3_13: string;
    h3_14: string;
    h3_15: string;
}

const getRandomCities = async () => {
    return new Promise(async (resolve, reject) => {
        console.info("🧺 Picking random cities");

        const randomCities = await sequelize.query(
            "SELECT id, lat, lng, h3_0, h3_1, h3_2, h3_3, h3_4, h3_5, h3_6, h3_7, h3_8, h3_9, h3_10, h3_11, h3_12, h3_13, h3_14, h3_15 FROM cities ORDER BY RANDOM() LIMIT 10000",
            {
                logging: false,
                raw: true,
                type: QueryTypes.SELECT
            });

        stringify(randomCities, { header: true, delimiter: ";" }, (error, output) => {
            if (error) {
                return reject(error);
            }

            fs.mkdirSync("tmp/workloads", { recursive: true })
            fs.writeFile("tmp/workloads/random_cities.csv", output, (error) => {
                if (error) {
                    return reject(error)
                }

                console.info("✅ Picked random cities");

                return resolve(true)
            })
        })
    })
}

export const generateCityWorkLoad = async () => {
    return new Promise<void>((resolve, reject) => {
        console.info("🧬 Loading city data");

        const cities: CityObject[] = [];
        const parser = parse({
            delimiter: ':'
          });
          parser.read()
        const readStream = fs.createReadStream("resources/geonames-all-cities-with-a-population-1000.csv");
    
        readStream.pipe(parse({ 
            delimiter: ";", 
            from: 2,
            columns: ['geoname_id', 'name', 'ascii_name', 'alternate_names', 'feature_class', 'feature_code', 'country_code', 'country_name_en', 'country_code_2', 'admin_1_code', 'admin_2_code', 'admin_3_code', 'admin_4_code', 'population', 'elevation', 'digital_elevation_model', 'timezone', 'modification_date', 'label_en', 'coordinates'] 
        }))
            .on("data", function (row) {
                const coordinatesSplit = row.coordinates.split(',')
                const lat = parseFloat(coordinatesSplit[0]);
                const lng = parseFloat(coordinatesSplit[1]);
                const city: CityObject = { 
                    name: row.ascii_name, 
                    population: parseInt(row.population), 
                    lat,
                    lng,
                    point: { type: "Point", coordinates: [lng, lat]},
                    h3_0: latLngToCell(lat, lng, 0),
                    h3_1: latLngToCell(lat, lng, 1),
                    h3_2: latLngToCell(lat, lng, 2),
                    h3_3: latLngToCell(lat, lng, 3),
                    h3_4: latLngToCell(lat, lng, 4),
                    h3_5: latLngToCell(lat, lng, 5),
                    h3_6: latLngToCell(lat, lng, 6),
                    h3_7: latLngToCell(lat, lng, 7),
                    h3_8: latLngToCell(lat, lng, 8),
                    h3_9: latLngToCell(lat, lng, 9),
                    h3_10: latLngToCell(lat, lng, 10),
                    h3_11: latLngToCell(lat, lng, 11),
                    h3_12: latLngToCell(lat, lng, 12),
                    h3_13: latLngToCell(lat, lng, 13),
                    h3_14: latLngToCell(lat, lng, 14),
                    h3_15: latLngToCell(lat, lng, 15)
                }
    
                cities.push(city);
            })
            .on("error", () => {
                reject();
            })
            .on("end", async () => {
                await City.bulkCreate(cities, { logging: false });
                console.info("✅ Successfully loaded city data");
                await getRandomCities();
    
                resolve();
            });
    });
}