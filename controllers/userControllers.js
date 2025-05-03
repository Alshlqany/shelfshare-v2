import User from "../models/User.js";

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email address phone isVerified createdAt"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const editProfile = async (req, res) => {
  try {
    const allowedUpdates = ["name",  "address", "phone"];
    const updates = {};

    for (let key of allowedUpdates) {
      if (req.body[key]) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("name email address phone isVerified createdAt");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password -otp")
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "internal Server error" });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const allowedRoles = ["admin", "user"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    if (req.user.id === req.params.userId) {
      return res
        .status(400)
        .json({ message: "You cannot change your own role." });
    }
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({
      message: `${user.name}'s role has been updated to '${role}'.`,
      user,
    });
  } catch (error) {
    console.log("Error changing user role:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
