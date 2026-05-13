import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectMongoDB } from "@/lib/mongodb";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Lấy thông tin user hiện tại từ PostgreSQL
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { participantId } = await req.json();

    if (!participantId) {
      return NextResponse.json(
        { error: "participantId is required" },
        { status: 400 }
      );
    }

    // Kiểm tra không thể chat với chính mình
    if (currentUser.id === participantId) {
      return NextResponse.json(
        { error: "Không thể nhắn tin với chính mình" },
        { status: 400 }
      );
    }

    // Kiểm tra user đích có tồn tại không
    const targetUser = await prisma.user.findUnique({
      where: { id: participantId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    // Kết nối MongoDB
    const { db } = await connectMongoDB();
    const conversationsCollection = db.collection("conversations");

    // Tìm conversation đã tồn tại giữa 2 user
    const existingConversation = await conversationsCollection.findOne({
      participants: {
        $all: [currentUser.id, participantId],
        $size: 2,
      },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Tạo conversation mới
    const newConversation = {
      participants: [currentUser.id, participantId],
      participantDetails: [
        {
          userId: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.image || null,
        },
        {
          userId: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          avatar: targetUser.image || null,
        },
      ],
      lastMessage: null,
      lastMessageAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await conversationsCollection.insertOne(newConversation);

    return NextResponse.json({
      _id: result.insertedId.toString(),
      ...newConversation,
    });
  } catch (error) {
    console.error("[POST /api/chat/conversations/find-or-create]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
