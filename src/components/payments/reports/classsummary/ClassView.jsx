import React, { useEffect, useState } from "react";
import { axiosClient } from "../../../../services/axiosClient";
import EndPoints from "../../../../services/EndPoints";
import { useDispatch, useSelector } from "react-redux";
import { setTempData } from "../../../../store/AppAuthSlice";

export default function ClassView({ setSelectedView }) {
  const dispatch = useDispatch();
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const [classWiseTransactions, setClassWiseTransactions] = useState([]);

  const getClassWiseTransactions = async () => {
    try {
      const res = await axiosClient.post(
        `${EndPoints.ADMIN.GET_CLASS_SECTIONS_REPORTS}?sessionId=${classAndSectionData?.selectedSession?._id}`,
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        setClassWiseTransactions(res?.result?.sections);
        // setClassWiseTransactions(dummayData);
      }
    } catch (e) {
      // console.log("Error fetching fee summary:", e);
    }
  };

  useEffect(() => {
    getClassWiseTransactions();
  }, []);

  return (
    <>
      {/* transition table */}
      <div className="p-5 rounded-xl bg-[#1c1c1c] mb-6">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-poppins-bold">Transactions</h3>
            <p className="text-sm font-poppins-regular text-textGray2">
              All Class Sections payments
            </p>
          </div>
        </div>
        <div className="w-full rounded-xl overflow-hidden">
          {classWiseTransactions.length === 0 ? (
            <div className="font-poppins-bold text-lg text-textGray2 text-center">
              No Transition right now
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="text-textBlue text-base font-poppins-bold">
                <tr className="border-b border-gray-500/30 bg-[#686868] bg-opacity-5 text-center">
                  <th className="py-4 px-2">Class</th>
                  <th className="py-4 px-2">Total Student Count</th>
                  <th className="py-4 px-2">No of Paid</th>
                  <th className="py-4 px-2">No of Unpaid</th>
                  <th className="py-4 px-2">Action</th>
                </tr>
              </thead>

              <tbody className="bg-[#2b2b2b]">
                {classWiseTransactions?.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-backgroundGray15 text-center text-textPrimary text-base font-poppins-bold"
                  >
                    <td className="py-4 px-2">
                      {item?.className ?? ""} {item?.name ?? ""}
                    </td>
                    <td className="py-4 px-2">
                      {item?.sectionStudentCount ?? 0}
                    </td>
                    <td className="py-4 px-2">{item.paidStudentsCount ?? 0}</td>
                    <td className="py-4 px-2 text-textOrange">
                      {item?.unpaidStudentsCount ?? 0}
                    </td>
                    <td className="py-4 px-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedView("section");
                          dispatch(
                            setTempData({
                              selectedReportsClassTab: "section",
                              selectedReportsClassData: item,
                            }),
                          );
                        }}
                        className="bg-blue-500 text-white text-sm px-4 py-1 rounded-md"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
