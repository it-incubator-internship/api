import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { JwtAdapter } from '../../../../../providers/jwt/jwt.adapter';
import { ObjResult } from '../../../../../../../common/utils/result/object-result';
import { ForbiddenError, UnauthorizedError } from '../../../../../../../common/utils/result/custom-error';
import { CodeInputModel } from '../../dto/input/confirmation-code.user.dto';

export class CodeValidationCommand {
  constructor(public inputModel: CodeInputModel) {}
}

@CommandHandler(CodeValidationCommand)
export class CodeValidationHandler implements ICommandHandler<CodeValidationCommand> {
  constructor(private readonly jwtAdapter: JwtAdapter) {}

  async execute(command: CodeValidationCommand): Promise<any> {
    const { code } = command.inputModel;

    // верификация code
    const verificationResult = await this.verifyCodeFromEmail({ code });

    // если верификация прошла успешно
    if (verificationResult) {
      return ObjResult.Ok();
    }

    // если верификация не прошла успешно
    // декодирование code
    const decodingResult = await this.decodeCodeFromEmail({ code });

    // если декодирование прошло успешно, значит токен экспарился
    if (decodingResult) {
      return ObjResult.Err(new ForbiddenError(decodingResult.email));
    }

    // если декодирование не прошло успешно, значит токен сломан
    if (!decodingResult) {
      return ObjResult.Err(new UnauthorizedError('the code is incorrect'));
    }
  }

  private async verifyCodeFromEmail({ code }: { code: string }) {
    return await this.jwtAdapter.verifyCodeFromEmail({ code });
  }

  private async decodeCodeFromEmail({ code }: { code: string }) {
    return await this.jwtAdapter.decodeToken({ token: code });
  }
}
