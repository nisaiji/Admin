import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { PaymentsRepoProvider } from "../../features/payments/store/PaymentsRepoProvider";
import FeeStructureWizardPage from "../../features/payments/pages/FeeStructureWizardPage";

function renderWizard() {
  return render(
    <PaymentsRepoProvider>
      <MemoryRouter initialEntries={["/payments/fee-setup/new"]}>
        <Routes>
          <Route
            path="/payments/fee-setup/new"
            element={<FeeStructureWizardPage />}
          />
        </Routes>
      </MemoryRouter>
    </PaymentsRepoProvider>,
  );
}

function getClassCard(className) {
  return screen.getByRole("heading", { name: className }).closest("article");
}

describe("Fee Setup - Per-class fee heads", () => {
  test("fee heads stay per class and Others remains a fee head", async () => {
    const user = userEvent.setup();
    renderWizard();

    const classOneCard = getClassCard("Class 1");
    const classTwoCard = getClassCard("Class 2");

    await user.click(
      within(classOneCard).getByRole("button", { name: "Include this class" }),
    );
    await user.click(
      within(classTwoCard).getByRole("button", { name: "Include this class" }),
    );

    await user.type(
      within(classOneCard).getByLabelText(
        "Amount per installment for all selected sections in Class 1",
      ),
      "100",
    );
    await user.type(
      within(classTwoCard).getByLabelText(
        "Amount per installment for all selected sections in Class 2",
      ),
      "200",
    );

    await user.click(
      within(classOneCard).getByRole("button", { name: "Tuition Fee" }),
    );
    await user.click(within(classOneCard).getByRole("button", { name: "Others" }));

    expect(
      within(classOneCard).getByLabelText("Amount for Class 1 Tuition Fee"),
    ).toBeInTheDocument();
    expect(
      within(classOneCard).getByLabelText("Amount for Class 1 Others"),
    ).toBeInTheDocument();
    expect(
      within(classTwoCard).queryByLabelText("Amount for Class 2 Tuition Fee"),
    ).toBeNull();
  });

  test("new fee head is auto-selected only for one class and requires an amount", async () => {
    const user = userEvent.setup();
    renderWizard();

    const classOneCard = getClassCard("Class 1");
    const classTwoCard = getClassCard("Class 2");

    await user.click(
      within(classOneCard).getByRole("button", { name: "Include this class" }),
    );
    await user.click(
      within(classTwoCard).getByRole("button", { name: "Include this class" }),
    );

    await user.type(
      within(classOneCard).getByLabelText(
        "Amount per installment for all selected sections in Class 1",
      ),
      "100",
    );
    await user.type(
      within(classTwoCard).getByLabelText(
        "Amount per installment for all selected sections in Class 2",
      ),
      "100",
    );

    await user.click(
      within(classTwoCard).getByRole("button", { name: /Add Fee Head/i }),
    );
    await user.type(screen.getByLabelText(/Name \*/i), "Sports Fee");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(
      within(classTwoCard).getByLabelText("Amount for Class 2 Sports Fee"),
    ).toBeInTheDocument();
    expect(
      within(classOneCard).queryByLabelText("Amount for Class 1 Sports Fee"),
    ).toBeNull();

    await user.click(screen.getByRole("button", { name: "Proceed to Review" }));
    expect(
      screen.getByText("Enter amount for selected fee heads."),
    ).toBeInTheDocument();

    await user.type(
      within(classTwoCard).getByLabelText("Amount for Class 2 Sports Fee"),
      "250",
    );
    await user.click(screen.getByRole("button", { name: "Proceed to Review" }));

    expect(screen.getByText("Review Class Fee Structures")).toBeInTheDocument();
    expect(screen.getByText("Sports Fee: INR 250.00")).toBeInTheDocument();
  });
});
