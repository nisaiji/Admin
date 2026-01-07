import React, { useEffect, useState } from "react";
import collected from "../../../assets/images/fees/collected.png";
import pending from "../../../assets/images/fees/pending.png";
import due from "../../../assets/images/fees/due.png";
import refund from "../../../assets/images/fees/refund.png";
import classimg from "../../../assets/images/fees/payment.png";
import paymentgreen from "../../../assets/images/fees/creditcardgreen.png";
import graphup from "../../../assets/images/fees/net-banking.png";
import graphdown from "../../../assets/images/fees/upi.png";
import SessionDropdaown from "../SessionDropdaown";
import {
  BarChart,
  barClasses,
  barElementClasses,
  PieChart,
} from "@mui/x-charts";
import dots from "../../../assets/images/fees/dots.png";
import {
  FormControl,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
} from "@mui/material";
import { Stack } from "@mui/system";
import { useTranslation } from "react-i18next";
import {
  BlueCard,
  GreenCard,
  OrangeCard,
  RedCard,
  WhiteCard,
} from "../TopCard";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import { useSelector } from "react-redux";

export default function PaymentView() {
  const isDarkMode = true;
  const [t] = useTranslation();
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const [paymentModeSummary, setPaymentModeSummary] = useState([]);
  const [filterClass, setFilterClass] = useState(null);

  const getPaymentModeSummary = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_PAYMENT_MODE_SUMMARY}?sessionID=${classAndSectionData?.selectedSession?._id}&classID=${filterClass?._id}`
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setPaymentModeSummary(res?.result);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  useEffect(() => {
    if (filterClass?._id) {
      getPaymentModeSummary();
    }
  }, [filterClass?._id]);

  useEffect(() => {
    if (!classAndSectionData?.classList?.length) return;

    const defaultClass = classAndSectionData?.classList[0];

    setFilterClass(defaultClass);
  }, [classAndSectionData]);

  return (
    <>
      {/* Section 1 */}
      <div className="grid grid-cols-4 gap-4 my-6">
        <OrangeCard
          img={graphdown}
          heading="UPI"
          title1={`₹ ${paymentModeSummary?.modes?.[0]?.amount}`}
          title2={paymentModeSummary?.modes?.[0]?.transactions}
        />
        <GreenCard
          img={paymentgreen}
          heading="Net Banking"
          title1={`₹ ${paymentModeSummary?.modes?.[1]?.amount}`}
          title2={paymentModeSummary?.modes?.[1]?.transactions}
        />
        <BlueCard
          img={graphup}
          heading="Credit Card"
          title1={`₹ ${paymentModeSummary?.modes?.[2]?.amount}`}
          title2={paymentModeSummary?.modes?.[2]?.transactions}
        />
        {/* <WhiteCard img={classimg} heading="Other" title1="₹ 5000" title2="30" /> */}
      </div>
      {/* PIE CHART */}
      <div className="p-5 rounded-xl bg-[#1c1c1c] mb-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-poppins-bold">Payment Mode</h3>
            <p className="text-sm font-poppins-regular text-textGray2">
              Total number of fees collected by different mode of payment
            </p>
          </div>
          <div className="space-x-4">
            <select
              value={filterClass?._id || ""}
              onChange={(e) => {
                const selected = classAndSectionData?.classList?.find(
                  (cls) => cls._id === e.target.value
                );
                setFilterClass(selected);
              }}
              className="w-40 pl-4 pr-4 py-2.5 bg-[#242424] border border-gray-700 rounded-lg text-white appearance-none"
            >
              {classAndSectionData?.classList?.map((cls) => (
                <option key={cls?._id} value={cls?._id}>
                  {cls?.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div className="w-full flex justify-evenly items-center">
          <div className="flex justify-center items-center relative">
            {/* Donut Chart */}
            <PieChart
              series={[
                {
                  data: [
                    {
                      id: 0,
                      value: paymentModeSummary?.modes?.[0]?.transactions ?? 0,
                      color: "#0A81D1",
                    },
                    {
                      id: 1,
                      value: paymentModeSummary?.modes?.[1]?.transactions ?? 0,
                      color: "#FF793F",
                    },
                    {
                      id: 2,
                      value: paymentModeSummary?.modes?.[2]?.transactions ?? 0,
                      color: "#4CBC9A",
                    },
                  ],
                  innerRadius: 100,
                  outerRadius: 150,
                },
              ]}
              width={300}
              height={300}
              slotProps={{
                legend: { hidden: true }, // hide default legend
              }}
            />

            {/* Center Text */}
            <div className="absolute flex flex-col justify-center items-center">
              <p className="text-xl font-poppins-bold">
                ₹ {paymentModeSummary?.totalAmount}
              </p>
              <p className="text-sm text-textGray2 text-center leading-4">
                Fees Payment <br /> Mode
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#2b2b2b] min-h-[350px]">
            <h3 className="text-lg font-poppins-bold">Transitions</h3>
            <p className="text-sm font-poppins-regular text-textGray2 mb-4">
              Payment mode breakdown
            </p>
            <table className=" text-left rounded-b-xl mx-5">
              <thead className="text-textBlue text-base font-poppins-bold">
                <tr className="border-b border-gray-500/30 text-center">
                  <th className="py-4 px-2">Payment Mode</th>
                  <th className="py-4 px-2">No of Transistions</th>
                  <th className="py-4 px-2">Total Amount</th>
                </tr>
              </thead>

              <tbody className="bg-backgroundGray15 rounded-b-xl">
                {paymentModeSummary?.modes?.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-backgroundGray15 text-center text-textPrimary text-base font-poppins-bold"
                  >
                    <td className="py-4 px-2">{item?.mode}</td>
                    <td className="py-4 px-2">{item?.transactions}</td>
                    <td className="py-4 px-2">{item?.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
