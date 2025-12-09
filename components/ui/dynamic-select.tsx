"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Check, X } from "lucide-react";

export interface DynamicSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  onAddOption: (option: string) => void;
  placeholder?: string;
}

export function DynamicSelect({
  value,
  onValueChange,
  options,
  onAddOption,
  placeholder = "Select an option",
}: DynamicSelectProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [newOption, setNewOption] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);

  const handleAddNew = () => {
    const trimmedOption = newOption.trim();
    if (trimmedOption && !options.includes(trimmedOption)) {
      onAddOption(trimmedOption);
      onValueChange(trimmedOption);
      setNewOption("");
      setIsAdding(false);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setNewOption("");
    setIsAdding(false);
  };

  return (
    <Select value={value} onValueChange={onValueChange} open={isOpen} onOpenChange={setIsOpen}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}

        <div className="border-t my-1" />

        {!isAdding ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsAdding(true);
            }}
            className="w-full px-2 py-1.5 text-left text-sm flex items-center gap-2 hover:bg-accent hover:text-accent-foreground rounded-sm"
          >
            <Plus className="h-4 w-4" />
            Add New
          </button>
        ) : (
          <div className="p-2 space-y-2" onClick={(e) => e.stopPropagation()}>
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="Enter new option..."
              className="h-8"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddNew();
                } else if (e.key === "Escape") {
                  handleCancel();
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleAddNew}
                className="h-7 flex-1"
              >
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="h-7 flex-1"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
