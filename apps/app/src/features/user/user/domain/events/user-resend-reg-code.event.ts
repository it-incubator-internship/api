export class UserResendRegCodeEvent {
  constructor(
    public login,
    public email,
    public confirmationCode,
  ) {}
}
