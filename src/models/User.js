import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const ROLES = Object.freeze({ CUSTOMER: "customer", ADMIN: "admin" });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: [8, "Password must be at least 8 characters"] },
    phone: { type: String, trim: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    isActive: { type: Boolean, default: true },
    passwordChangedAt: Date,

  },{ timestamps: true });

// Hash password before saving it
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const genSalt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, genSalt);

  // Record password changes so older JWTs can be rejected
  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
    return;
  }

});

userSchema.methods.comparePassword = function (userPassword) {
  return bcrypt.compare(userPassword, this.password);
};

// True if the password was changed after the JWT was issued
userSchema.methods.changedPasswordAfter = function (jwtIssuedAt) {
  if (!this.passwordChangedAt) return false;
  return Math.floor(this.passwordChangedAt.getTime() / 1000) > jwtIssuedAt;
};



const User = mongoose.model("User", userSchema);

export default User;
