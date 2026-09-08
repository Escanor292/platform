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
  showBubble,
  onClick,
  caption,
}: {
  name: string;
  avatar?: string;
  bubble?: string;
  empty?: boolean;
  showBubble?: boolean;
  onClick: () => void;
  caption: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-[76px] shrink-0 flex-col items-center"
      title={bubble || name}
    >
      <div className="flex h-12 w-full items-end justify-center">
        {showBubble ? (
          <span
            className={cn(
              "w-full rounded-2xl border px-1.5 py-1 text-center text-[10px] leading-tight line-clamp-2 break-all shadow-sm",
              empty ? "border-gray-200 bg-white text-gray-400" : "border-gray-200 bg-white text-gray-800",
            )}
          >
            {bubble}
          </span>
        ) : null}
      </div>
      <Avatar className="mt-1.5 h-14 w-14 border-2 border-white shadow-sm">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <span className="mt-1 w-full truncate text-center text-[11px] text-gray-600">{caption}</span>
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
  const others = notes.filter((n) => n.userId && n.userId !== currentUser.id);

  return (
    <div className="border-b bg-white">
      <div className="flex items-start gap-2 overflow-x-auto px-4 pb-3 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <NoteAvatar
          name={currentUser.name || "Bạn"}
          avatar={currentUser.image || undefined}
          bubble={mine?.note?.trim() || "Ghi chú..."}
          empty={!mine?.note?.trim()}
          showBubble
          caption="Bạn"
          onClick={() => onEditOwn(mine?.note)}
        />
        {others.map((note) => {
          const hasNote = Boolean(note.note?.trim());
          return (
            <NoteAvatar
              key={note.id || note.userId}
              name={note.name}
              avatar={note.avatar}
              bubble={note.note}
              showBubble={hasNote}
              caption={note.name.split(" ")[0] || note.name}
              onClick={() => onOpenUser(note.userId)}
            />
          );
        })}
      </div>
    </div>
  );
}
