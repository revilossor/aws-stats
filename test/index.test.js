describe('index', () => {
  const express = require('express');
  let use, target;
  const routerAssertions = [
    { endpoint: '/list', mock: jest.fn(), path: '../src/router/list' }
  ];

  beforeAll(() => {
    routerAssertions.forEach(assertion => jest.mock(assertion.path, () => assertion.mock));
    use = jest.spyOn(express.Router, 'use');
    target = require('../index');
  });

  describe('routers', () => {
    routerAssertions.forEach((assertion) => {
      test(`${assertion.path} used for ${assertion.endpoint}`, () => {
        expect(use).toHaveBeenCalledWith(assertion.endpoint, assertion.mock);
      });
    });
  });

  test('exports an express.Router', () => {
    expect(target).toBeInstanceOf(express.Router().constructor);
  });

});
