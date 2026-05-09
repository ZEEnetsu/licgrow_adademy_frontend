export function testStatusChip(test) {
  if (
    !test.canAttempt &&
    test.attemptsUsed >= 3 &&
    String(test.canAttemptReason || '').includes('Maximum')
  ) {
    return { label: 'Max Reached', tone: 'rose' };
  }
  if (!test.canAttempt && test.attemptsUsed > 0)
    return { label: 'Cooldown', tone: 'amber' };
  if (!test.lastAttemptResult && test.attemptsUsed === 0)
    return { label: 'Not Started', tone: 'slate' };
  return { label: 'Available', tone: 'teal' };
}
