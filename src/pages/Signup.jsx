import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { axiosClient } from "../services/axiosClient";
import hide from "../assets/images/hide.png";
import show from "../assets/images/show.png";
import { useState } from "react";
import * as Yup from "yup";
import EndPoints from "../services/EndPoints";

function Signup() {
  const [ishide, setIsHide] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      schoolName: "",
      affiliationNo: "",
      address: "",
      email: "",
      phone: "",
      username: "",
      password: "",
    },
    validationSchema: Yup.object({
      schoolName: Yup.string().required("School name is required"),
      affiliationNo: Yup.string().required("Affiliation number is required"),
      address: Yup.string().required("Address is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      phone: Yup.string()
        .required("Phone number is required")
        .matches(/^\d{10}$/, "Phone number should be 10 digits")
        .test(
          "starts-with-1-to-5",
          "Phone number must start with a digit between 1 to 5",
          (value) => {
            return value && /^[1-5]/.test(value);
          }
        ),
      username: Yup.string().required("user name is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setLoading(true);
        const response = await axiosClient.post(EndPoints.ADMIN.ADMIN_REGISTER, values);
        // console.log(response);

        if (response?.statusCode === 200||response?.statusCode === 201) {
          toast.success(<b>Register Successfully</b>);
          resetForm();
          navigate("/login");
        }
      } catch (error) {
        // console.error("Error:", error);
        toast.error(<b>{error}</b>);
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  return (
    <div
      className="min-h-screen py-20"
      style={{
        backgroundImage:
          "linear-gradient(115deg, #000428, #00F0FF, #004E92, #065DA8)",
      }}
    >
      <Toaster position="top-center" reverseOrder={false} />
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row w-10/12 lg:w-9/12 bg-white rounded-xl mx-auto shadow-lg overflow-hidden">
          <div
            className="w-full  lg:w-2/5 flex flex-col items-center  justify-center p-4 bg-no-repeat bg-cover bg-center"
            style={{
              backgroundImage:
                "url('./src/assets/images/Register-Background.png')",
            }}
          >
            <h1 className="text-white text-3xl mb-3 text-center">Welcome</h1>
            <div className=" w-full">
              <p className="text-white text-center">
                Hello! welcome to School App. one step solution for schools.
              </p>
            </div>
          </div>
          <div className="w-full lg:w-3/5 py-16 px-12">
            <h2 className="text-3xl mb-4 text-center">Admin Register</h2>
            <form onSubmit={formik.handleSubmit}>
              <div className="mt-5">
                <input
                  type="text"
                  name="schoolName"
                  placeholder="school-Name"
                  className="border border-gray-400 py-1 px-2 w-full"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.schoolName}
                />
                {formik.touched.schoolName && formik.errors.schoolName ? (
                  <div className="text-red-600 text-sm">
                    {formik.errors.schoolName}
                  </div>
                ) : null}
              </div>
              <div className="mt-5">
                <input
                  type="text"
                  name="affiliationNo"
                  placeholder="Affiliation-No."
                  className="border border-gray-400 py-1 px-2 w-full"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.affiliationNo}
                />
                {formik.touched.affiliationNo && formik.errors.affiliationNo ? (
                  <div className="text-red-600 text-sm">
                    {formik.errors.affiliationNo}
                  </div>
                ) : null}
              </div>
              <div className="mt-5">
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  className="border border-gray-400 py-1 px-2 w-full"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.address}
                />
                {formik.touched.address && formik.errors.address ? (
                  <div className="text-red-600 text-sm">
                    {formik.errors.address}
                  </div>
                ) : null}
              </div>
              <div className="mt-5">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="border border-gray-400 py-1 px-2 w-full"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-red-600 text-sm">
                    {formik.errors.email}
                  </div>
                ) : null}
              </div>
              <div className="mt-5">
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  className="border border-gray-400 py-1 px-2 w-full"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.phone}
                />
                {formik.touched.phone && formik.errors.phone ? (
                  <div className="text-red-600 text-sm">
                    {formik.errors.phone}
                  </div>
                ) : null}
              </div>
              <div className="mt-5">
                <input
                  type="text"
                  name="username"
                  placeholder="user-Name"
                  className="border border-gray-400 py-1 px-2 w-full"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.username}
                />
                {formik.touched.username && formik.errors.username ? (
                  <div className="text-red-600 text-sm">
                    {formik.errors.username}
                  </div>
                ) : null}
              </div>
              <div className="mt-5 border border-gray-400 flex justify-center items-center focus-within:border-black focus-within:border-2 focus-within:rounded-md">
                <input
                  type={ishide ? "password" : "text"}
                  name="password"
                  placeholder="Password"
                  className="py-1 px-2 w-full border-none focus:outline-none"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                />
                {ishide ? (
                  <img
                    src={show}
                    onClick={() => setIsHide(!ishide)}
                    alt=""
                    className="size-5 relative right-3"
                  />
                ) : (
                  <img
                    src={hide}
                    onClick={() => setIsHide(!ishide)}
                    alt=""
                    className="size-5 relative right-3"
                  />
                )}
              </div>
              {formik.touched.password && formik.errors.password ? (
                <div className="text-red-600 text-sm">
                  {formik.errors.password}
                </div>
              ) : null}
              <div className="mt-5">
                <button
                  type="submit"
                  className="w-full bg-blue-900 py-3 text-center text-white"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? "Submitting..." : "Register Now"}
                </button>
              </div>
            </form>
            <div className="text-right mt-2 text-sm">
              Already have account?{" "}
              <Link to="/login">
                <span className="text-blue-950 font-semibold">login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
