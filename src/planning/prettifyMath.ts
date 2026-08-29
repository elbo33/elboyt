// ZasPro statements and solution_steps interleave Polish prose with raw inline
// LaTeX (e.g. "Obliczam \frac{39}{2}\cdot 12 = 234."). The scenes render prose
// as plain Text, so we turn that LaTeX into readable Unicode before it reaches
// Manim. This is deliberately a small, closed rule set: across all 62 exercise
// files the only macros are \left \right \cdot \frac \sqrt (arithmetic) plus
// \in \cup \langle \infty \mathbb (interval-heavy sections). An unhandled macro
// falls through literally — visible in a frame review, never a wrong claim.

// Only glyphs that Avenir Next actually carries. Subscript *letters* (ₙ, ₖ, …)
// render as tofu in the house font, so an index like a_{n+1} stays as the
// readable ASCII "a_(n+1)" instead — see toSub().
const SUP: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  "-": "⁻"
};
const SUB: Record<string, string> = {
  "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
  "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉"
};

const SYMBOLS: [RegExp, string][] = [
  [/\\left\s*/g, ""],
  [/\\right\s*/g, ""],
  [/\\cdot\s*/g, "·"],
  [/\\times\s*/g, "×"],
  [/\\div\s*/g, "÷"],
  [/\\pm\s*/g, "±"],
  [/\\Delta/g, "Δ"],
  [/\\alpha/g, "α"],
  [/\\beta/g, "β"],
  [/\\pi/g, "π"],
  [/\\infty/g, "∞"],
  [/\\ge(?![a-zA-Z])/g, "≥"],
  [/\\geq/g, "≥"],
  [/\\le(?![a-zA-Z])/g, "≤"],
  [/\\leq/g, "≤"],
  [/\\neq/g, "≠"],
  [/\\approx/g, "≈"],
  [/\\iff/g, "⇔"],
  [/\\Longleftrightarrow/g, "⇔"],
  [/\\Rightarrow/g, "⇒"],
  [/\\Longrightarrow/g, "⇒"],
  [/\\in(?![a-zA-Z])/g, "∈"],
  [/\\cup/g, "∪"],
  [/\\cap/g, "∩"],
  [/\\setminus/g, " \\ "],
  [/\\langle/g, "⟨"],
  [/\\rangle/g, "⟩"],
  [/\\circ/g, "°"],
  [/\\mathbb\{R\}/g, "ℝ"],
  [/\\mathbb\{N\}/g, "ℕ"],
  [/\\mathbb\{Z\}/g, "ℤ"],
  [/\\sin/g, "sin"],
  [/\\cos/g, "cos"],
  [/\\tan/g, "tg"],
  [/\\log/g, "log"],
  [/\\,/g, " "],
  [/\\;/g, " "],
  [/\\!/g, ""],
  [/\\quad/g, "   "],
  [/\\qquad/g, "     "]
];

/** All-digits (optionally signed) → Unicode script; anything else → null. */
function toScript(body: string, map: Record<string, string>): string | null {
  const out: string[] = [];
  for (const ch of body) {
    if (map[ch] === undefined) return null;
    out.push(map[ch]);
  }
  return out.join("");
}

/** Subscript: pure digits become ₁₂; mixed indices become "(n+1)". */
function subOrParen(body: string): string {
  const b = body.trim();
  const digits = toScript(b, SUB);
  if (digits !== null) return digits;
  return b.length === 1 ? `_${b}` : `_(${b})`;
}

/** Superscript: pure digits/sign become ²; mixed exponents become "^(m+n)". */
function supOrParen(body: string): string {
  const b = body.trim();
  const digits = toScript(b, SUP);
  if (digits !== null) return digits;
  return b.length === 1 ? `^${b}` : `^(${b})`;
}

function isSimpleFracArg(s: string): boolean {
  return /^[A-Za-z0-9.,₀-₉⁰-⁹√π]+$/.test(s.trim());
}

export function prettifyMath(input: string): string {
  let s = input;

  for (const [re, to] of SYMBOLS) s = s.replace(re, to);

  // \text{...} -> ...
  s = s.replace(/\\text\{([^{}]*)\}/g, "$1");

  // \frac{A}{B} (one level of nesting is enough for the podstawowy set)
  for (let i = 0; i < 4 && s.includes("\\frac"); i++) {
    s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, (_m, a: string, b: string) => {
      const num = isSimpleFracArg(a) ? a.trim() : `(${a.trim()})`;
      const den = isSimpleFracArg(b) ? b.trim() : `(${b.trim()})`;
      return `${num}/${den}`;
    });
  }

  // \sqrt[n]{A} and \sqrt{A}
  s = s.replace(/\\sqrt\[([^\]]*)\]\{([^{}]*)\}/g, (_m, n: string, a: string) => {
    const idx = toScript(n.trim(), SUP) ?? n.trim();
    return `${idx}√(${a.trim()})`;
  });
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, (_m, a: string) => {
    const arg = a.trim();
    return isSimpleFracArg(arg) ? `√${arg}` : `√(${arg})`;
  });

  // superscripts / subscripts: braced first, then single char
  s = s.replace(/\^\{([^{}]*)\}/g, (_m, b: string) => supOrParen(b));
  s = s.replace(/_\{([^{}]*)\}/g, (_m, b: string) => subOrParen(b));
  s = s.replace(/\^([A-Za-z0-9-])/g, (_m, c: string) => supOrParen(c));
  s = s.replace(/_([A-Za-z0-9])/g, (_m, c: string) => subOrParen(c));

  // leftover TeX scaffolding
  s = s.replace(/\\left|\\right/g, "");
  s = s.replace(/[{}]/g, "");
  s = s.replace(/\\\\/g, " ");
  s = s.replace(/\$/g, "");
  s = s.replace(/[ \t]{2,}/g, " ").trim();

  return s;
}
