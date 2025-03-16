```sh
bun install
bun run dev
```

```sh
bun run deploy
```

```sh
wrangler r2 bucket create duckdb-assets
wrangler r2 object put duckdb-assets/duckdb-eh.wasm --file node_modules/@duckdb/duckdb-wasm/dist/duckdb-eh.wasm
wrangler r2 object put duckdb-assets/duckdb-browser-eh.worker.js --file node_modules/@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js
 ```

```sh
wrangler r2 bucket cors set duckdb-assets --file=cors.json
```
