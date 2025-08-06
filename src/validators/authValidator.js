const Joi = require('joi');

// Registration validation schema
const registrationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'يجب أن يكون البريد الإلكتروني صحيحاً',
      'any.required': 'البريد الإلكتروني مطلوب'
    }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .required()
    .messages({
      'string.min': 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل',
      'string.max': 'كلمة المرور طويلة جداً',
      'string.pattern.base': 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم ورمز خاص',
      'any.required': 'كلمة المرور مطلوبة'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'تأكيد كلمة المرور غير متطابق',
      'any.required': 'تأكيد كلمة المرور مطلوب'
    }),
  firstName: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'الاسم الأول يجب أن يحتوي على حرفين على الأقل',
      'string.max': 'الاسم الأول طويل جداً',
      'any.required': 'الاسم الأول مطلوب'
    }),
  lastName: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'الاسم الأخير يجب أن يحتوي على حرفين على الأقل',
      'string.max': 'الاسم الأخير طويل جداً',
      'any.required': 'الاسم الأخير مطلوب'
    }),
  role: Joi.string()
    .valid('student', 'instructor')
    .default('student')
    .messages({
      'any.only': 'نوع المستخدم غير صحيح'
    })
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'يجب أن يكون البريد الإلكتروني صحيحاً',
      'any.required': 'البريد الإلكتروني مطلوب'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'كلمة المرور مطلوبة'
    })
});

// Validation functions
const validateRegistration = (data) => {
  return registrationSchema.validate(data, { abortEarly: false });
};

const validateLogin = (data) => {
  return loginSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateRegistration,
  validateLogin
};