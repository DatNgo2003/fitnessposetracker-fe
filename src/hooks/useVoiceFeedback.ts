/**
 * Voice Feedback Hook
 * Handles grouping reps with same feedback and playing audio sequentially
 */
import { useState, useRef, useCallback } from 'react';

export interface RepFeedback {
  rep_id: number;
  depth_feedback?: string;
  back_feedback?: string;
  body_feedback?: string;
  is_valid: boolean;
  [key: string]: any; // Allow other fields
}

interface RepGroup {
  repIds: number[];
  depthText: string;
  backText: string;
  isValid: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Get base API URL - handles both cases:
 * - API_BASE_URL = "http://localhost:8000" -> use as is
 * - API_BASE_URL = "http://localhost:8000/api" -> remove /api
 */
function getApiBaseUrl(): string {
  let base = API_BASE_URL.trim();
  // Remove trailing slash
  if (base.endsWith('/')) {
    base = base.slice(0, -1);
  }
  // Remove /api if it exists at the end (since router already has /api prefix)
  if (base.endsWith('/api')) {
    base = base.slice(0, -4);
  }
  return base;
}

const normalizeFeedbackText = (text?: string): string => {
  if (!text) return '';
  const trimmed = text.trim();
  const prefixRegex = /^L[A-ZÀ-Ỵa-zà-ỵ]*\s*\d+\s*[:\-–]\s*/i; // Handles "LẦN 1:", "Lần 2 -"
  return trimmed.replace(prefixRegex, '').trim();
};

/**
 * Group consecutive reps with the same feedback text
 */
function groupReps(reps: RepFeedback[]): RepGroup[] {
  if (reps.length === 0) return [];

  const groups: RepGroup[] = [];
  let currentGroup: RepGroup | null = null;

  for (const rep of reps) {
    // Chuẩn hóa riêng cho depth & back để có thể phát 2 loại feedback
    const rawDepth = (rep.depth_feedback || '').trim();
    const rawBack = (rep.back_feedback || rep.body_feedback || '').trim();

    const depthText = normalizeFeedbackText(rawDepth);
    const backText = normalizeFeedbackText(rawBack);

    // Group theo cặp (depth, back) + trạng thái hợp lệ
    const shouldStartNewGroup =
      !currentGroup ||
      currentGroup.depthText !== depthText ||
      currentGroup.backText !== backText ||
      currentGroup.isValid !== rep.is_valid;

    if (shouldStartNewGroup) {
      if (currentGroup) {
        groups.push(currentGroup);
      }

      currentGroup = {
        repIds: [rep.rep_id],
        depthText,
        backText,
        isValid: rep.is_valid,
      };
    } else {
      currentGroup.repIds.push(rep.rep_id);
    }
  }

  // Don't forget the last group
  if (currentGroup) {
    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Get rep audio URL (rep1.mp3, rep2.mp3, etc.)
 */
function getRepAudioUrl(repId: number): string {
  const base = getApiBaseUrl();
  return `${base}/api/rep-audio/rep${repId}.mp3`;
}

/**
 * Get feedback audio URL based on feedback text and exercise type
 */
function getFeedbackAudioUrl(
  feedbackText: string,
  exerciseType: 'squat' | 'pushup' | 'barbell' | 'lunge',
  isValid: boolean,
  kind: 'auto' | 'depth' | 'back' = 'auto'
): string | null {
  // Map feedback text to audio file names
  // This is a simplified mapping - you may need to adjust based on actual file names

  const lowerFeedback = feedbackText.toLowerCase();

  // Determine feedback type from text
  let audioFileName = '';

  if (exerciseType === 'squat') {
    if (kind === 'depth') {
      // QUAN TRỌNG: Check negative keywords TRƯỚC để tránh false positive
      // Ví dụ: "Bạn chưa hạ người đủ sâu" chứa "đủ sâu" nhưng đây là feedback xấu
      if (
        lowerFeedback.includes('chưa hạ người đủ sâu') ||
        lowerFeedback.includes('chưa hạ đủ sâu') ||
        lowerFeedback.includes('chưa hạ') ||
        lowerFeedback.includes('quá nông') ||
        lowerFeedback.includes('chưa đủ') ||
        lowerFeedback.includes('hạ người đủ sâu') // "Bạn chưa hạ người đủ sâu" pattern
      ) {
        audioFileName = 'squat_depth_qua_nong.mp3';
      } else if (
        lowerFeedback.includes('rất chuẩn') ||
        lowerFeedback.includes('độ sâu rất chuẩn') ||
        lowerFeedback.includes('chuẩn') ||
        lowerFeedback.includes('đạt đến vị trí') ||
        lowerFeedback.includes('an toàn và hiệu quả')
      ) {
        audioFileName = 'squat_depth_tot.mp3';
      } else {
        // Fallback: dùng isValid nếu không match keyword nào
        audioFileName = isValid ? 'squat_depth_tot.mp3' : 'squat_depth_qua_nong.mp3';
      }
    } else if (kind === 'back') {
      // Check negative keywords TRƯỚC
      if (
        lowerFeedback.includes('cong quá mức') ||
        lowerFeedback.includes('bị cong') ||
        lowerFeedback.includes('nghiêng quá mức') ||
        lowerFeedback.includes('đang bị cong')
      ) {
        audioFileName = 'squat_straightback_lung_gap.mp3';
      } else if (
        lowerFeedback.includes('rất tốt') ||
        lowerFeedback.includes('lưng bạn thẳng') ||
        lowerFeedback.includes('thẳng và ổn định') ||
        lowerFeedback.includes('ổn định')
      ) {
        audioFileName = 'squat_straightback_tot.mp3';
      } else {
        audioFileName = isValid ? 'squat_straightback_tot.mp3' : 'squat_straightback_lung_gap.mp3';
      }
    } else {
      if (lowerFeedback.includes('độ sâu') || lowerFeedback.includes('hạ người') || lowerFeedback.includes('hạ đủ sâu')) {
        audioFileName = isValid ? 'squat_depth_tot.mp3' : 'squat_depth_qua_nong.mp3';
      } else if (lowerFeedback.includes('lưng') || lowerFeedback.includes('cong') || lowerFeedback.includes('nghiêng')) {
        audioFileName = isValid ? 'squat_straightback_tot.mp3' : 'squat_straightback_lung_gap.mp3';
      }
    }
  } else if (exerciseType === 'pushup') {
    if (kind === 'depth') {
      // QUAN TRỌNG: Check negative keywords TRƯỚC
      if (
        lowerFeedback.includes('chưa hạ người đủ thấp') ||
        lowerFeedback.includes('chưa hạ') ||
        lowerFeedback.includes('hạ ngực gần chạm sàn')
      ) {
        audioFileName = 'pushup_depth_qua_nong.mp3';
      } else if (
        lowerFeedback.includes('tốt lắm') ||
        lowerFeedback.includes('độ sâu vừa phải') ||
        lowerFeedback.includes('kích hoạt đầy đủ')
      ) {
        audioFileName = 'pushup_depth_tot.mp3';
      } else {
        // Fallback
        return null;
      }
    } else if (kind === 'back') {
      // Check negative keywords TRƯỚC
      // "Thân người chưa tạo thành đường thẳng..."
      if (
        lowerFeedback.includes('chưa tạo thành đường thẳng') ||
        lowerFeedback.includes('thân người chưa') ||
        lowerFeedback.includes('siết cơ bụng và mông')
      ) {
        audioFileName = 'pushup_straight_lung_cong.mp3';
      } else if (
        lowerFeedback.includes('đường thẳng đẹp') ||
        lowerFeedback.includes('từ vai đến gót chân') ||
        lowerFeedback.includes('rất tốt')
      ) {
        audioFileName = 'pushup_straight_tot.mp3';
      } else {
        audioFileName = isValid ? 'pushup_straight_tot.mp3' : 'pushup_straight_lung_cong.mp3';
      }
    } else {
      // Auto mode - không dùng cho pushup
      return null;
    }
  } else if (exerciseType === 'barbell') {
    if (kind === 'depth') {
      // EDGE CASE: Backend đôi khi put back message vào depth_feedback
      // Khi depth_feedback chứa "Lưng cúi" -> SKIP depth audio (không có audio file matching)
      // Back audio sẽ được phát riêng từ back_feedback field
      if (
        lowerFeedback.includes('lưng cúi') ||
        lowerFeedback.includes('lưng cúi quá mức') ||
        lowerFeedback.includes('giữ lưng thẳng hơn')
      ) {
        return null; // Skip depth audio, back audio will play from back_feedback
      }

      // QUAN TRỌNG: Check negative keywords TRƯỚC
      // Bad: "Bạn đang hạ người quá sâu" 
      if (
        lowerFeedback.includes('hạ người quá sâu') ||
        lowerFeedback.includes('quá sâu') ||
        lowerFeedback.includes('gập gối quá nhiều') ||
        lowerFeedback.includes('giữ hông cao hơn')
      ) {
        audioFileName = 'barbell_dead_row_depth_qua_sau.mp3';
      } else if (
        // Good: "Tư thế rất chuẩn! Bạn đã giữ hông ở vị trí cao"
        lowerFeedback.includes('tư thế rất chuẩn') ||
        lowerFeedback.includes('rất chuẩn') ||
        lowerFeedback.includes('giữ hông ở vị trí cao') ||
        lowerFeedback.includes('an toàn cho lưng')
      ) {
        audioFileName = 'barbell_dead_row_depth_qua_tot.mp3';
      } else {
        // Fallback - nếu không match được thì skip (return null)
        return null;
      }
    } else if (kind === 'back') {
      // Check negative keywords TRƯỚC
      if (
        lowerFeedback.includes('cong quá mức') ||
        lowerFeedback.includes('bị cong') ||
        lowerFeedback.includes('nghiêng quá mức') ||
        lowerFeedback.includes('đang bị cong')
      ) {
        audioFileName = 'barbell_dead_row_straightback_lung_gap.mp3';
      } else if (
        lowerFeedback.includes('rất tốt') ||
        lowerFeedback.includes('lưng bạn thẳng') ||
        lowerFeedback.includes('thẳng và ổn định') ||
        lowerFeedback.includes('ổn định')
      ) {
        audioFileName = 'barbell_dead_row_straightback_tot.mp3';
      } else {
        audioFileName = isValid ? 'barbell_dead_row_straightback_tot.mp3' : 'barbell_dead_row_straightback_lung_gap.mp3';
      }
    } else {
      // Auto mode - không dùng cho barbell
      return null;
    }
  } else if (exerciseType === 'lunge') {
    if (kind === 'depth') {
      // QUAN TRỌNG: Check negative keywords TRƯỚC
      // Bad: "Bạn chưa hạ đầu gối sau đủ thấp"
      if (
        lowerFeedback.includes('chưa hạ đầu gối') ||
        lowerFeedback.includes('chưa hạ') ||
        lowerFeedback.includes('chưa đủ') ||
        lowerFeedback.includes('hạ sâu hơn')
      ) {
        audioFileName = 'reverse_lunge_depth_qua_nong.mp3';
      } else if (
        // Good: "Độ sâu rất chuẩn! Đầu gối sau hạ thấp gần sàn"
        lowerFeedback.includes('rất chuẩn') ||
        lowerFeedback.includes('chuẩn') ||
        lowerFeedback.includes('hạ thấp gần sàn') ||
        lowerFeedback.includes('kích hoạt tối đa')
      ) {
        audioFileName = 'reverse_lunge_depth_tot.mp3';
      } else {
        // Fallback - không match thì skip
        return null;
      }
    } else if (kind === 'back') {
      // Check negative keywords TRƯỚC
      // "Bạn đang nghiêng người về trước. Hãy giữ ngực mở và lưng thẳng..."
      if (
        lowerFeedback.includes('nghiêng người về trước') ||
        lowerFeedback.includes('nghiêng người') ||
        lowerFeedback.includes('phân bổ trọng lượng')
      ) {
        audioFileName = 'reverse_lunge_straightback_lung_gap.mp3';
      } else if (
        lowerFeedback.includes('rất tốt') ||
        lowerFeedback.includes('lưng bạn thẳng') ||
        lowerFeedback.includes('thẳng và ổn định') ||
        lowerFeedback.includes('ổn định')
      ) {
        audioFileName = 'reverse_lunge_straightback_tot.mp3';
      } else {
        audioFileName = isValid ? 'reverse_lunge_straightback_tot.mp3' : 'reverse_lunge_straightback_lung_gap.mp3';
      }
    } else {
      // Auto mode - không dùng cho lunge
      return null;
    }
  }

  if (!audioFileName) {
    return null; // No matching audio file
  }

  const base = getApiBaseUrl();
  // Map logical exercise type to backend folder name
  const folder =
    exerciseType === 'barbell'
      ? 'barbell_dead_row'
      : exerciseType === 'lunge'
        ? 'reverse_lung'
        : exerciseType;

  return `${base}/api/voice-feedback/${folder}/${audioFileName}`;
}

const dispatchVoiceAvatarEvent = (state: 'start' | 'end') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('voice_feedback_avatar', { detail: { state } }));
  }
};

