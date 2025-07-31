"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { UI_TEXT } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Control, FieldValues, Path } from "react-hook-form";

interface Item {
  _id: string;
  nama: string;
}

interface CreatableSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  items: Item[];
  loading: boolean;
  adding: boolean;
  onItemCreate: (name: string) => Promise<void>;
  onItemDelete: (id: string) => Promise<void>;
  isItemInUse: (id: string) => boolean;
  newItemPlaceholder: string;
}

export function CreatableSelect<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  items,
  loading,
  adding,
  onItemCreate,
  onItemDelete,
  isItemInUse,
  newItemPlaceholder,
}: CreatableSelectProps<T>) {
  const [newItemName, setNewItemName] = useState("");

// removed leftover duplicate function body and return

// removed duplicate non-generic CreatableSelect

  const handleCreate = async () => {
    if (!newItemName.trim()) return;
    await onItemCreate(newItemName);
    setNewItemName("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-col gap-2">
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={loading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>
                      {UI_TEXT.LOADING}
                    </SelectItem>
                  ) : items.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      {UI_TEXT.NO_ITEMS}
                    </SelectItem>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between px-2 py-1 hover:bg-gray-100 rounded"
                      >
                        <SelectItem value={item._id} className="flex-1">
                          {item.nama}
                        </SelectItem>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:text-red-700"
                          disabled={isItemInUse(item._id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onItemDelete(item._id);
                          }}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">{UI_TEXT.DELETE}</span>
                        </Button>
                      </div>
                    ))
                  )}
                  <div className="flex items-center gap-2 px-2 py-2 border-t mt-2">
                    <Input
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder={newItemPlaceholder}
                      className="flex-1 h-8"
                      disabled={adding}
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="h-8"
                      disabled={adding || !newItemName.trim()}
                      onClick={handleCreate}
                    >
                      {adding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        UI_TEXT.ADD
                      )}
                    </Button>
                  </div>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
