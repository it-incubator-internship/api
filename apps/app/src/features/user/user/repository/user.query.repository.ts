import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../common/database_module/prisma-connection.service';
import { AuthMeOutput } from '../../auth/dto/output/information.output.dto';
import { UserProfileOutputDto } from '../dto/output/user.profile.output.dto';
import { $Enums } from '../../../../../prisma/client';

import ProfileStatus = $Enums.ProfileStatus;

@Injectable()
export class UserQueryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserMeInformation({ id }: { id: string }): Promise<AuthMeOutput | null> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) return null;

    return {
      userId: user.id,
      email: user.email,
      userName: user.name,
    };
  }

  async findUserProfileById({ id }: { id: string }): Promise<UserProfileOutputDto | null> {
    const profile = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
      select: {
        name: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            country: true,
            city: true,
            aboutMe: true,
            originalAvatarUrl: true,
            smallAvatarUrl: true,
            profileStatus: true,
          },
        },
      },
    });

    if (!profile) return null;

    return {
      userName: profile.name,
      firstName: profile.profile?.firstName ? profile.profile.firstName : undefined,
      lastName: profile.profile?.lastName ? profile.profile.lastName : undefined,
      dateOfBirth: profile.profile?.dateOfBirth ? profile.profile.dateOfBirth : undefined,
      country: profile.profile?.country ? profile.profile.country : undefined,
      city: profile.profile?.city ? profile.profile.city : undefined,
      aboutMe: profile.profile?.aboutMe ? profile.profile.aboutMe : undefined,
      originalAvatarUrl: profile.profile?.originalAvatarUrl ? profile.profile.originalAvatarUrl : undefined,
      smallAvatarUrl: profile.profile?.smallAvatarUrl ? profile.profile.smallAvatarUrl : undefined,
      profileStatus: profile.profile?.profileStatus ? profile.profile.profileStatus : ProfileStatus.READY,
    };
  }
}
