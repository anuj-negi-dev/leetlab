import { db } from "../lib/db.js";
import { getLanguageID, submitBatch, poolBatchResults } from "../lib/judge0.js";

export const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
    hints,
    editorial,
  } = req.body;

  try {
    for (const [language, solution] of Object.entries(referenceSolutions)) {
      const languageID = getLanguageID(language);
      if (!languageID) {
        return res
          .status(400)
          .json({ message: `Unsupported language: ${language}` });
      }
      const submissions = testcases.map(({ input, output }) => ({
        language_id: languageID,
        source_code: solution,
        stdin: input,
        expected_output: output,
      }));
      const submissionsBatch = await submitBatch(submissions);
      const submissionTokens = submissionsBatch.map((sub) => sub.token);

      const results = await poolBatchResults(submissionTokens);

      results.forEach((result, index) => {
        if (result.status.id !== 3) {
          return res.status(400).json({
            message: `Reference solution failed for language ${language} on testcase ${
              index + 1
            }`,
          });
        }
      });
    }
    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
        hints,
        editorial,
        userID: req.user.id,
      },
    });

    return res.status(201).json({
      message: "Problem created successfully",
      problem: newProblem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating problem" });
  }
};

export const getAllProblems = async (req, res) => {
  try {
    const problems = await db.problem.findMany();

    if (!problems) {
      return res.status(404).json({
        message: "Not found!",
      });
    }

    return res.json({
      data: problems,
      message: "All problems fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error while fetching all problems",
    });
  }
};

export const getProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });

    if (!problem) {
      return res.status(404).json({
        message: "Not found!",
      });
    }

    return res.json({
      data: problem,
      message: "Problem fetched successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error while fetching problem",
    });
  }
};
