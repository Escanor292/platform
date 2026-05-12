"use client";

import Image from "next/image";
import { User } from "lucide-react";

interface UserAvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ src, name, size = "md" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={`${sizeClasses[size]} flex-shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden`}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={iconSizes[size] * 2}
          height={iconSizes[size] * 2}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-xs font-medium text-primary">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}
