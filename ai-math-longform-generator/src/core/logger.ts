export function logStep(message: string): void {
  process.stdout.write(`\n> ${message}\n`);
}
