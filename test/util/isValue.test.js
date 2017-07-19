describe('isValue', () => {

  const target = require('../../src/util/isValue');

  describe('correct output', () => {
    test('false if no arg', () => { expect(target(null, {})).toBe(false); });
    test('false if no data', () => { expect(target('mock', null)).toBe(false); });
    test('false if data not object', () => { expect(target('mock', 'mock')).toBe(false); });
    describe('false if arg is', () => {
      test('string', () => { expect(target('poop', { a: 'mock' })).toBe(false); });
      test('number', () => { expect(target(1, { a: 'mock' })).toBe(false); });
    });
    describe('true if arg is', () => {
      test('string', () => { expect(target('mock', { a: 'mock' })).toBe(true); });
      test('number', () => { expect(target(1, { a: 1 })).toBe(true); });
    });
    describe('case sensitivity', () => {
      test('true if caseSensitive is false and insensitive match', () => {
        expect(target('MockValue', { a: 'MOCKVALUE' }, false)).toBe(true);
      });
      test('false if caseSensitive is true and insensitive match', () => {
        expect(target('MockValue', { a: 'MOCKVALUE' }, true)).toBe(false);
      });
    });
  });
});
