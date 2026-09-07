declare module "toflexible" {
  /** Returns undefined for values it can't format within its internal iteration limit. */
  export default function toFlexible(
    value: number,
    decimals?: number,
  ): string | undefined;
}

declare module "clipboard-copy" {
  export default function clipboardCopy(text: string): Promise<void>;
}
