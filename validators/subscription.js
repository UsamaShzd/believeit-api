const yup = require("yup");

const stirpePaymentSchema = yup.object().shape({
  stripePaymentToken: yup.string().min(5).required(),
});

const googlePaySchema = yup.object().shape({
  purchaseToken: yup.string().required(),
  subscriptionId: yup
    .string()
    .oneOf(["bi_premium_yearly", "bi_premium_monthly"])
    .required(),
});

const applePaySchema = yup.object().shape({
  reciptData: yup.string().required(),
  password: yup.string().optional(),
  excludeOldTransactions: yup.boolean().optional(),
  subscriptionType: yup.string().oneOf(["yearly", "monthly"]).required(),
});

module.exports = {
  stirpePaymentSchema,
  googlePaySchema,
  applePaySchema,
};
