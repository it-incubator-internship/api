export class UserRegistrationEvent {
  constructor(
    public login,
    public email,
    public confirmationCode,
  ) {}
}
