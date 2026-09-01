import React from "react";
import { render, screen } from "@testing-library/react";

import FeeInfo from "../../components/payments/setting/FeeInfo";

describe("FeeInfo drawer scrolling", () => {
  test("keeps the drawer scrollable", () => {
    render(
      <FeeInfo
        open
        onClose={jest.fn()}
        isDarkMode={false}
        classAndSectionData={{
          feeStructureData: {
            frequency: "MONTHLY",
            dueDate: 10,
            createdAt: "2026-07-01T00:00:00.000Z",
          },
          selectedSession: {
            startDate: "2026-04-01T00:00:00.000Z",
            endDate: "2027-03-31T00:00:00.000Z",
          },
        }}
        data={{
          classDetails: { name: "Class 1" },
          sections: [{ _id: "a", name: "A" }],
          applicableSections: [
            {
              section: { _id: "a", name: "A" },
              feeHeads: [
                {
                  feeHeadId: "h1",
                  amount: 1200,
                  feeHeadDetails: {
                    _id: "h1",
                    name: "Tuition Fee",
                    type: "RECURRING",
                  },
                },
              ],
            },
          ],
        }}
        feeHeads={[]}
        loading={false}
        error=""
      />,
    );

    expect(screen.getByRole("dialog")).toHaveClass("overflow-y-auto");
  });

  test("merges fee heads from prop and section payload", () => {
    render(
      <FeeInfo
        open
        onClose={jest.fn()}
        isDarkMode={false}
        classAndSectionData={{
          feeStructureData: {
            frequency: "MONTHLY",
            dueDate: 10,
            createdAt: "2026-07-01T00:00:00.000Z",
          },
          selectedSession: {
            startDate: "2026-04-01T00:00:00.000Z",
            endDate: "2027-03-31T00:00:00.000Z",
          },
        }}
        data={{
          classDetails: { name: "Class 1" },
          sections: [{ _id: "a", name: "A" }],
          applicableSections: [
            {
              section: { _id: "a", name: "A" },
              feeHeads: [
                {
                  feeHeadId: "h1",
                  amount: 1200,
                  feeHeadDetails: {
                    _id: "h1",
                    name: "Admission Fee",
                    type: "RECURRING",
                  },
                },
                {
                  feeHeadId: "h2",
                  amount: 2200,
                  feeHeadDetails: {
                    _id: "h2",
                    name: "Tuition Fee",
                    type: "ONE_TIME",
                  },
                },
                {
                  feeHeadId: "h3",
                  amount: 3200,
                  feeHeadDetails: {
                    _id: "h3",
                    name: "Library Fee",
                    type: "ONE_TIME",
                  },
                },
                {
                  feeHeadId: "h4",
                  amount: 4200,
                  feeHeadDetails: {
                    _id: "h4",
                    name: "Sports Fee",
                    type: "RECURRING",
                  },
                },
              ],
            },
          ],
        }}
        feeHeads={[
          { _id: "h1", name: "Admission Fee", type: "RECURRING" },
          { _id: "h2", name: "Tuition Fee", type: "ONE_TIME" },
        ]}
        loading={false}
        error=""
      />,
    );

    expect(screen.getByText("Admission Fee")).toBeInTheDocument();
    expect(screen.getByText("Tuition Fee")).toBeInTheDocument();
    expect(screen.getByText("Library Fee")).toBeInTheDocument();
    expect(screen.getByText("Sports Fee")).toBeInTheDocument();
  });
});
