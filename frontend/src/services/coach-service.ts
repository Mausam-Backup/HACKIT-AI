export interface TournamentCriteria {
  level: 'college' | 'state' | 'national' | 'global';
  format: 'offline' | 'online' | 'hybrid';
  timeframe: '24h' | '36h' | '48h' | '1week';
  teamSkills: string;
  judgingFocus: 'innovation' | 'technical' | 'business' | 'ux';
  targetDomain?: string;
  openRouterKey?: string;
  model?: string;
}

export interface Attachment {
  name: string;
  type: 'image' | 'text' | 'pdf' | 'other';
  dataUrl?: string;
  content?: string;
}

export interface TechStackRecommendation {
  category: 'Frontend' | 'Backend' | 'Database' | 'AI / ML' | 'APIs & Services' | 'Deployment';
  name: string;
  reason: string;
  icon?: string;
}

export interface FeatureRoadmap {
  mustHaveMVP: string[];
  differentiators: string[];
  skipOrTraps: string[];
}

export interface TimelinePhase {
  phase: string;
  duration: string;
  tasks: string[];
}

export interface ProblemAnalysis {
  title: string;
  winScore: number; // 0-100
  impactRating: 'High' | 'Medium' | 'Low';
  technicalFeasibility: 'High' | 'Medium' | 'Low';
  noveltyScore: number; // 0-10
  verdict: string;
  pros: string[];
  cons: string[];
  techStack: TechStackRecommendation[];
  featureRoadmap: FeatureRoadmap;
  timeline: TimelinePhase[];
  pitchTips: string[];
  clarifyingQuestions: string[];
}

export interface ProblemComparisonItem {
  id: string;
  title: string;
  winScore: number;
  feasibility: 'High' | 'Medium' | 'Low';
  effortHours: number;
  wowFactor: 'High' | 'Medium' | 'Low';
  techRisk: 'Low' | 'Medium' | 'High';
  verdict: string;
  recommendedRole: string;
}

export interface ProblemComparisonMatrix {
  comparisonTitle: string;
  winnerTitle: string;
  summaryVerdict: string;
  items: ProblemComparisonItem[];
}

export interface CoachMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  analysis?: ProblemAnalysis;
  comparison?: ProblemComparisonMatrix;
  meta?: {
    latencyMs?: number;
    model?: string;
  };
}

export async function processFile(file: File): Promise<Attachment> {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
  const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json') || file.name.endsWith('.csv');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    if (isImage) {
      reader.onload = () => {
        resolve({
          name: file.name,
          type: 'image',
          dataUrl: reader.result as string,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } else if (isText) {
      reader.onload = () => {
        resolve({
          name: file.name,
          type: 'text',
          content: reader.result as string,
        });
      };
      reader.onerror = reject;
      reader.readAsText(file);
    } else if (isPdf) {
      reader.onload = () => {
        const dataUrl = reader.result as string;
        let extractedText = '';
        try {
          // Decode text content from base64 PDF stream if available
          const base64Str = dataUrl.split(',')[1] || '';
          const binaryStr = atob(base64Str);
          // Simple regex to extract readable ASCII text blocks from PDF object streams
          const textMatches = binaryStr.match(/[\x20-\x7E]{4,}/g) || [];
          const cleanedText = textMatches
            .filter((t) => !t.startsWith('/') && !t.includes('Obj') && !t.includes('Font') && t.length > 5)
            .slice(0, 150)
            .join(' ');

          if (cleanedText.length > 30) {
            extractedText = `[Extracted Document Text for "${file.name}"]:\n${cleanedText}`;
          }
        } catch (e) {
          console.warn('PDF text parse fallback:', e);
        }

        resolve({
          name: file.name,
          type: 'pdf',
          dataUrl,
          content: extractedText || `[PDF Document Attached: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)]`,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => {
        resolve({
          name: file.name,
          type: 'other',
          dataUrl: reader.result as string,
          content: `[File Attached: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)]`,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }
  });
}

export async function sendCoachMessage(
  messages: CoachMessage[],
  criteria: Partial<TournamentCriteria>,
  attachments: Attachment[] = []
): Promise<{ text: string; analysis?: ProblemAnalysis; comparison?: ProblemComparisonMatrix; meta?: { latencyMs?: number; model?: string } }> {
  try {
    const startTime = Date.now();
    const response = await fetch('/api/coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        criteria,
        attachments,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - startTime;
    return {
      ...data,
      meta: {
        latencyMs,
        model: criteria.model || 'OpenRouter / Groq Llama-3.3 70B',
      },
    };
  } catch (err) {
    console.error('Error contacting coach API:', err);
    throw err;
  }
}

