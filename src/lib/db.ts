import { Pool, PoolConfig, types } from "pg";

const dbConfig: PoolConfig = {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    database: process.env.DB_DATABASE!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    max: 20,
};

types.setTypeParser(types.builtins.NUMERIC, (val) => parseFloat(val));
types.setTypeParser(types.builtins.INT8, (val) => parseInt(val));
types.setTypeParser(types.builtins.INT4, (val) => parseInt(val));
types.setTypeParser(types.builtins.JSONB, (val) => JSON.parse(val));
const pool = new Pool(dbConfig);

export async function query<T>(
    text: string,
    params?: Array<any>
): Promise<Array<T>> {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);

        return result.rows as unknown as Array<T>;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        client.release();
    }
}

export function buildEqualityFilter(
    params: {
        key: string;
        value: string | number | boolean | JSON | null | undefined;
    }[]
): {
    filterQuery: string;
    queryParams: any[];
} {
    const presentParams = params.filter((p) => p.value);
    if (presentParams.length == 0) {
        return { filterQuery: ``, queryParams: [] };
    } else {
        return {
            filterQuery: `WHERE
  ${presentParams
      .map((param, ind) => `${param.key} = $${ind + 1}`)
      .join(` AND `)}
  `,
            queryParams: presentParams.map((p) => p.value),
        };
    }
}
