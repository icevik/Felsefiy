#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
npx prisma db push --accept-data-loss

echo "🚀 Starting application..."
exec npm run dev
