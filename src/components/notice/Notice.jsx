import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import Breadcrumbs from "../BreadCrumbs";
import { useTranslation } from "react-i18next";
import profile from "../../assets/images/profileEmpty.png";
import userIcon from "../../assets/images/darkmode/userIcon.png";
import adminIcon from "../../assets/images/darkmode/admin.png";
import teacher from "../../assets/images/darkmode/teacher.png";
import check from "../../assets/images/darkmode/check.png";
import menu from "../../assets/images/darkmode/menu.png";
import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import Spinner from "../Spinner";
import moment from "moment";
import {
  FormControl,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
} from "@mui/material";
import { Stack } from "@mui/system";

export default function Notice() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const { data } = useSelector((state) => state.appAuth);
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const [pageNo, setPageNo] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRequestCount, setTotalRequestCount] = useState(1);
  const [filterRole, setFilterRole] = useState("all");
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [updatedDescription, setUpdatedDescription] = useState("");
  const [toastDisplayed, setToastDisplayed] = useState(false);
  const [open, setOpen] = useState(false);
  const options = [
    {
      label: "By All",
      value: "all",
      icon: adminIcon,
    },
    {
      label: "By You",
      value: "admin",
      icon: userIcon,
    },
    {
      label: "By Teacher",
      value: "teacher",
      icon: teacher,
    },
  ];

  let selected = options.find((opt) => opt.value === filterRole);

  const [formData, setFormData] = useState({
    description: "",
    toTeacher: false,
    toParent: false,
  });

  const fetchNotice = async () => {
    try {
      setLoading(true);

      const resAdmin = await axiosClient.get(
        `${EndPoints.ADMIN.GET_NOTICE}?page=${pageNo}&limit=${limit}&createdBy=${filterRole}`
      );

      if (resAdmin?.statusCode === 200) {
        const adminNotices = resAdmin?.result?.announcements || [];
        setRequests(adminNotices);
        setTotalRequestCount(resAdmin?.result?.total || 0);
      }
    } catch (e) {
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotice();
  }, [pageNo, limit, filterRole]);

  const validateData = () => {
    if (!formData.description.trim()) {
      return t("validationError.description");
    } else if (!formData.toTeacher && !formData.toParent) {
      return t("validationError.selectTeacherOrParent");
    } else {
      return "";
    }
  };

  const handleSave = async () => {
    try {
      if (toastDisplayed) return;
      setToastDisplayed(true);
      setTimeout(() => setToastDisplayed(false), 3000);
      // Validate form
      const e = validateData();
      if (e) return toast.error(e);

      let targetAudience = [];
      if (formData.toTeacher) targetAudience.push("teacher");
      if (formData.toParent) targetAudience.push("parent");

      // Send POST request
      const res = await axiosClient.post(EndPoints.ADMIN.ADD_NOTICE, {
        description: formData.description,
        targetAudience,
      });

      if (res?.statusCode === 201) {
        toast.success(res?.result);
        setFormData({
          description: "",
          teacher: false,
          parent: false,
        });
        fetchNotice();
      }
    } catch (e) {
      toast.error(e);
    }
  };

  const handleUpdate = (notice) => {
    setEditingNoticeId(notice._id);
    setUpdatedDescription(notice.description);
    setMenuOpenIndex(null);
  };

  const handleConfirmUpdate = async (notice) => {
    try {
      const res = await axiosClient.put(
        `${EndPoints.ADMIN.UPDATE_NOTICE}/${notice?._id}`,
        {
          description: updatedDescription,
          targetAudience: notice.targetAudience,
        }
      );
      // console.log(res);

      if (res?.statusCode === 200) {
        toast.success("Notice updated");
        setEditingNoticeId(null);
        fetchNotice();
      }
    } catch (e) {
      toast.error(e);
    }
  };

  const handleCancelUpdate = () => {
    setEditingNoticeId(null);
    setUpdatedDescription("");
  };

  const handleDelete = async (id) => {
    try {
      const res = await axiosClient.delete(
        `${EndPoints.ADMIN.DELETE_NOTICE}/${id}`
      );
      if (res?.statusCode === 200) {
        toast.success("Notice deleted");
        fetchNotice();
      }
    } catch (e) {
      toast.error("Failed to delete notice");
    }
  };

  return (
    <>
      {/* loader */}
      {loading && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-[#93a3b6] bg-opacity-50 z-30`}
        >
          <Spinner />
        </div>
      )}
      <Toaster position="top-center" reverseOrder={false} />
      <div
        className={`${
          isDarkMode ? "bg-background2" : "bg-whiteBackground2"
        } px-6 py-[25px] select-none`}
      >
        <div
          className={`${
            isDarkMode
              ? "bg-gradient-to-r from-fromColor1 to-toColor1"
              : "bg-whiteBackground"
          } min-h-[calc(100vh-110px)] rounded-[16px]`}
        >
          <div className={`px-10 py-6`}>
            <Breadcrumbs />
            <div
              className={`text-2xl ${
                isDarkMode ? "text-textPrimary" : "text-textBlack"
              } font-poppins-bold`}
            >
              {t("titles.noticeBoard")}
            </div>
            {/* input form */}
            <div className="flex space-x-4 p-4">
              <img
                src={data?.photo || profile}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />

              <div className="flex-1">
                <textarea
                  type="text"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }));
                    e.target.style.height = "auto";
                    const newHeight = Math.min(e.target.scrollHeight, 200);
                    e.target.style.height = `${newHeight}px`;
                  }}
                  rows={1}
                  placeholder={t(`placeholders.WriteNotice`)}
                  className={`w-full p-3 max-h-[200px] rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                    isDarkMode
                      ? "bg-[#68686826] text-textPrimary"
                      : "text-textBlack border border-borderWhite2"
                  }`}
                />

                <div className="flex justify-between items-center mt-3">
                  <div className="flex gap-3">
                    <button
                      className={`px-4 py-2 text-sm rounded-md border transition ${
                        formData.toTeacher
                          ? "text-textBlue border-borderBlue"
                          : isDarkMode
                          ? "text-textPrimary border-borderWhite"
                          : ""
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          toTeacher: !prev.toTeacher,
                        }))
                      }
                    >
                      To Teacher
                    </button>
                    <button
                      className={`px-4 py-2 text-sm rounded-md border transition ${
                        formData.toParent
                          ? "text-textBlue border-borderBlue"
                          : isDarkMode
                          ? "text-textPrimary border-borderWhite"
                          : ""
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          toParent: !prev.toParent,
                        }))
                      }
                    >
                      To Parent
                    </button>
                  </div>
                  <button
                    onClick={() => handleSave()}
                    className={`px-5 py-2 text-sm rounded-md transition ${
                      isDarkMode
                        ? " bg-[#68686880] text-textPrimary"
                        : "text-textBlack border border-borderWhite2"
                    }`}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>

            <hr className="border border-[#6E6F8173]" />
            {/* filter */}
            <div className="relative w-[150px] my-3 select-none">
              <div
                className="flex space-x-2 bg-[#0A81D11A] py-1 justify-center items-center rounded-xl cursor-pointer"
                onClick={() => setOpen((prev) => !prev)}
              >
                <img
                  src={selected.icon}
                  alt=""
                  className="size-6 object-contain"
                />
                <p className="text-textBlue">{selected.label}</p>
              </div>

              {open && (
                <div className="absolute z-10 w-full mt-1 rounded-xl shadow-md bg-[#2D3133]">
                  {options.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center px-3 py-2 cursor-pointer rounded-xl"
                      onClick={() => {
                        setFilterRole(option.value);
                        setOpen(false);
                      }}
                    >
                      <img
                        src={option.icon}
                        alt=""
                        className="size-6 object-contain mr-2"
                      />
                      <span className="text-textBlue text-sm">
                        {option.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* notices */}
            {requests.map((req, index) => (
              <div
                key={req._id}
                className="relative flex space-x-4 p-4 border-b border-[#6E6F8173]"
              >
                <img
                  src={
                    req?.createdByRole === "admin"
                      ? data?.photo || profile
                      : req?.createdByRole === "teacher"
                      ? `data:image/jpeg;base64,${req?.createdByDetails?.photo}` ||
                        profile
                      : profile
                  }
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold text-textPrimary">
                    <span
                      className={`mr-2
                       ${isDarkMode ? "text-textPrimary" : "text-textBlack"}`}
                    >
                      {data?.schoolName}
                    </span>
                    <span className="text-[#939292]">
                      {req?.createdByRole === "admin"
                        ? "School Admin "
                        : `${req?.createdByDetails?.firstname} ${req?.createdByDetails?.lastname} `}
                      {moment(req?.updatedAt).format("DD MMM YYYY hh:mm A ")}
                      {req?.targetAudience?.map((audience, index) => {
                        const capitalized =
                          audience.charAt(0).toUpperCase() + audience.slice(1);
                        return (
                          <span
                            key={index}
                            className="inline-flex items-center mr-1"
                          >
                            {capitalized}
                            <img
                              src={check}
                              alt="tick"
                              className="w-4 h-4 ml-1"
                            />
                            {index < req.targetAudience.length - 1 && ""}
                          </span>
                        );
                      })}
                    </span>
                  </p>
                  {editingNoticeId === req._id ? (
                    <div className="mt-2">
                      <textarea
                        value={updatedDescription}
                        onChange={(e) => {
                          setUpdatedDescription(e.target.value);
                          e.target.style.height = "auto";
                          const newHeight = Math.min(
                            e.target.scrollHeight,
                            200
                          );
                          e.target.style.height = `${newHeight}px`;
                        }}
                        className="w-full p-2 border rounded-md text-sm bg-transparent text-textPrimary resize-none max-h-[200px]"
                        rows={1}
                      />

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleConfirmUpdate(req)}
                          className="px-4 py-1 border border-borderWhite text-textPrimary rounded-md text-sm"
                        >
                          Update
                        </button>
                        <button
                          onClick={handleCancelUpdate}
                          className="px-4 py-1 bg-whiteBackground text-textBlack rounded-md text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p
                      className={`mt-2 text-sm ${
                        isDarkMode ? "text-textPrimary" : "text-textBlack"
                      }`}
                    >
                      {req?.description}
                    </p>
                  )}
                </div>

                {/* Show menu only if createdByRole === "admin" */}
                {req.createdByRole === "admin" && (
                  <div className="relative">
                    <img
                      src={menu}
                      alt="Menu"
                      className="w-6 h-6 cursor-pointer"
                      onClick={() =>
                        setMenuOpenIndex(menuOpenIndex === index ? null : index)
                      }
                    />

                    {menuOpenIndex === index && (
                      <div className="absolute right-0 w-32 bg-[#2D3133] rounded-md shadow-lg z-10">
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-textPrimary"
                          onClick={() => handleUpdate(req)}
                        >
                          Update
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-textRed"
                          onClick={() => handleDelete(req._id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {/* pagination logic */}
            <div
              className={`flex gap-5 justify-between items-center my-9 mx-10 text-sm max-md:flex-wrap max-md:mr-2.5 max-md:max-w-full`}
            >
              <div className={`text-[#9391a5] text-base leading-5`}>
                {t("titles.showing")}
                <span className={`text-textBlue`}>
                  {" "}
                  {pageNo * limit - (limit - 1)} -{" "}
                  {Math.min(totalRequestCount, pageNo * limit)}{" "}
                </span>
                {t("titles.from")}
                <span className={`text-textBlue`}> {totalRequestCount} </span>
                {t("titles.data")}
              </div>

              <div className={`flex items-center gap-4`}>
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    minWidth: "80px",
                    backgroundColor: isDarkMode ? "" : "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "& .MuiInputBase-root, & .MuiSvgIcon-root": {
                      color: isDarkMode ? "#E3E8F3" : "black",
                    },
                  }}
                >
                  <Select
                    value={limit}
                    onChange={(e) => {
                      setLimit(e.target.value);
                      setPageNo(1);
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                          color: isDarkMode ? "#E3E8F3" : "black",
                        },
                      },
                    }}
                  >
                    {[10, 20, 25, 50, 100].map((itm, i) => (
                      <MenuItem
                        key={i}
                        value={itm}
                        sx={{
                          backgroundColor: isDarkMode ? "#1a1a1a" : "white",
                          color: isDarkMode ? "#E3E8F3" : "black",
                          "&:hover": {
                            backgroundColor: isDarkMode ? "#2a2a2a" : "#E9EEF2",
                          },
                        }}
                      >
                        {itm}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Stack spacing={2}>
                  <Pagination
                    count={Math.ceil(totalRequestCount / limit)}
                    shape="rounded"
                    page={pageNo}
                    onChange={(e) => setPageNo(e.target.value)}
                    renderItem={(item) => (
                      <PaginationItem
                        {...item}
                        sx={{
                          color: isDarkMode ? "white" : "black",
                          borderColor:
                            item.type === "previous" || item.type === "next"
                              ? "transparent"
                              : "#0F4189",
                          borderWidth: "2px",
                          borderRadius: "20px",
                          borderStyle: "solid",
                          "&.Mui-selected": {
                            color: "white",
                            backgroundColor: "#0F4189",
                          },
                        }}
                      />
                    )}
                  />
                </Stack>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
