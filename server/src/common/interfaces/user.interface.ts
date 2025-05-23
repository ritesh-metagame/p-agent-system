import Joi from "joi";

const createUserSchema = Joi.object({
  username: Joi.string().min(3).required().messages({
    "string.base": `"username" should be a type of 'text'`,
    "string.empty": `"username" cannot be an empty field`,
    "string.min": `"username" should have a minimum length of {#limit}`,
    "string.max": `"username" should have a maximum length of {#limit}`,
    "any.required": `"username" is a required field`,
  }),
  password: Joi.string().min(8).required().messages({
    "string.base": `"password" should be a type of 'text'`,
    "string.empty": `"password" cannot be an empty field`,
    "string.min": `"password" should have a minimum length of {#limit}`,
    "any.required": `"password" is a required field`,
  }),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().allow("").optional(),
  lastName: Joi.string().allow("").optional(),
  password: Joi.string().min(8).optional(),
  email: Joi.string().email().optional(),
  mobileNumber: Joi.string().optional(),
  bankName: Joi.string().allow("").optional(),
  accountNumber: Joi.string().allow("").optional(),
});
