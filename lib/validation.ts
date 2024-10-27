// username
export const validateUsername = (
  username: string,
  min: number,
  max: number,
): string | null => {
  const usernamePattern = /^[a-zA-Z0-9]+$/;

  if (!username) {
    return "User name is required";
  }
  if (!usernamePattern.test(username)) {
    return "User name can only contain letters and numbers";
  }
  if (min > username.length || username.length > max) {
    return `User name must be between ${min} and ${max} characters`;
  }
  return null;
};

// userid
export const validateUserId = (
  userid: string,
  min: number,
  max: number,
): string | null => {
  const userIdPattern = /^[a-zA-Z0-9]+$/;

  if (!userid) {
    return "User ID is required";
  }
  if (!userIdPattern.test(userid)) {
    return "User ID can only contain letters and numbers";
  }
  if (min > userid.length || userid.length > max) {
    return `User ID must be between ${min} and ${max} characters`;
  }
  return null;
};

// email
export const validateEmail = (email: string): string | null => {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/i;

  if (!email) {
    return "Email is required";
  }
  if (!emailPattern.test(email)) {
    return "Invalid email format";
  }
  return null;
};

// password
export const validatePassword = (
  password: string,
  confirmPassword: string,
): string | null => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return null;
};

// required
export const validateRequired = (
  username: string,
  userid: string,
  email: string,
  password: string,
  confirmPass: string,
): string | null => {
  if (!username && !userid && !email && !password && !confirmPass) {
    return "Please fill out all fields";
  }
  return null;
};
