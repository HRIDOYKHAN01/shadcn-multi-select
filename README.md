# React MultiSelect Component

A fully **type-safe, customizable, and accessible multi-select component** for React 18+ built with [shadcn/ui](https://ui.shadcn.com/) style components.  
Supports badges inside the trigger, search input, and fully controlled selection with `renderItem` for custom rendering.

---

## Features

- ✅ Fully type-safe with generic `T`
- ✅ Controlled selection with `values` and `onValuesChange`
- ✅ Customizable rendering with `renderItem`
- ✅ Badges inside the trigger button
- ✅ Overflow handling for badges (`wrap`, `wrap-when-open`, `cutoff`)
- ✅ Searchable dropdown
- ✅ Supports grouping and separators
- ✅ Lightweight, no external dependencies beyond React & shadcn/ui

---

## Installation

```bash
npm install lucide-react @shadcn/ui
# or
yarn add lucide-react @shadcn/ui

import React, { useState } from "react";
import { CheckIcon } from "lucide-react";
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectItem,
} from "@/components/MultiSelect";

type Framework = { id: string; name: string };

const frameworks: Framework[] = [
  { id: "1", name: "React" },
  { id: "2", name: "Vue" },
  { id: "3", name: "Angular" },
  { id: "4", name: "Svelte" },
];

export default function App() {
  const [selected, setSelected] = useState<Framework[]>([]);

  return (
    <MultiSelect
      values={selected}
      onValuesChange={setSelected}
      getId={(f) => f.id}
      renderItem={(item, isSelected) => (
        <div className="flex items-center gap-2">
          {isSelected && <CheckIcon className="w-4 h-4" />}
          {item.name}
        </div>
      )}
    >
      <MultiSelectTrigger>
        <MultiSelectValue
          placeholder="Select frameworks..."
          overflowBehavior="wrap"
        />
      </MultiSelectTrigger>

      <MultiSelectContent>
        {frameworks.map((f) => (
          <MultiSelectItem key={f.id} value={f} />
        ))}
      </MultiSelectContent>
    </MultiSelect>
  );
}

