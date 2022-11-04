const Joi = require('joi');
const SignupSchema = Joi.object({
   username: Joi.string().min(4).alphanum().required().messages({
      'string.empty': 'نام کاربری نمیتواند خالی باشد',
      'string.base': `خطای فرمت نام کاربری`,
      'string.min': 'خطای تعداد نام کاربری(حداقل 4)',
      'any.required': 'نام کاربری اجباری است',
   }),
   email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
      'string.empty': 'ایمیل نمیتواند خالی باشد',
      'string.base': `خطای فرمت ایمیل`,
      'any.required': 'ایمیل اجباری است',
      'string.email': 'ایمیل نامعتبر',
   }),
   password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required().messages({
      'string.empty': 'رمز عبور نمیتواند خالی باشد',
      'string.base': `خطای فرمت رمز عبور`,
      'string.min': 'خطای تعداد رمز عبور',
      'any.required': 'رمز عبور اجباری است',
      'string.pattern.base': 'رمز عبور باید حداقل 8 و حداکثر 30 حرف یا عدد باشد',
   }),
});

module.exports = { SignupSchema };
