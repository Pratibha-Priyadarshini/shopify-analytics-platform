export interface User {
  name: string;
  email: string;
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function removeToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function isAuthenticated() {
  return !!getToken();
}

export function setUser(user: User) {
  if (typeof window === 'undefined') return; // Server-side check
  
  try {
    const userStr = JSON.stringify(user);
    localStorage.setItem("user", userStr);
    console.log("User data stored:", userStr);
    // Dispatch event to notify components
    window.dispatchEvent(new Event('userUpdated'));
  } catch (error) {
    console.error("Error setting user:", error);
  }
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null; // Server-side check
  
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}
