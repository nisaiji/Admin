import React from "react";
import { useFormik } from "formik";
import ArrowRight from "../assets/images/ArrowRight.png";

const Step1 = ({ nextStep }) => {
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validate: (values) => {
      const errors = {};
      return errors;
    },
  });

  return (
    <div>
      <form className="text-black" onSubmit={formik.handleSubmit}>
        <div className="mt-5">
          <p className="text-gray-900 text-sm text-left pl-3 font-semibold">School Name</p>
          <input
            className="text-black rounded-xl border border-[#E9EAF0] py-1 px-5 mt-2 w-full"
            type="text"
            name="username"
            placeholder="School"
            onChange={formik.handleChange}
            value={formik.values.username}
          />
        </div>
        <div className="flex gap-2 mt-5">
          <div className="w-1/2">
            <p className="text-gray-900 text-sm text-left pl-3 font-semibold">
              Affiliation Number
            </p>
            <input
              className="text-black rounded-xl border border-[#E9EAF0] py-1 px-5 mt-2 w-full"
              type="text"
              name="affiliation"
              placeholder="Affiliation Number"
              onChange={formik.handleChange}
              value={formik.values.affiliation}
            />
          </div>
          <div className="w-1/2">
            <p className="text-gray-900 text-sm text-left pl-3 font-semibold">School Number</p>
            <input
              className="text-black rounded-xl border border-[#E9EAF0] py-1 px-5 mt-2 w-full"
              type="text"
              name="schoolnumber"
              placeholder="School Number"
              onChange={formik.handleChange}
              value={formik.values.schoolnumber}
            />
          </div>
        </div>
        <div className="mt-5">
          <p className="text-gray-900 text-sm text-left pl-3 font-semibold">Admin Name</p>
          <div className="flex gap-2">
            <input
              className="text-black rounded-xl border border-[#E9EAF0] py-1 px-5 mt-2 w-full"
              type="text"
              name="firstname"
              placeholder="First name"
              onChange={formik.handleChange}
              value={formik.values.firstname}
            />
            <input
              className="text-black rounded-xl border border-[#E9EAF0] py-1 px-5 mt-2 w-full"
              type="text"
              name="lastname"
              placeholder="Last name"
              onChange={formik.handleChange}
              value={formik.values.lastname}
            />
          </div>
        </div>
        <div className="mt-5">
          <p className="text-gray-900 text-sm text-left pl-3 font-semibold">Email</p>
          <input
            className="text-black rounded-xl border border-[#E9EAF0] py-1 px-5 mt-2 w-full"
            type="text"
            name="email"
            placeholder="Email address"
            onChange={formik.handleChange}
            value={formik.values.email}
          />
        </div>
        <div className="mt-5">
          <p className="text-gray-900 text-sm text-left pl-3 font-semibold">Phone Number</p>
          <input
            className="text-black rounded-xl border border-[#E9EAF0] py-1 px-5 mt-2 w-full"
            type="text"
            name="phonenumber"
            placeholder="Phone Number"
            onChange={formik.handleChange}
            value={formik.values.phonenumber}
          />
        </div>
        <div className="mt-5">
          <button
            className="rounded-lg px-7 h-10 bg-[#464590] font-semibold flex items-center justify-center ml-auto text-white"
            type="submit"
            onClick={nextStep}
          >
            <div className="flex items-center gap-2">
              <p className="text-base">Next</p>
              <img className="w-6 h-6" src={ArrowRight} alt="Arrow Right" />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step1;
