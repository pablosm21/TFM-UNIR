const { getCommandForAction } = require('../config/actions');

describe('actions allowlist', () => {
  test('returns command for allowed action', () => {
    const command = getCommandForAction(2, 'm');
    expect(typeof command).toBe('string');
    expect(command).toContain('javac');
  });

  test('returns null for unknown box', () => {
    expect(getCommandForAction(999, 'm')).toBeNull();
  });

  test('returns null for unknown label', () => {
    expect(getCommandForAction(1, 'z')).toBeNull();
  });
});
