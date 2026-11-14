import React, { useEffect, useState } from "react";
import type { StoredUserData } from "@/types/interface";
// LocalStorage me save hone wale data ka interface


export const UserNameBatch: React.FC = () => {
  const [displayName, setDisplayName] = useState<string>("Guest");

  useEffect(() => {
    const rawData = localStorage.getItem("userdata");
console.log("Retrieved userdata from localStorage:", rawData);
    if (!rawData) {
      setDisplayName("Guest");
      return;
    }

    try {
      const parsedData: StoredUserData = JSON.parse(rawData);

      // Backend API structure ke according possible user object resolve karna
      const userPayload =
        parsedData.data?.user || parsedData.user || parsedData.data || parsedData;

      const fName =
        userPayload.firstName ||
        userPayload.first_name ||
        userPayload.name?.split(" ")[0] ||
        "";

      const lName =
        userPayload.lastName ||
        userPayload.last_name ||
        userPayload.name?.split(" ").slice(1).join(" ") ||
        "";

      const fullName = `${fName} ${lName}`.trim();

      // Agar first aur last name mil gaya to wo use hoga, warna fallback "Guest"
      setDisplayName(fullName || "Guest");
    } catch {
      // JSON parse fail hone par fallback
      setDisplayName("Guest");
    }
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
      <span>Hello, {displayName}</span>
    </div>
  );
};

export default UserNameBatch;