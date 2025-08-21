import { Networking } from './networking';

describe('Networking', () => {
  let networking: Networking;

  beforeEach(() => {
    networking = new Networking();
  });

  it('should be created', () => {
    expect(networking).toBeTruthy();
  });

}); 
