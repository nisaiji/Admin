import React, { useEffect, useRef, useState } from "react";
import school from "../../assets/images/darkmode/school.png";
import editPhotow from "../../assets/images/darkmode/editPhotow.png";
import editPhoto from "../../assets/images/darkmode/editPhoto.png";
import edit from "../../assets/images/darkmode/editimg.png";
import { useDispatch, useSelector } from "react-redux";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import toast from "react-hot-toast";
import { setClassAndSectionData, updateAdminData } from "../../store/AppAuthSlice";
import { Chip, FormControl, MenuItem, Select, Typography } from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import { getSessionPhase } from "../../utils/helper";

export default function SectionData({
  isDarkMode,
  role,
  teacherData,
  classAndSectionData,
  data,
  date,
}) {
  const dispatch = useDispatch();
  const schoolName = useSelector((state) => state.appAuth.schoolName);
  const fileInputRef = useRef(null);
  const [session, setSession] = useState([]);

  // modify photo size to less than 1mb
  const resizeImage = (
    file,
    maxSizeMB = 1,
    maxWidth = 1000,
    maxHeight = 1000,
  ) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        image.src = e.target.result;
      };

      image.onload = () => {
        const canvas = document.createElement("canvas");
        let width = image.width;
        let height = image.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height *= maxWidth / width;
            width = maxWidth;
          } else {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const reader2 = new FileReader();
            reader2.readAsDataURL(blob);
            reader2.onloadend = () => resolve(reader2.result);
          },
          "image/jpeg",
          0.8, // adjust quality (0.0 - 1.0)
        );
      };

      reader.onerror = reject;
      image.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // upload photo of school by admin
  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let base64Image;

      if (file.size > 1024 * 1024) {
        // Resize if greater than 1MB
        base64Image = await resizeImage(file);
      } else {
        // Convert to Base64
        const toBase64 = (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
          });

        base64Image = await toBase64(file);
      }

      // Upload the image
      const res = await axiosClient.put(EndPoints.ADMIN.PHOTO_UPLOAD, {
        photo: base64Image,
        method: "POST",
      });

      if (res?.statusCode === 200) {
        dispatch(updateAdminData({ photo: base64Image }));
        toast.success(res?.result);
      }
    } catch (error) {
      // console.error("Photo upload failed", error);
      toast.error("Photo upload failed.");
    }
  };

  // Helper to get next session years
  const getNextSessionYears = () => {
    const today = moment();

    // Academic year starts in April
    const isAfterMarch = today.month() >= 3; // month() is 0-based → April = 3

    const currentAcademicStart = isAfterMarch ? today.year() : today.year() - 1;

    const currentAcademicEnd = currentAcademicStart + 1;

    const nextAcademicStart = currentAcademicStart + 1;
    const nextAcademicEnd = currentAcademicEnd + 1;

    // Check if next session already exists
    const nextSessionExists = session?.some(
      (s) =>
        s?.academicStartYear === nextAcademicStart &&
        s?.academicEndYear === nextAcademicEnd,
    );

    if (!nextSessionExists) {
      return {
        start: nextAcademicStart,
        end: nextAcademicEnd,
        startDate: moment(`${nextAcademicStart}-04-01`).toDate(),
        endDate: moment(`${nextAcademicEnd}-03-31`).toDate(),
      };
    }

    return null;
  };

  // Check if next session exists
  const nextSession = getNextSessionYears();

  /**
   * Fetches calendar events based on the selected month.
   */
  const getSession = async () => {
    try {
      if (role === "admin") {
        const res = await axiosClient.get(EndPoints.ADMIN.GET_SESSION);
        if (res?.statusCode === 200) {
          // console.log(res);

          const activeSession = res?.result?.find((s) => s?.isCurrent === true);
          if (!classAndSectionData?.selectedSession?._id) {
            dispatch(
              setClassAndSectionData({
                selectedSession: activeSession,
                session: res?.result,
              }),
            );
          }
          setSession(
            res?.result.sort(
              (a, b) => a?.academicStartYear - b?.academicStartYear,
            ),
          );
        }
      }
    } catch (e) {
      // console.log(e);
    }
  };

  // Handler to create new session
  const handleCreateSession = async () => {
    try {
      // setLoading(true);
      // console.log(nextSession);
      const res = await axiosClient.post(EndPoints.ADMIN.CREATE_SESSION, {
        academicStartYear: nextSession.start,
        academicEndYear: nextSession.end,
      });
      // console.log(res);

      if (res?.statusCode === 200) {
        toast.success(res?.result);
        getSession();
      }
    } catch (e) {
      // toast.error("Error creating session.");
    } finally {
      // setLoading(false);
    }
  };

  const handleMarkSessionComplete = async () => {
    try {
      if (!classAndSectionData?.selectedSession?._id) {
        toast.error("No session selected.");
        return;
      }
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.MARK_SESSION_COMPLETE}/${classAndSectionData?.selectedSession?._id}`,
      );
      if (res?.statusCode === 200) {
        toast.success(res?.result);
        getSession(); // Refresh session list
      }
    } catch (e) {
      toast.error(e);
    }
  };

  // Function to render the clock with current time
  const Clock = () => {
    const [currentTime, setCurrentTime] = useState(
      moment().format("hh:mm:ss A"),
    );

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(moment().format("hh:mm:ss A"));
      }, 1000); // Update every second

      return () => clearInterval(timer); // Cleanup on unmount
    }, []);

    return (
      <div
        className={`flex items-center justify-between  rounded-full px-6 py-2 shadow-md w-fit ${
          isDarkMode ? "bg-[#68686826] text-textPrimary" : "bg-whiteBackground"
        }`}
      >
        {/* Date Section */}
        <div
          className={`flex flex-col items-start pr-6 border-r border-gray-500`}
        >
          <span className={`text-xs text-gray-400`}>Date</span>
          <span className={`text-lg font-medium`}>
            {moment().format("DD-MM-YYYY")}
          </span>
        </div>

        {/* Time Section */}
        <div className={`flex flex-col items-start px-6`}>
          <span className={`text-xs text-gray-400`}>Time</span>
          <span className={`text-lg font-medium`}>{currentTime}</span>
        </div>

        {/* Edit Icon */}
        <img src={edit} alt="Edit" className={`w-10 h-10 ml-4`} />
      </div>
    );
  };

  useEffect(() => {
    getSession();
  }, [date, classAndSectionData?.selectedSession?._id]);

  return (
    <div
      className={`${
        isDarkMode
          ? "bg-gradient-to-r from-fromColor1 to-toColor1"
          : "bg-whiteBackground"
      } flex items-center w-full p-4 shadow-lg`}
    >
      {role === "classTeacher" || role === "teacher" ? (
        <img
          src={teacherData?.photo || school}
          alt="School Logo"
          className="w-[300px] h-[200px] rounded-lg object-cover"
        />
      ) : role === "admin" ? (
        <div className="relative inline-block">
          <img
            src={data?.photo || school}
            alt="School Logo"
            className="w-[300px] h-[200px] rounded-xl  object-cover border-2 border-borderLine"
          />
          <img
            src={isDarkMode ? editPhotow : editPhoto}
            alt="Edit"
            className={`absolute size-10 bottom-0 right-0 cursor-pointer`}
            onClick={() => fileInputRef?.current?.click()}
          />
        </div>
      ) : (
        ""
      )}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={uploadPhoto}
      />
      <div className={`flex flex-col justify-center flex-grow px-4`}>
        <h1
          className={`text-3xl font-bold ${
            isDarkMode ? "text-textPrimary" : "text-textBlack"
          }`}
        >
          {localStorage.getItem("schoolName") || schoolName}
        </h1>
        <span className={`text-textGray`}>Welcome to School Dashboard!</span>
      </div>

      <div className={`flex flex-col items-end space-y-4`}>
        {role === "admin" && (
          <div className="flex items-center gap-4">
            {/* Add create session option if next session does not exist */}
            {nextSession && (
              <button
                className="font-bold text-white bg-[#4CBC9A] rounded-lg px-4 py-2 cursor-pointer mr-3  focus:outline-none"
                onClick={handleCreateSession}
              >
                Create Session {nextSession?.start}-
                {String(nextSession?.end).slice(-2)}
              </button>
            )}
            {classAndSectionData?.selectedSession?._id && (
              <button
                className="font-bold text-white bg-[#0F4189] rounded-lg px-4 py-2 cursor-pointer mr-3 focus:outline-none"
                onClick={handleMarkSessionComplete}
              >
                Toggle Session{" "}
                {classAndSectionData?.selectedSession?.academicStartYear}-
                {String(
                  classAndSectionData?.selectedSession?.academicEndYear,
                ).slice(-2)}
              </button>
            )}
            {/* session dropdown */}
            <FormControl sx={{ bgcolor: "#1e1e1e", borderRadius: 3 }}>
              <Select
                value={
                  session?.some(
                    (s) => s?._id === classAndSectionData?.selectedSession?._id,
                  )
                    ? classAndSectionData?.selectedSession?._id
                    : ""
                }
                onChange={(e) => {
                  const selected = session?.find(
                    (s) => s?._id === e?.target?.value,
                  );
                  localStorage.removeItem("classAndSectionData");
                  localStorage.removeItem("tempData");
                  dispatch(
                    setClassAndSectionData({
                      selectedSession: selected,
                    }),
                  );
                }}
                displayEmpty
                sx={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "bold",
                  borderRadius: 14,
                  ".MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  ".MuiSelect-icon": {
                    color: isDarkMode ? "#fff" : "#000",
                  },
                  bgcolor: "#1e1e1e",
                }}
                renderValue={(selectedValue) => {
                  const s = session?.find(
                    (item) => item?._id === selectedValue,
                  );
                  if (!s) return <Typography>Select Session</Typography>;

                  const phase = getSessionPhase(s, moment);
                  const chipLabel =
                    phase === "current"
                      ? "Current"
                      : phase === "upcoming"
                        ? "Upcoming"
                        : "Previous";

                  return (
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      gap={1}
                      width="100%"
                    >
                      <Typography fontWeight="bold">
                        {s?.academicStartYear}-
                        {String(s?.academicEndYear).slice(-2)}
                      </Typography>
                      {s?._id && (
                        <Chip
                          label={chipLabel}
                          size="small"
                          sx={{
                            bgcolor:
                              phase === "current"
                                ? "#4CBC9A26"
                                : phase === "upcoming"
                                  ? "#3A86FF26"
                                  : "#9CA3AF26",
                            color:
                              phase === "current"
                                ? "#4CBC9A"
                                : phase === "upcoming"
                                  ? "#3A86FF"
                                  : "#9CA3AF",
                            fontWeight: "bold",
                            fontSize: 14,
                            p: 2,
                          }}
                        />
                      )}
                    </Box>
                  );
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "#1e1e1e",
                      color: "#fff",
                      borderRadius: 3,
                      mt: 1,
                    },
                  },
                }}
              >
                {session?.map((data) => (
                  <MenuItem
                    key={data?._id}
                    value={data?._id} // ✅ only pass id
                    sx={{
                      fontWeight: "bold",
                      "&:hover": {
                        bgcolor: "#333",
                      },
                    }}
                  >
                    {data?.academicStartYear}-
                    {String(data?.academicEndYear).slice(-2)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}
        <Clock />
      </div>
    </div>
  );
}
