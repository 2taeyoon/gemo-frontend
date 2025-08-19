"use client";

interface AttendanceStatus {
  hasCheckedToday: boolean;
  lastAttendance: string | null;
  consecutiveAttendance: number;
}

interface AttendanceSectionProps {
  attendanceStatus: AttendanceStatus;
  isProcessing: boolean;
  onCheckAttendance: () => void;
  getBonusXp: (days: number) => number;
}

/**
 * 출석체크 섹션 컴포넌트
 */
export default function AttendanceSection({ 
  attendanceStatus, 
  isProcessing, 
  onCheckAttendance, 
  getBonusXp 
}: AttendanceSectionProps) {
  return (
    <div className="attendance-main">
      {attendanceStatus.hasCheckedToday ? (
        // 이미 출석체크한 경우
        <div className="attendance-completed">
          <div className="check-icon">✅</div>
          <h2>오늘 출석체크 완료!</h2>
          <p>내일 다시 출석체크할 수 있습니다.</p>
          <div className="completed-info">
            <div className="consecutive-days">
              <span className="number">{attendanceStatus.consecutiveAttendance || 0}</span>
              <span className="label">연속 출석</span>
            </div>
          </div>
        </div>
      ) : (
        // 아직 출석체크하지 않은 경우
        <div className="attendance-pending">
          <div className="check-icon-pending">📋</div>
          <h2>오늘의 출석체크</h2>
          <p>출석체크하고 경험치를 받아보세요!</p>
          
          <button 
            onClick={onCheckAttendance}
            disabled={isProcessing}
            className={`check-button ${isProcessing ? 'processing' : ''}`}
          >
            {isProcessing ? '처리 중...' : '출석체크하기'}
          </button>

          <div className="expected-reward">
            <p>예상 보상: <strong>{getBonusXp((attendanceStatus.consecutiveAttendance || 0) + 1)} XP</strong></p>
          </div>
        </div>
      )}
    </div>
  );
}
