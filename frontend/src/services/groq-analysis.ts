import Groq from 'groq-sdk';

export interface DetectedIssue {
  issue_type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  count: number;
  context: string;
}

export interface InterviewAnalysis {
  overall_score: number;
  communication_score: number;
  technical_score: number;
  problem_solving_score: number;
  code_quality_score: number;
  summary: string;
  detailed_feedback: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detected_issues: DetectedIssue[];
  skill_breakdown: {
    communication: {
      score: number;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
    technical: {
      score: number;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
    problem_solving: {
      score: number;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
    code_quality: {
      score: number;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
  };
}

const ANALYSIS_PROMPT = `You are an expert technical interviewer at Google/Meta/Amazon. Analyze this interview conversation and provide STRICT, CRITICAL feedback.

Analyze the conversation and return a JSON object with this exact structure:
{
  "overall_score": number (0-1, be strict!),
  "communication_score": number (0-1),
  "technical_score": number (0-1),
  "problem_solving_score": number (0-1),
  "code_quality_score": number (0-1, 0 if no code),
  "summary": "2-3 sentence honest assessment",
  "detailed_feedback": "4-5 sentences on what went wrong",
  "strengths": ["2-3 specific strengths"],
  "weaknesses": ["2-3 specific weaknesses"],
  "recommendations": ["3-5 actionable improvements"],
  "detected_issues": [
    {
      "issue_type": "filler_words|rambling|no_clarifying|poor_posture|low_confidence|weak_intro|other",
      "severity": "high|medium|low",
      "description": "Specific description of what was found",
      "count": number,
      "context": "Brief quote from conversation"
    }
  ],
  "skill_breakdown": {
    "communication": { "score": 0-1, "strengths": [], "weaknesses": [], "recommendations": [] },
    "technical": { "score": 0-1, "strengths": [], "weaknesses": [], "recommendations": [] },
    "problem_solving": { "score": 0-1, "strengths": [], "weaknesses": [], "recommendations": [] },
    "code_quality": { "score": 0-1, "strengths": [], "weaknesses": [], "recommendations": [] }
  }
}

SCORING RUBRIC (be strict!):
- 0.9-1.0: Truly exceptional, interview-ready
- 0.7-0.8: Good but notable flaws
- 0.5-0.6: Average, needs work
- Below 0.5: Poor, major issues

DETECTED ISSUES - Look for:
1. filler_words: Count "um", "uh", "like", "you know", "so", "basically"
2. rambling: Answers too long, unfocused, off-topic
3. no_clarifying: Jumped straight to solution without asking questions
4. poor_posture: Any mention of slouching or bad body language
5. low_confidence: "I guess", "maybe", "I'm not sure", hesitant tone
6. weak_intro: Poor opening statements

Be HONEST - only include issues you actually detect. Return realistic counts and actual quotes from the conversation.`;

export function getMockAnalysis(
  conversationHistory?: Array<{ role: string; content: string; timestamp?: string }>
): InterviewAnalysis {
  const history = conversationHistory || [];
  const userMessages = history.filter(
    (m) => m.role === 'user' || m.role === 'candidate'
  );
  
  const totalUserWords = userMessages.reduce((acc, m) => {
    return acc + (m.content ? m.content.split(/\s+/).filter(Boolean).length : 0);
  }, 0);

  const fullUserText = userMessages.map((m) => m.content || '').join(' ');
  const sampleUserMsg = userMessages.find((m) => m.content.length > 5)?.content || fullUserText || 'No response recorded.';
  const snippet = sampleUserMsg.length > 90 ? sampleUserMsg.slice(0, 90) + '...' : sampleUserMsg;

  // Simple proportional baseline if Groq API key is not present
  const wordRatio = Math.min(1.0, totalUserWords / 120);
  const commScore = Math.round(wordRatio * 85) / 100;
  const techScore = Math.round(wordRatio * 80) / 100;
  const probScore = Math.round(wordRatio * 82) / 100;
  const codeScore = totalUserWords > 30 ? 0.60 : 0.0;

  const overall = Math.round(((commScore + techScore + probScore + codeScore) / 4) * 100) / 100;

  const detected_issues: DetectedIssue[] = [];
  if (totalUserWords < 20 && totalUserWords > 0) {
    detected_issues.push({
      issue_type: 'brief_answer',
      severity: 'medium',
      description: `Response duration was brief (${totalUserWords} total words)`,
      count: 1,
      context: snippet
    });
  }

  return {
    overall_score: overall,
    communication_score: commScore,
    technical_score: techScore,
    problem_solving_score: probScore,
    code_quality_score: codeScore,
    summary: totalUserWords > 0 
      ? `Candidate provided ${userMessages.length} turn(s) (${totalUserWords} total words): "${snippet}"` 
      : 'No response transcript recorded.',
    detailed_feedback: `Evaluated ${userMessages.length} candidate turn(s) across total transcript volume of ${totalUserWords} words.`,
    strengths: userMessages.length > 0 ? [`Completed ${userMessages.length} response turn(s)`] : [],
    weaknesses: totalUserWords < 40 ? ['Expand response length and technical detail'] : [],
    recommendations: ['Elaborate on system design trade-offs and STAR framework examples'],
    detected_issues,
    skill_breakdown: {
      communication: {
        score: commScore,
        strengths: commScore > 0.5 ? ['Conversational engagement'] : [],
        weaknesses: commScore <= 0.5 ? ['Brief response length'] : [],
        recommendations: ['Elaborate further on verbal answers']
      },
      technical: {
        score: techScore,
        strengths: techScore > 0.5 ? ['Technical discussion'] : [],
        weaknesses: techScore <= 0.5 ? ['Expand system architecture details'] : [],
        recommendations: ['Discuss architecture trade-offs']
      },
      problem_solving: {
        score: probScore,
        strengths: probScore > 0.5 ? ['Problem solving steps'] : [],
        weaknesses: probScore <= 0.5 ? ['Provide step-by-step methodology'] : [],
        recommendations: ['Structure answers with STAR framework']
      },
      code_quality: {
        score: codeScore,
        strengths: codeScore > 0.5 ? ['Code concepts'] : [],
        weaknesses: codeScore <= 0.5 ? ['Provide code implementation'] : [],
        recommendations: ['Provide algorithmic solutions']
      }
    }
  };
}

export async function analyzeInterview(
  conversationHistory: Array<{ role: string; content: string; timestamp?: string }>,
  interviewTitle: string = 'Interview'
): Promise<InterviewAnalysis> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    console.warn('GROQ_API_KEY not set, using dynamic transcript fallback analysis');
    return getMockAnalysis(conversationHistory);
  }

  const groq = new Groq({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const conversationText = conversationHistory.length > 0
    ? conversationHistory.map((msg) => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`).join('\n\n')
    : 'Candidate: Im applying for this software engineering role. I have 3 years of experience.';

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: ANALYSIS_PROMPT },
        { 
          role: 'user', 
          content: `Interview: ${interviewTitle}\n\nConversation:\n${conversationText}` 
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return getMockAnalysis(conversationHistory);
    }

    const analysis: InterviewAnalysis = JSON.parse(content);
    if (!analysis.detected_issues) {
      analysis.detected_issues = [];
    }

    return analysis;
  } catch (error) {
    console.error('Groq analysis failed, using fallback:', error);
    return getMockAnalysis(conversationHistory);
  }
}

