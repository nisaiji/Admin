import React, { useEffect, useState } from "react";
import SessionDropdaown from "../SessionDropdaown";
import profile from "../../../assets/images/profileEmpty.png";
import notification from "../../../assets/images/fees/notifications.png";
import discount from "../../../assets/images/fees/discount.png";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import moment from "moment";
import { ChevronRight } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { set } from "date-fns";
import Spinner from "../../Spinner";

export default function StudentView({
  setSelectedView,
  selectedStudent,
  filterClass,
  filterSection,
}) {
  const [studentSummary, setStudentSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const getStudentSummary = async () => {
    try {
      const res = await axiosClient.post(
        // `${EndPoints.ADMIN.GET_PAYMENT_TRANSITIIONS}?sessionStudentId=${selectedStudent?.sessionStudentId}`
        `${EndPoints.ADMIN.GET_PAYMENT_TRANSITIIONS}?sessionStudentId=6942fd8fd06f243e76e5beac`
      );
      // console.log(res.result);

      if (res?.statusCode === 200) {
        setStudentSummary(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  const sendParentReminder = async () => {
    try {
      // ?sessionStudentId=6942fd8fd06f243e76e5beac
      setLoading(true);
      const res = await axiosClient.post(
        `${EndPoints.ADMIN.GET_REPORT_FEE_REMINDER}`,
        { instanceID: "6942fd8fd06f243e76e5beac" }
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setTimeout(() => {
          toast.success(res?.result?.message);
          setLoading(false);
        }, 1500);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    } finally {
    }
  };

  useEffect(() => {
    getStudentSummary();
  }, [selectedStudent]);

  // const rows = [
  //   {
  //     month: "January",
  //     id: "12128CNN",
  //     amount: "₹ 5000",
  //     mode: "UPI",
  //     modeColor: "#F77F00",
  //     time: "12:03 AM",
  //     date: "04/01/2025",
  //     due: "05/01/2025",
  //     overdue: false,
  //   },
  //   {
  //     month: "February",
  //     id: "123FRT67",
  //     amount: "₹ 5000",
  //     mode: "Net Banking",
  //     modeColor: "#0096C7",
  //     time: "2:03 AM",
  //     date: "04/02/2025",
  //     due: "05/02/2025",
  //     overdue: false,
  //   },
  //   {
  //     month: "March",
  //     id: "563YTU86",
  //     amount: "₹ 5000",
  //     mode: "VISA Card",
  //     modeColor: "#6A4C93",
  //     time: "8:03 PM",
  //     date: "05/03/2025",
  //     due: "05/03/2025",
  //     overdue: false,
  //   },
  //   {
  //     month: "April",
  //     id: "9889TU86",
  //     amount: "₹ 5000",
  //     mode: "Net Banking",
  //     modeColor: "#0096C7",
  //     time: "5:45 PM",
  //     date: "02/04/2025",
  //     due: "05/04/2025",
  //     overdue: false,
  //   },
  //   {
  //     month: "May",
  //     id: "87HSB678",
  //     amount: "₹ 5000",
  //     mode: "UPI",
  //     modeColor: "#F77F00",
  //     time: "8:45 AM",
  //     date: "06/05/2025",
  //     due: "05/05/2025",
  //     overdue: true,
  //   },
  //   {
  //     month: "June",
  //     id: "87GYQ678",
  //     amount: "₹ 5000",
  //     mode: "UPI",
  //     modeColor: "#F77F00",
  //     time: "5:45 PM",
  //     date: "06/06/2025",
  //     due: "05/06/2025",
  //     overdue: true,
  //   },
  // ];

  return (
    <div className="p-6 w-full text-white">
      {loading && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-[#93a3b6] bg-opacity-50 z-30`}
        >
          <Spinner />
        </div>
      )}
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex">
        <button
          type="button"
          onClick={() => setSelectedView("class")}
          className="text-sm font-poppins-bold cursor-pointer"
        >
          Payments
        </button>
        <ChevronRight className="w-5 h-5" />
        <button
          type="button"
          onClick={() => setSelectedView("section")}
          className="text-sm font-poppins-bold cursor-pointer"
        >
          {filterClass?.name ?? "Nursary"} {filterSection?.name ?? "A"}
        </button>
        <ChevronRight className="w-5 h-5" />
        <p className="text-sm text-textBlue font-poppins-bold">
          {studentSummary?.studentFirstname ?? "Akash"}{" "}
          {studentSummary?.studentLastname ?? "Chouhan"}
        </p>
      </div>

      <p className="text-xl font-poppins-bold my-6">
        Nursary Payment Overview{" "}
      </p>

      <div className="flex justify-between items-center">
        <div className="flex gap-6 justify-center items-center">
          <img
            src={studentSummary?.studentPhoto ?? profile}
            alt="p"
            className="size-[50px] object-contain rounded-md"
          />
          <p className="text-textPrimary text-sm font-poppins-bold ">
            {studentSummary?.studentFirstname ?? ""}{" "}
            {studentSummary?.studentLastname ?? ""}
          </p>
        </div>
        <div className="flex gap-6 justify-center items-center">
          <button className="bg-backgroundBlue15 text-textBlue text-sm font-poppins-bold p-[10px] rounded-md flex justify-center items-center gap-2">
            <img src={discount} alt="d" className="size-6 object-contain" />
            Dispute
          </button>
          <button
            type="button"
            onClick={() => sendParentReminder()}
            disabled={loading}
            className="bg-backgroundBlue text-textPrimary text-sm font-poppins-regular p-[10px] rounded-md flex justify-center items-center gap-2"
          >
            <img src={notification} alt="d" className="size-6 object-contain" />
            Reminder
          </button>
        </div>
      </div>

      {/* Monthly Fee Trends */}
      <div className="p-5 rounded-xl bg-[#1c1c1c] my-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-poppins-bold">Transactions</h3>
            <p className="text-sm font-poppins-regular text-textGray2">
              Student paid unpaid status
            </p>
          </div>
          {/* <SessionDropdaown /> */}
        </div>

        <div className="w-full rounded-xl overflow-auto">
          <table className="w-full text-left">
            <thead className="text-textBlue text-base font-poppins-bold">
              <tr className="border-b border-gray-500/30 bg-[#686868]/10 text-center">
                <th className="py-4 px-2">Month</th>
                <th className="py-4 px-2">Transaction ID</th>
                <th className="py-4 px-2">Amount</th>
                <th className="py-4 px-2">Payment Mode</th>
                <th className="py-4 px-2">Date & Time</th>
                {/* <th className="py-4 px-2">Due Date</th> */}
                <th className="py-4 px-2">Action</th>
              </tr>
            </thead>

            <tbody className="bg-[#2b2b2b]">
              {studentSummary?.map((std, index) => (
                <tr
                  key={index}
                  className="border-b border-backgroundGray15 text-center text-textPrimary text-base font-poppins-medium"
                >
                  {/* STUDENT NAME */}
                  <td className="py-4 px-2">
                    {moment(std?.paidAt).format("MMM")}
                  </td>
                  <td className="py-4 px-2">{std?.zohoPaymentId}</td>
                  <td className="py-4 px-2">{std?.amount}</td>
                  <td className="py-4 px-2">{std?.paymentMethod}</td>
                  <td className="py-4 px-2">
                    {moment(std?.paidAt).format("DD/MM/YYYY HH:mm A")}
                  </td>
                  {/* <td className="py-4 px-2">{std?.due}</td> */}
                  {/* ACTION */}
                  <td className="py-4 px-2">
                    <button className="bg-backgroundBlue text-white text-sm px-4 py-1 rounded-md">
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
