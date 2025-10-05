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
  const { page, limit, difficulty, tags, query } = req.query;
  try {
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const filters = {};

    if (query) {
      filters.title = {
        contains: query,
        mode: "insensitive",
      };
    }

    if (difficulty) {
      filters.difficulty = difficulty;
    }

    if (tags) {
      const tagArray = tags.split(",");
      filters.tags = {
        hasSome: tagArray,
      };
    }

    const problems = await db.problem.findMany({
      where: filters,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        solvedBy: {
          where: {
            userID: req.user.id,
          },
        },
      },
    });

    console.log("Problems", problems);

    const totalProblems = await db.problem.count({
      where: {},
    });

    if (!problems) {
      return res.status(404).json({
        message: "Not found!",
      });
    }

    return res.json({
      data: problems,
      metadata: {
        total: totalProblems,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(totalProblems / pageSize),
        count: problems.length,
      },
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
      include: {
        solvedBy: true,
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

export const updateProblem = async (req, res) => {
  const { id } = req.params;
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
        if (!languageID) {
          return res
            .status(400)
            .json({ message: `Unsupported language: ${language}` });
        }
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
    const updatedProblem = await prisma.problem.update({
      where: {
        id,
      },
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

    return res.json({
      message: "Problem updated successfully",
      data: updatedProblem,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error while updating the problem",
    });
  }
};

export const deleteProblem = async (req, res) => {
  const { id } = req.params;
  try {
    const problem = await db.problem.findUnique({
      where: {
        id,
      },
    });
    if (!problem) {
      res.status(404).json({
        message: "Problem not found",
      });
    }
    await db.problem.delete({
      where: {
        id,
      },
    });
    return res.json({
      message: "Problem deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error while deleting the problem",
    });
  }
};

export const getAllProblemSolvedByUser = async (req, res) => {
  const userID = req.user.id;
  const { page, limit } = req.query;
  try {
    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const problems = await db.problem.findMany({
      where: {
        solvedBy: {
          some: {
            userID,
          },
        },
      },
      skip,
      take: pageSize,
      include: {
        solvedBy: {
          where: {
            userID,
          },
        },
      },
    });
    return res.json({
      data: problems,
      message: "All problem solved by user fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error while getting all problem solved by user",
    });
  }
};
