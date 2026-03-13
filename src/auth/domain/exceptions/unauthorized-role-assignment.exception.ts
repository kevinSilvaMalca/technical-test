export class UnauthorizedRoleAssignmentException extends Error {
  constructor(assignerRole: string, targetRole: string) {
    super(
      `Role '${assignerRole}' is not authorized to assign role '${targetRole}'`,
    );
    this.name = 'UnauthorizedRoleAssignmentException';
  }
}
