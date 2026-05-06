declare module 'sql.js' {
  export interface Database {
    run(sql: string, params?: unknown[]): void
    exec(sql: string): Array<{ values: unknown[][] }>
  }
  export interface SqlJsStatic {
    Database: new () => Database
  }
  export default function initSqlJs(): Promise<SqlJsStatic>
}
