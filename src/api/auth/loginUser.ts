import type { LoginResponse } from "@/types/interface";

const API_BASE_URL = "http://localhost:7070/users";

const loginUser = async (username: string,password: string): Promise<LoginResponse> => 
  {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier: username,
      password,
    }),
  });

  let data: LoginResponse;

  try {
    data = (await response.json()) as LoginResponse;
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  const token = data.token ?? data.data?.token;

  if (typeof token !== "string" || !token.trim()) {
    throw new Error("Login response did not contain a token");
  }
  localStorage.setItem("token", token);
  localStorage.setItem("userdata", JSON.stringify(data));
  return data;
};

export default loginUser;