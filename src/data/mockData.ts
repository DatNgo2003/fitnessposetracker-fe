export interface Exercise {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  icon: string;
  image: string;
}

export interface Pose {
  x: number;
  y: number;
  confidence: number;
}

export interface TrainingSession {
  exerciseId: string;
  currentRep: number;
  targetReps: number;
  errors: string[];
  feedback: string;
  feedbackAudioUrl: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  audioUrl?: string;
  timestamp: Date;
}

export const exercises: Exercise[] = [
  {
    id: 'barbell_dead_row',
    name: 'Barbell Dead Row',
    nameVi: 'Kéo Tạ Đòn',
    description: 'Động tác tập lưng với thanh tạ',
    icon: '🏋️',
    image: 'https://cdn.unityfitness.vn/2024/04/barbell-row-2-1024x576.jpg',
  },
  {
    id: 'dumbbell_reverse_lunge',
    name: 'Dumbbell Reverse Lunge',
    nameVi: 'Lunge Ngược Với Tạ Đơn',
    description: 'Động tác tập chân và mông',
    icon: '🦵',
    image: 'https://cdn.muscleandstrength.com/sites/default/files/dumbbell-rear-lunge.jpg',
  },
  {
    id: 'pushup',
    name: 'Push Up',
    nameVi: 'Hít Đất',
    description: 'Động tác tập ngực và vai',
    icon: '💪',
    image: 'https://www.fitnessjunkies.com/sites/default/files/images/push-ups.jpg',
  },
  {
    id: 'squat',
    name: 'Squat',
    nameVi: 'Gánh Tạ',
    description: 'Động tác tập chân cơ bản',
    icon: '🏋️‍♀️',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
];

export const mockPoseData: Pose[] = [
  { x: 0.3, y: 0.2, confidence: 0.9 }, // head
  { x: 0.3, y: 0.35, confidence: 0.95 }, // neck
  { x: 0.25, y: 0.45, confidence: 0.9 }, // left shoulder
  { x: 0.35, y: 0.45, confidence: 0.9 }, // right shoulder
  { x: 0.2, y: 0.6, confidence: 0.85 }, // left elbow
  { x: 0.4, y: 0.6, confidence: 0.85 }, // right elbow
  { x: 0.15, y: 0.75, confidence: 0.8 }, // left wrist
  { x: 0.45, y: 0.75, confidence: 0.8 }, // right wrist
  { x: 0.3, y: 0.65, confidence: 0.95 }, // spine
  { x: 0.25, y: 0.85, confidence: 0.9 }, // left hip
  { x: 0.35, y: 0.85, confidence: 0.9 }, // right hip
  { x: 0.25, y: 1.1, confidence: 0.85 }, // left knee
  { x: 0.35, y: 1.1, confidence: 0.85 }, // right knee
  { x: 0.25, y: 1.35, confidence: 0.8 }, // left ankle
  { x: 0.35, y: 1.35, confidence: 0.8 }, // right ankle
];

export const mockTrainingSessions: Record<string, TrainingSession> = {
  pushup: {
    exerciseId: 'pushup',
    currentRep: 5,
    targetReps: 15,
    errors: ['Lưng không thẳng', 'Tay chưa thẳng hoàn toàn'],
    feedback: 'Bạn cần giữ lưng thẳng hơn và đẩy tay lên hoàn toàn ở điểm cao nhất. Hãy tập trung vào việc siết bụng và giữ thân người thẳng.',
    feedbackAudioUrl: '/mock-audio/pushup-feedback.mp3',
  },
  squat: {
    exerciseId: 'squat',
    currentRep: 8,
    targetReps: 20,
    errors: ['Đầu gối vượt qua mũi chân', 'Lưng hơi cong'],
    feedback: 'Đầu gối của bạn đang vượt quá mũi chân, điều này có thể gây chấn thương. Hãy đẩy mông ra sau nhiều hơn và giữ lưng thẳng.',
    feedbackAudioUrl: '/mock-audio/squat-feedback.mp3',
  },
  barbell_dead_row: {
    exerciseId: 'barbell_dead_row',
    currentRep: 6,
    targetReps: 12,
    errors: ['Góc lưng chưa đủ thấp'],
    feedback: 'Hãy cúi lưng xuống thấp hơn một chút để tối ưu hóa động tác chèo. Giữ lưng thẳng và kéo thanh tạ về phía bụng.',
    feedbackAudioUrl: '/mock-audio/barbell-feedback.mp3',
  },
  dumbbell_reverse_lunge: {
    exerciseId: 'dumbbell_reverse_lunge',
    currentRep: 4,
    targetReps: 10,
    errors: ['Chân trước hơi nghiêng'],
    feedback: 'Chân trước của bạn cần thẳng hơn và vuông góc 90 độ. Hãy chú ý giữ thăng bằng và không để đầu gối vượt quá mũi chân.',
    feedbackAudioUrl: '/mock-audio/lunge-feedback.mp3',
  },
};

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    type: 'assistant',
    message: 'Xin chào! Tôi có thể giúp gì cho bạn về các động tác tập luyện?',
    timestamp: new Date(),
  },
];

export const mockChatResponses: Record<string, { answer: string; audioUrl: string }> = {
  'tư thế pushup': {
    answer: 'Để thực hiện push-up đúng cách: Giữ thân người thẳng từ đầu đến chân, tay ngang vai, hạ người xuống cho đến khi ngực gần chạm sàn, sau đó đẩy lên. Nhớ giữ bụng siết chặt!',
    audioUrl: '/mock-audio/qa-pushup.mp3',
  },
  'squat': {
    answer: 'Squat đúng cách: Chân rộng bằng vai, mũi chân hơi xoay ra ngoài, hạ người như ngồi ghế, đầu gối không vượt mũi chân, lưng thẳng. Đẩy gót chân để đứng lên.',
    audioUrl: '/mock-audio/qa-squat.mp3',
  },
  default: {
    answer: 'Tôi chưa có thông tin chi tiết về câu hỏi này. Bạn có thể hỏi về các động tác cụ thể như push-up, squat, barbell row, hay lunge.',
    audioUrl: '/mock-audio/qa-default.mp3',
  },
};
