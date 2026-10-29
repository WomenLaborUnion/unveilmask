/** Value type detected or selected for masking. */
export type MaskType = 'auto' | 'email' | 'phone' | 'name' | 'generic';

export interface MaskOptions {
  /** Value type; 'auto' detects from the value shape (default: 'auto') */
  type?: MaskType;
  /** Character used for masking (default: '*') */
  maskChar?: string;
}

/** Mask the middle of a value. */
export function mask(value: string, options?: MaskOptions): string;

/** Detect the value type from its shape. */
export function detectType(str: string): 'email' | 'phone' | 'generic';

/** Mask the middle of a plain string, keeping the first/last third. */
export function maskGeneric(str: string, maskChar?: string): string;

/** Mask the middle of the email local part; the domain stays visible. */
export function maskEmail(str: string, maskChar?: string): string;

/** Mask the middle digit groups; prefix and last group stay visible. */
export function maskPhone(str: string, maskChar?: string): string;

/** Mask the middle of each whitespace-separated word (for names). */
export function maskName(str: string, maskChar?: string): string;

/** Mask a single name word, keeping the first and last character. */
export function maskWord(word: string, maskChar?: string): string;

export interface DomOptions extends MaskOptions {
  /** Start in the revealed state (default: false) */
  revealed?: boolean;
}

/**
 * Mount a hover-reveal masker inside an element.
 * Requires a DOM; pair with `unveilmask/style.css`.
 */
export function mount(element: HTMLElement, value: string, options?: DomOptions): HTMLElement;

/** Build the hover-reveal HTML string for a value (SSR/templating). */
export function render(value: string, options?: DomOptions): string;

/** Initialize every `[data-nm-value]` element under root. */
export function autoInit(root?: ParentNode): HTMLElement[];

/** Programmatically reveal a mounted masker. */
export function reveal(element: HTMLElement): void;

/** Hide a programmatically revealed masker. */
export function hide(element: HTMLElement): void;

/** Toggle the revealed state of a mounted masker. */
export function toggle(element: HTMLElement, force?: boolean): void;

/** Unmount: restore the element's text content to the original value. */
export function unmount(element: HTMLElement): HTMLElement;
