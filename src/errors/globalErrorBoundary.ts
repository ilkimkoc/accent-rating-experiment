cat > src/errors/globalErrorBoundary.ts <<'EOF'
const ERROR_FLAG_KEY = "__GLOBAL_FATAL_ERROR__";

function renderGenericError(error: unknown): void {
  const message =
    error instanceof Error
      ? `${error.name}: ${error.message}\n\n${error.stack ?? ""}`
      : String(error);

  document.body.innerHTML = `
    <div class="global-error-boundary">
      <div class="global-error-content">
        <h1>Something went wrong</h1>
        <p>Please copy the technical error below:</p>
        <pre style="
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          max-width: 900px;
          margin: 24px auto;
          padding: 20px;
          text-align: left;
          background: #111;
          color: #ffdddd;
          border: 1px solid #aa3333;
          border-radius: 8px;
        ">${message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
      </div>
    </div>
  `;

  (window as any)[ERROR_FLAG_KEY] = true;
}

export function hasGlobalErrorOccurred(): boolean {
  return Boolean((window as any)[ERROR_FLAG_KEY]);
}

export function registerGlobalErrorBoundary(): void {
  window.onerror = (
    message,
    source,
    lineno,
    colno,
    error
  ) => {
    renderGenericError(
      error ??
        new Error(
          `${String(message)} at ${source ?? "unknown source"}:${lineno ?? 0}:${colno ?? 0}`
        )
    );
    return true;
  };

  window.onunhandledrejection = (event) => {
    renderGenericError(event.reason);
  };
}
EOF 
