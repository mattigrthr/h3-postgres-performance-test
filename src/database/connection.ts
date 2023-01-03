import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
    'h3_performance_test',
    'postgres',
    'password',
    {
        host: 'localhost',
        dialect: 'postgres'
    }
)

export const connectToDatabase = async () => {
    await sequelize.authenticate({ logging: false });
    console.info("🎉 Successfully connected to database")
}