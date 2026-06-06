const { getBoxColor } = require('../services/boxStatusService');

describe('box color mapping', () => {
  test('white when no logs and no valid compilation', () => {
    expect(getBoxColor(false, false)).toBe('white');
  });

  test('red when log exists but no valid compilation', () => {
    expect(getBoxColor(true, false)).toBe('red');
  });

  test('green when both exist', () => {
    expect(getBoxColor(true, true)).toBe('green');
  });
});
