import { createApi } from '@reduxjs/toolkit/query/react';
import HttpFactory from '@/utils/httpFactory';
import { axiosBaseQuery } from './axiosBaseQuery';

export interface SendOtpResponse {
  message: string;
  phone: string;
  expiresInSeconds?: number;
  devOtp?: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
  name?: string;
}

export interface VerifiedCustomerAddress {
  id?: string;
  fullName?: string;
  flatOrHouse: string;
  areaOrSociety: string;
  city: string;
  state?: string;
  pincode: string;
  landmark?: string;
  isSocietyResident: boolean;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl?: string;
  isMobileConfirmed?: boolean;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
    name: string;
    isPhoneVerified: boolean;
  };
  address?: VerifiedCustomerAddress | null;
}

export interface GetProfileResponse {
  user: {
    id: string;
    phone: string;
    name: string;
    isPhoneVerified: boolean;
    optInMarketing?: boolean;
  };
  address: VerifiedCustomerAddress | null;
}

export interface UpdateUserProfilePayload {
  name?: string;
  optInMarketing?: boolean;
}

export interface UpsertAddressPayload {
  name?: string;
  flatOrHouse: string;
  areaOrSociety: string;
  city: string;
  state?: string;
  pincode: string;
  landmark?: string;
  isSocietyResident?: boolean;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  isMobileConfirmed?: boolean;
}

export interface ConfirmMobileAddressPayload {
  phone: string;
  flatOrHouse: string;
  areaOrSociety: string;
  city: string;
  pincode: string;
  landmark?: string;
  isSocietyResident?: boolean;
  latitude: number;
  longitude: number;
}

export class UserAuthService extends HttpFactory {
  constructor() {
    super(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
  }

  async sendOtp(phone: string): Promise<SendOtpResponse> {
    const res = await this.post('/user-auth/send-otp', { phone });
    return this.unwrap<SendOtpResponse>(res);
  }

  async verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
    const res = await this.post('/user-auth/verify-otp', payload);
    return this.unwrap<VerifyOtpResponse>(res);
  }

  async getProfile(): Promise<GetProfileResponse> {
    const res = await this.get('/user-auth/profile');
    return this.unwrap<GetProfileResponse>(res);
  }

  async updateProfile(payload: UpdateUserProfilePayload) {
    const res = await this.put('/user-auth/profile', payload);
    return this.unwrap(res);
  }

  async updateAddress(payload: UpsertAddressPayload) {
    const res = await this.put('/user-auth/address', payload);
    return this.unwrap<VerifiedCustomerAddress>(res);
  }

  async confirmAddressMobile(payload: ConfirmMobileAddressPayload) {
    const res = await this.post('/user-auth/confirm-address-mobile', payload);
    return this.unwrap<VerifiedCustomerAddress>(res);
  }
}

export const userAuthService = new UserAuthService();

export const userAuthApi = createApi({
  reducerPath: 'userAuthApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['UserProfile'],
  endpoints: (builder) => ({
    sendOtp: builder.mutation<SendOtpResponse, { phone: string }>({
      query: (body) => ({
        url: '/user-auth/send-otp',
        method: 'POST',
        data: body,
      }),
    }),
    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpPayload>({
      query: (body) => ({
        url: '/user-auth/verify-otp',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['UserProfile'],
    }),
    getUserProfile: builder.query<GetProfileResponse, void>({
      query: () => ({
        url: '/user-auth/profile',
        method: 'GET',
      }),
      providesTags: ['UserProfile'],
    }),
    updateUserProfile: builder.mutation<
      GetProfileResponse['user'],
      UpdateUserProfilePayload
    >({
      query: (body) => ({
        url: '/user-auth/profile',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['UserProfile'],
    }),
    updateUserAddress: builder.mutation<
      VerifiedCustomerAddress,
      UpsertAddressPayload
    >({
      query: (body) => ({
        url: '/user-auth/address',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['UserProfile'],
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useUpdateUserAddressMutation,
} = userAuthApi;
export default userAuthService;
