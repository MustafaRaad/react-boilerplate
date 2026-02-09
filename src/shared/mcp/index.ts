/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 * 
 * MCP (Model-Component-Protocol) Utilities
 * Central export point for MCP pattern utilities
 */

export { createModel, useModelFromQuery, type ModelConfig } from "./createModel";
export {
  createProtocol,
  createCRUDProtocol,
  type ProtocolMutationConfig,
} from "./createProtocol";
export { ErrorBoundary } from "./ErrorBoundary";
export type { ModelResult, ProtocolMutationResult, CRUDProtocol } from "./types";