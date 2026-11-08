import { userServiceApiClient } from "@/api/axios";

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phone?: string | null;
  houseNo?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | number | null;
}

interface RegistrationPayload {
  firstName: string;
  lastName: string;
  credentials: {
    username: string;
    email: string;
    password: string;
    phone: string;
  };
  address: {
    houseNo: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string | number;
  };
}



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
  const response = await userServiceApiClient.post(
    "/auth/register",
    mapData(userData)
  );
  return response.data;
};

export const updateUser = async (
  userData: RegistrationFormData,
  action: string
) => {
  const response = await userServiceApiClient.post(
    "/auth/register",
    mapData(userData),
    { params: action ? { action } : {} }
  );
  return response.data;
};

export default registerUser;