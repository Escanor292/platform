/**
 * GET /api/chat/conversations/[conversationId]/messages
 * Get messages for a conversation
 * 
 * POST /api/chat/conversations/[conversationId]/messages
 * Send a message
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMessages, sendMessage } from '@/services/mongodb/chat.service';
import { SendMessageRequest } from '@/types/chat.types';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string} }>
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { conversationId } = await params;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '30');
    const before = searchParams.get('before') || undefined;

    // Get messages
    const result = await getMessages(conversationId, userId, limit, before);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API] Get messages error:', error);
    
    if (error.message === 'Invalid conversation ID') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    if (error.message === 'Conversation not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to get messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ conversationId: string} }>
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { conversationId } = await params;

    // Parse request body
    const body: SendMessageRequest = await request.json();
    const { text } = body;

    // Validate input
    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400 }
      );
    }

    // Send message
    const message = await sendMessage(conversationId, userId, text);

    return NextResponse.json({
      message,
    });
  } catch (error: any) {
    console.error('[API] Send message error:', error);
    
    if (error.message === 'Invalid conversation ID') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    if (error.message === 'Conversation not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    
    // Handle specific errors
    if (error.message.includes('blocked')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
