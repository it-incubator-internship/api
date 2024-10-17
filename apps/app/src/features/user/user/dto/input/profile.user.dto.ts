import { IsString, Length, Matches, MaxLength } from 'class-validator';

import { Trim } from '../../../../../../../common/decorators/trim.decorator';
import { userNameApiProperty } from '../../../auth/decorators/swagger/user-registration/user-registration.input';
import {
  aboutMeApiProperty,
  cityApiProperty,
  countryApiProperty,
  dateOfBirthApiProperty,
  firstNameApiProperty,
  lastNameApiProperty,
} from '../../decorators/swagger/update-user-profile/update-user-profile.input';

export class ProfileUserInputModel {
  @userNameApiProperty()
  @IsString()
  @Trim()
  @Length(6, 30)
  @Matches(/^[a-zA-Z0-9_-]+$/)
  userName: string;

  @firstNameApiProperty()
  @IsString()
  @Trim()
  @Length(1, 50)
  @Matches(/^[A-Za-zА-Яа-я]+$/)
  firstName: string;

  @lastNameApiProperty()
  @IsString()
  @Trim()
  @Length(1, 50)
  @Matches(/^[A-Za-zА-Яа-я]+$/)
  lastName: string;

  @dateOfBirthApiProperty()
  @IsString()
  @Trim()
  @Matches(/^(\d{2}\.\d{2}\.\d{4})?$/)
  dateOfBirth: string | null = null;

  @countryApiProperty()
  @IsString()
  @Trim()
  @MaxLength(30)
  @Matches(/^[A-Za-zА-Яа-я\s]*$/)
  country: string | null = null;

  @cityApiProperty()
  @IsString()
  @Trim()
  @MaxLength(30)
  @Matches(/^[A-Za-zА-Яа-я\s]*$/)
  city: string | null = null;

  @aboutMeApiProperty()
  @IsString()
  @Trim()
  @MaxLength(200)
  @Matches(/^[0-9A-Za-zА-Яа-яёЁ\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/)
  aboutMe: string | null = null;
}
