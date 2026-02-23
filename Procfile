web: python backend/run.py
worker: python backend/worker.py
scheduler: python backend/scheduler.py
iztro: cd backend/iztro_service && npm install --omit=dev && node index.js
redis: redis-server --save 60 1 --loglevel warning
