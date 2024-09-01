export class UserOauthRegisreationEvent {
  constructor(
    public login,
    public email,
    public service,
  ) {}
}
