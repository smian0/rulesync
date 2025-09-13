import matter from "gray-matter";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function deepRemoveNullishValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    const cleanedArray = value
      .map((item) => deepRemoveNullishValue(item))
      .filter((item) => item !== undefined);
    return cleanedArray;
  }

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      const cleaned = deepRemoveNullishValue(val);
      if (cleaned !== undefined) {
        result[key] = cleaned;
      }
    }
    return result;
  }

  return value;
}

function deepRemoveNullishObject(
  obj: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!obj || typeof obj !== "object") {
    return {};
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    const cleaned = deepRemoveNullishValue(val);
    if (cleaned !== undefined) {
      result[key] = cleaned;
    }
  }
  return result;
}

export function stringifyFrontmatter(
  body: string,
  frontmatter: Record<string, unknown> | null | undefined,
): string {
  const cleanFrontmatter = deepRemoveNullishObject(frontmatter);

  return matter.stringify(body, cleanFrontmatter);
}

export function parseFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  try {
    const { data: frontmatter, content: body } = matter(content);
    return { frontmatter, body };
  } catch (error) {
    // If YAML parsing fails, try to extract frontmatter manually
    // This handles cases where descriptions contain complex XML/HTML tags
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatterText = frontmatterMatch[1];
      const body = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
      
      // Parse line by line for simple key-value pairs
      const frontmatter: Record<string, unknown> = {};
      const lines = frontmatterText.split('\n');
      let currentKey = '';
      let currentValue = '';
      let inMultiline = false;
      
      for (const line of lines) {
        if (line.match(/^[a-zA-Z][a-zA-Z0-9_-]*:\s*/)) {
          // Save previous key-value pair if we have one
          if (currentKey && currentValue !== undefined) {
            frontmatter[currentKey] = currentValue.trim();
          }
          
          // Start new key-value pair
          const [key, ...valueParts] = line.split(':');
          currentKey = key.trim();
          currentValue = valueParts.join(':').trim();
          inMultiline = false;
        } else if (currentKey && (line.startsWith('  ') || line.startsWith('\t') || inMultiline)) {
          // Continue multi-line value
          currentValue += '\n' + line;
          inMultiline = true;
        } else if (line.trim() === '' && inMultiline) {
          // Empty line in multiline content
          currentValue += '\n' + line;
        }
      }
      
      // Save the last key-value pair
      if (currentKey && currentValue !== undefined) {
        frontmatter[currentKey] = currentValue.trim();
      }
      
      return { frontmatter, body };
    }
    
    // If we can't parse frontmatter at all, throw the original error
    throw error;
  }
}
