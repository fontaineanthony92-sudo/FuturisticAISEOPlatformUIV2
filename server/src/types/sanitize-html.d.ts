declare module "sanitize-html" {
  interface SanitizeOptions {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    allowedSchemes?: string[];
    allowedSchemesByTag?: Record<string, string[]>;
  }

  function sanitizeHtml(dirty: string, options?: SanitizeOptions): string;
  export default sanitizeHtml;
}
