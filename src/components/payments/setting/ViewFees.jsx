import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { axiosClient } from "../../../services/axiosClient";
import EndPoints from "../../../services/EndPoints";
import moment from "moment/moment";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  Eye,
  Trash2,
  X,
  Calendar,
  DollarSign,
  GraduationCap,
  Clock,
  Settings,
} from "lucide-react";
import { capitalize } from "@mui/material";

export function FeeStructureView({ onBack, setSelected }) {
  const { classAndSectionData } = useSelector((state) => state.appAuth);

  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedStructure, setSelectedStructure] = useState(null);

  const getSchoolFeeStructure = async () => {
    try {
      const res = await axiosClient.get(
        `${EndPoints.ADMIN.GET_FEES}?sessionId=${classAndSectionData?.selectedSession?._id}`,
      );
      console.log(res);
      if (res?.statusCode === 200) {
        setData(res?.result);
      }
    } catch (e) {
      //       console.log(e);
    }
  };

  useEffect(() => {
    if (classAndSectionData?.selectedSession?._id) {
      getSchoolFeeStructure();
    }
  }, [classAndSectionData]);

  const structures = useMemo(() => {
    return data.map((item) => ({
      id: item?._id,
      className: item?.class?.name || "-",
      sections: item?.section ? [item?.section?.name] : [],
      totalAmount: item?.totalAmount,
      status: item?.isActive ? "Active" : "Inactive",
      frequency: item?.schoolFeeStructure?.installmentType,
      startDate: moment(item?.schoolFeeStructure?.effectiveFrom).format(
        "DD MMM YYYY",
      ),
      lateFee: item?.schoolFeeStructure?.lateFeePercent,
      createdAt: moment(item?.createdAt).format("DD MMM YYYY"),
      periodBreakdown: item?.feeInstallments.map((f, i) => ({
        title: `Installment ${i + 1}`,
        amount: f?.amount,
        startDate: moment(f?.startDate).format("DD MMM YYYY"),
        dueDate: moment(f?.dueDate).format("DD MMM YYYY"),
      })),
    }));
  }, [data]);

  const filteredStructures = structures.filter((s) => {
    const matchesSearch = s.className
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesClass = filterClass === "all" || s.className === filterClass;

    const matchesStatus = filterStatus === "all" || s.status === filterStatus;

    return matchesSearch && matchesClass && matchesStatus;
  });

  const getStatusColor = (status) => {
    if (status === "Active")
      return "bg-green-500/10 text-green-400 border-green-500/20";
    return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  const classes = useMemo(() => {
    const uniqueClasses = new Set();

    structures?.forEach((item) => {
      if (item?.className && item?.className !== "-") {
        uniqueClasses.add(item?.className);
      }
    });

    return ["all", ...Array.from(uniqueClasses)];
  }, [structures]);

  // const classes = [
  //   "all",
  //   "Nursery",
  //   "LKG",
  //   "UKG",
  //   "Class 1",
  //   "Class 2",
  //   "Class 3",
  //   "Class 4",
  //   "Class 5",
  //   "Class 6",
  //   "Class 7",
  //   "Class 8",
  //   "Class 9",
  //   "Class 10",
  //   "Class 11",
  //   "Class 12",
  // ];

  const statuses = ["all", "Active", "Inactive", "Draft"];

  const currentStructures = filteredStructures.slice((1 - 1) * 10, 1 * 10);

  return (
    <div className="w-full mx-auto max-w-5xl my-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white text-2xl">Fee Structures</h1>
            <p className="text-gray-400 text-sm mt-1">
              View and manage all class-based fee structures
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelected("schoolFeeSetting")}
            className="p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
            title="School Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSelected("paymentSetup")}
            disabled={!classAndSectionData?.feeStructureData?.installmentType}
            className="flex items-center gap-2 px-6 py-3 bg-[#0A81D1] text-white rounded-lg hover:bg-[#0A81D1]/90 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create New Fee Structure
          </button>
        </div>
      </div>

      {/* Combined Card with Filters, Search and Table */}
      {filteredStructures.length === 0 ? (
        <div className="bg-[#1a1d24] border border-gray-800 rounded-xl p-12 text-center">
          <div className="text-gray-500 mb-2"> No fee structures found</div>
          <p className="text-gray-600 text-sm mb-6">
            Get started by creating your first fee structure
          </p>
        </div>
      ) : (
        <div className="bg-[#1a1d24] border border-gray-800 rounded-xl overflow-hidden">
          {/* Filters and Search inside card */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by class..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0A81D1] transition-colors"
                />
              </div>

              {/* Class Filter */}
              <div className="relative min-w-[200px]">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={filterClass}
                  onChange={(e) => {
                    setFilterClass(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-[#0A81D1] transition-colors"
                >
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls === "all" ? "All Classes" : cls}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative min-w-[180px]">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    handleFilterChange();
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white appearance-none cursor-pointer focus:outline-none focus:border-[#0A81D1] transition-colors"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status === "all" ? "All Status" : status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Fee Structures Table or Empty State */}
          {filteredStructures.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-500 mb-2">No fee structures found</div>
              <p className="text-gray-600 text-sm">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 text-sm px-6 py-4">
                      Class
                    </th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4">
                      Sections
                    </th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4">
                      Total Amount
                    </th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4">
                      Status
                    </th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentStructures.map((structure, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-800 hover:bg-[#0a0a0a]/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-white">
                          {structure?.className ?? ""}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {structure?.sections?.map((section) => (
                            <span
                              key={section}
                              className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded"
                            >
                              {section}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white">
                          {structure?.totalAmount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs border ${getStatusColor(
                            structure.status,
                          )}`}
                        >
                          {structure?.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedStructure(structure)}
                            className="p-2 text-gray-400 hover:text-[#0A81D1] hover:bg-[#0A81D1]/10 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Detail View Modal */}
      {selectedStructure && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d24] border border-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#1a1d24] border-b border-gray-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white text-xl">Fee Structure Details</h2>
              <button
                onClick={() => setSelectedStructure(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Class</p>
                      <p className="text-white">
                        {selectedStructure?.className}{" "}
                        {selectedStructure?.sections}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Total Amount</p>
                      <p className="text-white">
                        {selectedStructure?.totalAmount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Frequency</p>
                      <p className="text-white">
                        {capitalize(selectedStructure?.frequency)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Start Date</p>
                      <p className="text-white">
                        {selectedStructure?.startDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sections & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4">
                  <h3 className="text-white mb-3">Sections</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedStructure?.sections?.map((section) => (
                      <span
                        key={section}
                        className="px-3 py-1.5 bg-[#0A81D1]/10 text-[#0A81D1] border border-[#0A81D1]/20 rounded-lg"
                      >
                        Section {section}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4">
                  <h3 className="text-white mb-3">Status & Fees</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Status</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs border ${getStatusColor(
                          selectedStructure?.status,
                        )}`}
                      >
                        {selectedStructure?.status}
                      </span>
                    </div>
                    {selectedStructure?.lateFee && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Late Fee Interest</span>
                        <span className="text-white">
                          {selectedStructure?.lateFee}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Period Breakdown */}
              <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4">
                <h3 className="text-white mb-4">Payment Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedStructure?.periodBreakdown?.map((period, index) => (
                    <div
                      key={index}
                      className="bg-[#1a1d24] border border-gray-700 rounded-lg p-4 hover:border-[#0A81D1]/30 transition-colors"
                    >
                      <p className="text-gray-400 text-sm mb-1">
                        {period?.title}
                      </p>
                      <p className="text-white text-lg">{period?.amount}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-4">
                <h3 className="text-white mb-3">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Created Date</p>
                    <p className="text-white">{selectedStructure?.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Academic Year Start</p>
                    <p className="text-white">{selectedStructure?.startDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            {/* <div className="sticky bottom-0 bg-[#1a1d24] border-t border-gray-800 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedStructure(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Close
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0A81D1] text-white rounded-lg hover:bg-[#0A81D1]/90 transition-all">
              <Edit2 className="w-4 h-4" />
                Edit Structure
            </button>
</div> */}
          </div>
        </div>
      )}
    </div>
  );
}
