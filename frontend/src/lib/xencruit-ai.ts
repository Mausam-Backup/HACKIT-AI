/**
 * Xencruit Analytics Engine v2.0
 * Robust Behavioral Metrics for AI Proctoring & Interview Monitoring
 * @module XencruitAI
 */

export interface ILandmark {
  x: number;
  y: number;
  z: number;
}

export interface IBehavioralMetrics {
  posture: number;
  engagement: number;
  focus: number;
  symmetry: number;
  sentiment: 'Neutral' | 'Positive';
  lastUpdateTime: number;
}

export class XencruitAI {
  private metrics: IBehavioralMetrics;
  private smoothP = 100;
  private smoothE = 100;
  private smoothF = 100;
  private smoothS = 100;
  private lastFaceX = 0.5;
  private lastFaceY = 0.5;

  private readonly LERP_POSTURE = 0.08;
  private readonly LERP_FOCUS = 0.12;
  private readonly LERP_ENGAGEMENT = 0.10;

  constructor() {
    this.metrics = {
      posture: 0,
      engagement: 0,
      focus: 0,
      symmetry: 0,
      sentiment: 'Neutral',
      lastUpdateTime: Date.now()
    };
  }

  /**
   * Linear Interpolation (Smoothing)
   */
  private lerp(start: number, end: number, alpha: number): number {
    return (1 - alpha) * start + alpha * end;
  }

  /**
   * Process Pose Landmarks (MediaPipe POSE_LANDMARKS)
   * Indices: 11 (L Shoulder), 12 (R Shoulder)
   */
  public processPose(landmarks: ILandmark[]): void {
    if (!landmarks || landmarks.length < 13) return;

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    // 1. Posture Score (Shoulder Leveling)
    const yDiff = Math.abs(leftShoulder.y - rightShoulder.y);
    const pRaw = Math.max(0, Math.min(100, 100 - (yDiff * 600)));
    this.smoothP = this.lerp(this.smoothP, pRaw, this.LERP_POSTURE);
    this.metrics.posture = Math.round(this.smoothP);

    // 2. Symmetry Score (Frame Centering)
    const midX = (leftShoulder.x + rightShoulder.x) / 2;
    const sRaw = Math.max(0, Math.min(100, 100 - (Math.abs(midX - 0.5) * 300)));
    this.smoothS = this.lerp(this.smoothS, sRaw, this.LERP_POSTURE);
    this.metrics.symmetry = Math.round(this.smoothS);
  }

  /**
   * Process Face Landmarks (MediaPipe FACEMESH_LANDMARKS)
   * Indices: 5 (Nose Tip), 33 (L Eye Side), 263 (R Eye Side)
   */
  public processFace(landmarks: ILandmark[]): void {
    if (!landmarks || landmarks.length < 264) return;

    const noseTip = landmarks[5];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    // 1. Focus Level (Yaw/Pitch Estimation via Point Ratios)
    const distL = Math.sqrt(Math.pow(noseTip.x - leftEye.x, 2) + Math.pow(noseTip.y - leftEye.y, 2));
    const distR = Math.sqrt(Math.pow(noseTip.x - rightEye.x, 2) + Math.pow(noseTip.y - rightEye.y, 2));
    
    const yawErr = Math.abs(distL - distR) * 800; // Head Rotation
    const centerErr = Math.abs(noseTip.x - 0.5) * 200; // Alignment
    const depthErr = Math.abs(leftEye.z - rightEye.z) * 500; // Z-Skew
    
    const fRaw = Math.max(0, 100 - (yawErr + centerErr + depthErr));
    this.smoothF = this.lerp(this.smoothF, fRaw, this.LERP_FOCUS);
    this.metrics.focus = Math.round(this.smoothF);

    // 2. Engagement Score (Focus + Stability)
    const movX = Math.abs(noseTip.x - this.lastFaceX);
    const movY = Math.abs(noseTip.y - this.lastFaceY);
    this.lastFaceX = noseTip.x;
    this.lastFaceY = noseTip.y;

    const eRaw = Math.max(20, Math.min(100, this.smoothF * 0.82 + (1 - (movX + movY)) * 18));
    this.smoothE = this.lerp(this.smoothE, eRaw, this.LERP_ENGAGEMENT);
    this.metrics.engagement = Math.round(this.smoothE);

    // 3. Sentiment Logic
    this.metrics.sentiment = this.smoothF > 75 ? 'Positive' : 'Neutral';
    this.metrics.lastUpdateTime = Date.now();
  }

  /**
   * Retrieve current robust behavioral state
   */
  public getMetrics(): IBehavioralMetrics {
    return { ...this.metrics };
  }
}
