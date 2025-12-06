module.exports = {
  AccessToken: jest.fn().mockImplementation(() => ({
    addGrant: jest.fn(),
    toJwt: jest.fn().mockReturnValue('mocked-jwt-token'),
  })),
};
