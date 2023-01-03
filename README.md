# H3 Postgres performance test

A series of tests to assess the performance of H3 on Postgres

## Starting the database

First, make sure you have Docker running. Then, from within the root directory, run the following command:

```zsh
docker-compose --profile database up
```

### Resources

For generating our test workloads, we're using the coordinates of cities with more than 1,000 inhabitants.
The CSV file `resources/geonames-all-cities-with-a-population-1000.csv` was downloaded from [opendatasoft](https://public.opendatasoft.com/explore/dataset/geonames-all-cities-with-a-population-1000/information/?disjunctive.cou_name_en&sort=name) and is based on the [GeoNames](https://www.geonames.org/about.html) dataset from the 10th December 2022. The data has been published under the [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) licence.