# MongoDB Atlas Deployment

This backend is wired for MongoDB Atlas and Render.

## Render settings

- Root Directory: `backend`
- Build Command:

```bash
npm install --include=dev && npm run build
```

- Start Command:

```bash
npm start
```

## Required environment variables

Set these in the Render service environment, not in a committed `.env` file.

```env
NODE_ENV=production
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority&appName=progloss
JWT_SECRET=<strong-random-secret>
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

If you use the repo-level `render.yaml`, Render will apply the same settings automatically:

- `rootDir: backend`
- `buildCommand: npm install --include=dev && npm run build`
- `startCommand: npm start`

## Optional Atlas tuning

```env
DNS_SERVERS=1.1.1.1,8.8.8.8
MONGO_APP_NAME=progloss
MONGO_MAX_POOL_SIZE=10
MONGO_SERVER_SELECTION_TIMEOUT_MS=10000
MONGO_CONNECT_TIMEOUT_MS=10000
MONGO_RETRY_WRITES=true
JWT_ACCESS_EXPIRES=45m
JWT_REFRESH_EXPIRES_DAYS=30
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## Atlas network access

- Add your Render outbound IP ranges to Atlas Network Access if you restrict IPs.
- For testing, you can temporarily allow broader access, then lock it down again.
- Make sure the Atlas cluster is not paused.
- If you use an SRV URI, keep `DNS_SERVERS=1.1.1.1,8.8.8.8` or your preferred resolvers available in the service env.

## Notes

- Do not set `PORT` on Render; the platform injects it automatically.
- Production deployments must use an Atlas URI that starts with `mongodb+srv://`.
- The backend config sets DNS resolvers for Atlas automatically and uses tuned Mongoose connection options for Render.