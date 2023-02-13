import { parse } from "csv-parse";
import fs from "fs"
import { sequelize } from "./database/connection";
import cliProgress from 'cli-progress';
import colors from 'ansi-colors';
import _ from "lodash"; 
import { Query } from "./WorkLoadGenerator";

const readQueries = async (): Promise<Query[]> => {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream("tmp/workloads/random_queries.csv");
        const queries: Query[] = [];
    
        readStream.pipe(parse({ 
            delimiter: ";", 
            from: 2, 
            columns: ["id", "type", "query", "resolution", "lat", "lng"]
        }))
            .on("data", (row) => {
                queries.push(row as Query);
            })
            .on("end", async () => {
                return resolve(queries);
            });
    })
}

const runQueries = async () => {
    console.info("🌋 Executing SQL queries");

    const queries = await readQueries();    
    const b1 = new cliProgress.SingleBar({
        format: 'CLI Progress |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Queries || Duration: {duration_formatted}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });
    const executionTimes = {
        h3: {
            total: 0,
            res0: 0,
            res1: 0,
            res2: 0,
            res3: 0,
            res4: 0,
            res5: 0,
            res6: 0,
            res7: 0,
            res8: 0,
            res9: 0,
            res10: 0,
            res11: 0,
            res12: 0,
            res13: 0,
            res14: 0,
            res15: 0,
        },
        postgis: {
            total: 0,
            res0: 0,
            res1: 0,
            res2: 0,
            res3: 0,
            res4: 0,
            res5: 0,
            res6: 0,
            res7: 0,
            res8: 0,
            res9: 0,
            res10: 0,
            res11: 0,
            res12: 0,
            res13: 0,
            res14: 0,
            res15: 0,
        }
    }

    const addExecutionTime = (query: Query, executionTime?: number) => {
        if (!!executionTime) {
            executionTimes[query.type === "H3" ? "h3" : "postgis"]["total"] += executionTime;
            (executionTimes[query.type === "H3" ? "h3" : "postgis"] as any)[`res${query.resolution}`] += executionTime;
        }
    }

    b1.start(queries.length, 0, {});

    for (const query of queries) {
        await sequelize.query(
            query.query, 
            { 
                benchmark: true, 
                logging: (_message, executionTime) => { addExecutionTime(query, executionTime) }
            }
        );
        b1.increment();
    }

    b1.stop();

    console.log("✅ Ran all queries");
    console.log(`H3 execution: ${new Date(executionTimes.h3.total).toISOString().slice(11, 19)}`);
    console.log(`Postgis execution: ${new Date(executionTimes.postgis.total).toISOString().slice(11, 19)}`);
    console.log("\nTotal");
    console.log(`H3:      ${executionTimes.h3.total} ms`);
    console.log(`Postgis: ${executionTimes.postgis.total} ms`);

    for (let i = 0; i < 16; i += 1) {
        const resKey = `res${i}`;
        console.log(`\nResolution ${i}`);
        console.log(`H3:      ${(executionTimes.h3 as any)[resKey]} ms`);
        console.log(`Postgis: ${(executionTimes.postgis as any)[resKey]} ms`);
    }
}

export const runCityPerformanceTest = async () => {
    await runQueries();
}