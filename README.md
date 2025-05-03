# Wix External Database Adaptor for PostgreSQL

This is an external database adaptor for connecting Wix Studio with a PostgreSQL database.

## Endpoints

- `/provision`: Initializes the connection.
- `/listSchemas`: Lists available collections (feedbacks).
- `/get`: Retrieves an item by _id.
- `/find`: Retrieves items by filter.
- `/count`: Counts items based on a filter.

## Deployment

To deploy, simply push this repo to Render or any Node.js hosting platform and set environment variables as provided in `.env`.
