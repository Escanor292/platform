"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type InboxNote = {
  id: string;
  userId: string;
  note: string;
  isOwn?: boolean;
  name: string;
  avatar?: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function NoteAvatar({
  name,
  avatar,
  bubble,
  empty,
  onClick,
  caption,
}: {
  name: string;
  avatar?: string;
  bubble: string;
  empty?: boolean;
  onClick: () => void;
  caption: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex w-[76px] shrink-0 flex-col items-center pt-9"
      title={bubble}
    >
      <span
        className={cn(
          "absolute left-1/2 top-0 z-10 w-[88px] -translate-x-1/2 rounded-[1.15rem] border px-2 py-1.5 text-center text-[11px] leading-tight line-clamp-2 shadow-sm",
          empty
            ? "border-gray-200 bg-white text-gray-400"
            : "border-gray-200 bg-white text-gray-800",
        )}
      >
        {bubble}
        <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 border-b border-r border-gray-200 bg-white" />
      </span>
      <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <span className="mt-1.5 w-full truncate text-center text-[11px] text-gray-600">{caption}</span>
    </button>
  );
}

export function ChatNotesTray({
  notes,
  currentUser,
  onEditOwn,
  onOpenUser,
}: {
  notes: InboxNote[];
  currentUser: { id?: string; name?: string | null; image?: string | null };
  onEditOwn: (existing?: string) => void;
  onOpenUser: (userId: string) => void;
}) {
  const mine = notes.find((n) => n.isOwn || n.userId === currentUser.id);
  const others = notes.filter((n) => n.userId !== currentUser.id && n.note);

  return (
    <div className="border-b bg-white">
      <div className="flex gap-3 overflow-x-auto px-4 pb-3 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <NoteAvatar
          name={currentUser.name || "Bạn"}
          avatar={currentUser.image || undefined}
          bubble={mine?.note?.trim() || "Ghi chú..."}
          empty={!mine?.note?.trim()}
          caption="Ghi chú của bạn"
          onClick={() => onEditOwn(mine?.note)}
        />
        {others.map((note) => (
          <NoteAvatar
            key={note.id}
            name={note.name}
            avatar={note.avatar}
            bubble={note.note}
            caption={note.name.split(" ")[0] || note.name}
            onClick={() => onOpenUser(note.userId)}
          />
        ))}
      </div>
    </div>
  );
}
