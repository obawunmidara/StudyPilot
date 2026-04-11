// auth.js
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../FireBase";

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.log(err.code);

    switch (err.code) {
      case "auth/popup-closed-by-user":
        throw new Error("You closed the popup.");
      case "auth/network-request-failed":
        throw new Error("Check your internet.");
      default:
        throw new Error(err.message);
    }
  }
};