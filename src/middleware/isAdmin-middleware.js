export const isAdmin = (req, res, next) => {
  try {
    const { role } = req.user;
    if (role === "ADMIN") next();
    else {
      return res.status(403).json({
        message: "Permission Denied",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error while checking permission",
    });
  }
};
