// import React, { useState } from "react";
// import hide from "../assets/images/hide.png";
// import show from "../assets/images/show.png";
// import { useTranslation } from "react-i18next";

// /**
//  * Step3 Component - First step of a multi-step form.
//  * Handles user inputs for school name, phone, email, and password fields.
//  * @param {object} formik - Formik object for managing form state and validation.
//  */
// const Step3 = ({ formik, goback }) => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const togglePasswordVisibility = () => setShowPassword(!showPassword);
//   const toggleConfirmPasswordVisibility = () =>
//     setShowConfirmPassword(!showConfirmPassword);

//   const [t] = useTranslation();

//   return (
//     <form onSubmit={formik.handleSubmit}>
//       <div className="flex gap-5">
//         {/* Password Field */}
//         <div className="mt-5">
//           <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
//             {t("labels.password")}
//           </p>
//           <input
//             className="text-black rounded-lg border border-gray-300 py-2 px-5 mt-2 w-full"
//             type={showPassword ? "text" : "password"}
//             name="password"
//             placeholder={t("placeholders.password")}
//             onChange={formik.handleChange}
//             value={formik.values.password}
//           />
//           <img
//             src={showPassword ? hide : show}
//             alt="Toggle Password Visibility"
//             className="absolute right-3 top-9 cursor-pointer size-6"
//             style={{
//               filter:
//                 "invert(41%) sepia(0%) saturate(0%) hue-rotate(180deg) brightness(90%) contrast(85%)",
//             }}
//             onClick={togglePasswordVisibility}
//           />
//           {formik.touched.password && formik.errors.password && (
//             <div className="text-red-500 text-sm text-left pl-3">
//               {formik.errors.password}
//             </div>
//           )}
//         </div>

//         {/* Confirm Password Field */}
//         <div className="mt-5">
//           <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
//             {t("labels.confirmPassword")}
//           </p>
//           <input
//             className="text-black rounded-lg border border-gray-300 py-2 px-5 mt-2 w-full"
//             type={showConfirmPassword ? "text" : "password"}
//             name="confirmPassword"
//             placeholder={t("placeholders.confirmPassword")}
//             onChange={formik.handleChange}
//             value={formik.values.confirmPassword}
//           />
//           <img
//             src={showConfirmPassword ? hide : show}
//             alt="Toggle Confirm Password Visibility"
//             className="absolute right-3 top-9 cursor-pointer size-6"
//             style={{
//               filter:
//                 "invert(41%) sepia(0%) saturate(0%) hue-rotate(180deg) brightness(90%) contrast(85%)",
//             }}
//             onClick={toggleConfirmPasswordVisibility}
//           />
//           {formik.touched.confirmPassword && formik.errors.confirmPassword && (
//             <div className="text-red-500 text-sm text-left pl-3">
//               {formik.errors.confirmPassword}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="flex justify-between w-full mt-5">
//         <button
//           type="button"
//           className="rounded-lg px-4 h-8 bg-[#0F4189] font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
//           data-testid="back"
//           onClick={goback}
//         >
//           <p className="text-base">{t("buttons.back")}</p>
//         </button>
//         <button
//           type="submit"
//           className="rounded-lg px-4 h-8 bg-[#0F4189] font-medium flex items-center justify-center text-white transition-all duration-200 ease-in-out active:scale-90"
//           data-testid="submitPage1"
//         >
//           <div className="flex items-center gap-2">
//             <p className="text-base">{t("buttons.submit")}</p>
//           </div>
//         </button>
//       </div>
//     </form>
//   );
// };

// export default Step3;
