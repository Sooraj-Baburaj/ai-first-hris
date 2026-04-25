import type { ResolveRoleResponseDto } from "@closed-ai/types";

import { env } from "../config/env.js";
import { employeeRepository } from "../repositories/recruiting/employee.repository.js";

export const authService = {
  async resolveRoleByEmail(email: string): Promise<ResolveRoleResponseDto> {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === env.RECRUITER_EMAIL.toLowerCase()) {
      return {
        email: normalizedEmail,
        role: "recruiter",
        route: "/recruiter/candidates",
        label: "Recruiter workspace",
      };
    }

    const employee = await employeeRepository.findByEmail(normalizedEmail);
    if (employee) {
      return {
        email: normalizedEmail,
        role: "employee",
        route: "/employee",
        label: "Employee portal",
      };
    }

    return {
      email: normalizedEmail,
      role: "candidate",
      route: "/candidate",
      label: "Candidate portal",
    };
  },
};
