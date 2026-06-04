export function calculateAttendance(
  shift?: string,
  clockIn?: string,
  clockOut?: string
): { hours: string; attendanceState: string } {
  // If no clock in, mark as Absent
  if (!clockIn || clockIn === '—' || clockIn.trim() === '') {
    return { hours: '—', attendanceState: 'Absent' };
  }

  let hours = '—';
  let attendanceState = 'On time';

  // 1. Calculate hours if both clockIn and clockOut are present and not '—'
  if (clockIn && clockIn !== '—' && clockOut && clockOut !== '—') {
    const parseTime = (t: string) => {
      const parts = t.split(':');
      if (parts.length < 2) return null;
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (isNaN(h) || isNaN(m)) return null;
      return { h, m };
    };

    const inTime = parseTime(clockIn);
    const outTime = parseTime(clockOut);

    if (inTime && outTime) {
      const inMinutes = inTime.h * 60 + inTime.m;
      let outMinutes = outTime.h * 60 + outTime.m;

      let diffMinutes = outMinutes - inMinutes;
      if (diffMinutes < 0) {
        // Crossed midnight
        diffMinutes += 24 * 60;
      }
      hours = (diffMinutes / 60).toFixed(1) + 'h';
    }
  }

  // 2. Calculate attendance state based on shift and clockIn
  if (shift && shift !== '—' && shift.trim() !== '') {
    // Split by en-dash or hyphen
    const shiftParts = shift.split(/[–-]/);
    if (shiftParts.length > 0) {
      const shiftStartStr = shiftParts[0].trim();
      const parseTime = (t: string) => {
        const parts = t.split(':');
        if (parts.length < 2) return null;
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (isNaN(h) || isNaN(m)) return null;
        return { h, m };
      };

      const shiftStartTime = parseTime(shiftStartStr);
      const clockInTime = parseTime(clockIn);

      if (shiftStartTime && clockInTime) {
        const shiftStartMinutes = shiftStartTime.h * 60 + shiftStartTime.m;
        const clockInMinutes = clockInTime.h * 60 + clockInTime.m;

        // Grace period of 5 minutes
        if (clockInMinutes > shiftStartMinutes + 5) {
          attendanceState = 'Late';
        }
      }
    }
  }

  return { hours, attendanceState };
}
