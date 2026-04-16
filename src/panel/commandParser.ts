import { escapeHtml } from "./utils";

const TOOL_TAG_REGEX = /<tool_calling>([\s\S]*?)<\/tool_calling>/gi;

export function processToolCallsInText(text: string): string {
   const matches = [...text.matchAll(TOOL_TAG_REGEX)];
   if (!matches.length) return text;

   let out = "";
   let lastIndex = 0;

   for (const match of matches) {
      const fullMatch = match[0];
      const payload = (match[1] || "").trim();
      const start = match.index ?? 0;
      const end = start + fullMatch.length;

      // Keep text before this tag
      out += text.slice(lastIndex, start);

      // Replace this tag with command result
      let result = "";
      try {
         const parsedCommand = JSON.parse(payload);
         result = convertToolCallsToHTML(parsedCommand);
      } catch (e) {
         result = escapeHtml(fullMatch);
      }
      out += result;

      lastIndex = end;
   }

   // Keep trailing text
   out += text.slice(lastIndex);
   return out;
}

function convertToolCallsToHTML(command: Record<string, any>): string {
   if (command.header) {
      return `<div class="code-block">
               <div class="code-header">
                  <span class="code-lang">${escapeHtml(command.header)}</span>
               </div>
             </div>`;
   }
   return "";
}
