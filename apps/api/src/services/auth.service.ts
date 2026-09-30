import { LoginRequest, LoginResponseData, AuthUser } from "@apartment/shared";
import { userRepository } from "../repositories/user.repository.js";
import { comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { AppError } from "../errors/app-error.js";

export class AuthService {
  /**
   * Authenticate user with email and password.
   * Throws uniform AppError.unauthorized on any mismatch to prevent user enumeration.
   * Never leaks passwords or password hashes.
   */
  public async login(credentials: LoginRequest): Promise<LoginResponseData> {
    const user = await userRepository.findByEmail(credentials.email);

    if (!user) {
      throw AppError.unauthorized("Invalid email or password");
    }

    if (!user.isActive) {
      throw AppError.forbidden("Account has been deactivated. Please contact management.");
    }

    const isValidPassword = await comparePassword(credentials.password, user.passwordHash);
    if (!isValidPassword) {
      throw AppError.unauthorized("Invalid email or password");
    }

    // Generate signed JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.roleCode
    });

    // Sanitized user profile (password_hash is completely excluded)
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.roleCode,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive
    };

    // Retrieve assigned unit details (if resident)
    const unit = await userRepository.getUserUnit(user.id);

    return {
      token,
      user: authUser,
      unit: unit || undefined
    };
  }

  /**
   * Fetch current authenticated user's profile.
   */
  public async getCurrentUser(userId: string): Promise<{ user: AuthUser; unit?: any }> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.roleCode,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive
    };

    const unit = await userRepository.getUserUnit(user.id);

    return {
      user: authUser,
      unit: unit || undefined
    };
  }
}

export const authService = new AuthService();
