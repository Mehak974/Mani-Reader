-- Fix #12: Deduplicate GuestUser.deviceId and enforce uniqueness
-- Step 1: Delete duplicate rows, keeping the most recently active record per deviceId
DELETE FROM "guest_users"
WHERE "id" NOT IN (
  SELECT DISTINCT ON ("deviceId") "id"
  FROM "guest_users"
  WHERE "deviceId" IS NOT NULL
  ORDER BY "deviceId", "lastActive" DESC
);

-- Step 2: Drop the non-unique index (was added as a workaround)
DROP INDEX IF EXISTS "guest_users_deviceId_idx";

-- Step 3: Add the proper unique constraint
CREATE UNIQUE INDEX "guest_users_deviceId_key" ON "guest_users"("deviceId");
