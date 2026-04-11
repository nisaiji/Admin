export default {
  testEnvironment: "jsdom",
  //   transform: {
  //     "^.+\\.jsx?$": [
  //       "babel-jest",
  //       { presets: ["@babel/preset-env", "@babel/preset-react"] },
  //     ],
  //   },
  transform: {
    "^.+\\.(js|jsx|mjs)$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(mp4|mp3|wav|ogg|avi|mov|webm)$": "<rootDir>/__mocks__/fileMock.js",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
};
