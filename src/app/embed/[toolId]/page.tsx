import { getAllTools } from "@/lib/tools";

// Only the tool ids returned by generateStaticParams are rendered; any other
// /embed/[toolId] route resolves to the static 404 page.
export const dynamicParams = false;

// Pre-render an embed wrapper page for every tool.
export function generateStaticParams() {
  return getAllTools().map((tool) => ({
    toolId: tool.id,
  }));
}

interface EmbedPageProps {
  params: Promise<{ toolId: string }>;
}

/**
 * Embedded tool wrapper page (/embed/[toolId]).
 *
 * Renders a full-viewport <iframe> that loads the actual tool page
 * (`/tools/[toolId]?embed=1&nobadge=1`) so that the embedded view shows only
 * the tool itself (site chrome and tool-layout chrome are stripped by the
 * embed mode in ToolLayout / ChromeWrapper). A "Powered by 99gongju.online"
 * badge is fixed at the bottom-right corner and links back to the tool page.
 */
export default async function EmbedToolPage({ params }: EmbedPageProps) {
  const { toolId } = await params;

  // The inner iframe loads the real tool page in embed mode. `nobadge=1`
  // suppresses the in-page badge because this wrapper renders its own.
  const innerSrc = `/tools/${toolId}?embed=1&nobadge=1`;
  const toolPageUrl = `/tools/${toolId}`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#09090b",
      }}
    >
      {/* Iframe fills the viewport, leaving a 24px strip at the bottom for the badge */}
      <iframe
        src={innerSrc}
        title="99gongju.online embed"
        style={{
          width: "100%",
          height: "calc(100vh - 24px)",
          border: "none",
          display: "block",
        }}
        allow="clipboard-read; clipboard-write"
        allowFullScreen
        loading="eager"
      />
      {/* Powered-by badge fixed at the bottom-right corner */}
      <a
        href={`https://99gongju.online${toolPageUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: "8px",
          right: "8px",
          fontSize: "12px",
          lineHeight: 1,
          padding: "4px 8px",
          borderRadius: "6px",
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          color: "rgba(255, 255, 255, 0.85)",
          textDecoration: "none",
          backdropFilter: "blur(4px)",
          zIndex: 50,
        }}
      >
        Powered by 99gongju.online
      </a>
    </div>
  );
}
