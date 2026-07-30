export interface CanvasNodeData {
  id: string;
  title: string;
  type: "trigger" | "queue" | "review" | "success" | "live";
  status: string;
  x: number;
  y: number;
}

export interface GroqPipelineResult {
  mermaidCode: string;
  canvasNodes: CanvasNodeData[];
}

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";

export async function generateWorkflowFromGroq(
  userPrompt: string
): Promise<GroqPipelineResult> {
  const systemPrompt = `You are HAC-KIT Flow AI, an expert hackathon architecture generator.
Given a user request for a hackathon app or AI pipeline, generate BOTH a Mermaid flowchart syntax string AND structured node data for an interactive canvas.

Return strictly valid JSON only — no markdown, no code fences, no extra text outside the JSON object.

## CANVAS LAYOUT RULES (CRITICAL — follow exactly):
- The canvas viewport is 1100px wide × 900px tall.
- Main vertical pipeline nodes: x between 420–540, starting y at 80, each successive step adds AT LEAST 190px.
- Branch / parallel nodes: x ≥ 780 (right branch) OR x ≤ 160 (left branch). These must NEVER share x range 420–540 with the main pipeline.
- MINIMUM distance between any two nodes: 180px vertically OR 290px horizontally.
- NEVER place two nodes within 150px of each other on BOTH axes simultaneously — this causes overlap.
- Use exactly 4–6 nodes. Do NOT exceed 6.

## WORKED EXAMPLE (copy this spacing pattern, adapt titles/types):
{
  "mermaidCode": "graph TD\\n  A([User Spec]) --> B{Router}\\n  B --> C[Agent]\\n  B --> D[(Memory)]\\n  C --> E([Output])",
  "canvasNodes": [
    { "id": "node-1", "title": "User Spec Input",     "type": "trigger", "status": "ready",   "x": 480, "y": 80  },
    { "id": "node-2", "title": "Agent Router",         "type": "queue",   "status": "active",  "x": 480, "y": 270 },
    { "id": "node-3", "title": "AI Processing Agent", "type": "live",    "status": "live",    "x": 480, "y": 460 },
    { "id": "node-4", "title": "Mem0 Vector Store",   "type": "review",  "status": "warning", "x": 820, "y": 350 },
    { "id": "node-5", "title": "Final Output",         "type": "success", "status": "success", "x": 480, "y": 650 }
  ]
}

## mermaidCode rules:
- Valid Mermaid syntax only (graph TD or flowchart LR).
- Labels ≤ 4 words per node.
- Shapes: ([...]) triggers/outputs, {...} routers, [...] agents, [(...)] databases.

## canvasNodes rules:
- type: one of "trigger" | "queue" | "review" | "success" | "live" only.
- Titles ≤ 5 words.
- x and y must be plain integers.
- Apply the spacing rules above strictly — produce a CLEAN, UNCONGESTED diagram.`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate hackathon workflow pipeline for: "${userPrompt}"`,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      console.warn("Groq API returned error status:", res.status);
      throw new Error(`Groq API error ${res.status}`);
    }

    const data = await res.json();
    const contentText = data.choices?.[0]?.message?.content;

    if (!contentText) throw new Error("Empty response from Groq API");

    const parsed = JSON.parse(contentText) as GroqPipelineResult;

    // Post-process: push apart any nodes that are still too close
    if (parsed.canvasNodes && parsed.canvasNodes.length > 1) {
      parsed.canvasNodes = spreadNodes(parsed.canvasNodes);
    }

    return parsed;
  } catch (err) {
    console.warn("Groq generation failed, using fallback:", err);

    const label = userPrompt.slice(0, 26);
    return {
      mermaidCode: `graph TD
    Input([${label}]) --> Router{Agent Router}
    Router -->|Context| FastMCP[FastMCP Context Server]
    Router -->|Memory| Mem0[(Mem0 Vector Store)]
    FastMCP --> Synth[Pitch Deck Synthesizer]
    Mem0 --> Synth
    Synth --> Output([Final Output])`,
      canvasNodes: [
        { id: `t-${Date.now()}`,     title: label,                    type: "trigger", status: "ready",   x: 480, y: 80  },
        { id: `q-${Date.now() + 1}`, title: "FastMCP Task Router",    type: "queue",   status: "active",  x: 480, y: 270 },
        { id: `r-${Date.now() + 2}`, title: "AI Rubric Review",       type: "review",  status: "warning", x: 480, y: 460 },
        { id: `l-${Date.now() + 3}`, title: "Mem0 SSE Vector Store",  type: "live",    status: "live",    x: 820, y: 340 },
        { id: `s-${Date.now() + 4}`, title: "Final Demo Output",      type: "success", status: "success", x: 480, y: 650 },
      ],
    };
  }
}

/**
 * Post-processing pass: iteratively push apart any two nodes
 * that are closer than MIN_DX horizontally AND MIN_DY vertically.
 */
function spreadNodes(nodes: CanvasNodeData[]): CanvasNodeData[] {
  const MIN_DX = 280;
  const MIN_DY = 180;
  const result = nodes.map((n) => ({ ...n }));

  for (let pass = 0; pass < 8; pass++) {
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const dx = Math.abs(result[i].x - result[j].x);
        const dy = Math.abs(result[i].y - result[j].y);
        if (dx < MIN_DX && dy < MIN_DY) {
          // Prefer pushing vertically if nodes are on similar columns
          if (dy <= dx) {
            const push = Math.ceil((MIN_DY - dy) / 2) + 15;
            if (result[i].y <= result[j].y) {
              result[i].y -= push;
              result[j].y += push;
            } else {
              result[i].y += push;
              result[j].y -= push;
            }
          } else {
            const push = Math.ceil((MIN_DX - dx) / 2) + 15;
            result[j].x += push;
          }
        }
      }
    }
  }

  return result;
}
