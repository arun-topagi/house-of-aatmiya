import { UserAuthService } from '../../../src/modules/user-auth/user-auth.service';
import { BadRequestException } from '@nestjs/common';

describe('UserAuthService', () => {
  let service: UserAuthService;
  const mockPrisma: any = {
    otp_codes: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    users: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    sessions: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    addresses: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const mockJwt: any = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };
  const mockConfig: any = {
    get: jest.fn().mockReturnValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserAuthService(mockPrisma, mockJwt, mockConfig);
  });

  it('rejects invalid phone numbers on sendOtp', async () => {
    await expect(service.sendOtp({ phone: '12345' })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('generates and stores a 4-digit WhatsApp OTP for a valid 10-digit number', async () => {
    mockPrisma.otp_codes.create.mockResolvedValue({ id: 'otp-1' });
    const res = await service.sendOtp({ phone: '9876543210' });
    expect(res.phone).toBe('9876543210');
    expect(mockPrisma.otp_codes.create).toHaveBeenCalled();
  });
});
