"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { PencilLine, Shuffle, Trash2, X } from "lucide-react";
import { useCup } from "@/lib/store";
import { cx } from "@/lib/utils";

export function ResetDialog({
  open,
  onOpenChange,
  onRedraw,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRedraw: () => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content w-[min(92vw,400px)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl focus:outline-none">
          <div className="p-5">
            <Dialog.Title className="font-display text-lg font-bold">What next?</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              Your call — the bracket lives in your browser only.
            </Dialog.Description>
            <div className="mt-4 grid gap-2">
              <Option
                icon={<Shuffle className="size-4 text-accent" />}
                title="Shuffle a new draw"
                desc="Same 16 teams, fresh bracket"
                onClick={() => {
                  onOpenChange(false);
                  onRedraw();
                }}
              />
              <Option
                icon={<PencilLine className="size-4 text-highlight" />}
                title="Edit teams"
                desc="Back to setup with your teams kept"
                onClick={() => {
                  onOpenChange(false);
                  useCup.getState().toSetup();
                }}
              />
              <Option
                danger
                icon={<Trash2 className="size-4" />}
                title="Erase everything"
                desc="Clear all teams and start fresh"
                onClick={() => {
                  onOpenChange(false);
                  useCup.getState().eraseAll();
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mt-3 w-full cursor-pointer rounded-xl py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Cancel — back to the bracket
            </button>
          </div>
          <Dialog.Close asChild>
            <button
              aria-label="Close"
              className="absolute right-3 top-3 grid size-8 cursor-pointer place-items-center rounded-lg text-muted-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X className="size-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Option({
  icon,
  title,
  desc,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex w-full cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        danger ? "hover:border-red-500/50 hover:bg-red-500/5" : "hover:border-accent/50 hover:bg-accent/5",
      )}
    >
      <span className={cx("mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted", danger && "text-red-500")}>
        {icon}
      </span>
      <span>
        <span className={cx("block text-sm font-semibold", danger && "text-red-500")}>{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
    </button>
  );
}
