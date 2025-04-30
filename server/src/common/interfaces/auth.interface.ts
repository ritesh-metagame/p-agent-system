import Joi from "joi";

const loginSchema = Joi.object({
  username: Joi.string().required().min(2).messages({
    "string.empty": "Username cannot be empty",
    "any.required": "Username is required",
    "string.min": "Username must be at least {#limit} characters long",
  }),
  password: Joi.string().required().min(8).messages({
    "string.empty": "Password cannot be empty",
    "any.required": "Password is required",
    "string.min": "Password must be at least {#limit} characters long",
  }),
});

export { loginSchema };
