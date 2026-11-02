import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle } from "@base-ui/react/toggle";
import { useGrokTheme, textStyle } from "./hooks";

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
  count?: number;
}
export interface SegmentedProps<T extends string = string> {
  options: readonly (T | SegmentedOption<T>)[];
  value: T;
  onChange: (value: T) => void;
}

/** A view switch: two to five (here up to eight) short labels, one picked. Built on Base UI ToggleGroup. */
export function Segmented<T extends string = string>({ options: allOptions, value, onChange }: SegmentedProps<T>) {
  const t = useGrokTheme();
  const options = allOptions.map((o) => (typeof o === "string" ? { value: o, label: o } : o)) as SegmentedOption<T>[];
  return (
    <ToggleGroup
      className="g-seg"
      value={[value]}
      onValueChange={(v) => {
        const next = v[v.length - 1];
        if (next !== undefined) onChange(next as T);
      }}
      style={{ background: t.fill.secondary, borderRadius: t.radius.md }}
    >
      {options.map((o) => (
        <Toggle key={o.value} value={o.value} className="g-seg-item" style={{ ...textStyle(t.font.subtext), borderRadius: 6 }}>
          {o.label}
          {o.count !== undefined ? <span style={{ color: t.text.tertiary, marginLeft: 6, fontVariantNumeric: "tabular-nums" }}>{o.count}</span> : null}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}
