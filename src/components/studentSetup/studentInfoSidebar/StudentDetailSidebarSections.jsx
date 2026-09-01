import React from "react";
import {
  BookOpen,
  Briefcase,
  Calendar,
  Droplets,
  Heart,
  Info,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  Users,
} from "lucide-react";
import {
  buildExamMeta,
  buildLeaveRequestMeta,
  buildSubjectMeta,
  formatBooleanLabel,
  formatDateValue,
  formatPercentageValue,
  formatStatusLabel,
  getAttendancePercentage,
  getSessionLabel,
  getStatusTone,
  getStudentClassName,
  getStudentParentAddress,
  getStudentParentDob,
  getStudentParentEmail,
  getStudentParentGender,
  getStudentParentOccupation,
  getStudentParentPhone,
  getStudentParentQualification,
  getStudentSectionName,
} from "./utils";
import {
  DetailRow,
  EmptyStateLabel,
  SectionTitle,
  StatusChip,
  SubsectionTitle,
  SummaryListCard,
  SummaryStatGrid,
} from "./StudentDetailSidebarParts";

export function PersonalTabContent({ student, fullName, isDarkMode }) {
  return (
    <>
      <SectionTitle
        Icon={User}
        title="Student Overview"
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={User}
        label="Full Name"
        value={fullName}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Shield}
        label="Student ID"
        value={student?.studentId}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Shield}
        label="Aadhaar Number"
        value={student?.aadharNumber}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Calendar}
        label="Date of Birth"
        value={formatDateValue(student?.dob)}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Droplets}
        label="Blood Group"
        value={student?.bloodGroup}
        isDarkMode={isDarkMode}
        accentClass="text-[#FE4040]"
      />
      <DetailRow
        Icon={Shield}
        label="Gender"
        value={student?.gender}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={MapPin}
        label="Address"
        value={student?.address}
        isDarkMode={isDarkMode}
      />
    </>
  );
}

export function GuardianTabContent({ student, isDarkMode }) {
  return (
    <>
      <SectionTitle
        Icon={Users}
        title="Family Contacts"
        isDarkMode={isDarkMode}
      />
      <SubsectionTitle title="Primary Parent" isDarkMode={isDarkMode} />
      <DetailRow
        Icon={User}
        label="Name"
        value={student?.mainParentFullName}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Phone}
        label="Phone"
        value={student?.parentPhone}
        isDarkMode={isDarkMode}
        accentClass="text-[#0A81D1]"
      />
      <DetailRow
        Icon={Mail}
        label="Email"
        value={student?.mainParentEmail}
        isDarkMode={isDarkMode}
        accentClass="text-[#0A81D1]"
      />
      <DetailRow
        Icon={Heart}
        label="Gender"
        value={student?.mainParentGender}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Calendar}
        label="Date of Birth"
        value={formatDateValue(student?.mainParentDob)}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Briefcase}
        label="Occupation"
        value={student?.mainParentOccupation}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={BookOpen}
        label="Qualification"
        value={student?.mainParentQualification}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={MapPin}
        label="Address"
        value={student?.mainParentAddress}
        isDarkMode={isDarkMode}
      />

      <SubsectionTitle title="Secondary Contacts" isDarkMode={isDarkMode} />
      <DetailRow
        Icon={User}
        label="Guardian Name"
        value={student?.guardianName}
        isDarkMode={isDarkMode}
      />
    </>
  );
}

export function AcademicTabContent({ student, isDarkMode }) {
  return (
    <>
      <SectionTitle
        Icon={BookOpen}
        title="Academic Identity"
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={BookOpen}
        label="Class and Section"
        value={`${student?.className} ${student?.sectionName}`}
        isDarkMode={isDarkMode}
        accentClass="text-[#0A81D1]"
      />
      <DetailRow
        Icon={Calendar}
        label="Session"
        value={getSessionLabel(student)}
        isDarkMode={isDarkMode}
      />

      <SectionTitle
        Icon={Calendar}
        title="Attendance Summary"
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Calendar}
        label="Attendance Percentage"
        value={formatPercentageValue(getAttendancePercentage(student))}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Calendar}
        label="Present Count"
        value={student?.attendanceSummary?.presentCount}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Calendar}
        label="Absent Count"
        value={student?.attendanceSummary?.absentCount}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Calendar}
        label="Total Marked Days"
        value={student?.attendanceSummary?.totalMarkedDays}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Info}
        label="Latest Attendance Status"
        value={formatStatusLabel(
          student?.attendanceSummary?.latestAttendanceStatus,
        )}
        isDarkMode={isDarkMode}
      />

      <SectionTitle
        Icon={BookOpen}
        title="Subject Summary"
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Info}
        label="Total Subjects"
        value={student?.subjectSummary?.totalSubjects}
        isDarkMode={isDarkMode}
      />
      {student?.subjectSummary?.subjects?.length > 0 ? (
        <div className="mt-3 space-y-3">
          {student?.subjectSummary?.subjects?.map((subject, i) => (
            <DetailRow
              key={i}
              Icon={Info}
              label={subject?.subjectName}
              value={
                subject?.teacherName
                  ? `SubjectTeacher: ${subject.teacherName}`
                  : "No teacher assigned"
              }
              value2={
                subject?.subjectCode
                  ? `Subject Code: ${subject.subjectCode}`
                  : undefined
              }
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      ) : (
        <EmptyStateLabel label="No subjects assigned" isDarkMode={isDarkMode} />
      )}
    </>
  );
}

export function ActivityTabContent({ student, isDarkMode }) {
  const leaveSummary = student?.leaveSummary ?? {};
  const examSummary = student?.examSummary ?? {};
  const examStats = examSummary?.stats ?? {};
  const latestRequests = Array.isArray(leaveSummary?.latestRequests)
    ? leaveSummary.latestRequests
    : [];
  const latestExams = Array.isArray(examSummary?.latestExams)
    ? examSummary.latestExams
    : [];

  return (
    <>
      <SectionTitle Icon={Info} title="Leave Summary" isDarkMode={isDarkMode} />
      <DetailRow
        Icon={Info}
        label="Total Leave"
        value={leaveSummary?.totalLeave}
        isDarkMode={isDarkMode}
      />

      <SectionTitle Icon={Info} title="Exam Summary" isDarkMode={isDarkMode} />
      <DetailRow
        Icon={Info}
        label="Total Exams"
        value={examStats?.totalExams}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Info}
        label="Scheduled"
        value={examStats?.scheduledCount}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Info}
        label="Ongoing"
        value={examStats?.ongoingCount}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Info}
        label="Completed"
        value={examStats?.completedCount}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Info}
        label="Published Results"
        value={examStats?.publishedResultCount}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Info}
        label="Passed Exams"
        value={examStats?.passedExamCount}
        isDarkMode={isDarkMode}
      />
      <DetailRow
        Icon={Info}
        label="Failed Exams"
        value={examStats?.failedExamCount}
        isDarkMode={isDarkMode}
      />

      <SubsectionTitle title="Latest Exams" isDarkMode={isDarkMode} />
      {latestExams?.length > 0 ? (
        <div className="mt-3 space-y-3">
          {latestExams?.map((exam) => (
            <SummaryListCard
              key={exam?.examId ?? exam?.examName}
              title={exam?.examName}
              meta={[
                `Status: ${exam?.examStatus}`,
                `Total Subjects: ${exam?.subjectCount}`,
              ]}
              badge={
                exam?.resultPublished ? "Result Published" : "Result Pending"
              }
              badgeTone={getStatusTone(exam?.overallStatus)}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      ) : (
        <EmptyStateLabel
          label="No recent exams available"
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
}
