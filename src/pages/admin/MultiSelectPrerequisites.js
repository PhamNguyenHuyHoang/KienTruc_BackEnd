import React from "react";
import { X, Check, ChevronDown } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";

import { ScrollArea } from "../../components/ui/scroll-area";

const MultiSelectPrerequisites = ({
  options, // [{ maMonHoc, tenMonHoc }]
  selectedValues, // [maMonHoc1, maMonHoc2]
  onChange, // (newSelectedValues) => void
  placeholder = "Chọn môn tiên quyết...",
  className,
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleSelect = React.useCallback(
    (maMonHoc) => {
      const newSelectedValues = selectedValues.includes(maMonHoc)
        ? selectedValues.filter((val) => val !== maMonHoc)
        : [...selectedValues, maMonHoc];
      onChange(newSelectedValues);
    },
    [selectedValues, onChange]
  );

  const handleRemove = (maMonHocToRemove) => {
    onChange(selectedValues.filter((val) => val !== maMonHocToRemove));
  };

  const getSubjectName = (maMonHoc) => {
    const subject = options.find((opt) => opt.maMonHoc === maMonHoc);
    return subject ? subject.tenMonHoc : maMonHoc;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between h-auto min-h-10 py-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${className} ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className="flex flex-wrap gap-1.5 items-center">
            {selectedValues.length > 0 ? (
              selectedValues.map((value) => (
                <Badge
                  variant="secondary"
                  key={value}
                  className="rounded-sm px-1.5 py-0.5 dark:bg-gray-600 dark:text-gray-100"
                >
                  {getSubjectName(value)}
                  {!disabled && (
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(value);
                      }}
                    />
                  )}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground dark:text-gray-400">
                {placeholder}
              </span>
            )}
          </div>
          {!disabled && (
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 dark:bg-gray-800 dark:border-gray-700">
        <Command shouldFilter={false}>
          <div
            className="flex items-center border-b px-3 dark:border-gray-700"
            cmdk-input-wrapper=""
          >
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              placeholder="Tìm kiếm môn học..."
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:ring-0 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>
          <CommandList>
            <ScrollArea className="max-h-60">
              <CommandEmpty className="py-6 text-center text-sm dark:text-gray-400">
                Không tìm thấy môn học.
              </CommandEmpty>
              <CommandGroup>
                {options
                  .filter(
                    (option) =>
                      option.tenMonHoc
                        .toLowerCase()
                        .includes(inputValue.toLowerCase()) ||
                      option.maMonHoc
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                  )
                  .map((option) => {
                    const isSelected = selectedValues.includes(option.maMonHoc);
                    return (
                      <CommandItem
                        key={option.maMonHoc}
                        value={`${option.maMonHoc} ${option.tenMonHoc}`}
                        onSelect={() => {
                          handleSelect(option.maMonHoc);
                        }}
                        className="cursor-pointer dark:text-gray-200 dark:hover:!bg-gray-700"
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            isSelected ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <span>
                          {option.tenMonHoc} ({option.maMonHoc})
                        </span>
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelectPrerequisites;
