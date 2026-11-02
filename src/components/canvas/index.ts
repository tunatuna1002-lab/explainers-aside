/**
 * Local re-creation of the `grok/canvas` kit: same component names and props.
 * A page written for Grok Bot imports from here instead of "grok/canvas".
 */
export type { ChangeEvent, CSSProperties, FocusEvent, FormEvent, KeyboardEvent, MouseEvent, PointerEvent, ReactNode, RefObject, SyntheticEvent } from "react";
export { Fragment, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

export { Page, type PageProps } from "./Page";
export { Section, type SectionProps } from "./Section";
export { Text } from "./Text";
export { Callout, type CalloutProps, type CalloutTone, type Tone } from "./Callout";
export { TableOfContents, type TableOfContentsItem, type TableOfContentsProps } from "./TableOfContents";
export { Grid, Metrics, type GridColumns, type GridProps, type Metric } from "./Grid";
export { Segmented, type SegmentedOption, type SegmentedProps } from "./Segmented";
export { Properties, type PropertyItem } from "./Properties";
export { Steps, BulletList, NumberedList, type Step, type ListItem } from "./Steps";
export { Table, type TableCell, type TableProps } from "./Table";
export { Bars, type Bar, type BarsProps } from "./Bars";
export { Heatmap, type HeatmapProps } from "./Heatmap";
export { Equation, Frac, Pow, Sqrt, Paren, Sum, type EquationProps, type FracProps, type PowProps, type SqrtProps, type ParenProps, type SumProps } from "./Equation";
export { Diagram, type DiagramNode, type DiagramEdge, type DiagramNodeKind, type DiagramProps } from "./Diagram";
export { computeDAGLayout, type DAGLayoutOptions, type DAGLayoutResult, type DAGLayoutNode, type DAGLayoutEdge, type DAGLayoutRank } from "./dag";
export type { PageWidth } from "./width";
export { useGrokTheme } from "./hooks";
export type { GrokDataViz, GrokPalette, GrokTextStyle, GrokTheme, GrokWeightScale } from "./tokens";
