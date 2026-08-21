-- CreateTable
CREATE TABLE "assistant_telemetry_events" (
    "id" TEXT NOT NULL,
    "assistant" VARCHAR(64) NOT NULL,
    "eventType" VARCHAR(64) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assistant_telemetry_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assistant_telemetry_events_createdAt_idx" ON "assistant_telemetry_events"("createdAt");

-- CreateIndex
CREATE INDEX "assistant_telemetry_events_assistant_eventType_createdAt_idx" ON "assistant_telemetry_events"("assistant", "eventType", "createdAt");
