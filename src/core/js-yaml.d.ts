// Minimal ambient declaration for the vendored js-yaml (no @types package
// installed). Only the surface we use.
declare module "js-yaml" {
  export function load(input: string): unknown;
  export function dump(obj: unknown): string;
  const jsyaml: {load: typeof load; dump: typeof dump};
  export default jsyaml;
}
