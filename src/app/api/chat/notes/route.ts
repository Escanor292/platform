/**
 * GET /api/chat/notes
 * Get user's notes (only active, not expired)
 * 
 * POST /api/chat/notes
 * Create user note (expires after 24 hours)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserNotes, createUserNote } from '@/services/mongodb/chat.service';
import { CreateUserNoteRequest } from '@/types/chat.types';

export async function GET(request: NextRequest) {
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

    // Get user notes
    const notes = await getUserNotes(userId);

    return NextResponse.json({
      notes,
    });
  } catch (error: any) {
    console.error('[API] Get user notes error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body: CreateUserNoteRequest = await request.json();
    const { targetUserId, note } = body;

    // Validate input
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target user ID is required' },
        { status: 400 }
      );
    }

    if (!note || !note.trim()) {
      return NextResponse.json(
        { error: 'Note is required' },
        { status: 400 }
      );
    }

    if (note.trim().length > 500) {
      return NextResponse.json(
        { error: 'Note is too long (max 500 characters)' },
        { status: 400 }
      );
    }

    // Create user note
    const newNote = await createUserNote(userId, targetUserId, note);

    return NextResponse.json({
      note: newNote,
    });
  } catch (error: any) {
    console.error('[API] Create user note error:', error);

    if (error.message === 'Current user not found' || error.message === 'Target user not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create user note' },
      { status: 500 }
    );
  }
}
