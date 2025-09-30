import {
  poolBatchResults,
  submitBatch,
  getLanguageName,
} from "../lib/judge0.js";
import { db } from "../lib/db.js";

export const submitCode = async (req, res) => {
  const { code, languageID, stdin, expectedOutputs, problemID } = req.body;

  const userID = req.user.id;

  try {
    if (
      !Array.isArray(expectedOutputs) ||
      expectedOutputs.length === 0 ||
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      expectedOutputs.length !== stdin.length
    ) {
      return res.status(400).json({
        message: "Invalid or missing test cases",
      });
    }

    const submissionsBatch = stdin.map((input) => ({
      source_code: code,
      language_id: languageID,
      stdin: input,
    }));

    const submissionResponse = await submitBatch(submissionsBatch);

    const tokens = submissionResponse.map((res) => res.token);

    const results = await poolBatchResults(tokens);

    let allPassed = true;

    const detailedResult = results.map((result, i) => {
      const stdout = result.stdout.trim();
      const expected_output = expectedOutputs[i].trim();
      const passed = stdout === expected_output;
      if (!passed) {
        allPassed = false;
      }

      return {
        testCaseIndex: i + 1,
        stdin: stdin[i].trim(),
        stdout,
        expectedOutput: expected_output,
        stderr: result.stderr ? result.stderr.trim() : null,
        compileOutput: result.compile_output ? result.compile_output : null,
        status: result.status.description,
        time: result.time ? `${result.time} sec` : null,
        memory: result.memory ? `${result.memory} KB` : null,
        passed,
      };
    });

    const submission = await db.submission.create({
      data: {
        userID,
        problemID,
        code,
        language: getLanguageName(languageID),
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(detailedResult.map((r) => r.stdout)),
        stderr: detailedResult.some((r) => r.stderr)
          ? JSON.stringify(detailedResult.map((r) => r.stderr))
          : null,
        compileOutput: detailedResult.some((r) => r.compile_output)
          ? JSON.stringify(detailedResult.map((r) => r.compile_output))
          : null,
        status: allPassed ? "Accepted" : "Wrong Answer",
        memory: detailedResult.some((r) => r.memory)
          ? JSON.stringify(detailedResult.map((r) => r.memory))
          : null,
        time: detailedResult.some((r) => r.time)
          ? JSON.stringify(detailedResult.map((r) => r.time))
          : null,
      },
    });

    if (allPassed) {
      await db.problemSolved.upsert({
        where: {
          userID_problemID: {
            userID,
            problemID,
          },
        },
        update: {},
        create: {
          userID,
          problemID,
        },
      });
    }

    const testCasesResult = detailedResult.map((r) => ({
      submissionID: submission.id,
      ...r,
    }));

    await db.testCaseResult.createMany({
      data: testCasesResult,
    });

    const submissionWithTestCases = await db.submission.findUnique({
      where: {
        id: submission.id,
      },
      include: {
        testCaseResult: true,
      },
    });

    return res.json({
      data: submissionWithTestCases,
      messages: "Code executed successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error while submitting code",
    });
  }
};

export const getAllSubmissions = async (req, res) => {
  const userID = req.user.id;
  try {
    const submissions = await db.submission.findMany({
      where: {
        userID,
      },
    });
    return res.json({
      data: submissions,
      message: "All submissions fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error while getting all submissions",
    });
  }
};

export const getSubmission = async (req, res) => {
  const { problemID } = req.params;
  const userID = req.user.id;
  try {
    const submission = await db.submission.findMany({
      where: {
        userID,
        problemID,
      },
    });
    return res.json({
      data: submission,
      message: "Submission fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error while getting submission",
    });
  }
};

export const getSubmissionsCount = async (req, res) => {
  const { problemID } = req.params;
  try {
    const submissionsCount = await db.submission.count({
      where: {
        problemID,
      },
    });

    return res.json({
      data: submissionsCount,
      message: "Submissions count fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error while getting submissions count",
    });
  }
};
