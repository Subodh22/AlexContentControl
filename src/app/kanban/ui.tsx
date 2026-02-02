"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Column = {
  _id: Id<"columns">;
  name: string;
  order: number;
};

type Card = {
  _id: Id<"cards">;
  columnId: Id<"columns">;
  title: string;
  description: string | null;
  order: number;
};

const DEMO_CLERK_USER_ID = "demo";

export function KanbanBoard() {
  const upsertFromClerk = useMutation(api.users.upsertFromClerk);
  const createBoard = useMutation(api.boards.createBoard);

  const [ownerUserId, setOwnerUserId] = useState<Id<"users"> | null>(null);
  const [boardId, setBoardId] = useState<Id<"boards"> | null>(null);

  const columns = useQuery(
    api.columns.listByBoard,
    boardId ? { boardId } : "skip"
  ) as Column[] | undefined;
  const cards = useQuery(
    api.cards.listByBoard,
    boardId ? { boardId } : "skip"
  ) as Card[] | undefined;

  const createCard = useMutation(api.cards.create);

  useEffect(() => {
    (async () => {
      const id = await upsertFromClerk({
        clerkUserId: DEMO_CLERK_USER_ID,
        email: null,
        name: "Demo",
      });
      setOwnerUserId(id);
    })();
  }, [upsertFromClerk]);

  useEffect(() => {
    (async () => {
      if (!ownerUserId) return;
      const b = await createBoard({ ownerUserId, name: "My Board" });
      setBoardId(b);
    })();
    // create once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerUserId]);

  const cardsByColumn = useMemo(() => {
    const map = new Map<string, Card[]>();
    (cards ?? []).forEach((card) => {
      const list = map.get(card.columnId) ?? [];
      list.push(card);
      map.set(card.columnId, list);
    });
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => a.order - b.order);
      map.set(k, list);
    }
    return map;
  }, [cards]);

  if (!boardId || !columns) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <div className="text-zinc-600">Loading board…</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Kanban</h1>
        <NewCardDialog
          columns={columns}
          onCreate={async ({ title, description, columnId }) => {
            await createCard({
              boardId,
              columnId,
              title,
              description,
            });
          }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {columns
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((col) => (
            <div
              key={col._id}
              className="rounded-lg border border-zinc-200 bg-white"
            >
              <div className="border-b border-zinc-200 px-4 py-3">
                <div className="font-medium text-zinc-900">{col.name}</div>
              </div>
              <div className="space-y-2 p-3">
                {(cardsByColumn.get(col._id) ?? []).map((card) => (
                  <div
                    key={card._id}
                    className="rounded-md border border-zinc-200 bg-zinc-50 p-3"
                  >
                    <div className="font-medium text-zinc-900">{card.title}</div>
                    {card.description ? (
                      <div className="mt-1 text-sm text-zinc-600">
                        {card.description}
                      </div>
                    ) : null}
                  </div>
                ))}
                {(cardsByColumn.get(col._id) ?? []).length === 0 ? (
                  <div className="text-sm text-zinc-500">No cards</div>
                ) : null}
              </div>
            </div>
          ))}
      </div>

      <div className="text-xs text-zinc-500">
        Demo mode: no auth, everything writes under a single "Demo" user.
      </div>
    </div>
  );
}

function NewCardDialog({
  columns,
  onCreate,
}: {
  columns: Column[];
  onCreate: (args: {
    title: string;
    description: string | null;
    columnId: Id<"columns">;
  }) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState<Id<"columns"> | null>(
    columns[0]?._id ?? null
  );

  useEffect(() => {
    if (!columnId && columns[0]?._id) setColumnId(columns[0]._id);
  }, [columnId, columns]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New card</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create card</DialogTitle>
          <DialogDescription>Add a new card to a column.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="text-sm font-medium">Title</div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">Description</div>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">Column</div>
            <select
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm"
              value={columnId ?? ""}
              onChange={(e) => setColumnId(e.target.value as any)}
            >
              {columns
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            type="button"
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (!columnId) return;
              if (!title.trim()) return;
              await onCreate({
                title: title.trim(),
                description: description.trim() ? description.trim() : null,
                columnId,
              });
              setTitle("");
              setDescription("");
              setOpen(false);
            }}
            type="button"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
