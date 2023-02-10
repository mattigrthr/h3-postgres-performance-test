import { parse } from "csv-parse";
import fs from "fs"
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from "./database/connection";
import cliProgress from 'cli-progress';
import colors from 'ansi-colors';
import _ from "lodash"; 

type Query = {
    id: string,
    query: string,
    type: "H3" | "POSTGIS"
}

// Average edge lengths are taken from here: https://h3geo.org/docs/core-library/restable/#edge-lengths
// The index position of the array corresponds with the H3 resolution
const h3EdgeLenghtsInM = [
    1107712.591,
    418676.0055,
    158244.6558,
    59810.85794,
    22606.3794,
    8544.408276,
    3229.482772,
    1220.629759,
    461.354684,
    174.375668,
    65.907807,
    24.910561,
    9.415526,
    3.559893,
    1.348575,
    0.509713
];

const runQueries = async (queries: Query[]) => {
    console.info("🌋 Executing SQL queries");
    const b1 = new cliProgress.SingleBar({
        format: 'CLI Progress |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Queries || Duration: {duration_formatted}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });
    let h3ExecutionTime = 0;
    let postgisExecutionTime = 0;
    const addExecutionTime = (type: "H3" | "POSTGIS", executionTime?: number) => {
        if (!!executionTime) {
            if (type === "H3") {
                h3ExecutionTime += executionTime;
            } else {
                postgisExecutionTime += executionTime;
            }
        }
    }

    b1.start(queries.length, 0, {});

    for (const query of queries) {
        await sequelize.query(
            query.query, 
            { 
                benchmark: true, 
                logging: (_message, executionTime) => { addExecutionTime(query.type, executionTime) }
            }
        );
        b1.increment();
    }

    b1.stop();

    console.log("✅ Ran all queries");
    console.log(`H3 execution: ${new Date(h3ExecutionTime).toISOString().slice(11, 19)}`)
    console.log(`Postgis execution: ${new Date(postgisExecutionTime).toISOString().slice(11, 19)}`)
}

export const runCityPerformanceTest = async () => {
    return new Promise((resolve, reject) => {
        console.info("🦠 Generating SQL queries");

        const readStream = fs.createReadStream("tmp/workloads/random_cities.csv");
        const queries: Query[][] = [];
    
        readStream.pipe(parse({ 
            delimiter: ";", 
            from: 2, 
            columns: ["id", "lat", "lng", "h3_0", "h3_1", "h3_2", "h3_3", "h3_4", "h3_5", "h3_6", "h3_7", "h3_8", "h3_9", "h3_10", "h3_11", "h3_12", "h3_13", "h3_14", "h3_15"]
        }))
            .on("data", (row) => {
                const h3Queries: Query[] = [];
                const postgisQueries: Query[] = [];

                for (let i = 0; i < 16; i += 1) {
                    h3Queries.push({id: uuidv4(), type: "H3", query: `SELECT SUM(population) FROM cities GROUP BY h3_${i} HAVING h3_${i} = '${row[`h3_${i}`]}'`})
                    postgisQueries.push({id: uuidv4(), type: "POSTGIS", query: `SELECT SUM(population) FROM cities WHERE ST_DISTANCESPHEROID(point, ST_SETSRID(ST_MAKEPOINT(lng, lat), 4326), 'SPHEROID["WGS 84",6378137,298.257223563]') <= ${h3EdgeLenghtsInM[i]}`})
                }

                queries.push([h3Queries, postgisQueries].flat());
            })
            .on("end", async () => {
                await runQueries(_.shuffle(queries.flat()));
                
                return resolve(true);
            });
    })
}