export type OcrTransportMode = 'rest' | 'grpc-streaming' | 'grpc-unary';

export function normalizeOcrTransportMode(mode?: string | null): OcrTransportMode {
  if (mode === 'grpc-streaming' || mode === 'grpc') return 'grpc-streaming';
  if (mode === 'grpc-unary') return 'grpc-unary';
  return 'rest';
}

export function parseOcrTransportMode(value: unknown): OcrTransportMode {
  return normalizeOcrTransportMode(typeof value === 'string' ? value : null);
}

export function isGrpcStreamingMode(mode: OcrTransportMode) {
  return mode === 'grpc-streaming';
}

export function isBatchOcrTransportMode(mode: OcrTransportMode) {
  return mode === 'rest' || mode === 'grpc-unary';
}

export function getOcrTransportLabel(mode: OcrTransportMode) {
  switch (mode) {
    case 'grpc-streaming':
      return 'gRPC Streaming';
    case 'grpc-unary':
      return 'gRPC Request/Response';
    default:
      return 'REST API';
  }
}

export function getOcrTransportUsageLabel(mode: OcrTransportMode) {
  switch (mode) {
    case 'grpc-streaming':
      return 'gRPC Stream';
    case 'grpc-unary':
      return 'gRPC R/R';
    default:
      return 'REST';
  }
}

export function getOcrReadyDelayMs(
  transportMode: OcrTransportMode | null | undefined,
  sourceType: 'sample' | 'upload',
  isMiss = false,
) {
  const base = sourceType === 'sample' ? 2800 : 3200;
  const jitter = Math.round(Math.random() * (isMiss ? 800 : 1200));

  if (transportMode === 'grpc-unary') {
    return Math.max(900, Math.round((base + jitter) * 0.48));
  }

  return base + jitter;
}

export function getOcrBatchRevealDelayMs(transportMode: OcrTransportMode) {
  return transportMode === 'grpc-unary' ? 180 : 480;
}
