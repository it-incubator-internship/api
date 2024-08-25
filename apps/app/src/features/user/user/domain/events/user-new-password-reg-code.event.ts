export class UserNewPasswordRegCodeEvent {
  constructor(
    public login,
    public email,
    public confirmationCode,
  ) {}
}
