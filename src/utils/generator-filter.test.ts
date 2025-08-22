import { describe, expect, it } from "vitest";
import {
  filterGeneratorsByFeatures,
  type GeneratorInfo,
  getGeneratorsForFeature,
  groupGeneratorsByFeature,
  mapGeneratorToFeatureType,
  validateFeaturesHaveGenerators,
} from "./generator-filter.js";

describe("generator-filter", () => {
  const mockGenerators: GeneratorInfo[] = [
    { name: "copilot", other: "data1" },
    { name: "cursor", other: "data2" },
    { name: "claudecode-commands", other: "data3" },
    { name: "roo-commands", other: "data4" },
    { name: "claudecode-mcp", other: "data5" },
    { name: "cursor-mcp", other: "data6" },
    { name: "cursor-ignore", other: "data7" },
    { name: "unmapped-generator", other: "data8" },
  ];

  describe("mapGeneratorToFeatureType", () => {
    it("should map rules generators correctly", () => {
      expect(mapGeneratorToFeatureType("copilot")).toBe("rules");
      expect(mapGeneratorToFeatureType("cursor")).toBe("rules");
      expect(mapGeneratorToFeatureType("claudecode")).toBe("rules");
    });

    it("should map commands generators correctly", () => {
      expect(mapGeneratorToFeatureType("claudecode-commands")).toBe("commands");
      expect(mapGeneratorToFeatureType("roo-commands")).toBe("commands");
    });

    it("should map mcp generators correctly", () => {
      expect(mapGeneratorToFeatureType("claudecode-mcp")).toBe("mcp");
      expect(mapGeneratorToFeatureType("cursor-mcp")).toBe("mcp");
    });

    it("should map ignore generators correctly", () => {
      expect(mapGeneratorToFeatureType("cursor-ignore")).toBe("ignore");
      expect(mapGeneratorToFeatureType("cline-ignore")).toBe("ignore");
    });

    it("should return null for unmapped generator", () => {
      expect(mapGeneratorToFeatureType("unknown-generator")).toBe(null);
    });
  });

  describe("filterGeneratorsByFeatures", () => {
    it("should return all generators for wildcard", () => {
      const result = filterGeneratorsByFeatures(mockGenerators, "*");
      expect(result).toHaveLength(8);
      expect(result).toEqual(mockGenerators);
    });

    it("should return all generators for undefined features", () => {
      const result = filterGeneratorsByFeatures(mockGenerators, undefined);
      expect(result).toHaveLength(8);
      expect(result).toEqual(mockGenerators);
    });

    it("should filter by rules feature", () => {
      const result = filterGeneratorsByFeatures(mockGenerators, ["rules"]);
      expect(result).toHaveLength(3); // copilot, cursor, unmapped-generator
      expect(result.map((g) => g.name)).toEqual(["copilot", "cursor", "unmapped-generator"]);
    });

    it("should filter by commands feature", () => {
      const result = filterGeneratorsByFeatures(mockGenerators, ["commands"]);
      expect(result).toHaveLength(3); // claudecode-commands, roo-commands, unmapped-generator
      expect(result.map((g) => g.name)).toEqual([
        "claudecode-commands",
        "roo-commands",
        "unmapped-generator",
      ]);
    });

    it("should filter by multiple features", () => {
      const result = filterGeneratorsByFeatures(mockGenerators, ["rules", "commands"]);
      expect(result).toHaveLength(5); // rules + commands + unmapped
      expect(result.map((g) => g.name)).toEqual([
        "copilot",
        "cursor",
        "claudecode-commands",
        "roo-commands",
        "unmapped-generator",
      ]);
    });

    it("should include unmapped generators for backward compatibility", () => {
      const result = filterGeneratorsByFeatures(mockGenerators, ["rules"]);
      expect(result.some((g) => g.name === "unmapped-generator")).toBe(true);
    });
  });

  describe("groupGeneratorsByFeature", () => {
    it("should group generators by feature type", () => {
      const result = groupGeneratorsByFeature(mockGenerators);

      expect(result.rules).toHaveLength(2);
      expect(result.rules.map((g) => g.name)).toEqual(["copilot", "cursor"]);

      expect(result.commands).toHaveLength(2);
      expect(result.commands.map((g) => g.name)).toEqual(["claudecode-commands", "roo-commands"]);

      expect(result.mcp).toHaveLength(2);
      expect(result.mcp.map((g) => g.name)).toEqual(["claudecode-mcp", "cursor-mcp"]);

      expect(result.ignore).toHaveLength(1);
      expect(result.ignore.map((g) => g.name)).toEqual(["cursor-ignore"]);

      expect(result.unmapped).toHaveLength(1);
      expect(result.unmapped.map((g) => g.name)).toEqual(["unmapped-generator"]);
    });
  });

  describe("getGeneratorsForFeature", () => {
    it("should return generator names for rules feature", () => {
      const result = getGeneratorsForFeature("rules");
      expect(result).toContain("copilot");
      expect(result).toContain("cursor");
      expect(result).toContain("claudecode");
      expect(result).not.toContain("claudecode-commands");
    });

    it("should return generator names for commands feature", () => {
      const result = getGeneratorsForFeature("commands");
      expect(result).toContain("claudecode-commands");
      expect(result).toContain("roo-commands");
      expect(result).not.toContain("copilot");
    });

    it("should return generator names for mcp feature", () => {
      const result = getGeneratorsForFeature("mcp");
      expect(result).toContain("claudecode-mcp");
      expect(result).toContain("cursor-mcp");
      expect(result).not.toContain("copilot");
    });

    it("should return generator names for ignore feature", () => {
      const result = getGeneratorsForFeature("ignore");
      expect(result).toContain("cursor-ignore");
      expect(result).toContain("cline-ignore");
      expect(result).not.toContain("copilot");
    });
  });

  describe("validateFeaturesHaveGenerators", () => {
    it("should return valid=true when all features have generators", () => {
      const result = validateFeaturesHaveGenerators(["rules", "commands"], mockGenerators);
      expect(result.valid).toBe(true);
      expect(result.missingFeatures).toEqual([]);
    });

    it("should return valid=false when some features have no generators", () => {
      const limitedGenerators = [
        { name: "copilot" }, // rules only
      ];

      const result = validateFeaturesHaveGenerators(
        ["rules", "commands", "mcp"],
        limitedGenerators,
      );
      expect(result.valid).toBe(false);
      expect(result.missingFeatures).toEqual(["commands", "mcp"]);
    });

    it("should handle empty generator list", () => {
      const result = validateFeaturesHaveGenerators(["rules"], []);
      expect(result.valid).toBe(false);
      expect(result.missingFeatures).toEqual(["rules"]);
    });

    it("should handle empty features list", () => {
      const result = validateFeaturesHaveGenerators([], mockGenerators);
      expect(result.valid).toBe(true);
      expect(result.missingFeatures).toEqual([]);
    });
  });
});
