import {
    updateUserProfile,
    UpdateUserProfileInput,
} from "../../repositories";

export async function saveUserProfile(
  input: UpdateUserProfileInput
): Promise<void> {
  if (!input.uid) {
    throw new Error("User is required.");
  }

  if (!input.fullName.trim()) {
    throw new Error("Full name is required.");
  }

  const cleanMobile = String(input.mobile || "").replace(/\D/g, "");

  if (cleanMobile && cleanMobile.length !== 10) {
    throw new Error("Please enter a valid 10 digit mobile number.");
  }

  if (input.age && (input.age < 13 || input.age > 100)) {
    throw new Error("Please enter a valid age between 13 and 100.");
  }

  await updateUserProfile({
    ...input,
    mobile: cleanMobile,
  });
}
