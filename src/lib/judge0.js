import axios from "axios";

export const getLanguageID = (language) => {
  const languageMap = {
    JAVASCRIPT: 63,
    PYTHON: 71,
  };

  return languageMap[language.toUpperCase()] || null;
};

export const submitBatch = async (submissions) => {
  const { data } = await axios.post(
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
    {
      submissions,
    }
  );
  return data;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const poolBatchResults = async (tokens) => {
  while (true) {
    const { data } = await axios.get(
      `${process.env.JUDGE0_API_URL}/submissions/batch`,
      {
        params: {
          tokens: tokens.join(","),
          base64_encoded: false,
        },
      }
    );
    const submissions = data.submissions;

    const isAllDone = submissions.every(
      (sub) => sub.status.id !== 1 && sub.status.id !== 2
    );

    if (isAllDone) return submissions;

    await sleep(1000);
  }
};
