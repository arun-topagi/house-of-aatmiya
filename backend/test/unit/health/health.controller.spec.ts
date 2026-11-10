import { HealthController } from '../../src/health/health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('should return ok status for The House of Aatmiya API', () => {
    const res = controller.check();
    expect(res.status).toBe('ok');
    expect(res.service).toBe('The House of Aatmiya API');
  });
});
