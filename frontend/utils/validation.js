
export const isNotEmpty = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== "";
};


export const isOnlyAlphabet = (name) => {
  return /^[A-Za-z ]+$/.test(name.trim());
};


export const isOnlyNumber = (value) => {
  return /^[0-9]+$/.test(value);
};


export const hasMinLength = (value, length) => {
  return value && value.length >= length;
};



export const validateName = (name) => {
  if (!isNotEmpty(name)) return "Name cannot be empty";
  if (!isOnlyAlphabet(name)) return "Name must contain only alphabets";
  if (!hasMinLength(name, 3)) return "Name must be at least 3 characters";
  return null;
};


export const validatePassword = (password) => {
  if (!isNotEmpty(password)) return "Password cannot be empty";
  if (!hasMinLength(password, 6))
    return "Password must be at least 6 characters";
  return null;
};


export const validateUsername = (username) => {
  if (!isNotEmpty(username)) return "Phone number cannot be empty";
  if (!isOnlyNumber(username))
    return "Phone number must contain only numbers";
  if (username.length !== 10)
    return "Phone number must be exactly 10 digits";
  return null;
};



export const validateEmail = (email) => {
  if (!isNotEmpty(email)) return "Email cannot be empty";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid email format";
  return null;
};


export const validateStrongPassword = (password) => {
  if (!isNotEmpty(password)) return "Password cannot be empty";
  if (password.length < 6) return "Minimum 6 characters required";
  if (!/[A-Za-z]/.test(password))
    return "Password must contain at least one letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one number";
  return null;
};