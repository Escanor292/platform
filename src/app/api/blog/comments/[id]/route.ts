// ============================================================
// API: DELETE /api/blog/comments/[id] - Delete comment
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteComment } from '@/lib/blog/comment.service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await deleteComment(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API] DELETE /api/blog/comments/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete comment' },
      { status: error.message.includes('permission') ? 403 : 500 }
    );
  }
}
