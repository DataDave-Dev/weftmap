type ClearState = (value: null) => void;

export function clearAnalysisResult(
  setGraph: ClearState,
  setError: ClearState,
) {
  setGraph(null);
  setError(null);
}
