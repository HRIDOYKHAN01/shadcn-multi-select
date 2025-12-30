"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import {
  Command,
  CommandItem,
  CommandEmpty,
  CommandList,
  CommandGroup,
  CommandSeparator,
  CommandInput,
} from "@/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronsUpDownIcon, XIcon } from "lucide-react";

/* =========================================================
   Context
========================================================= */

type MultiSelectCtxType<T> = {
  open: boolean;
  setOpen: (open: boolean) => void;

  selectedMap: Map<string, T>;
  toggleValue: (value: T) => void;

  items: Map<string, T>;
  onItemAdded: (id: string, value: T) => void;

  getId: (obj: T) => string;

  searchValue: string;
  setSearchValue: (val: string) => void;

  renderItem: (item: T, isSelected: boolean) => ReactNode;
};

const MultiSelectContext = createContext<MultiSelectCtxType<unknown> | null>(
  null
);

function useMultiSelectContext<T>() {
  const ctx = useContext(MultiSelectContext);
  if (!ctx)
    throw new Error("useMultiSelectContext must be used inside MultiSelect");
  return ctx as MultiSelectCtxType<T>;
}

/* =========================================================
   MultiSelect
========================================================= */

type MultiSelectProps<T> = {
  values: T[];
  onValuesChange?: (values: T[]) => void;

  inputValue?: string;
  onInputChange?: (val: string) => void;

  getId: (obj: T) => string;

  renderItem: (item: T, isSelected: boolean) => ReactNode;

  children?: ReactNode;
};

export function MultiSelect<T>({
  values,
  onValuesChange,
  inputValue,
  onInputChange,
  getId,
  renderItem,
  children,
}: MultiSelectProps<T>) {
  const [open, setOpen] = useState(false);

  const [internalSearch, setInternalSearch] = useState("");
  const searchValue = inputValue ?? internalSearch;
  const setSearchValue = onInputChange ?? setInternalSearch;

  const selectedMap = new Map(values.map((v) => [getId(v), v]));
  const [items, setItems] = useState<Map<string, T>>(new Map());

  const toggleValue = useCallback(
    (val: T) => {
      const id = getId(val);
      const next = new Map(selectedMap);
      if (next.has(id)) next.delete(id);
      else next.set(id, val);

      onValuesChange?.([...next.values()]);
    },
    [selectedMap, getId, onValuesChange]
  );

  const onItemAdded = useCallback((id: string, value: T) => {
    setItems((prev) =>
      prev.get(id) === value ? prev : new Map(prev).set(id, value)
    );
  }, []);

  return (
    <MultiSelectContext.Provider
      value={
        {
          open,
          setOpen,
          selectedMap,
          toggleValue,
          items,
          onItemAdded,
          getId,
          searchValue,
          setSearchValue,
          renderItem,
        } as MultiSelectCtxType<unknown>
      }
    >
      <Popover open={open} onOpenChange={setOpen} modal>
        {children}
      </Popover>
    </MultiSelectContext.Provider>
  );
}

/* =========================================================
   Trigger
========================================================= */

export function MultiSelectTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Button>) {
  const { open } = useMultiSelectContext<any>();

  return (
    <PopoverTrigger asChild>
      <Button
        {...props}
        variant="outline"
        aria-expanded={open}
        className={cn(
          "flex h-auto min-h-9 w-full items-center justify-between gap-2",
          className
        )}
      >
        {children}
        <ChevronsUpDownIcon className="size-4 opacity-50" />
      </Button>
    </PopoverTrigger>
  );
}

/* =========================================================
   Value Display
========================================================= */

