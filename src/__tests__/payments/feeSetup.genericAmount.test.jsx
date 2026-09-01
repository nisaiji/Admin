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

describe("Fee Setup - recurring amount totals", () => {
  test("same-fee mode applies a common amount and updates class and grand totals", async () => {
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
    await user.click(
      within(classOneCard).getByRole("button", { name: "Tuition Fee" }),
    );
    await user.type(
      within(classOneCard).getByLabelText("Amount for Class 1 Tuition Fee"),
      "500",
    );

    await user.type(
      within(classTwoCard).getByLabelText(
        "Amount per installment for all selected sections in Class 2",
      ),
      "200",
    );

    expect(within(classOneCard).getByText("INR 2,900.00")).toBeInTheDocument();
    expect(within(classTwoCard).getByText("INR 7,200.00")).toBeInTheDocument();
    expect(screen.getByText("INR 10,100.00")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Proceed to Review" }));

    expect(screen.getByText("Review Class Fee Structures")).toBeInTheDocument();
    expect(screen.getAllByText("INR 10,100.00").length).toBeGreaterThan(0);
  });

  test("section-wise mode preserves different section amounts when toggling same-fee mode", async () => {
    const user = userEvent.setup();
    renderWizard();

    const classTwoCard = getClassCard("Class 2");
    await user.click(
      within(classTwoCard).getByRole("button", { name: "Include this class" }),
    );

    await user.click(
      within(classTwoCard).getByRole("checkbox", {
        name: "Use same fee for all selected sections in Class 2",
      }),
    );

    await user.type(
      within(classTwoCard).getByLabelText(
        "Amount per installment for Class 2 A",
      ),
      "100",
    );
    await user.type(
      within(classTwoCard).getByLabelText(
        "Amount per installment for Class 2 B",
      ),
      "150",
    );
    await user.type(
      within(classTwoCard).getByLabelText(
        "Amount per installment for Class 2 C",
      ),
      "200",
    );

    await user.click(
      within(classTwoCard).getByRole("checkbox", {
        name: "Use same fee for all selected sections in Class 2",
      }),
    );
    await user.type(
      within(classTwoCard).getByLabelText(
        "Amount per installment for all selected sections in Class 2",
      ),
      "300",
    );

    await user.click(
      within(classTwoCard).getByRole("checkbox", {
        name: "Use same fee for all selected sections in Class 2",
      }),
    );

    expect(
      within(classTwoCard).getByLabelText("Amount per installment for Class 2 A"),
    ).toHaveValue("100");
    expect(
      within(classTwoCard).getByLabelText("Amount per installment for Class 2 B"),
    ).toHaveValue("150");
    expect(
      within(classTwoCard).getByLabelText("Amount per installment for Class 2 C"),
    ).toHaveValue("200");
  });
});
