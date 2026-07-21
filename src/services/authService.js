import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { COLLECTIONS } from "../utils/constants";

/**
 * Register a new user with Firestore profile.
 * @param {{ name: string, email: string, password: string }} data
 * @returns {Promise<import('../types').User>}
 */
export async function registerUser(data) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password,
  );

  try {
    await updateProfile(credential.user, { displayName: data.name });

    /** @type {Omit<import('../types').User, 'id'>} */
    const userData = {
      name: data.name,
      email: data.email,
      role: "user",
      approved: false,
      hostApproved: false,
      adminApproved: false,
      disabled: false,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, COLLECTIONS.USERS, credential.user.uid), userData);

    return {
      id: credential.user.uid,
      ...userData,
      createdAt: new Date(),
    };
  } catch (error) {
    try {
      await deleteUser(credential.user);
    } catch {
      // ignore rollback failure
    }
    throw error;
  }
}

/**
 * Sign in and fetch user profile.
 * @param {{ email: string, password: string }} data
 * @returns {Promise<import('../types').User>}
 */
export async function loginUser(credentials) {
  const credential = await signInWithEmailAndPassword(
    auth,
    credentials.email,
    credentials.password,
  );
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, credential.user.uid));

  if (!userDoc.exists()) {
    throw new Error("User profile not found");
  }

  const userData = userDoc.data();
  const approved =
    userData.approved === true ||
    (userData.adminApproved === true && userData.hostApproved === true);

  return { id: userDoc.id, ...userData, approved };
}

/**
 * Fetch user profile by ID.
 * @param {string} userId
 * @returns {Promise<import('../types').User | null>}
 */
export async function getUserProfile(userId) {
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
  if (!userDoc.exists()) return null;

  const userData = userDoc.data();
  const approved =
    userData.approved === true ||
    (userData.adminApproved === true && userData.hostApproved === true);

  return { id: userDoc.id, ...userData, approved };
}

/**
 * Sign out current user.
 */
export async function logoutUser() {
  await signOut(auth);
}