export function MultiSelectValue<T>({
  placeholder,
  clickToRemove = true,
  overflowBehavior = "wrap-when-open",
  className,
}: {
  placeholder?: string;
  clickToRemove?: boolean;
  overflowBehavior?: "wrap" | "wrap-when-open" | "cutoff";
  className?: string;
}) {
  const { selectedMap, toggleValue, items, open, renderItem } =
    useMultiSelectContext<T>();
  const valueRef = useRef<HTMLDivElement>(null);
  const [overflowAmount, setOverflowAmount] = useState(0);

  const shouldWrap =
    overflowBehavior === "wrap" ||
    (overflowBehavior === "wrap-when-open" && open);

  useEffect(() => {
    if (!valueRef.current || shouldWrap) {
      setOverflowAmount(0);
      return;
    }

    const container = valueRef.current;
    const childrenEls = Array.from(
      container.querySelectorAll("[data-selected-item]")
    ) as HTMLElement[];
    childrenEls.forEach((el) => (el.style.display = ""));
    let hidden = 0;
    for (let i = childrenEls.length - 1; i >= 0; i--) {
      if (container.scrollWidth <= container.clientWidth) break;
      childrenEls[i].style.display = "none";
      hidden++;
    }
    setOverflowAmount(hidden);
  }, [selectedMap, shouldWrap]);

  if (selectedMap.size === 0)
    return <span className="text-muted-foreground">{placeholder}</span>;

  return (
    <div
      ref={valueRef}
      className={cn(
        "flex w-full gap-1.5 overflow-hidden",
        shouldWrap && "flex-wrap",
        className
      )}
    >
      {[...selectedMap.entries()].map(([id, value]) => (
        <Badge
          key={id}
          data-selected-item
          variant="outline"
          className="group flex items-center gap-1"
          onClick={
            clickToRemove
              ? (e) => {
                  e.stopPropagation();
                  toggleValue(value);
                }
              : undefined
          }
        >
          {renderItem(value, true)}
          {clickToRemove && (
            <XIcon className="size-3 opacity-60 group-hover:text-destructive" />
          )}
        </Badge>
      ))}

      {overflowAmount > 0 && !shouldWrap && (
        <Badge variant="outline">+{overflowAmount}</Badge>
      )}
    </div>
  );
}

/* =========================================================
   Content
========================================================= */

export function MultiSelectContent({
  search = true,
  children,
}: {
  search?: boolean | { placeholder?: string; emptyMessage?: string };
  children: ReactNode;
}) {
  const { searchValue, setSearchValue } = useMultiSelectContext<any>();
  const canSearch = typeof search === "object" || search;

  return (
    <PopoverContent className="min-w-(--radix-popover-trigger-width) p-0">
      <Command>
        {canSearch && (
          <CommandInput
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder={
              typeof search === "object" ? search.placeholder : "Search..."
            }
          />
        )}

        <CommandList>
          <CommandEmpty>
            {typeof search === "object" ? search.emptyMessage : "No results"}
          </CommandEmpty>
          {children}
        </CommandList>
      </Command>
    </PopoverContent>
  );
}

/* =========================================================
   Item
========================================================= */

export function MultiSelectItem<T>({
  value,
  ...props
}: { value: T } & Omit<
  React.ComponentPropsWithoutRef<typeof CommandItem>,
  "value"
>) {
  const { toggleValue, selectedMap, onItemAdded, getId, renderItem } =
    useMultiSelectContext<T>();
  const id = getId(value);
  const isSelected = selectedMap.has(id);

  useEffect(() => {
    onItemAdded(id, value);
  }, [id, value, onItemAdded]);

  return (
    <CommandItem {...props} onSelect={() => toggleValue(value)}>
      {renderItem(value, isSelected)}
    </CommandItem>
  );
}

/* =========================================================
   Helpers
========================================================= */

export function MultiSelectGroup(
  props: React.ComponentPropsWithoutRef<typeof CommandGroup>
) {
  return <CommandGroup {...props} />;
}

export function MultiSelectSeparator(
  props: React.ComponentPropsWithoutRef<typeof CommandSeparator>
) {
  return <CommandSeparator {...props} />;
}
