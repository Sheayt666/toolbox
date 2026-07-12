import { getToolBySlug, type Tool } from "./tools";

/**
 * Tool workflow chains.
 *
 * Each chain is an ordered list of tool ids that represent a typical
 * step-by-step usage sequence (e.g. compress an image -> convert its
 * format -> encode it as Base64 -> add a watermark). These chains power
 * both the inline "workflow guidance" inside ToolLayout and the
 * "next step" recommendations inside ToolRecommend.
 *
 * Only tool ids that resolve to a real Tool (via getToolBySlug) are
 * rendered, so it is safe to reference ids here that may not exist yet.
 */
const workflows: string[][] = [
  // Image processing pipeline
  ["image-compressor", "image-converter", "image-to-base64", "image-watermark"],
  // Image editing pipeline
  ["image-crop", "image-resize", "image-compressor", "image-converter"],
  // Image publishing pipeline
  ["image-resize", "image-compressor", "image-watermark", "favicon-generator"],
  // Encoding / decoding pipeline
  ["base64", "image-to-base64", "base64-to-image"],
  // Developer data pipeline
  ["json-formatter", "base64", "hash-generator"],
  // Security / sharing pipeline
  ["password-generator", "qrcode", "base64"],
];

export interface WorkflowStep {
  /** 1-based step number within the workflow */
  step: number;
  /** Resolved tool */
  tool: Tool;
  /** Whether this step is the currently viewed tool */
  current: boolean;
}

/**
 * Returns the full ordered workflow (with 1-based step numbers) that
 * contains the given tool. Returns an empty array when the tool is not
 * part of any defined workflow.
 */
export function getWorkflowForTool(toolId: string): WorkflowStep[] {
  if (!toolId) return [];
  for (const chain of workflows) {
    const idx = chain.indexOf(toolId);
    if (idx === -1) continue;
    const steps = chain
      .map((id) => getToolBySlug(id))
      .filter((t): t is Tool => Boolean(t));
    return steps.map((tool, i) => ({
      step: i + 1,
      tool,
      current: tool.id === toolId,
    }));
  }
  return [];
}

/**
 * Returns the workflow steps that come AFTER the given tool, i.e. the
 * recommended "next steps" in the usage sequence.
 */
export function getNextSteps(toolId: string, limit = 4): WorkflowStep[] {
  const workflow = getWorkflowForTool(toolId);
  const currentIdx = workflow.findIndex((s) => s.current);
  if (currentIdx === -1) return [];
  return workflow.slice(currentIdx + 1, currentIdx + 1 + limit);
}

/**
 * Whether the given tool participates in any defined workflow.
 */
export function hasWorkflow(toolId: string): boolean {
  return getWorkflowForTool(toolId).length > 0;
}
