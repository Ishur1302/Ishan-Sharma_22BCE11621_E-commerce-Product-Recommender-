// Shim to satisfy builds when ./types is not generated yet
// Do not rely on this in production.
declare module "./types" {
  export type Database = any;
}
