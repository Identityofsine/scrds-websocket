import { TCPSocket } from './networking';

describe('TCPSocket', () => {
  let networking: TCPSocket;

  beforeEach(() => {
    networking = TCPSocket.Instance;
  });

  it('should be created', () => {
    expect(networking).toBeTruthy();
  });

}); 
