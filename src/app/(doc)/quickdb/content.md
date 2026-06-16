## 🚀 Why QuickDB?

QuickDB turns VS Code into a powerhouse database management tool. Whether you're inspecting data, visualizing relationships, or letting AI write your queries, QuickDB provides a seamless, context-rich experience without ever leaving your editor.

### ✨ Key Features at a Glance

- **Universal Database Support:** Connect to PostgreSQL, MySQL, SQLite, MongoDB, and Redis—all from a single unified interface.
- **AI-Ready with Built-In MCP Server:** Instantly expose your database schema and data to AI agents like Cursor, Claude Desktop, Antigravity, Windsurf, and more.
- **Visual Query Builder:** Construct complex queries, joins, and aggregations visually—no SQL required.
- **Powerful Table Manager:** Create, modify, and visualize your schema with an intuitive UI.
- **Relationship Navigation:** Follow foreign keys by clicking—jump to a referenced row or list every row that references it, no manual `JOIN`s.
- **Data Visualization:** Instantly chart any query result into stunning, exportable Ant Design Plots graphs.
- **Import & Export:** Move data easily between SQL dumps, JSON, CSV, and Excel.

## 📸 See It in Action

### Database Management & Imports

Easily connect to your servers and import data seamlessly.

![Connect server and import database](https://nazmulhaque.netlify.app/gifs/quickdb/connect-server-import-database.gif)

### Visual Query Builder

Build complex SQL queries visually without writing code.

![Query Builder demo](https://nazmulhaque.netlify.app/gifs/quickdb/query-builder.gif)

### Connect with External AI Clients

Connect QuickDB to your favorite AI assistant (Cursor, Claude Desktop, JetBrains AI, Windsurf, Continue, etc.) in just a few clicks:

1. **Open the Setup Panel:** Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux) and run `QuickDB: Setup MCP Server`.
2. **Select Connections:** Choose which databases you want the AI to have access to.
3. **Copy Snippet:** Click "Copy snippet" on the card matching your AI client.
4. **Paste & Restart:** Paste the JSON into your client's config file and restart the client.

![External client setup](https://nazmulhaque.netlify.app/gifs/quickdb/external-client-setup.gif)

## 🏁 Getting Started

### 📦 Installation

1. **Open VS Code** and navigate to the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
2. **Search** for `"QuickDB"`.
3. **Click Install** on the QuickDB extension.

> **Note:** After installation, a new **QuickDB icon** will appear in your Activity Bar (left sidebar). Click it to open the connections view.

### ⚡ Quick Start (Adding a Database)

Follow these steps to connect your first database:

1. **Open the Panel:** Click the QuickDB icon in the sidebar.
2. **Add a Connection:** Click the **`+`** icon at the top of the panel, or run `QuickDB: Add Connection` from the Command Palette.
3. **Provide Details:** Select your database engine (PostgreSQL, MySQL, MongoDB, SQLite, or Redis) and fill in your connection credentials.
4. **Test & Save:** Click **Test connection** to verify your details, then click **Create connection** to save it.
5. **Explore:** Your new database will appear in the tree view. Expand it and click any table to start browsing and editing data!

## Supported Databases

QuickDB supports **54 driver families** spanning SQL, NoSQL, graph, time-series, vector, file-format, stream, and cloud-analytics engines.

### SQL & Relational

| Database      | Default Port | Notes                                                        |
| ------------- | ------------ | ------------------------------------------------------------ |
| SQLite        | N/A          | File-based, supports `:memory:`                              |
| MySQL         | 3306         | Full INFORMATION_SCHEMA; multi-database browsing             |
| PostgreSQL    | 5432         | SSL/TLS; multi-database; FK-aware autocomplete               |
| SQL Server    | 1433         | Azure SQL & Synapse; schema-qualified tables (`dbo.table`)   |
| ClickHouse    | 8123         | HTTP interface; multi-database; backtick quoting             |
| Cassandra     | 9042         | CQL; keyspace browsing; ScyllaDB compatible                  |
| Trino         | 8080         | Catalog browsing; `OFFSET n LIMIT m` pagination              |
| libSQL        | —            | Remote Turso URLs (auth token in password field)             |
| Vertica       | 5433         | v_catalog introspection; PostgreSQL-like SQL                 |
| Apache Druid  | 8888         | SQL over HTTP (router endpoint)                              |
| Apache Pinot  | 9000         | SQL over HTTP (controller endpoint)                          |
| Snowflake     | 443          | Account id in host field; multi-database (SHOW DATABASES)    |
| Oracle        | 1521         | Thin mode — no Oracle Client install required; OFFSET/FETCH  |
| Firebird      | 3050         | RDB$RELATIONS schema; FIRST n SKIP m pagination              |
| Cloudflare D1 | —            | REST API; account/db ids; SQLite-compatible SQL              |
| DuckDB        | —            | In-process analytics; filepath or `:memory:`; MotherDuck cloud via token |
| PGlite        | —            | WASM in-process PostgreSQL; filepath for persistent storage or blank for `:memory:` |
| Exasol        | 8563         | In-memory analytics; WebSocket driver; schema-qualified tables |
| Apache Hive   | 10000        | HiveServer2 Thrift protocol; Impala compatible               |
| IBM DB2       | 50000        | TCP probe; ibm_db native module required for full query execution |
| Dameng        | 5236         | TCP probe; Dameng Node.js driver required for full query execution |
| Apache Derby  | 1527         | TCP probe; JVM/JDBC required for full query execution        |
| H2            | 9092         | TCP probe; JVM/JDBC required; use H2 Console on port 8082     |
| MS Access     | —            | File probe (.accdb/.mdb); Windows ODBC required for query execution |

### Cloud Analytics & Data Warehouses

| Database            | Default Port | Notes                                                       |
| ------------------- | ------------ | ----------------------------------------------------------- |
| Databricks          | 443          | Unity Catalog; workspace URL as host; PAT as password       |
| Amazon Athena       | 443          | SigV4 auth; region as host; access key/secret as user/password |
| Google BigQuery     | 443          | StandardSQL REST; service account JSON in password field    |
| Google Spanner      | 443          | Standard SQL REST; project-id/instance-id as host           |
| Salesforce          | 443          | SOQL REST; username + password+securitytoken                |
| Microsoft Dataverse | 443          | OData v4 REST; Entra client-cred JSON in password field     |

### NoSQL / Document

| Database           | Default Port | Notes                                                     |
| ------------------ | ------------ | --------------------------------------------------------- |
| MongoDB            | 27017        | Connection string or host/port; multi-database browsing   |
| Redis              | 6379         | All data types: strings, hashes, lists, sets, sorted sets |
| SurrealDB          | 8000         | SurrealQL; database field takes `namespace/database`      |
| CouchDB            | 5984         | Mango JSON queries; multi-database browsing               |
| RavenDB            | 8080         | RQL over HTTP; multi-database; collection stats           |
| Couchbase          | 8093         | N1QL query service; keyspace browsing                     |
| Amazon DynamoDB    | —            | PartiQL; region in host field, access key as user         |
| Firebase Firestore | 443          | Structured Query REST; project-id as host; service account JSON |
| Memcached          | 11211        | Key-value store; stats + GET/SET in console               |
| Aerospike          | 3000         | Native client; namespaces as databases, sets as tables    |
| TypeDB             | 1729         | TypeQL via typedb-driver; entity types browsable          |

### Message Streams & Queues

| System       | Default Port | Notes                                                        |
| ------------ | ------------ | ------------------------------------------------------------ |
| Apache Kafka | 9092         | kafkajs admin API; topics as tables; partition metadata view |
| RabbitMQ     | 15672        | HTTP Management API; vhosts as databases, queues as tables   |

### Time-Series, Search & Graph

| Database      | Default Port | Notes                                          |
| ------------- | ------------ | ---------------------------------------------- |
| InfluxDB      | 8086         | InfluxQL (v1 + v1-compat); tags/fields as cols |
| Elasticsearch | 9200         | SQL endpoint; OpenSearch compatible            |
| Neo4j         | 7687         | Cypher / Bolt; Memgraph compatible             |

### Vector

| Database | Default Port | Notes                                                 |
| -------- | ------------ | ----------------------------------------------------- |
| Qdrant   | 6333         | Collections + payload schema; JSON scroll             |
| Weaviate | 8080         | Classes as collections; GraphQL console               |
| ChromaDB | 8000         | REST v2; `tenant/database` in database field          |
| Milvus   | 19530        | REST API v2; JSON filter queries                      |
| Pinecone | 443          | REST API v3; API key as password; JSON vector queries |
| LanceDB  | 8080         | REST server; JSON query bodies                        |

### File Formats

| Format  | Notes                                                  |
| ------- | ------------------------------------------------------ |
| CSV     | Loaded into in-memory SQLite at connect time           |
| Excel   | Each sheet becomes a table; full SQL surface           |
| Parquet | Columnar file format; filepath required                |
| Avro    | Serialization format; filepath required; schema-aware  |

### Protocol-compatible engines

Engines that speak the MySQL or PostgreSQL wire protocol connect through the same drivers — pick them by name in the connection form:

| Protocol          | Engines                                                                                |
| ----------------- | -------------------------------------------------------------------------------------- |
| MySQL             | MariaDB, TiDB (4000), SingleStore, StarRocks (9030), Apache Doris (9030)                |
| PostgreSQL        | CockroachDB (26257), Timescale, Amazon Redshift (5439), Greenplum, QuestDB (8812), RisingWave (4566), YugabyteDB (5433), KingbaseES (54321) |
| TDS               | SQL Server, Azure SQL, Azure Synapse, Microsoft Fabric                                 |
| CQL               | Cassandra, ScyllaDB                                                                     |
| ES HTTP           | Elasticsearch, OpenSearch                                                               |
| Bolt              | Neo4j, Memgraph                                                                         |
| DuckDB            | DuckDB (local file / `:memory:`), MotherDuck (cloud), DuckLake (catalog), Apache Iceberg |
| Hive              | Apache Hive, Apache Impala (HiveServer2 protocol)                                       |
| PostgreSQL (also) | Netezza (5480), SAP ASE/Sybase (TDS via mssql), IBM i (db2 family)                      |

## Connection Management

### Adding a Connection

1. Open the QuickDB sidebar
2. Click the **+** button or run `QuickDB: Add Connection`
3. Select the database type from the available options
4. Fill in the required fields, then **Test connection** and **Create connection**

### Color Coding

Assign a color to each connection for quick visual distinction:

| Color  | Suggested Use |
| ------ | ------------- |
| Red    | Production    |
| Orange | Staging       |
| Yellow | Warning       |
| Green  | Development   |
| Blue   | Default       |
| Purple | Testing       |

Production connections (red) show a warning indicator in the tree view.

### Editing, Removing & Filtering

- **Edit:** Right-click a connection → Edit Connection
- **Remove:** Right-click a connection → Remove Connection
- **Refresh:** Right-click a connection → Refresh, or press `F5`
- **Filter tables:** Type in the **Find table…** input below the connection name to filter the table list live.

## Table Viewer

The Table Viewer is the primary data browsing interface. Click any table in the sidebar tree to open it.

### View Modes

| Mode      | Icon | Description                      |
| --------- | ---- | -------------------------------- |
| Table     | #    | Standard grid view (default)     |
| Transpose | T    | Rows displayed as columns        |
| Text      | A    | Plain text / export-ready format |
| Tree      | >    | Hierarchical tree view           |

### Editing Data

- **Edit a cell:** Click on a cell and type the new value
- **Add a row:** Click **+ Add** in the toolbar or press `Ctrl+N`
- **Delete rows:** Select rows, then click **- Delete** or press `Del`
- **Set NULL:** Right-click a cell → Set NULL (`Ctrl+Alt+N`)
- **Save:** Click **Save** or press `Ctrl+S`; **Preview SQL** (`Ctrl+P`) shows the generated DML before applying.

### Relationship Navigation

QuickDB reads foreign keys from your schema (SQLite, MySQL, PostgreSQL) and turns key cells into clickable links — no manual `JOIN`s. Hover a cell to reveal the relationship actions:

- **Jump to the referenced row (↗):** On a foreign-key cell, opens the parent table in a new tab, pre-filtered to that key.
- **Show referencing rows (branch icon):** On a primary-key cell, opens the child table filtered to rows that point back to this one.

**Inferred relationships:** For schemas without declared foreign keys (MongoDB especially), QuickDB infers links by naming convention — a column like `user_id` is matched to the `users` collection (with singular/plural handling). Declared foreign keys always take precedence.

## Query Console

Run arbitrary queries against your database.

### Toolbar

| Button        | Description                                                                  |
| ------------- | ---------------------------------------------------------------------------- |
| **Run**       | Run the selected text, or the statement at the cursor (`Ctrl/Cmd+Enter`)     |
| **Run all**   | Run every statement in the editor                                            |
| **Explain**   | Wrap the current statement in `EXPLAIN` and run it to see the query plan      |
| **Ask AI**    | Hand the current query off to the `@quickdb` chat assistant                  |
| **Format**    | Pretty-print the SQL                                                         |
| **Save**      | Pin the current query to your Saved library                                  |
| **History**   | Toggle the panel showing past executions                                     |
| **Schema**    | Toggle the schema browser side panel                                         |
| **Read-only** | When on, only read statements may run — writes are blocked                   |

Destructive statements (`DROP TABLE`, `DROP DATABASE`, `TRUNCATE`, and unscoped `DELETE` / `UPDATE`) prompt for confirmation before running.

### Editor

- **Context-aware autosuggest** offers only what's valid at the cursor — tables after `FROM`/`JOIN`, columns after `SELECT`, etc. Use `Ctrl/Cmd+Space` to force open; `Tab` / `Enter` accepts.
- **Type `table.`** to list that table's columns instantly.
- **Foreign-key JOIN completion** offers related tables with a ready-made `ON` clause.
- **Live, dialect-aware validation** flags unknown tables/columns, unbalanced parens, `= NULL`, cross joins, and more, underlining the offending word.
- **Smart error fixes** suggest the closest real identifier (**Did you mean `…`?**) or hand the failing query to the `@quickdb` chat assistant.

### MongoDB

```
db.users.find({"role": "admin"})
db.users.insertOne({"name": "Alice", "role": "user"})
db.users.aggregate([{"$group": {"_id": "$role", "count": {"$sum": 1}}}])
```

Supported methods: `find`, `findOne`, `insertOne`, `insertMany`, `updateOne`, `updateMany`, `deleteOne`, `deleteMany`, `countDocuments`, `aggregate`, `distinct`.

### Redis

```
GET mykey
SET mykey "hello world"
HGETALL myhash
LRANGE mylist 0 -1
ZRANGE myzset 0 -1 WITHSCORES
```

## Visual Query Builder

Build complex SQL queries visually without writing code.

![Query Builder demo](https://nazmulhaque.netlify.app/gifs/quickdb/query-builder.gif)

### Features

- **Drag-to-join:** drag from a column in one table to a column in another to wire up the `ON` clause.
- **Custom subqueries:** use a custom SQL subquery as the main table or a joined table.
- **Joins:** `INNER`, `LEFT`, `RIGHT`, `FULL` — configure type, columns, and aliases.
- **Filters (WHERE / HAVING):** nested AND/OR groups with operators `=`, `!=`, `<`, `>`, `LIKE`, `IN`, `BETWEEN`, `IS NULL`, …
- **Sorting & pagination:** drive `ORDER BY` and `LIMIT/OFFSET` from the column picker.
- **SQL Preview + Results side-by-side**, separated by a draggable splitter.

## Table Manager

Create and modify database tables with a visual interface.

### Creating a Table

1. Right-click a connection → Create Table
2. Enter the table name
3. Add columns with name & type, primary key / auto-increment, nullable / unique constraints, default values, comments, check constraints, and generated columns.

### Index Management

- View all indexes for a table
- Create new indexes (unique or non-unique)
- Drop existing indexes

## Import & Export

Move data between QuickDB and `.sql` / `.json` / `.csv` / `.xlsx` files. Right-click a connection for **Export Database** / **Import Database**, or a table for **Export Table** / **Import to Table**.

![Connect server and import database](https://nazmulhaque.netlify.app/gifs/quickdb/connect-server-import-database.gif)

### Export

- **SQL** — schema + data dump (toggle DROP statements / schema-only).
- **JSON** — one file containing every selected table.
- **CSV** — one CSV file per table.
- **Excel (xlsx)** — one workbook with one sheet per table.

### Import

- **SQL** — replays statements (uses the native `mysql`/`psql`/`sqlite` CLI when available, falling back to the internal parser).
- **JSON / XLSX / CSV** — streamed into the destination database with bounded memory usage.

## Data Compare

Compare data between two tables or connections.

1. Open via the Command Palette: `QuickDB: Compare Data`
2. Select source and target connections/tables
3. View differences highlighted in the comparison grid

## Copy to Database

Copy table data from one database to another.

1. Open via the Command Palette: `QuickDB: Copy to Database`
2. Select the source table
3. Choose the target connection and copy options, then **Execute**

## Data Visualization

Chart any query result, save the chart, and download it as PNG / SVG / HTML / spec JSON. The same engine renders charts inside the extension and answers AI requests via the MCP server.

![Use MCP to make a chart](https://nazmulhaque.netlify.app/gifs/quickdb/use-mcp-to-make-chart.gif)

### Two modes

- **Template mode** (default): pick a chart type (`bar`, `line`, `area`, `pie`, `scatter`, `histogram`, `heatmap`, `boxplot`, …) and map columns to X / Y / Group-by / Aggregation.
- **Spec mode:** paste any config from the Ant Design Plots gallery; your data fills `data` automatically.

### Download formats

| Format | What you get                                                |
| ------ | ----------------------------------------------------------- |
| SVG    | Vector text — sharp at any zoom.                            |
| HTML   | Standalone, shareable HTML that loads Ant Design Plots.     |
| JSON   | The Ant Design Plots config itself.                         |

## MCP Server Integration

QuickDB includes a Model Context Protocol (MCP) server that enables AI tools to interact with your databases.

![MCP server setup panel](https://nazmulhaque.netlify.app/gifs/quickdb/external-client-setup.gif)

### Available MCP Tools

| Tool                       | Description                                               | Type  |
| -------------------------- | --------------------------------------------------------- | ----- |
| `quickdb_list_connections` | List all saved database connections                       | Read  |
| `quickdb_list_tables`      | List tables for a connection                              | Read  |
| `quickdb_describe_table`   | Get column details for a table                            | Read  |
| `quickdb_execute_query`    | Execute a read-only SQL/MongoDB/Redis query               | Read  |
| `quickdb_execute_write`    | Execute a write SQL query (see safety rules)              | Write |
| `quickdb_get_schema`       | Get full database schema                                  | Read  |
| `quickdb_get_rows`         | Get rows with filtering, sorting, pagination              | Read  |
| `quickdb_count_rows`       | Count rows with optional filter                           | Read  |
| `quickdb_search_value`     | Search for text across columns                            | Read  |
| `quickdb_insert_row`       | Insert a row — returns the inserted row with auto-IDs     | Write |
| `quickdb_update_rows`      | Update rows matching a filter (filter required)           | Write |
| `quickdb_delete_rows`      | Delete rows matching a filter (filter required)           | Write |
| `quickdb_visualize_query`  | Run SQL and render the result as an Ant Design Plots chart | Read  |
| `quickdb_chart_types`      | List supported chart templates + example specs            | Read  |

### Safety rules

- **`quickdb_execute_query`** allows only read forms: `SELECT`, `SHOW`, `DESCRIBE`, `EXPLAIN`, `VALUES`, `TABLE`, and `WITH … SELECT`.
- **`quickdb_execute_write`** refuses `DROP DATABASE`/`DROP SCHEMA`, `TRUNCATE`, and unscoped `DELETE` / `UPDATE` by default. Set `QUICKDB_ALLOW_DESTRUCTIVE=1` to opt out.
- **`quickdb_update_rows` / `quickdb_delete_rows`** require a non-empty `filter`.
- **Row cap:** structured read tools are hard-capped at 500 rows per call (default 100).
- **Per-call timeout:** every query has a wall-clock timeout (default 30 s), overridable via `QUICKDB_QUERY_TIMEOUT_MS`.

### Environment variables (stdio server)

| Variable                    | Default | Effect                                                          |
| --------------------------- | ------- | --------------------------------------------------------------- |
| `QUICKDB_CONNECTIONS`       | (unset) | JSON array of connections to seed the server on startup         |
| `QUICKDB_LOG_LEVEL`         | `info`  | `debug` \| `info` \| `warn` \| `error` — stderr verbosity       |
| `QUICKDB_ALLOW_DESTRUCTIVE` | (unset) | Set to `1` to allow destructive statements                      |
| `QUICKDB_QUERY_TIMEOUT_MS`  | `30000` | Per-tool-call query timeout in milliseconds                     |
