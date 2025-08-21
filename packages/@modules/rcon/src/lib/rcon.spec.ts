import { Rcon } from './rcon';

describe('Rcon', () => {
  let rcon: Rcon;

  beforeEach(() => {
    rcon = new Rcon();
  });

  it('should be created', () => {
    expect(rcon).toBeTruthy();
  });

  it('should return a greeting message', () => {
    const result = rcon.hello();
    expect(result).toBe('Hello from @modules/rcon!');
  });
}); 