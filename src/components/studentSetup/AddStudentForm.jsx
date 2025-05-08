import React from "react";
import { useSelector } from "react-redux";

function TransferStudent() {
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);

  const DetailItem = ({ label, value }) => {
    return (
      <div className={`flex gap-6 items-center w-full`}>
        <div
          className={`self-stretch my-auto ${
            isDarkMode ? "text-textGray1" : "text-textBlack"
          } w-[130px]`}
        >
          {label}
        </div>
        <p className={`${isDarkMode ? "text-textPrimary" : "text-textBlack"}`}>
          -
        </p>
        <div
          className={`self-stretch my-auto ${
            isDarkMode ? "text-textPrimary" : "text-textBlack"
          } w-[129px]`}
        >
          {value}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${
        isDarkMode ? "bg-background2" : "bg-whiteBackground2"
      } px-6 min-h-[calc(100vh-72px)] py-4 `}
    >
      <div
        className={`${
          isDarkMode
            ? "bg-gradient-to-r from-fromColor1 to-toColor1"
            : "bg-whiteBackground"
        } p-4 rounded-[16px]`}
      >
        <h1
          className={`px-16 pt-6 text-4xl font-bold ${
            isDarkMode ? "text-textPrimary" : "text-textBlack"
          } max-md:ml-2.5`}
        >
          Transfer student
        </h1>
        <div
          className={`px-8 py-9 mt-9 w-full rounded-2xl ${
            isDarkMode ? "bg-backgroundGray50" : ""
          }`}
        >
          <section className="px-10">
            <h2
              className={`text-xl font-bold ${
                isDarkMode ? "text-textPrimary" : "text-textBlack"
              }`}
            >
              Student Details
            </h2>
            <div className="flex flex-wrap mt-[35px] w-full">
              <div className="grow shrink min-w-60 w-[50%]">
                <DetailItem label="Full Name" value="Mahi Sharma" />
                <div className="mt-7">
                  <DetailItem label="Father's name" value="Ajay Sharma" />
                </div>
                <div className="mt-7">
                  <DetailItem label="Date of birth" value="DD/MM/YYYY" />
                </div>
                <div className="mt-7">
                  <DetailItem label="Nationality" value="Indian" />
                </div>
              </div>
              <div className="grow shrink min-w-60 w-[50%]">
                <DetailItem label="Gender" value="Female" />
                <div className="mt-7">
                  <DetailItem label="Mother's name" value="Ajay Sharma" />
                </div>
                <div className="mt-7">
                  <DetailItem
                    label="Date of first admission"
                    value="DD/MM/YYYY"
                  />
                </div>
                <div className="mt-7">
                  <DetailItem label="School board" value="MP BOARD" />
                </div>
              </div>
            </div>
          </section>
          <section
            className={`mt-20 w-full ${
              isDarkMode ? "text-textPrimary" : "text-textBlack"
            } max-md:mt-10 max-md:max-w-full`}
          >
            <div className="flex justify-between items-start max-w-full w-[1240px]">
              <div className="min-w-60 w-[1233px]">
                <div className="w-full max-w-[1233px] max-md:max-w-full">
                  <div className="flex gap-5 justify-center items-end w-full">
                    <div className="overflow-hidden min-h-[154px] min-w-60 w-[1232px]">
                      <label className="font-bold tracking-normal leading-none">
                        Reason for leaving
                      </label>
                      <textarea
                        placeholder="Reason"
                        className={`overflow-hidden px-5 pt-3.5 pb-24 mt-1.5 max-w-full leading-tight whitespace-nowrap rounded-lg border border-solid ${
                          isDarkMode
                            ? "bg-stone-500 bg-opacity-30 border-stone-500 border-opacity-30"
                            : "bg-stone-200 bg-opacity-30 border-stone-300 border-opacity-30"
                        } w-[868px] max-md:pr-5`}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-10 items-start mt-12 w-full max-md:mt-10">
                    <div className="overflow-hidden h-[84px] min-w-60 w-[399px]">
                      <label className="font-semibold tracking-normal leading-none">
                        Any dues left
                      </label>
                      <div
                        className={`flex overflow-hidden flex-col justify-center px-5 py-3.5 mt-1.5 w-full leading-tight whitespace-nowrap rounded-lg border border-solid ${
                          isDarkMode
                            ? "bg-stone-500 bg-opacity-30 border-stone-500 border-opacity-30"
                            : "bg-stone-200 bg-opacity-30 border-stone-300 border-opacity-30"
                        } max-w-[401px] rotate-[-0.010598677076564101rad] max-md:pl-5`}
                      >
                        <div className="flex items-center">
                          <div className="self-stretch my-auto rotate-[1.734723475976807e-18rad] w-[46px]">
                            No
                          </div>
                          <img
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/0086b55b1bbe4fb0811d091c6a2ac13842b3c356?placeholderIfAbsent=true&apiKey=a8cc6c1bf626485c842deb8f5c2a2105"
                            className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="overflow-hidden min-h-[84px] min-w-60 w-[400px]">
                      <label className="font-semibold tracking-normal leading-none">
                        Date of application for TC
                      </label>
                      <div
                        className={`flex overflow-hidden gap-5 justify-between px-5 py-3 mt-1.5 max-w-full leading-tight whitespace-nowrap rounded-lg border border-solid ${
                          isDarkMode
                            ? "bg-stone-500 bg-opacity-30 border-stone-500 border-opacity-30"
                            : "bg-stone-200 bg-opacity-30 border-stone-300 border-opacity-30"
                        } w-[400px]`}
                      >
                        <div className="my-auto">12-04-2025</div>
                        <img
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/687fcf93c62fb54e2cbe7021265af20f49c1f56b?placeholderIfAbsent=true&apiKey=a8cc6c1bf626485c842deb8f5c2a2105"
                          className="object-contain shrink-0 w-8 aspect-square"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-5 mt-14 mb-0 max-w-full tracking-normal leading-10 w-[287px] max-md:mt-10 max-md:mb-2.5 max-md:ml-1">
              <button
                className={`gap-3 self-stretch px-6 text-white ${
                  isDarkMode ? "bg-sky-600" : "bg-sky-500"
                } rounded-lg border ${
                  isDarkMode ? "border-sky-600" : "border-sky-500"
                } border-solid min-h-14 max-md:px-5`}
              >
                Apply TC
              </button>
              <button
                className={`gap-2.5 self-stretch px-2.5 ${
                  isDarkMode ? "text-sky-600" : "text-sky-500"
                } whitespace-nowrap rounded-lg border-2 ${
                  isDarkMode ? "border-sky-600" : "border-sky-500"
                } border-solid min-h-14`}
              >
                Download
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TransferStudent;
