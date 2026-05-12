/**
 * Initialize MongoDB indexes for chat collections
 * Run: npx tsx scripts/init-chat-indexes.ts
 */

import { getDb } from '../src/lib/mongodb';

async function initChatIndexes() {
  console.log('🔧 Initializing chat indexes...');

  try {
    const db = await getDb();

    // ─────────────────────────────────────────────────────────────────────────────
    // Conversations Collection
    // ─────────────────────────────────────────────────────────────────────────────

    const conversationsCollection = db.collection('conversations');

    console.log('📝 Creating indexes for conversations collection...');

    // Unique index on conversationKey
    await conversationsCollection.createIndex(
      { conversationKey: 1 },
      { unique: true, name: 'idx_conversation_key' }
    );
    console.log('✅ Created unique index on conversationKey');

    // Index on participantIds for quick lookup
    await conversationsCollection.createIndex(
      { participantIds: 1 },
      { name: 'idx_participant_ids' }
    );
    console.log('✅ Created index on participantIds');

    // Index on updatedAt for sorting
    await conversationsCollection.createIndex(
      { updatedAt: -1 },
      { name: 'idx_updated_at' }
    );
    console.log('✅ Created index on updatedAt');

    // Compound index for active conversations
    await conversationsCollection.createIndex(
      { participantIds: 1, updatedAt: -1 },
      { name: 'idx_participant_updated' }
    );
    console.log('✅ Created compound index on participantIds + updatedAt');

    // ─────────────────────────────────────────────────────────────────────────────
    // Messages Collection
    // ─────────────────────────────────────────────────────────────────────────────

    const messagesCollection = db.collection('messages');

    console.log('📝 Creating indexes for messages collection...');

    // Compound index on conversationId + createdAt for pagination
    await messagesCollection.createIndex(
      { conversationId: 1, createdAt: -1 },
      { name: 'idx_conversation_created' }
    );
    console.log('✅ Created compound index on conversationId + createdAt');

    // Index on senderId
    await messagesCollection.createIndex(
      { senderId: 1 },
      { name: 'idx_sender_id' }
    );
    console.log('✅ Created index on senderId');

    // Index on isDeleted for filtering
    await messagesCollection.createIndex(
      { isDeleted: 1 },
      { name: 'idx_is_deleted' }
    );
    console.log('✅ Created index on isDeleted');

    // ─────────────────────────────────────────────────────────────────────────────
    // Chat Reports Collection
    // ─────────────────────────────────────────────────────────────────────────────

    const chatReportsCollection = db.collection('chat_reports');

    console.log('📝 Creating indexes for chat_reports collection...');

    // Compound index on status + createdAt for admin dashboard
    await chatReportsCollection.createIndex(
      { status: 1, createdAt: -1 },
      { name: 'idx_status_created' }
    );
    console.log('✅ Created compound index on status + createdAt');

    // Index on conversationId
    await chatReportsCollection.createIndex(
      { conversationId: 1 },
      { name: 'idx_conversation_id' }
    );
    console.log('✅ Created index on conversationId');

    // Index on reporterId
    await chatReportsCollection.createIndex(
      { reporterId: 1 },
      { name: 'idx_reporter_id' }
    );
    console.log('✅ Created index on reporterId');

    console.log('');
    console.log('✨ All chat indexes created successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('  - Conversations: 4 indexes');
    console.log('  - Messages: 3 indexes');
    console.log('  - Chat Reports: 3 indexes');
    console.log('');

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
}

// Run the script
initChatIndexes()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
