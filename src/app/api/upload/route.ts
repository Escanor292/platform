import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type (ảnh + video)
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    const isVideo = file.type.startsWith('video/');
    const validTypes = [...validImageTypes, ...validVideoTypes];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: isVideo
          ? "Invalid video type. Only MP4, WEBM, and MOV are allowed."
          : "Invalid file type. Only JPEG, PNG, WEBP, GIF, MP4, WEBM, and MOV are allowed."
      }, { status: 400 });
    }

    // Validate file size (ảnh 5MB, video 30MB)
    const maxSize = isVideo ? 30 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${isVideo ? '30MB' : '5MB'}.` 
      }, { status: 400 });
    }

    // Check Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("[CLOUDINARY_CONFIG_ERROR] Missing Cloudinary credentials");
      return NextResponse.json({ 
        error: "Upload service not configured. Please contact administrator." 
      }, { status: 500 });
    }

    // Chuyển file sang buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload lên Cloudinary
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          resource_type: "auto", 
          folder: "crowdfund-vn",
          transformation: isVideo
            ? [
                { width: 1280, crop: "limit" }, // Giới hạn chiều rộng video
                { quality: "auto:good" },       // Chất lượng tự động
              ]
            : [
                { width: 1920, height: 1080, crop: "limit" }, // Limit max size
                { quality: "auto:good" }, // Auto quality optimization
                { fetch_format: "auto" } // Auto format (WebP when supported)
              ],
          flags: isVideo ? "video" : undefined,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({ 
      secure_url: result.secure_url, // Match với ImageUpload component
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    });
  } catch (error: any) {
    console.error("[CLOUDINARY_UPLOAD_ERROR]", error);
    return NextResponse.json({ 
      error: error.message || "Upload failed. Please try again." 
    }, { status: 500 });
  }
}
