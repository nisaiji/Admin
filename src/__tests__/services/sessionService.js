import { axiosClient } from "../../services/axiosClient";
import EndPoints from "../../services/EndPoints";
import {
  buildSessionDraft,
  createSession,
  getImmediateNextSessionDraft,
  getSessions,
  getUpcomingSessionCreationError,
  hasOverlappingSession,
} from "../../services/sessionService";

jest.mock("../../services/axiosClient", () => ({
  axiosClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe("sessionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("normalizes current and upcoming sessions returned by the API", async () => {
    axiosClient.get.mockResolvedValue({
      result: [
        {
          _id: "upcoming-session",
          academicStartYear: 2027,
          academicEndYear: 2028,
          status: "upcoming",
        },
        {
          _id: "active-session",
          academicStartYear: 2026,
          academicEndYear: 2027,
        },
      ],
    });

    await expect(getSessions()).resolves.toEqual([
      expect.objectContaining({
        id: "active-session",
        academicYearLabel: "2026-27",
        startDate: "2026-04-01",
        endDate: "2027-03-31",
        status: "active",
      }),
      expect.objectContaining({
        id: "upcoming-session",
        academicYearLabel: "2027-28",
        startDate: "2027-04-01",
        endDate: "2028-03-31",
        status: "upcoming",
      }),
    ]);
  });

  test("derives the immediate next academic session window", () => {
    expect(
      getImmediateNextSessionDraft([
        {
          academicStartYear: 2026,
          academicEndYear: 2027,
        },
        {
          academicStartYear: 2027,
          academicEndYear: 2028,
          status: "upcoming",
        },
      ]),
    ).toEqual(
      expect.objectContaining({
        academicStartYear: 2028,
        academicEndYear: 2029,
        academicYearLabel: "2028-29",
        startDate: "2028-04-01",
        endDate: "2029-03-31",
      }),
    );
  });

  test("blocks duplicate upcoming session creation", () => {
    const candidate = buildSessionDraft(2028, 2029);

    expect(
      getUpcomingSessionCreationError(
        [
          {
            academicStartYear: 2026,
            academicEndYear: 2027,
          },
          {
            academicStartYear: 2027,
            academicEndYear: 2028,
            status: "upcoming",
          },
        ],
        candidate,
      ),
    ).toBe("An upcoming session (2027-28) already exists.");
  });

  test("detects overlapping academic session windows", () => {
    expect(
      hasOverlappingSession(
        [
          {
            academicStartYear: 2026,
            academicEndYear: 2027,
          },
        ],
        {
          academicStartYear: 2026,
          academicEndYear: 2028,
          startDate: "2026-04-01",
          endDate: "2028-03-31",
        },
      ),
    ).toBe(true);
  });

  test("uses the shared create-session endpoint wrapper", async () => {
    axiosClient.post.mockResolvedValue({ statusCode: 200 });

    await createSession({
      academicStartYear: 2027,
      academicEndYear: 2028,
      status: "upcoming",
    });

    expect(axiosClient.post).toHaveBeenCalledWith(
      EndPoints.ADMIN.CREATE_SESSION,
      {
        academicStartYear: 2027,
        academicEndYear: 2028,
        status: "upcoming",
      },
    );
  });
});
