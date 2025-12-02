import { Chip, FormControl, MenuItem, Select, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setClassAndSectionData } from "../../store/AppAuthSlice";

export default function SessionDropdaown() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.appConfig.isDarkMode);
  const { classAndSectionData } = useSelector((state) => state.appAuth);
  const [session, setSession] = useState(classAndSectionData?.session);

  return (
    <FormControl sx={{ bgcolor: "#1e1e1e", borderRadius: 3 }}>
      <Select
        value={
          session?.some(
            (s) => s?._id === classAndSectionData?.selectedSession?._id
          )
            ? classAndSectionData?.selectedSession?._id
            : ""
        }
        onChange={(e) => {
          const selected = session?.find((s) => s?._id === e?.target?.value);
          dispatch(
            setClassAndSectionData({
              selectedSession: selected,
            })
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
          const s = session?.find((item) => item?._id === selectedValue);
          if (!s) return <Typography>Select Session</Typography>;

          return (
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap={1}
              width="100%"
            >
              <Typography fontWeight="bold">
                {s?.academicStartYear}-{String(s?.academicEndYear).slice(-2)}
              </Typography>
              {s?._id && (
                <Chip
                  label="Active"
                  size="small"
                  sx={{
                    bgcolor: "#4CBC9A26",
                    color: "#4CBC9A",
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
            {data?.academicStartYear}-{String(data?.academicEndYear).slice(-2)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
