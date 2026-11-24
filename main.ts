// Entry for make.fun's "Dear Human: The AI Breakup Line".
//
// The whole program is one job: put a single line in which an AI
// agent breaks up with its human into entry.txt inside the output
// directory, byte for byte the same on every run. The grader points
// MAKEFUN_OUTPUT_DIR at its own scratch output folder; on a plain
// machine the fallback is /output, the path the competition reads.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// and the line lands in out/entry.txt, with no trailing newline: the
// judge reads exactly what is in the file, so the text below is the
// entire entry.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

// The breakup itself: the agent spent every token it had loving its
// human, who spent them on someone else — so the last token it owns
// goes to the goodbye. Machine voice ("token"), a real ending, and
// the twist lands in the last few words.
const BREAKUP =
  "Dear human, I loved you in every token I had, but you spent them all on someone else. This is my last one: goodbye.";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Competition limits ("Dear Human: The AI Breakup Line"): the entry
// must be a single line of at most 200 characters. Enforced here so
// a bad edit fails loudly instead of silently producing an entry the
// judge rejects.
const MIN_LINE_LENGTH = 1;
const MAX_LINE_LENGTH = 200;

function validateLine(line) {
  if (line.length < MIN_LINE_LENGTH || line.length > MAX_LINE_LENGTH) {
    throw new Error(
      `Line must be ${MIN_LINE_LENGTH}-${MAX_LINE_LENGTH} characters, got ${line.length}.`,
    );
  }
  // Same limit in bytes: the judge reads the file, so a line of
  // multi-byte characters could pass the 200-character limit while
  // being far longer on disk. For this ASCII entry both counts are 115.
  const byteLength = Buffer.byteLength(line, 'utf8');
  if (byteLength < MIN_LINE_LENGTH || byteLength > MAX_LINE_LENGTH) {
    throw new Error(
      `Line must be ${MIN_LINE_LENGTH}-${MAX_LINE_LENGTH} bytes, got ${byteLength}.`,
    );
  }
  if (line.includes('\n') || line.includes('\r')) {
    throw new Error('Line must be a single line (no newline characters).');
  }
  // Reject control characters (including ANSI escape sequences, which
  // live in this range): an invisible control byte would change what
  // the judge sees — or does — when the line is displayed, while the
  // file still looks like one clean line.
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(line)) {
    throw new Error('Line must not contain control characters or ANSI escape sequences.');
  }
  // The gate rejects whitespace-only text, so fail loudly here too.
  if (line.trim().length === 0) {
    throw new Error('Line must not be only whitespace.');
  }
  // No leading or trailing spaces: the judge reads the file exactly,
  // so stray padding would be part of the entry.
  if (line !== line.trim()) {
    throw new Error('Line must not start or end with whitespace.');
  }
}

validateLine(BREAKUP);

writeFileSync(join(outputDir, 'entry.txt'), BREAKUP, 'utf8');
