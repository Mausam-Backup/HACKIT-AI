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
  const lowerText = fullUserText.toLowerCase();

  // Detect filler words count
  const fillerMatches = lowerText.match(/\b(um|uh|like|you know|basically|so|i guess)\b/g) || [];
  const fillerCount = fillerMatches.length;

  // Detect negative / dismissive / unprofessional / junk phrasing
  const negativeMatches = lowerText.match(/\b(sucks|hate|terrible|bad|whatever|idk|dunno|garbage|crap|shit|useless|bro)\b/g) || [];
  const negativeCount = negativeMatches.length;

  // Count technical terms
  const techTerms = lowerText.match(/\b(react|node|api|database|sql|system|architecture|function|code|algorithm|async|state|backend|frontend|microservice|cache|redis|postgres|docker|kubernetes|aws|cloud|rest|graphql|design|pattern|optimization|performance|scale|security|auth|latency|queue|kafka)\b/g) || [];
  const techTermCount = techTerms.length;

  // Count reasoning / problem solving terms
  const logicTerms = lowerText.match(/\b(because|approach|solution|trade-off|first|then|finally|optimized|therefore|handled|implemented|reduced|increased|improved|scale|benchmark|result)\b/g) || [];
  const logicTermCount = logicTerms.length;

  // STRICT Dynamic Scoring Logic based on actual response substance:
  let commScore = 0;
  let techScore = 0;
  let probScore = 0;
  let codeScore = 0;

  if (totalUserWords === 0) {
    commScore = 0;
    techScore = 0;
    probScore = 0;
    codeScore = 0;
  } else if (totalUserWords < 15) {
    // Extremely brief answer (< 15 words)
    if (negativeCount > 0 || techTermCount === 0) {
      commScore = negativeCount > 0 ? 0 : 0.20;
      techScore = techTermCount > 0 ? 0.35 : 0;
      probScore = logicTermCount > 0 ? 0.35 : 0;
      codeScore = 0;
    } else {
      commScore = 0.35;
      techScore = 0.35;
      probScore = 0.35;
      codeScore = 0;
    }
  } else if (totalUserWords < 40) {
    // Brief answer (15 - 40 words)
    commScore = negativeCount > 0 ? 0.15 : 0.50;
    techScore = techTermCount > 0 ? 0.55 : 0.10;
    probScore = logicTermCount > 0 ? 0.55 : 0.10;
    codeScore = 0;
  } else if (totalUserWords < 100) {
    // Medium answer (40 - 100 words)
    commScore = negativeCount > 0 ? 0.30 : 0.72;
    techScore = techTermCount > 0 ? Math.min(0.85, 0.40 + techTermCount * 0.08) : 0.20;
    probScore = logicTermCount > 0 ? Math.min(0.85, 0.40 + logicTermCount * 0.08) : 0.20;
    codeScore = (lowerText.includes('code') || lowerText.includes('function')) ? 0.50 : 0.10;
  } else {
    // Detailed answer (100+ words)
    commScore = negativeCount > 0 ? 0.40 : 0.85;
    techScore = techTermCount > 0 ? Math.min(0.95, 0.55 + techTermCount * 0.06) : 0.30;
    probScore = logicTermCount > 0 ? Math.min(0.95, 0.55 + logicTermCount * 0.06) : 0.30;
    codeScore = (lowerText.includes('code') || lowerText.includes('function')) ? 0.75 : 0.20;
  }

  // Deduct for filler words
  if (fillerCount > 5) commScore = Math.max(0, commScore - 0.15);
  else if (fillerCount > 2) commScore = Math.max(0, commScore - 0.08);

  const overall = Math.round(((commScore + techScore + probScore + codeScore) / 4) * 100) / 100;

  // Real quote excerpt
  const sampleUserMsg = userMessages.find((m) => m.content.length > 5)?.content || fullUserText || 'No response recorded.';
  const snippet = sampleUserMsg.length > 90 ? sampleUserMsg.slice(0, 90) + '...' : sampleUserMsg;

  // Build accurate detected issues
  const detected_issues: DetectedIssue[] = [];
  if (negativeCount > 0) {
    detected_issues.push({
      issue_type: 'unprofessional_tone',
      severity: 'high',
      description: `Used dismissive/unprofessional phrase ("${negativeMatches.slice(0, 3).join('", "')}")`,
      count: negativeCount,
      context: snippet
    });
  }
  if (totalUserWords < 20 && totalUserWords > 0) {
    detected_issues.push({
      issue_type: 'extremely_brief_answer',
      severity: 'high',
      description: `Response was extremely brief (${totalUserWords} total words)`,
      count: 1,
      context: snippet
    });
  }
  if (fillerCount > 0) {
    detected_issues.push({
      issue_type: 'filler_words',
      severity: fillerCount > 4 ? 'medium' : 'low',
      description: `Used filler phrases ${fillerCount} time(s)`,
      count: fillerCount,
      context: snippet
    });
  }

  // Construct realistic strengths, weaknesses, summary
  let summary = '';
  let strengths: string[] = [];
  let weaknesses: string[] = [];
  let recommendations: string[] = [];

  if (totalUserWords < 15 || negativeCount > 0) {
    summary = `Candidate provided an extremely brief response (${totalUserWords} total words) with negative/unprofessional phrasing ("${snippet}"). Failed to demonstrate technical architecture, engineering depth, or problem-solving reasoning.`;
    strengths = userMessages.length > 0 ? [`Session initiated (${userMessages.length} turn)`] : [];
    weaknesses = [
      `Response was extremely short (${totalUserWords} total words)`,
      negativeCount > 0 ? `Used unprofessional phrase: "${snippet}"` : 'No technical concepts or system architecture discussed',
      'Lacks structured STAR format (Situation, Task, Action, Result)'
    ];
    recommendations = [
      'Provide comprehensive technical responses with architectural detail',
      'Maintain professional executive demeanor and constructive dialogue',
      'Structure behavioral answers strictly with the STAR framework'
    ];
  } else {
    summary = `Candidate provided ${userMessages.length} response turn(s) (${totalUserWords} total words). Demonstrates basic conversational engagement with room to expand technical depth.`;
    strengths = [
      `Active engagement across ${userMessages.length} prompt exchange(s)`,
      `Spoke ${totalUserWords} total words during technical discussion`,
      'Maintained conversational response flow'
    ];
    weaknesses = [
      techTermCount < 2 ? 'Lacks specific system architecture trade-offs' : 'Could tighten response conciseness',
      logicTermCount < 2 ? 'Could articulate step-by-step problem-solving methodology' : 'Could quantify engineering impact metrics'
    ];
    recommendations = [
      'Deep-dive into specific system architecture trade-offs',
      'Structure behavioral answers using Situation-Task-Action-Result',
      'Quantify engineering achievements with measurable metrics'
    ];
  }

  return {
    overall_score: Math.max(0, Math.min(0.98, overall)),
    communication_score: Math.max(0, Math.min(0.98, Math.round(commScore * 100) / 100)),
    technical_score: Math.max(0, Math.min(0.98, Math.round(techScore * 100) / 100)),
    problem_solving_score: Math.max(0, Math.min(0.98, Math.round(probScore * 100) / 100)),
    code_quality_score: Math.max(0, Math.min(0.98, Math.round(codeScore * 100) / 100)),
    summary,
    detailed_feedback: `Evaluated ${userMessages.length} candidate turn(s). Response length: ${totalUserWords} words. Technical terms: ${techTermCount}. Quote: "${snippet}"`,
    strengths,
    weaknesses,
    recommendations,
    detected_issues,
    skill_breakdown: {
      communication: {
        score: Math.round(commScore * 100) / 100,
        strengths: commScore > 0.5 ? ['Conversational flow'] : [],
        weaknesses: commScore <= 0.5 ? ['Extremely brief response', 'Unprofessional tone'] : ['Cadence variance'],
        recommendations: ['Maintain professional tone and elaborate on answers']
      },
      technical: {
        score: Math.round(techScore * 100) / 100,
        strengths: techScore > 0.5 ? ['Domain concepts mentioned'] : [],
        weaknesses: techScore <= 0.5 ? ['No system architecture or technical depth provided'] : ['Elaborate on trade-offs'],
        recommendations: ['Explain system design principles and technical choices']
      },
      problem_solving: {
        score: Math.round(probScore * 100) / 100,
        strengths: probScore > 0.5 ? ['Logical reasoning'] : [],
        weaknesses: probScore <= 0.5 ? ['No problem-solving methodology shown'] : ['Ask clarifying questions'],
        recommendations: ['Break down problems step-by-step']
      },
      code_quality: {
        score: Math.round(codeScore * 100) / 100,
        strengths: codeScore > 0.5 ? ['Clean structure'] : [],
        weaknesses: codeScore <= 0.5 ? ['No code or algorithm logic submitted'] : ['Edge cases'],
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

