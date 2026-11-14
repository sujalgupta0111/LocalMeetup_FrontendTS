import { userServiceApiClient } from "@/api/axios";
import type { RegistrationFormData, RegistrationPayload } from "@/types/interface";


const mapData = (userData: RegistrationFormData): RegistrationPayload => {
  console.log("User Data:", userData);

  return {
    firstName: userData.firstName,
    lastName: userData.lastName,

    credentials: {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      phone: userData.phone ?? "",
    },

    address: {
      houseNo: userData.houseNo ?? "",
      street: userData.street ?? "",
      city: userData.city ?? "",
      state: userData.state ?? "",
      country: userData.country ?? "",
      pincode: userData.pincode ?? "",
    },
  };
};

const registerUser = async (userData: RegistrationFormData) => {
  const response = await userServiceApiClient.post( "/auth/register", mapData(userData));
  return response.data;
};

export const updateUser = async ( userData: RegistrationFormData, action: string) => {
  const response = await userServiceApiClient.post("/auth/register",mapData(userData),{ params: action ? { action } : {} });
  return response.data;
};

export default registerUser;