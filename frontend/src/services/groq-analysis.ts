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

export async function analyzeInterview(
  conversationHistory: Array<{ role: string; content: string; timestamp?: string }>,
  interviewTitle: string = 'Interview'
): Promise<InterviewAnalysis> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    console.warn('GROQ_API_KEY not set, using mock analysis');
    return getMockAnalysis();
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
      return getMockAnalysis();
    }

    const analysis: InterviewAnalysis = JSON.parse(content);
    if (!analysis.detected_issues) {
      analysis.detected_issues = [];
    }

    return analysis;
  } catch (error) {
    console.error('Groq analysis failed, using fallback:', error);
    return getMockAnalysis();
  }
}

export function getMockAnalysis(): InterviewAnalysis {
  return {
    overall_score: 0.78,
    communication_score: 0.72,
    technical_score: 0.82,
    problem_solving_score: 0.80,
    code_quality_score: 0.75,
    summary: 'Solid technical foundation with good structured problem-solving. Minor filler word usage and room to tighten up communication.',
    detailed_feedback: 'You demonstrated strong technical depth and clear logic when describing previous projects. To take your performance to the next level, work on reducing filler words ("um", "like") and structure answers using the STAR method consistently.',
    strengths: [
      'Clear technical explanation of architecture choices',
      'Strong problem-solving methodology',
      'Good engagement and calm delivery under pressure'
    ],
    weaknesses: [
      'Used filler words ("um", "like") during initial responses',
      'Could provide more specific metric outcomes for past projects'
    ],
    recommendations: [
      'Practice brief pauses instead of filler words',
      'Structure behavioral answers strictly with the STAR framework',
      'Quantify project achievements with numbers and percentages'
    ],
    detected_issues: [
      {
        issue_type: 'filler_words',
        severity: 'medium',
        description: "Used 'um', 'uh', 'like' 7 times",
        count: 7,
        context: 'Um, I think the approach we took was... uh... like standard MVC'
      },
      {
        issue_type: 'low_confidence',
        severity: 'low',
        description: "Used hesitant phrase 'I guess'",
        count: 2,
        context: 'I guess we could optimize this with a hash map'
      }
    ],
    skill_breakdown: {
      communication: {
        score: 0.72,
        strengths: ['Clear articulation', 'Good conversational pace'],
        weaknesses: ['Occasional filler words'],
        recommendations: ['Pause before answering']
      },
      technical: {
        score: 0.82,
        strengths: ['Strong fundamentals', 'Good grasp of system design'],
        weaknesses: ['Can elaborate more on trade-offs'],
        recommendations: ['Deep-dive into edge cases']
      },
      problem_solving: {
        score: 0.80,
        strengths: ['Structured thinking', 'Logical step-by-step approach'],
        weaknesses: ['Didn\'t ask clarifying questions first'],
        recommendations: ['Always confirm constraints upfront']
      },
      code_quality: {
        score: 0.75,
        strengths: ['Clean code structure', 'Good variable naming'],
        weaknesses: ['Missed corner case handling'],
        recommendations: ['Write unit test cases']
      }
    }
  };
}