export function useVoiceFeedback(
  exerciseType: 'squat' | 'pushup' | 'barbell' | 'lunge',
  cameraAngle: 'front_view' | 'side_view' = 'side_view'
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopCurrentAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
  }, []);

  const playClip = useCallback(
    (url: string, signal: AbortSignal): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (signal.aborted) {
          reject(new DOMException('Playback aborted', 'AbortError'));
          return;
        }

        // Stop any audio currently playing
        stopCurrentAudio();

        const audio = new Audio(url);
        currentAudioRef.current = audio;

        const cleanup = () => {
          audio.pause();
          audio.currentTime = 0;
          if (currentAudioRef.current === audio) {
            currentAudioRef.current = null;
          }
        };

        const handleAbort = () => {
          cleanup();
          reject(new DOMException('Playback aborted', 'AbortError'));
        };

        signal.addEventListener('abort', handleAbort, { once: true });

        audio.onended = () => {
          signal.removeEventListener('abort', handleAbort);
          cleanup();
          resolve();
        };

        audio.onerror = () => {
          signal.removeEventListener('abort', handleAbort);
          cleanup();
          reject(new Error(`Failed to play audio: ${url}`));
        };

        audio.play().catch((err) => {
          signal.removeEventListener('abort', handleAbort);
          cleanup();
          reject(err);
        });
      });
    },
    [stopCurrentAudio]
  );

  /**
   * Get announcement audio URL (depth.mp3 or back.mp3)
   */
  const getAnnouncementAudioUrl = (type: 'depth' | 'back'): string => {
    const base = getApiBaseUrl();
    return `${base}/api/voice-feedback/depth_back/${type}.mp3`;
  };

  const playVoiceFeedback = useCallback(
    async (groups: RepGroup[], signal: AbortSignal) => {
      for (const group of groups) {
        // Phát rep number audio
        for (let i = 0; i < group.repIds.length; i++) {
          const repId = group.repIds[i];
          const repAudioUrl = getRepAudioUrl(repId);
          await playClip(repAudioUrl, signal);

          if (i < group.repIds.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 150));
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 300));

        // Phát announcement "depth" trước, rồi phát feedback depth
        if (group.depthText) {
          // Phát "depth.mp3" announcement
          const depthAnnouncementUrl = getAnnouncementAudioUrl('depth');
          await playClip(depthAnnouncementUrl, signal);
          await new Promise((resolve) => setTimeout(resolve, 200));

          const depthAudioUrl = getFeedbackAudioUrl(group.depthText, exerciseType, group.isValid, 'depth');
          if (depthAudioUrl) {
            await playClip(depthAudioUrl, signal);
          }
        }

        // Chỉ phát feedback lưng/thân khi ở side_view (góc ngang)
        if (group.backText && cameraAngle === 'side_view') {
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Phát "back.mp3" announcement
          const backAnnouncementUrl = getAnnouncementAudioUrl('back');
          await playClip(backAnnouncementUrl, signal);
          await new Promise((resolve) => setTimeout(resolve, 200));

          const backAudioUrl = getFeedbackAudioUrl(group.backText, exerciseType, group.isValid, 'back');
          if (backAudioUrl) {
            await playClip(backAudioUrl, signal);
          }
        }

        if (group !== groups[groups.length - 1]) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    },
    [exerciseType, cameraAngle, playClip]
  );

  const playFeedback = useCallback(async (reps: RepFeedback[]) => {
    if (reps.length === 0) {
      console.warn('No reps to play feedback for');
      return;
    }

    // Cancel any ongoing playback
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    dispatchVoiceAvatarEvent('start');
    setIsPlaying(true);

    try {
      // Group reps
      const groups = groupReps(reps);

      if (groups.length === 0) {
        console.warn('No rep groups to play');
        return;
      }

      // Play feedback
      const signal = abortControllerRef.current.signal;
      await playVoiceFeedback(groups, signal);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Voice feedback playback cancelled');
      } else {
        console.error('Error playing voice feedback:', error);
      }
    } finally {
      setIsPlaying(false);
      dispatchVoiceAvatarEvent('end');
      stopCurrentAudio();
      abortControllerRef.current = null;
    }
  }, [exerciseType, playVoiceFeedback, stopCurrentAudio]);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsPlaying(false);
      dispatchVoiceAvatarEvent('end');
      stopCurrentAudio();
    }
  }, [stopCurrentAudio]);

  return {
    playFeedback,
    stop,
    isPlaying,
  };
}

